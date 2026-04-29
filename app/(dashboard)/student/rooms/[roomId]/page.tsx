'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { useRoom, useParticipants } from '@/features/room/queries';
import { useJoinRoom } from '@/features/room/mutations';
import { ParticipantData, WorkspaceFile, getWorkspaceFiles, createFileApi, deleteFileApi, updateFileApi } from '@/features/room/api';
import { useRoomSocket } from '@/features/realtime/useRoomSocket';
import CodeEditor from '@/components/editor/CodeEditor';
import Participants from '@/components/room/Participants';
import { Copy, Check, AlertTriangle, WifiOff, PlusCircle, ArrowLeft, Play, Send, Rocket, Loader2, Terminal, Database } from 'lucide-react';
import { useCurrentUserInfo } from '@/app/components/_api/queries';
import { useRunCode, useSubmitCode, getRunResult, getSubmissionResult } from '@/features/problems/mutations';
import { useLanguages } from '@/src/hooks/useLanguages';
import { socket } from '@/features/realtime/socket';
import { toast } from '@/components/ui/Toast';

import { useStudentProblems, useStudentProblemDetail } from '@/src/hooks/useProblems';
import ReactMarkdown from 'react-markdown';
import { Search } from 'lucide-react';
import ProblemUiStudent from '../../components/problem-ui-student';

interface PageProps {
    params: Promise<{ roomId: string }>;
}

export default function RoomPage({ params }: PageProps) {
    const { roomId } = use(params);
    const queryClient = useQueryClient();
    const router = useRouter();
    const { data: roomInfo, isLoading: isRoomLoading, isFetching: isRoomFetching, error } = useRoom(roomId);
    const { data: participants } = useParticipants(roomId);
    const { mutate: joinRoom, isPending: isJoining } = useJoinRoom({
        onSuccess: () => {
            console.log("Join room success!");
        },
        onError: (err: any) => {
            console.error("Join room failed:", err.response?.data || err.message);
        }
    });

    const room = roomInfo?.room;
    const sessionRest = roomInfo?.session;
    const currentUserRole = roomInfo?.currentUserRole;
    const currentUserStatus = roomInfo?.currentUserStatus;

    console.log("[RoomPage] State Check:", { 
        roomId, 
        isRoomLoading, 
        isRoomFetching, 
        isJoining, 
        hasRoom: !!room, 
        currentUserRole 
    });

    const shouldEnableSocket = !!room && (sessionRest !== null || currentUserRole === 'HOST');

    const getFileLanguage = (path: string) => {
        const ext = path.split('.').pop()?.toLowerCase();
        if (ext === 'py') return 'python';
        if (ext === 'js') return 'javascript';
        if (ext === 'ts') return 'typescript';
        if (ext === 'cpp') return 'cpp';
        if (ext === 'java') return 'java';
        return 'typescript';
    };

    const { isConnected, sessionStatus, closingTimeLeft, onlineUserIds } = useRoomSocket({
        roomId,
        enabled: shouldEnableSocket,
        onFileCreated: (file) => {
            if (file.workspaceId !== workspaceId) return;
            setFiles(prev => {
                if (prev.some(f => f.id === file.id)) return prev;
                return [...prev, file];
            });
        },
        onFileDeleted: (data) => {
            if (data.workspaceId !== workspaceId) return;
            const { filePath, id } = data;
            setFiles(prev => prev.filter(f => (id ? f.id !== id : f.filePath !== filePath)));
            if (activeFileName === filePath) setActiveFileName(mainFileName || '');
        },
        onFileRenamed: (data) => {
            if (data.workspaceId !== workspaceId) return;
            const { oldPath, newFile } = data;
            setFiles(prev => {
                const exists = prev.some(f => f.id === newFile.id);
                if (exists) return prev.map(f => f.id === newFile.id ? newFile : f);
                return prev.map(f => f.filePath === oldPath ? newFile : f);
            });
            if (activeFileName === oldPath) setActiveFileName(newFile.filePath);
            if (mainFileName === oldPath) setMainFileName(newFile.filePath);
        },
        onFileUpdated: (updatedFile) => {
            if (updatedFile.workspaceId !== workspaceId) return;
            setFiles(prev => prev.map(f => f.id === updatedFile.id ? { ...f, ...updatedFile } : f));
        },
        onFileSwitched: (data) => {
            if (viewingUser && data.userId === viewingUser.userId) {
                console.log("[RoomPage] Auto-switching to file:", data.filePath);
                setActiveFileName(data.filePath);
            }
        },
        onProblemSelected: ({ problemSlug }) => {
            console.log("[RoomPage] Socket problem selected:", problemSlug);
            setSelectedProblemId(problemSlug);
            queryClient.invalidateQueries({ queryKey: ['student-problem-detail', problemSlug] });
            setIsInitialized(false); // Trigger re-init
        }
    });

    useEffect(() => {
        console.log("[RoomPage] Socket Sync:", { 
            connected: isConnected, 
            onlineIds: Array.from(onlineUserIds),
            count: onlineUserIds.size 
        });
    }, [isConnected, onlineUserIds]);

    const { data: currentUser } = useCurrentUserInfo();

    useEffect(() => {
        const handleApproved = (data: { userId: string }) => {
            if (currentUser?.id && String(data.userId) === String(currentUser.id)) {
                console.log("[RoomPage] I was approved!");
                queryClient.invalidateQueries({ queryKey: ['room', roomId] });
                queryClient.invalidateQueries({ queryKey: ['room_participants', roomId] });
            }
        };

        socket.on('participant_approved', handleApproved);
        return () => {
            socket.off('participant_approved', handleApproved);
        };
    }, [roomId, currentUser?.id, queryClient]);
    const [viewingUser, setViewingUser] = useState<ParticipantData | null>(null);
    const [copied, setCopied] = useState(false);
    
    const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
    const [problemSearch, setProblemSearch] = useState("");
    const [isInitialized, setIsInitialized] = useState(false);
    const [lastProblemId, setLastProblemId] = useState<string | null>(null);
    
    useEffect(() => {
        if (room?.problemSlug && !selectedProblemId) {
            setSelectedProblemId(room.problemSlug);
        }
    }, [room?.problemSlug]);

    const { data: problemsRes } = useStudentProblems({ search: problemSearch, limit: 20 });

    const isHost = currentUserRole === 'HOST';
    const isViewing = !!viewingUser && viewingUser.userId !== currentUser?.id;

    const handleSelectProblem = (slug: string) => {
        if (!isHost) return;
        setSelectedProblemId(slug); // Immediate local feedback
        queryClient.invalidateQueries({ queryKey: ['student-problem-detail', slug] });
        socket.emit('select_problem', { roomId, problemSlug: slug });
    };

    useEffect(() => {
        const handleProblemSelected = (data: { problemSlug: string }) => {
            console.log("[RoomPage] Problem selected:", data.problemSlug);
            setSelectedProblemId(data.problemSlug);
            toast.info("Đã cập nhật bài tập mới!");
        };

        socket.on('problem_selected', handleProblemSelected);
        return () => {
            socket.off('problem_selected', handleProblemSelected);
        };
    }, [roomId]);

    const [files, setFiles] = useState<WorkspaceFile[]>([]);
    const [activeFileName, setActiveFileName] = useState<string>("");
    const [language, setLanguage] = useState<string>('');
    const [customInput, setCustomInput] = useState("");
    const [leftCollapsed, setLeftCollapsed] = useState(false);
    const [rightCollapsed, setRightCollapsed] = useState(false);
    const [terminalOpen, setTerminalOpen] = useState(true);
    const [resultTab, setResultTab] = useState<'input' | 'output'>('input');
    const [mainFileName, setMainFileName] = useState<string>("");
    const [modal, setModal] = useState<{ 
        type: 'input' | 'confirm', 
        title: string, 
        message: string, 
        defaultValue?: string, 
        onConfirm: (val?: string) => void,
        cancelText?: string,
        confirmText?: string
    } | null>(null);

    const currentUserParticipant = participants?.find(p => {
        if (p.roomId !== roomId) return false;
        return currentUser?.id && String(p.userId) === String(currentUser?.id);
    });
    
    // Use the workspace of the user being viewed, or fallback to the current user's workspace
    const workspaceId = viewingUser?.workspaceId || currentUserParticipant?.workspaceId;
    
    const filesRef = useRef<WorkspaceFile[]>(files);
    
    useEffect(() => {
        filesRef.current = files;
    }, [files]);
    const { data: languages = [] } = useLanguages();

    const { data: problemDetail, isLoading: isLoadingProblemDetail } = useStudentProblemDetail(selectedProblemId || "", 1, undefined, !!selectedProblemId);

    useEffect(() => {
        if (languages.length > 0 && !language) {
            // Default language should match problem entry file or default to first lang
            const entryExt = problemDetail?.version?.entryFile?.split('.').pop();
            const matchingLang = languages.find(l => l.ext.replace('.', '') === entryExt);
            setLanguage(matchingLang?.name.toLowerCase() || languages[0].name.toLowerCase());
        }
    }, [languages, language, problemDetail]);

    const isLoading = isRoomLoading || isJoining || isRoomFetching;

    useEffect(() => {
        if (!workspaceId || languages.length === 0 || !language || isLoading) return;
        if (selectedProblemId && isLoadingProblemDetail) return;

        // Reset files when switching workspaces
        if (isInitialized && workspaceId !== currentUserParticipant?.workspaceId && !viewingUser) {
             setIsInitialized(false);
             return;
        }

        getWorkspaceFiles(workspaceId).then(async fetchedFiles => {
            // If viewing mode, just set files and stop. Don't initialize/create files.
            if (isViewing) {
                setFiles(fetchedFiles);
                const entryFromProblem = problemDetail?.version?.entryFile;
                const bestEntry = fetchedFiles.find(f => f.filePath === entryFromProblem)?.filePath 
                                || fetchedFiles.find(f => f.filePath.toLowerCase().includes('main'))?.filePath 
                                || fetchedFiles[0]?.filePath;
                setActiveFileName(bestEntry || "");
                return;
            }

            // Normal mode (my own workspace): Re-initialization logic
            const shouldReinit = !isInitialized || (selectedProblemId !== lastProblemId);
            
            if (fetchedFiles.length === 0 || shouldReinit) {
                let initialFiles: WorkspaceFile[] = [];
                let entryName = "";
                let detectedLang = language;

                if (problemDetail) {
                    const langObj = languages.find(l => l.name.toLowerCase() === language) || languages[0];
                    detectedLang = langObj.name.toLowerCase();

                    const problemFiles = (problemDetail.languageFiles || []).filter((f: any) => 
                        f.type !== 'HIDDEN' && f.type !== 'SOLUTION'
                    );

                    if (problemFiles.length > 0) {
                        initialFiles = problemFiles.map((f: any) => ({
                            filePath: f.path,
                            content: f.content
                        }));
                        entryName = problemDetail.version?.entryFile || problemFiles.find((f: any) => f.type === 'TEMPLATE')?.path || problemFiles[0].path;
                    } else {
                        const dot = langObj.ext.startsWith('.') ? '' : '.';
                        entryName = `main${dot}${langObj.ext}`;
                        initialFiles = [{ filePath: entryName, content: langObj.template || "" }];
                    }
                } else {
                    const langObj = languages.find(l => l.name.toLowerCase() === language) || languages[0];
                    detectedLang = langObj.name.toLowerCase();
                    const dot = langObj.ext.startsWith('.') ? '' : '.';
                    entryName = `main${dot}${langObj.ext}`;
                    initialFiles = [{ filePath: entryName, content: langObj.template || "" }];
                }

                if (fetchedFiles.length === 0 && initialFiles.length > 0) {
                    await Promise.all(initialFiles.map(f => createFileApi(workspaceId, f.filePath, f.content))).catch(e => {
                        console.error("[RoomPage] Initial file creation failed:", e);
                    });
                    setFiles(initialFiles);
                } else {
                    setFiles(fetchedFiles.length > 0 ? fetchedFiles : initialFiles);
                }
                
                const finalEntry = entryName || fetchedFiles[0]?.filePath || initialFiles[0]?.filePath || "";
                setActiveFileName(finalEntry);
                setMainFileName(finalEntry);
                setLanguage(detectedLang);
                setIsInitialized(true);
                setLastProblemId(selectedProblemId);
            } else {
                setFiles(fetchedFiles);
                if (!activeFileName) {
                    const entryFromProblem = problemDetail?.version?.entryFile;
                    const bestEntry = fetchedFiles.find(f => f.filePath === entryFromProblem)?.filePath 
                                    || fetchedFiles.find(f => f.filePath.toLowerCase().includes('main'))?.filePath 
                                    || fetchedFiles[0]?.filePath;
                    setActiveFileName(bestEntry || "");
                    setMainFileName(bestEntry || "");
                }
            }
        }).catch(err => {
            console.error("[RoomPage] Failed to load workspace files:", err);
            if (err.response?.status === 401) {
                toast.error("Phiên làm việc hết hạn, vui lòng đăng nhập lại.");
            }
        });
    }, [workspaceId, isViewing, languages, isLoading, isInitialized, selectedProblemId, problemDetail, lastProblemId]);

    const handleAddFile = () => {
        if (!workspaceId || isViewing) return;
        setModal({
            type: 'input',
            title: 'Thêm file mới',
            message: 'Nhập tên file (ví dụ: utils.py)',
            defaultValue: '',
            onConfirm: async (name) => {
                if (!name) return;
                let finalName = name;
                if (!finalName.includes('.')) {
                    const langObj = languages.find(l => l.name.toLowerCase() === language.toLowerCase());
                    const dot = langObj?.ext.startsWith('.') ? '' : '.';
                    if (langObj) finalName += `${dot}${langObj.ext}`;
                    else finalName += '.txt';
                }

                try {
                    const newFile = await createFileApi(workspaceId, finalName, '');
                    setFiles(prev => [...prev, newFile]);
                    setActiveFileName(finalName);
                    
                    setModal(null);
                    toast.success(`Đã thêm file ${finalName}`);
                } catch (err: any) {
                    toast.error(err.response?.data?.message || 'Không thể thêm file');
                }
            }
        });
    };

    const handleRenameFile = (oldPath: string) => {
        if (!workspaceId || isViewing) return;
        setModal({
            type: 'input',
            title: 'Đổi tên file',
            message: `Nhập tên mới cho file ${oldPath}`,
            defaultValue: oldPath,
            onConfirm: async (newPath) => {
                if (!newPath || newPath === oldPath) { setModal(null); return; }
                if (files.find(f => f.filePath === newPath)) {
                    toast.error('Tên file đã tồn tại.');
                    return;
                }

                try {
                    const oldFile = files.find(f => f.filePath === oldPath);
                    if (!oldFile?.id) throw new Error("File ID not found");

                    const newFile = await updateFileApi(oldFile.id, { filePath: newPath });
                    
                    setFiles(prev => prev.map(f => f.id === newFile.id ? newFile : f));
                    if (activeFileName === oldPath) setActiveFileName(newPath);
                    if (mainFileName === oldPath) setMainFileName(newPath);
                    
                    setModal(null);
                    toast.success(`Đã đổi tên thành ${newPath}`);
                } catch (err: any) {
                    toast.error(err.response?.data?.message || 'Không thể đổi tên file');
                }
            }
        });
    };

    const handleDeleteFile = (path: string) => {
        if (!workspaceId || isViewing) return;
        if (files.length <= 1) return;
        if (path === mainFileName) {
            toast.warning('Không thể xóa file chính.');
            return;
        }

        setModal({
            type: 'confirm',
            title: 'Xóa file',
            message: `Bạn có chắc chắn muốn xóa file ${path}? Hành động này không thể hoàn tác.`,
            onConfirm: async () => {
                try {
                    await deleteFileApi(workspaceId, path);
                    setFiles(prev => prev.filter(f => f.filePath !== path));
                    if (activeFileName === path) {
                        const remaining = files.filter(f => f.filePath !== path);
                        setActiveFileName(mainFileName || remaining[0]?.filePath || '');
                    }
                    
                    setModal(null);
                    toast.success(`Đã xóa file ${path}`);
                } catch (err: any) {
                    toast.error(err.response?.data?.message || 'Không thể xóa file');
                }
            }
        });
    };

    const handleSetMain = async (path: string) => {
        if (!workspaceId) return;
        setMainFileName(path);
        setActiveFileName(path);
        setLanguage(getFileLanguage(path));
        toast.info(`Đã đặt ${path} làm file chính.`);
    };

    const runMutation = useRunCode();
    const submitMutation = useSubmitCode();

    const [execStatus, setExecStatus] = useState<"IDLE" | "RUNNING" | "QUEUED" | "COMPLETED" | "ERROR">("IDLE");
    const [runResult, setRunResult] = useState<any>(null);
    const [submitResult, setSubmitResult] = useState<any>(null);
    const [showResult, setShowResult] = useState(false);

    const currentEventRef = useRef<string | null>(null);

    const handleCopyLink = () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        if (!url) return;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url);
        } else {
            const el = document.createElement('textarea');
            el.value = url;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRunSubmitResult = (data: any) => {
        setExecStatus("COMPLETED");
        setRunResult(data);
        setShowResult(true);
        setResultTab('output');
    };

    const listenForExecution = async (id: string, type: 'RUN' | 'SUBMIT') => {
        if (currentEventRef.current) socket.off(currentEventRef.current);

        const eventName = `submission-${id}`;
        const altEventName = `run-${id}`;
        currentEventRef.current = eventName;

        const cleanup = () => {
            socket.off(eventName, handleRunSubmitResult);
            socket.off(altEventName, handleRunSubmitResult);
        };

        socket.on(eventName, (data) => {
            handleRunSubmitResult(data);
            cleanup();
        });
        socket.on(altEventName, (data) => {
            handleRunSubmitResult(data);
            cleanup();
        });

        try {
            const data = type === 'RUN' ? await getRunResult(id) : await getSubmissionResult(id);
            if (data && data.status !== 'QUEUED' && data.status !== 'PROCESSING') {
                handleRunSubmitResult(data);
                cleanup();
                return;
            }
        } catch (err) {
            console.warn("API Hybrid check failed:", err);
        }

        setTimeout(() => {
            if (execStatus === "QUEUED" || execStatus === "RUNNING") {
                setExecStatus("ERROR");
                cleanup();
            }
        }, 30000);
    };

    const handleRun = async () => {
        if (!workspaceId) return;
        setExecStatus("RUNNING");
        setShowResult(false);
        try {
            const entryPath = mainFileName || activeFileName || (files[0]?.filePath);
            const ext = entryPath.split('.').pop() || '';
            const langObj = languages.find(l => l.ext.replace('.', '') === ext) || languages[0];

            const resp = await runMutation.mutateAsync({
                languageId: langObj?.id || 1,
                entryFile: entryPath,
                files: filesRef.current.map(f => ({
                    filePath: f.filePath,
                    content: f.content
                })),
                input: customInput
            });
            setExecStatus("QUEUED");
            setTerminalOpen(true);
            const executionId = (resp as any).data?.id || resp.id;
            if (!executionId) {
                console.error("No execution ID returned from run API", resp);
                setExecStatus("ERROR");
                return;
            }
            listenForExecution(executionId, 'RUN');
        } catch (err) {
            setExecStatus("ERROR");
        }
    };

    const handleSubmit = async () => {
        if (!workspaceId || !selectedProblemId) return;
        setExecStatus("RUNNING");
        setShowResult(false);
        try {
            const entryPath = mainFileName || activeFileName || (files[0]?.filePath);
            const ext = entryPath.split('.').pop() || '';
            const langObj = languages.find(l => l.ext.replace('.', '') === ext) || languages[0];

            const resp = await submitMutation.mutateAsync({
                languageId: langObj?.id || 1,
                entryFile: entryPath,
                files: filesRef.current.map(f => ({
                    filePath: f.filePath,
                    content: f.content
                })),
                problemVersionId: problemDetail?.version?.id || ""
            });
            setExecStatus("QUEUED");
            setTerminalOpen(true);
            const submissionId = (resp as any).data?.submissionId || resp.submissionId;
            if (!submissionId) {
                console.error("No submission ID returned from submit API", resp);
                setExecStatus("ERROR");
                return;
            }
            listenForExecution(submissionId, 'SUBMIT');
        } catch (err) {
            setExecStatus("ERROR");
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 124px)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spin" style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent-purple)', borderRadius: '50%', margin: '0 auto 16px' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Đang kết nối phòng học...</p>
                </div>
            </div>
        );
    }

    if (error || !room) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 124px)', textAlign: 'center', padding: 24 }}>
                <AlertTriangle size={40} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Phòng không tồn tại</h2>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-ghost" onClick={() => router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ArrowLeft size={16} /> Quay lại Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!currentUserRole) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 124px)' }}>
                <div className="card" style={{ maxWidth: 420, textAlign: 'center', padding: 32, borderRadius: 16 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 16,
                        background: 'var(--gradient-purple)', boxShadow: 'var(--shadow-glow-purple)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px', fontSize: 28,
                    }}>
                        <Rocket size={32} color="white" />
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>{room.name}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14, lineHeight: 1.6 }}>
                        {room.description || 'Bạn đang chuẩn bị tham gia phòng học này. Sẵn sàng code cùng mọi người chưa?'}
                    </p>
                    
                    <button 
                        className="btn btn-primary" 
                        onClick={() => joinRoom(room.id)}
                        disabled={isJoining}
                        style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 16, fontWeight: 700 }}
                    >
                        {isJoining ? (
                            <><Loader2 size={20} className="spin" style={{ marginRight: 10 }} /> Đang kết nối...</>
                        ) : (
                            <><Play size={20} style={{ marginRight: 10 }} /> Tham Gia Phòng</>
                        )}
                    </button>
                    <button className="btn btn-ghost" onClick={() => router.push('/student/rooms')} style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
                        Hủy bỏ
                    </button>
                </div>
            </div>
        );
    }

    if (currentUserStatus === 'PENDING') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 124px)' }}>
                <div className="card" style={{ maxWidth: 420, textAlign: 'center', padding: 32, borderRadius: 16 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 16,
                        background: 'var(--bg-tertiary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                    }}>
                        <Loader2 size={32} className="spin" color="var(--accent-purple)" />
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Đang chờ phê duyệt</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14, lineHeight: 1.6 }}>
                        Yêu cầu tham gia của bạn đã được gửi đến chủ phòng. Vui lòng đợi một lát nhé!
                    </p>
                    <button className="btn btn-ghost" onClick={() => router.push('/student/rooms')} style={{ width: '100%', justifyContent: 'center' }}>
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (sessionStatus === 'CLOSED') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 124px)', textAlign: 'center', padding: 24 }}>
                <WifiOff size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Phòng đã đóng</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 400 }}>Phiên học tập đã kết thúc do chủ phòng vắng mặt quá lâu hoặc đã chủ động đóng phòng.</p>
                <button className="btn btn-primary" onClick={() => router.push('/student/rooms')}>
                    Quay lại danh sách phòng
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 124px)', gap: 14, minHeight: 0 }}>
            {sessionStatus === 'CLOSING' && closingTimeLeft !== null && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid var(--accent-red)',
                    color: 'var(--accent-red)',
                    padding: '10px 20px',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    animation: 'pulse 2s infinite ease-in-out'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <AlertTriangle size={20} />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>Cảnh báo: Phòng sắp đóng</div>
                            <div style={{ fontSize: 12, opacity: 0.8 }}>Chủ phòng đã rời đi. Vui lòng đợi chủ phòng quay lại hoặc hoàn tất công việc của bạn.</div>
                        </div>
                    </div>
                    <div style={{ 
                        fontSize: 20, 
                        fontWeight: 900, 
                        fontFamily: 'monospace',
                        background: 'var(--accent-red)',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: 8,
                        boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
                    }}>
                        {Math.floor(closingTimeLeft / 60)}:{String(closingTimeLeft % 60).padStart(2, '0')}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ 
                            width: 10, height: 10, borderRadius: '50%', 
                            background: isConnected ? 'var(--accent-green)' : 'var(--accent-red)', 
                            boxShadow: isConnected ? '0 0 10px var(--accent-green)' : '0 0 10px var(--accent-red)' 
                        }} />
                        <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>
                            {problemDetail ? `Soạn thảo: ${problemDetail.title}` : room.name}
                        </h1>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {problemDetail ? `Bài: ${problemDetail.title} - ${language}` : `Phòng học của bạn - ${activeFileName || 'main.py'}`}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <select
                        className="btn"
                        style={{ 
                            background: '#1c212e', 
                            fontSize: 13, 
                            border: '1px solid var(--border)', 
                            color: 'var(--text-primary)', 
                            height: 32, 
                            padding: '0 12px',
                            opacity: activeFileName !== mainFileName ? 0.5 : 1,
                            cursor: activeFileName !== mainFileName ? 'not-allowed' : 'pointer'
                        }}
                        value={language}
                        disabled={activeFileName !== mainFileName}
                        title={activeFileName !== mainFileName ? "Chỉ có thể đổi ngôn ngữ khi đang chọn file chính" : ""}
                        onChange={(e) => {
                            const newLang = e.target.value;
                            const langObj = languages.find(l => l.name.toLowerCase() === newLang.toLowerCase());
                            if (!langObj) return;

                            setModal({
                                type: 'confirm',
                                title: 'Chuyển đổi ngôn ngữ',
                                message: `Bạn có muốn nạp code mẫu của ${langObj.name} không? (Nội dung cũ trong file chính sẽ bị ghi đè)`,
                                onConfirm: async () => {
                                    setLanguage(newLang);
                                    if (workspaceId && mainFileName) {
                                        const dot = langObj.ext.startsWith('.') ? '' : '.';
                                        // Robust base name extraction
                                        const lastDotIndex = mainFileName.lastIndexOf('.');
                                        const base = lastDotIndex !== -1 ? mainFileName.substring(0, lastDotIndex) : mainFileName;
                                        const newMainName = `${base}${dot}${langObj.ext}`;

                                        try {
                                            const oldMainFile = files.find(f => f.filePath === mainFileName);
                                            if (!oldMainFile?.id) throw new Error("Main file ID not found");

                                            // Rename and update content in one call
                                            const newFile = await updateFileApi(oldMainFile.id, { 
                                                filePath: newMainName, 
                                                content: langObj.template || "" 
                                            });
                                            
                                            setFiles(prev => prev.map(f => f.id === newFile.id ? newFile : f));
                                            setMainFileName(newMainName);
                                            setActiveFileName(newMainName);
                                            
                                            toast.success(`Đã chuyển sang ${langObj.name} và nạp template.`);
                                        } catch (err) {
                                            console.error("Failed to swap language files:", err);
                                            toast.error("Không thể đổi ngôn ngữ file chính. Vui lòng thử lại.");
                                        }
                                    }
                                    setModal(null);
                                }
                            });
                        }}
                    >
                        {languages.map(l => (
                            <option key={l.id} value={l.name.toLowerCase()}>{l.name}</option>
                        ))}
                    </select>
                    
                    <button 
                        className="btn btn-primary" 
                        onClick={handleRun} 
                        disabled={execStatus === "RUNNING" || execStatus === "QUEUED" || isViewing} 
                        style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 16px', fontSize: 13 }}
                    >
                        {execStatus === "RUNNING" || execStatus === "QUEUED" ? (
                            <Loader2 className="animate-spin" size={14} />
                        ) : (
                            <><Play size={14} fill="currentColor" /> Run</>
                        )}
                    </button>



                    <button className="btn btn-ghost" onClick={handleCopyLink} style={{ height: 32, padding: '0 12px', fontSize: 13, border: '1px solid var(--border)' }}>
                        {copied ? <Check size={14} style={{ color: 'var(--accent-green)' }} /> : <Copy size={14} />}
                        <span style={{ marginLeft: 6 }}>{copied ? 'Đã copy' : 'Mời bạn bè'}</span>
                    </button>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: `${leftCollapsed ? '48px' : '300px'} 1fr ${rightCollapsed ? '48px' : '280px'}`,
                gap: 14,
                flex: 1,
                minHeight: 0,
                transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-secondary)', border: '1px solid var(--border)', minWidth: 0 }}>
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
                        {!leftCollapsed && <div style={{ fontWeight: 700, fontSize: 13 }}>📚 Bài tập</div>}
                        <button onClick={() => setLeftCollapsed(!leftCollapsed)} className="btn-icon" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            {leftCollapsed ? <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} /> : <ArrowLeft size={16} />}
                        </button>
                    </div>
                    {!leftCollapsed && (
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                            {isHost && !selectedProblemId && (
                                <div style={{ padding: 12 }}>
                                    <div style={{ position: 'relative', marginBottom: 12 }}>
                                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input 
                                            type="text" 
                                            placeholder="Tìm bài tập..." 
                                            value={problemSearch}
                                            onChange={(e) => setProblemSearch(e.target.value)}
                                            style={{ width: '100%', padding: '8px 10px 8px 32px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-primary)' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {problemsRes?.items?.map((p: any) => (
                                            <div 
                                                key={p.id} 
                                                className="problem-card-item"
                                                onClick={() => handleSelectProblem(p.slug)}
                                                style={{ 
                                                    padding: '12px 14px', 
                                                    background: 'var(--bg-tertiary)', 
                                                    border: '1px solid var(--border)', 
                                                    borderRadius: 10, 
                                                    fontSize: 13, 
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    position: 'relative',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>{p.title}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
                                                        <span style={{ 
                                                            padding: '2px 6px', 
                                                            borderRadius: 4, 
                                                            background: p.difficulty === 'Easy' ? 'rgba(16,185,129,0.1)' : p.difficulty === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                                            color: p.difficulty === 'Easy' ? 'var(--accent-green)' : p.difficulty === 'Medium' ? 'var(--accent-orange)' : 'var(--accent-red)',
                                                            fontWeight: 600,
                                                            fontSize: 10
                                                        }}>
                                                            {p.difficulty}
                                                        </span>
                                                        <span>{p.category?.name}</span>
                                                    </div>
                                                </div>
                                                <div className="select-btn" style={{ 
                                                    padding: '6px 12px', 
                                                    borderRadius: 6, 
                                                    background: 'var(--accent-purple)', 
                                                    color: 'white', 
                                                    fontSize: 11, 
                                                    fontWeight: 600,
                                                    boxShadow: 'var(--shadow-glow-purple)'
                                                }}>
                                                    Chọn
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <style jsx>{`
                                        .problem-card-item:hover {
                                            border-color: var(--accent-purple) !important;
                                            background: rgba(147, 51, 234, 0.05) !important;
                                            transform: translateY(-2px);
                                        }
                                        .problem-card-item:hover .select-btn {
                                            background: #7e22ce !important;
                                        }
                                    `}</style>
                                </div>
                            )}

                            {selectedProblemId && (isLoadingProblemDetail || !problemDetail) ? (
                                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 40 }}>
                                    <Loader2 className="animate-spin" size={24} color="var(--accent-purple)" />
                                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Đang tải nội dung bài tập...</div>
                                </div>
                            ) : selectedProblemId && problemDetail ? (
                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    <ProblemUiStudent 
                                        title={problemDetail.title}
                                        description={problemDetail.version?.description}
                                        testcases={problemDetail.testcases}
                                        difficulty={problemDetail.difficulty as any}
                                        stats={problemDetail.stats as any}
                                        timeLimit={problemDetail.timeLimit}
                                        memoryLimit={problemDetail.memoryLimit}
                                    />
                                    {isHost && (
                                        <div style={{ padding: '0 16px 16px' }}>
                                            <button onClick={() => setSelectedProblemId(null)} className="btn btn-ghost" style={{ width: '100%', fontSize: 12 }}>Chọn bài tập khác</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                !isHost && (
                                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 13, padding: 20 }}>
                                        Đang chờ Host chọn bài tập...
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, minWidth: 0 }}>
                    <div className="card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0b0f1a', position: 'relative' }}>
                        <CodeEditor 
                            roomId={roomId} 
                            viewingUser={viewingUser} 
                            isViewing={isViewing}
                            workspaceId={workspaceId} 
                            activeFilePath={activeFileName}
                            hideSidebar={true}
                            onAddFile={handleAddFile}
                            onRenameFile={handleRenameFile}
                            onDeleteFile={handleDeleteFile}
                            onSetMain={handleSetMain}
                            files={files}
                            onFilesChange={(newFiles) => {
                                filesRef.current = newFiles;
                                setFiles(newFiles);
                            }}
                            mainFilePath={mainFileName}
                            onActiveFileChange={setActiveFileName}
                        />
                    </div>

                    {terminalOpen && (
                        <div className="card" style={{ height: '260px', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0b0f1a', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', gap: 20, padding: '0 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                                <div 
                                    onClick={() => setResultTab('input')} 
                                    style={{ 
                                        padding: '10px 4px', fontSize: 13, fontWeight: 600, cursor: 'pointer', 
                                        color: resultTab === 'input' ? 'var(--accent-purple)' : 'var(--text-muted)', 
                                        borderBottom: resultTab === 'input' ? '2px solid var(--accent-purple)' : '2px solid transparent', 
                                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 
                                    }}
                                >
                                    <Terminal size={14} /> Đầu vào
                                </div>
                                <div 
                                    onClick={() => setResultTab('output')} 
                                    style={{ 
                                        padding: '10px 4px', fontSize: 13, fontWeight: 600, cursor: 'pointer', 
                                        color: resultTab === 'output' ? 'var(--accent-purple)' : 'var(--text-muted)', 
                                        borderBottom: resultTab === 'output' ? '2px solid var(--accent-purple)' : '2px solid transparent', 
                                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 
                                    }}
                                >
                                    <Database size={14} /> Kết quả
                                </div>
                            </div>
                            
                                    <div style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
                                        {resultTab === 'input' ? (
                                            <textarea value={customInput} onChange={(e) => setCustomInput(e.target.value)} style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 12, resize: 'none', fontFamily: 'monospace', lineHeight: 1.6 }} />
                                        ) : (
                                            <>
                                                {execStatus === "QUEUED" && <div style={{ color: 'var(--accent-cyan)', fontSize: 13 }} className="blink">Đang chờ chấm...</div>}
                                                {runResult && !runResult.score && (
                                                    <div style={{ fontSize: 12 }}>
                                                        {runResult.runtime && <div style={{ fontWeight: 'bold', color: String(runResult.status || '').toLowerCase() === 'accepted' ? 'var(--accent-green)' : 'var(--accent-red)' }}>Thời gian: {runResult.runtime}ms</div>}
                                                        {runResult.compileOutput && <pre style={{ background: '#000', padding: 8, marginTop: 4, color: '#f87171' }}>{runResult.compileOutput}</pre>}
                                                        {!runResult.compileOutput && (runResult.output || runResult.stdout) && <pre style={{ background: '#000', padding: 8, marginTop: 4 }}>{runResult.output || runResult.stdout}</pre>}
                                                    </div>
                                                )}
                                                {runResult && runResult.score !== undefined && (
                                                    <div style={{ fontSize: 12 }}>
                                                        <div style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--accent-purple)' }}>Điểm: {runResult.score} / {runResult.maxScore || 100}</div>
                                                        <div style={{ marginBottom: 8 }}>Vượt qua: {runResult.testcasesPassed || 0} / {runResult.testcasesTotal || 0} testcases</div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 8 }}>
                                                            {runResult.results?.map((res: any, idx: number) => (
                                                                <div key={idx} style={{ padding: '4px 8px', borderRadius: 4, textAlign: 'center', fontSize: 10, background: res.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${res.passed ? 'var(--accent-green)' : 'var(--accent-red)'}` }}>TC {idx + 1}</div>
                                                            ))}
                                                        </div>
                                                        {runResult.error && <div style={{ color: 'var(--accent-red)', marginTop: 8 }}>{runResult.error}</div>}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                        </div>
                    )}
                </div>

                <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-secondary)', border: '1px solid var(--border)', minWidth: 0 }}>
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
                        {!rightCollapsed && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ fontWeight: 700, fontSize: 13 }}>👥 Thành viên</div>
                                <span className="badge badge-green" style={{ fontSize: 9 }}>
                                    {onlineUserIds.size} online
                                </span>
                            </div>
                        )}
                        <button onClick={() => setRightCollapsed(!rightCollapsed)} className="btn-icon" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            {rightCollapsed ? <ArrowLeft size={16} /> : <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
                        </button>
                    </div>
                    {!rightCollapsed && (
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <Participants 
                                roomId={roomId} 
                                currentUserId={currentUser?.id} 
                                viewingUser={viewingUser} 
                                onSelectUser={setViewingUser} 
                                onlineUserIds={onlineUserIds} 
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* PREMIUM MODAL SYSTEM */}
            {modal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        width: '100%', maxWidth: 420, padding: 28,
                        background: 'rgba(18, 22, 36, 0.95)',
                        border: '1px solid rgba(139, 92, 246, 0.4)',
                        borderRadius: 24,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                        animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        position: 'relative',
                        color: '#fff'
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {modal.title}
                        </h3>
                        {modal.message && (
                            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 28, lineHeight: 1.6 }}>
                                {modal.message}
                            </p>
                        )}

                        {modal.type === 'input' && (
                            <div style={{ position: 'relative', marginBottom: 28 }}>
                                <input 
                                    autoFocus
                                    id="modal-input-field"
                                    type="text"
                                    defaultValue={modal.defaultValue}
                                    style={{
                                        width: '100%', background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 12, padding: '12px 16px',
                                        fontSize: 16, color: '#fff', outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') { 
                                            modal.onConfirm((e.target as any).value || modal.defaultValue); 
                                            setModal(null); 
                                        }
                                        if (e.key === 'Escape') setModal(null);
                                    }}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button 
                                className="btn"
                                onClick={() => setModal(null)}
                                style={{ 
                                    padding: '10px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', 
                                    border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer',
                                    fontSize: 14, fontWeight: 600
                                }}
                            >
                                {modal.cancelText || 'Hủy'}
                            </button>
                            <button 
                                className="btn"
                                onClick={() => {
                                    const val = (document.getElementById('modal-input-field') as HTMLInputElement)?.value;
                                    modal.onConfirm(val || modal.defaultValue);
                                    setModal(null);
                                }}
                                style={{ 
                                    padding: '10px 24px', borderRadius: 12, 
                                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                    border: 'none', color: '#fff', cursor: 'pointer',
                                    fontSize: 14, fontWeight: 700,
                                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                                }}
                            >
                                {modal.confirmText || 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
