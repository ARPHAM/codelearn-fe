'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

import Editor from '@monaco-editor/react'
import './styles.module.css'
import { JetBrains_Mono } from 'next/font/google'
import { io, Socket } from 'socket.io-client'
import { useSubmitCode, useRunCode } from './_api/mutations'
import { getRunResult, getSubmissionResult } from '@/features/problems/mutations'
import { useLanguages } from '@/hooks/useLanguages'
import { useStudentProblemDetail } from '@/hooks/useProblems'
import { examApi } from '@/api/exam.api'
import FillInTheBlankEditor from '@/components/FillInTheBlankEditor'
import { toast } from '@/components/ui/Toast'
import { useSearchParams, useRouter } from 'next/navigation'
import ProblemUiStudent from '../../components/problem-ui-student'
import { Bot, Send, Target, ClipboardList, Code2, Play, Upload, Edit2, Star, X, Plus, Database, Terminal, Loader2, Sparkles, ChevronLeft, ChevronRight, PanelLeftOpen, PanelRightOpen, MessageSquareText } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { aiApi } from '@/src/api/ai.api';

const mono = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
})

const getMonacoLanguage = (ext: string): string => {
    const mapping: Record<string, string> = {
        '.py': 'python',
        '.cpp': 'cpp',
        '.cxx': 'cpp',
        '.java': 'java',
        '.js': 'javascript',
        '.ts': 'typescript',
        '.cs': 'csharp',
        '.go': 'go',
        '.rs': 'rust',
        '.php': 'php',
        '.rb': 'ruby',
        '.sql': 'sql',
        '.css': 'css',
        '.html': 'html',
    }
    return mapping[ext.toLowerCase()] || 'text'
}

const getExt = (filename: string) => {
    const parts = filename.split('.');
    return parts.length > 1 ? '.' + parts.pop() : '';
}

const getUniqueFilename = (name: string, files: any[]) => {
    let newName = name;
    let counter = 1;
    const parts = name.split('.');
    const ext = parts.length > 1 ? '.' + parts.pop() : '';
    const base = (parts.length === 0 && ext) ? '' : parts.join('.');

    while (files.find(f => f.filename === newName)) {
        newName = `${base}_${counter}${ext}`;
        counter++;
    }
    return newName;
}

const extractAnswers = (content: string): string[] => {
    const regex = /\{\{([\s\S]*?)\}\}/g;
    const answers: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        answers.push(match[1]);
    }
    return answers;
};

const initialAiMessages = [
    {
        role: 'assistant',
        msg: 'Xin chào! Tôi là AI Assistant. Tôi đã sẵn sàng hỗ trợ bạn giải quyết bài tập này. Bạn cần giúp đỡ gì không?',
    }
]

export default function CodeEditorPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const slug = searchParams.get('slug')
    const battleId = searchParams.get('battleId')
    const examId = searchParams.get('examId')

    const editorRef = useRef<any>(null)
    const socketRef = useRef<Socket | null>(null)
    const handlerRef = useRef<((data: any) => void) | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const currentEventNameRef = useRef<string | null>(null)
    const submitRef = useRef<(() => void) | null>(null)

    const stuckMinutes = 32

    const { data: languages = [] } = useLanguages()

    const [language, setLanguage] = useState('python')
    const [selectedLanguageId, setSelectedLanguageId] = useState<number | undefined>(undefined);

    // Tìm languageId dựa trên tên ngôn ngữ
    useEffect(() => {
        if (languages.length > 0 && language) {
            const langObj = languages.find(l => l.name.toLowerCase() === language.toLowerCase());
            if (langObj && langObj.id !== selectedLanguageId) {
                setSelectedLanguageId(langObj.id);
            }
        }
    }, [language, languages, selectedLanguageId]);

    const { data: problemData, isLoading: isLoadingProblem } = useStudentProblemDetail(slug || '', selectedLanguageId, examId || undefined, !!slug)

    const isPracticeMode = !examId;
    const workspaceConfig = (isPracticeMode || !slug) 
        ? { canCreateFile: true, canChangeMainFile: true } 
        : (problemData?.version?.workspaceConfig || { canCreateFile: false, canChangeMainFile: false });

    const [files, setFiles] = useState<{ filename: string, language: string, content: string, type?: string, languageId?: number }[]>([
        {
            filename: "main.py",
            language: "python",
            content: "",
            type: "NORMAL"
        }
    ])

    const [activeFileName, setActiveFileName] = useState<string>("main.py")
    const [mainFileName, setMainFileName] = useState<string>("")

    const [modal, setModal] = useState<{
        type: 'input' | 'confirm',
        title: string,
        message?: string,
        defaultValue?: string,
        confirmText?: string,
        cancelText?: string,
        onConfirm: (val?: string) => void
    } | null>(null);

    const [isInitialized, setIsInitialized] = useState(false)
    const [lastProblemVersionId, setLastProblemVersionId] = useState<string | null>(null);
    const [lastLanguageId, setLastLanguageId] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (languages.length === 0) return;

        if (!slug) {
            if (!isInitialized) {
                const defaultFiles = [{
                    filename: "main.py",
                    language: "python",
                    content: languages.find(l => l.name.toLowerCase() === 'python')?.template || "",
                    type: "NORMAL"
                }];
                setFiles(defaultFiles);
                setActiveFileName("main.py");
                setMainFileName("main.py");
                setLanguage("python");
                setIsInitialized(true);
            }
            return;
        }

        // Nếu có data mới từ BE (khi đổi ngôn ngữ hoặc load lần đầu)
        if (!isLoadingProblem && problemData) {
            const currentVersionId = problemData.version?.id;
            
            // Khởi tạo lại nếu:
            // 1. Chưa khởi tạo
            // 2. VersionId thay đổi (có bản cập nhật mới)
            // 3. LanguageId thay đổi (người dùng chọn ngôn ngữ khác)
            const shouldReinit = !isInitialized || 
                                (currentVersionId !== lastProblemVersionId) || 
                                (selectedLanguageId !== lastLanguageId);

            if (shouldReinit) {
                // Lọc file theo quy tắc: Ẩn HIDDEN/SOLUTION, chỉ lấy TEMPLATE/NEUTRAL
                const allFiles = (problemData.languageFiles || []).filter((f: any) => 
                    f.type !== 'HIDDEN' && f.type !== 'SOLUTION'
                );

                if (allFiles.length > 0) {
                    // Thử khôi phục từ localStorage
                    const storageKey = `code-cache-${problemData.id}-${selectedLanguageId}`;
                    const cached = localStorage.getItem(storageKey);
                    let initialFiles = [];

                    if (cached) {
                        try {
                            initialFiles = JSON.parse(cached);
                        } catch (e) {
                            console.error("Failed to parse cached code", e);
                        }
                    }

                    if (initialFiles.length === 0) {
                        initialFiles = allFiles.map(f => {
                            const l = languages.find(lx => lx.id === f.languageId) || f.language;
                            const langName = l?.name?.toLowerCase() || 'text';
                            return {
                                filename: f.path,
                                language: langName,
                                content: f.content,
                                type: f.type,
                                languageId: f.languageId
                            }
                        });
                    }

                    setFiles(initialFiles);
                    setActiveFileName(initialFiles[0].filename);
                    const entry = problemData?.version?.entryFile || initialFiles[0].filename;
                    setMainFileName(entry);

                    const entryFileObj = initialFiles.find((f: any) => f.filename === entry) || initialFiles[0];
                    if (entryFileObj.language !== 'text') {
                        setLanguage(entryFileObj.language);
                    }
                    setIsInitialized(true);
                    setLastProblemVersionId(currentVersionId as string);
                    setLastLanguageId(selectedLanguageId);
                } else {
                    // Fallback nếu không có file nào (Dùng template mặc định của ngôn ngữ)
                    const langObj = languages.find(l => l.id === selectedLanguageId) || languages.find(l => l.name.toLowerCase() === 'python') || languages[0];
                    const defaultEntryName = problemData?.version?.entryFile || `main${langObj.ext || '.py'}`;

                    const defaultFiles = [{
                        filename: defaultEntryName,
                        language: langObj.name.toLowerCase(),
                        content: langObj.template || "",
                        type: "NORMAL"
                    }];

                    setFiles(defaultFiles);
                    setActiveFileName(defaultEntryName);
                    setMainFileName(defaultEntryName);
                    setLanguage(langObj.name.toLowerCase());
                    setIsInitialized(true);
                    setLastProblemVersionId(currentVersionId as string);
                    setLastLanguageId(selectedLanguageId);
                }
            }
        }
    }, [slug, problemData, languages, isInitialized, isLoadingProblem, selectedLanguageId, lastProblemVersionId, lastLanguageId])

    // Auto-save to localStorage
    useEffect(() => {
        if (isInitialized && problemData?.id) {
            const timer = setTimeout(() => {
                localStorage.setItem(`code-cache-${problemData.id}`, JSON.stringify(files));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [files, isInitialized, problemData?.id]);

    // Timer logic cho Kỳ thi
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    useEffect(() => {
        if (examId && !timeLeft) {
            // Fetch exam detail để lấy endTime
            examApi.getExamDetail(examId).then(data => {
                if (data.endTime) {
                    const end = new Date(data.endTime).getTime();
                    const now = new Date().getTime();
                    const diff = Math.max(0, Math.floor((end - now) / 1000));
                    setTimeLeft(diff);
                }
            });
        }
    }, [examId]);

    useEffect(() => {
        if (timeLeft !== null && timeLeft > 0) {
            const interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev === null || prev <= 1) {
                        clearInterval(interval);
                        if (prev === 1) handleAutoSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timeLeft]);

    const handleAutoSubmit = () => {
        toast({ type: 'warning', title: 'Hết giờ!', message: 'Hệ thống đang tự động nộp bài làm của bạn.' });
        if (submitRef.current) submitRef.current();
    };


    const handleAddFile = () => {
        setModal({
            type: 'input',
            title: 'Thêm file mới',
            message: 'Nhập tên file (ví dụ: utils.py)',
            defaultValue: '',
            onConfirm: (name) => {
                if (!name) return;
                let finalName = name;
                if (!finalName.includes('.')) {
                    const langObj = languages.find(l => l.name.toLowerCase() === language.toLowerCase());
                    if (langObj) finalName += langObj.ext;
                    else finalName += '.txt';
                }

                const uniqueName = getUniqueFilename(finalName, files);
                const langObjFound = languages.find(l => l.ext === getExt(uniqueName));

                setFiles(prev => [...prev, {
                    filename: uniqueName,
                    language: langObjFound?.name.toLowerCase() || 'text',
                    content: langObjFound?.template || ""
                }]);
                setActiveFileName(uniqueName);
            }
        });
    };

    const handleRenameFile = (oldName: string) => {
        setModal({
            type: 'input',
            title: 'Đổi tên file',
            message: `Nhập tên mới cho file ${oldName}`,
            defaultValue: oldName,
            onConfirm: (newName) => {
                if (!newName || newName === oldName) return;
                if (files.find(f => f.filename === newName)) {
                    toast({ type: 'error', title: 'Lỗi', message: 'Tên file đã tồn tại.' });
                    return;
                }

                setFiles(prev => prev.map(f => f.filename === oldName ? { ...f, filename: newName } : f));
                if (activeFileName === oldName) setActiveFileName(newName);
                if (mainFileName === oldName) setMainFileName(newName);

                if (mainFileName === oldName) {
                    const ext = getExt(newName);
                    const lang = languages.find(l => l.ext === ext);
                    if (lang) {
                        setLanguage(lang.name.toLowerCase());
                    } else {
                        toast({ type: 'warning', title: 'Cảnh báo', message: `File chính hiện có đuôi ${ext} không được hỗ trợ bởi các ngôn ngữ lập trình khả dụng.` });
                    }
                }
            }
        });
    };

    const handleDeleteFile = (name: string) => {
        if (files.length <= 1) return;
        if (name === mainFileName) {
            toast({ type: 'warning', title: 'Cảnh báo', message: 'Không thể xóa file chính.' });
            return;
        }
        setFiles(prev => prev.filter(f => f.filename !== name));
        if (activeFileName === name) {
            setActiveFileName(mainFileName);
        }
    };

    const handleSetMain = (name: string) => {
        const ext = getExt(name);
        const lang = languages.find(l => l.ext === ext);

        if (!lang) {
            toast({ type: 'warning', title: 'Lưu ý', message: 'File này không có đuôi hỗ trợ chạy code, nhưng vẫn có thể làm file chính.' });
        } else {
            setLanguage(lang.name.toLowerCase());
        }

        setMainFileName(name);
        toast({ type: 'info', title: 'Đã cập nhật', message: `Đã đặt ${name} làm file chính.` });
    };

    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        if (!newLang) return;

        const langObj = languages.find(l => l.name.toLowerCase() === newLang.toLowerCase());
        if (langObj && mainFileName) {
            const ext = getExt(mainFileName);
            if (ext !== langObj.ext) {
                const parts = mainFileName.split('.');
                const base = parts.length > 1 ? parts.slice(0, -1).join('.') : mainFileName;
                const newMainName = getUniqueFilename(base + langObj.ext, files.filter(f => f.filename !== mainFileName));

                const updateFiles = (shouldReset: boolean) => {
                    setFiles(prev => prev.map(f => {
                        if (f.filename === mainFileName) {
                            return {
                                ...f,
                                filename: newMainName,
                                language: newLang.toLowerCase(),
                                content: shouldReset ? (langObj.template || "") : f.content
                            };
                        }
                        return f;
                    }));
                    setMainFileName(newMainName);
                    if (activeFileName === mainFileName) setActiveFileName(newMainName);
                };

                setModal({
                    type: 'confirm',
                    title: 'Chuyển đổi ngôn ngữ',
                    message: `Bạn có muốn nạp code mẫu của ${newLang} không? (Nội dung hiện tại trong file ${mainFileName} sẽ bị xóa)`,
                    confirmText: 'Đồng ý, nạp mẫu',
                    cancelText: 'Giữ lại code cũ',
                    onConfirm: () => updateFiles(true),
                });
            }
        }
    };

    const [status, setStatus] = useState<"IDLE" | "RUNNING" | "QUEUED" | "COMPLETED" | "ERROR">("IDLE")
    const [runResult, setRunResult] = useState<any>(null)
    const [submitResult, setSubmitResult] = useState<any>(null)
    const [customInput, setCustomInput] = useState<string>("")
    const [resultTab, setResultTab] = useState<'output' | 'input'>('output')

    const [chatMessages, setChatMessages] = useState<any[]>(initialAiMessages)
    const [userMsg, setUserMsg] = useState("")
    const [isAiLoading, setIsAiLoading] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [chatMessages])

    const handleSendMessage = async () => {
        if (!userMsg.trim() || isAiLoading) return

        const newMsg = { role: 'user', msg: userMsg }
        const updatedHistory = [...chatMessages, newMsg]
        setChatMessages(updatedHistory)
        setUserMsg("")
        setIsAiLoading(true)

        try {
            const resp = await aiApi.chat({
                messages: updatedHistory.map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    content: m.msg
                })),
                codeContext: files.map(f => `${f.filename}:\n${f.content}`).join('\n\n'),
                problemContext: {
                    title: problemData?.title || 'Chưa rõ',
                    description: Array.isArray(problemData?.version?.description)
                        ? problemData.version.description.map((b: any) => b.content).join('\n')
                        : 'Chưa rõ'
                }
            })

            const data = resp
            if (data.text) {
                setChatMessages(prev => [...prev, { role: 'assistant', msg: data.text }])
            } else {
                toast({ type: 'error', title: 'Lỗi AI', message: data.error || 'Không thể nhận phản hồi từ AI' })
            }
        } catch (err: any) {
            toast({ type: 'error', title: 'Lỗi kết nối', message: err.response?.data?.message || 'Không thể kết nối với AI Assistant' })
        } finally {
            setIsAiLoading(false)
        }
    }

    const runMutation = useRunCode()
    const submitMutation = useSubmitCode()

    const initSocket = () => {
        if (socketRef.current?.connected) return socketRef.current;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const s = io(apiUrl, {
            autoConnect: true,
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
        socketRef.current = s;
        return s;
    };

    useEffect(() => {
        return () => { socketRef.current?.disconnect() }
    }, [])

    const handleRun = async () => {
        const safeMainFileName = mainFileName || files[0].filename;
        const mainFileObj = files.find(f => f.filename === safeMainFileName) || files[0];
        const langObj = languages.find(l => l.name.toLowerCase() === mainFileObj.language.toLowerCase());

        setStatus("RUNNING")
        setRunResult(null);
        setSubmitResult(null);

        const answers: Record<string, string[]> = {};
        const otherFiles: any[] = [];

        files.forEach(f => {
            const fileAnswers = extractAnswers(f.content);
            if (fileAnswers.length > 0) {
                answers[f.filename] = fileAnswers;
            }
            otherFiles.push({
                filePath: f.filename,
                content: f.content,
                language: f.language
            });
        });

        try {
            const resp = await runMutation.mutateAsync({
                languageId: langObj?.id,
                language: mainFileObj.language,
                entryFile: safeMainFileName,
                files: otherFiles,
                answers,
                input: customInput,
                problemVersionId: problemData?.version?.id,
                examId: examId as string
            })
            setStatus("QUEUED")
            setResultTab('output')
            listenToResult(resp.id, 'RUN')
        } catch (err) { setStatus("ERROR") }
    }

    const handleSubmit = async () => {
        const safeMainFileName = mainFileName || files[0].filename;
        const mainFileObj = files.find(f => f.filename === safeMainFileName) || files[0];
        const langObj = languages.find(l => l.name.toLowerCase() === (mainFileObj.language || 'python').toLowerCase());

        setStatus("RUNNING")
        setRunResult(null);
        setSubmitResult(null);

        const answers: Record<string, string[]> = {};
        const otherFiles: any[] = [];

        files.forEach(f => {
            const fileAnswers = extractAnswers(f.content);
            if (fileAnswers.length > 0) {
                answers[f.filename] = fileAnswers;
            }
            otherFiles.push({
                filePath: f.filename,
                content: f.content,
                language: f.language
            });
        });

        try {
            const resp = await submitMutation.mutateAsync({
                languageId: langObj?.id,
                language: mainFileObj.language || 'python',
                entryFile: safeMainFileName,
                files: otherFiles,
                answers,
                problemVersionId: problemData?.version?.id as string,
                battleId: battleId as string,
                examId: examId as string
            })
            setStatus("QUEUED")
            // Nếu là Kỳ thi, xóa cache và điều hướng sau khi nộp
            if (problemData?.id) localStorage.removeItem(`code-cache-${problemData.id}`);
            if (examId) {
                toast({ type: 'success', title: 'Thành công', message: 'Bài làm đã được nộp. Đang chuyển tới màn hình kết quả...' });
                setTimeout(() => {
                    router.push(`/student/exams/${examId}/result`);
                }, 1500);
            } else {
                listenToResult(resp.submissionId, 'SUBMIT')
            }
        } catch (err) { setStatus("ERROR") }
    }

    useEffect(() => { submitRef.current = handleSubmit }, [handleSubmit])

    const listenToResult = async (id: string, type: 'RUN' | 'SUBMIT') => {
        const s = initSocket();
        if (currentEventNameRef.current && handlerRef.current && s) {
            s.off(currentEventNameRef.current, handlerRef.current)
        }
        const newEventName = `submission-${id}`
        const altEventName = `run-${id}`
        currentEventNameRef.current = newEventName

        handlerRef.current = (data: any) => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            setStatus("COMPLETED")
            if (data.score !== undefined) { setSubmitResult(data); setRunResult(null); }
            else { setRunResult(data); setSubmitResult(null); }
        }

        const wrappedHandler = (data: any) => {
            if (handlerRef.current) handlerRef.current(data);
            s?.off(newEventName, wrappedHandler);
            s?.off(altEventName, wrappedHandler);
        };

        if (s) { s.on(newEventName, wrappedHandler); s.on(altEventName, wrappedHandler); }

        try {
            const data = type === 'RUN' ? await getRunResult(id) : await getSubmissionResult(id);
            if (data && data.status !== 'QUEUED' && data.status !== 'PROCESSING') {
                if (handlerRef.current) handlerRef.current(data);
            }
        } catch (err) { }

        timeoutRef.current = setTimeout(() => {
            if (status === "QUEUED" || status === "RUNNING") {
                setStatus("ERROR")
                toast({ type: 'warning', title: 'Timeout', message: "Không nhận được phản hồi từ server." })
            }
        }, 15000)
    }

    const currentFile = files.find(f => f.filename === activeFileName)

    const [leftCollapsed, setLeftCollapsed] = useState(false)
    const [rightCollapsed, setRightCollapsed] = useState(false)


    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 124px)', gap: 14, minHeight: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Code2 size={24} color="var(--accent-purple)" />
                            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>
                                {slug ? `Soạn thảo: ${problemData?.title || 'Đang tải...'}` : 'Trình soạn thảo Code tự do'}
                            </span>
                        </h1>
                        <p className="page-subtitle">{problemData?.title ? `Bài: ${problemData.title}` : 'Chế độ Code Tự Do'} · {currentFile?.language}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        {timeLeft !== null && (
                            <div style={{ marginRight: 20, textAlign: 'center' }}>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>BÀI THI KẾT THÚC SAU</div>
                                <div style={{ fontSize: 18, fontWeight: 900, color: timeLeft < 60 ? 'var(--accent-red)' : 'var(--accent-purple)', fontFamily: 'monospace' }}>
                                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                                </div>
                            </div>
                        )}
                        <select
                            className="btn"
                            style={{ background: '#1c212e', fontSize: 13, border: '1px solid var(--border)' }}
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                        >
                            <option value="">-- Chọn ngôn ngữ --</option>
                            {languages.map(l => (
                                <option key={l.id} value={l.name.toLowerCase()}>{l.name}</option>
                            ))}
                        </select>
                        <button className="btn btn-ghost" onClick={handleRun} disabled={status === "RUNNING" || status === "QUEUED"} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {status === "RUNNING" || status === "QUEUED" ? <Loader2 className="animate-spin" size={16} /> : <><Play size={16} fill="currentColor" /> Chạy code</>}
                        </button>
                        {slug && (
                            <button className="btn btn-primary" onClick={handleSubmit} disabled={status === "RUNNING" || status === "QUEUED"} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {status === "RUNNING" || status === "QUEUED" ? "Đang xử lý..." : <><Upload size={16} /> Nộp bài</>}
                            </button>
                        )}
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: !slug
                        ? `1fr ${rightCollapsed ? '48px' : '340px'}`
                        : `${leftCollapsed ? '48px' : '320px'} 1fr ${rightCollapsed ? '48px' : '340px'}`,
                    gap: 14,
                    flex: 1,
                    minHeight: 0,
                    transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    {slug && (
                        leftCollapsed ? (
                            <div className="card" style={{ padding: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, cursor: 'pointer', background: 'rgba(30, 35, 48, 0.4)' }} onClick={() => setLeftCollapsed(false)} title="Mở đề bài">
                                <PanelLeftOpen size={20} color="var(--accent-purple)" />
                                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 2 }}>ĐỀ BÀI</div>
                            </div>
                        ) : (
                            <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', minHeight: 0, transition: 'all 0.3s' }}>
                                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <ClipboardList size={14} /> Đề bài
                                    </div>
                                    <button onClick={() => setLeftCollapsed(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }} title="Thu nhỏ">
                                        <ChevronLeft size={16} />
                                    </button>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto', padding: 0, fontSize: 12 }}>
                                    {isLoadingProblem && <div style={{ padding: 16 }}>Đang tải đề bài...</div>}
                                    {!isLoadingProblem && problemData && (
                                        <ProblemUiStudent
                                            title={problemData.title}
                                            description={problemData.version?.description}
                                            testcases={problemData.testcases}
                                            difficulty={problemData.difficulty as any}
                                            stats={problemData.stats as any}
                                            timeLimit={problemData.timeLimit}
                                            memoryLimit={problemData.memoryLimit}
                                        />
                                    )}
                                    {!isLoadingProblem && !problemData && (
                                        <div style={{ padding: 16, color: 'red' }}>Lỗi không tải được đề bài!</div>
                                    )}
                                </div>
                            </div>
                        )
                    )}

                    <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', minHeight: 0 }}>
                        <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                {files.map(f => {
                                    const isMain = mainFileName === f.filename;
                                    const active = activeFileName === f.filename;
                                    const currentLangObj = languages.find(l => l.name.toLowerCase() === language.toLowerCase());
                                    const fileExt = getExt(f.filename);
                                    const isExtInvalid = isMain && currentLangObj && fileExt !== currentLangObj.ext && !['.txt', ''].includes(fileExt);
                                    const isUnsupported = isMain && !languages.find(l => l.ext === fileExt);
                                    const dbFile = problemData?.languageFiles?.find((lf: any) => lf.path === f.filename);
                                    const isTemplateFile = dbFile && dbFile.type === 'TEMPLATE';

                                    return (
                                        <div key={f.filename}
                                            className="file-tab"
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: '8px 8px 0 0', cursor: 'pointer',
                                                background: active ? '#0b0f1a' : 'transparent',
                                                border: active ? '1px solid var(--border)' : '1px solid transparent',
                                                borderBottom: active ? '1px solid #0b0f1a' : '1px solid transparent',
                                                marginBottom: -1, zIndex: 1,
                                                color: active ? (isMain && (isExtInvalid || isUnsupported) ? '#ef4444' : '#fff') : 'rgba(255,255,255,0.4)',
                                                fontSize: 12, fontWeight: active ? 600 : 400, transition: 'all 0.1s ease',
                                                position: 'relative'
                                            }}
                                            onClick={() => setActiveFileName(f.filename)}
                                        >
                                            <style>{`
                                                .file-tab:hover { background: ${active ? '#0b0f1a' : 'rgba(255,255,255,0.03)'} !important; color: ${active ? '#fff' : 'rgba(255,255,255,0.7)'} !important; }
                                            `}</style>
                                            {isMain && <Star size={11} fill="#eab308" color="#eab308" style={{ marginRight: 2 }} />}
                                            <span style={{ whiteSpace: 'nowrap' }}>{f.filename}</span>
                                            {active && (
                                                <div style={{ display: 'flex', gap: 6, marginLeft: 6, animation: 'fadeIn 0.2s ease' }}>
                                                    {!isTemplateFile && (
                                                        <button onClick={(e) => { e.stopPropagation(); handleRenameFile(f.filename); }} style={{ background: 'none', border: 'none', padding: 2, color: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Đổi tên file" className="tab-action">
                                                            <Edit2 size={10} />
                                                        </button>
                                                    )}
                                                    {!isMain && workspaceConfig.canChangeMainFile && (
                                                        <button onClick={(e) => { e.stopPropagation(); handleSetMain(f.filename); }} style={{ background: 'none', border: 'none', padding: 2, color: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Đặt làm file chính" className="tab-action">
                                                            <Star size={10} />
                                                        </button>
                                                    )}
                                                    {files.length > 1 && !isMain && !isTemplateFile && (
                                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteFile(f.filename); }} style={{ background: 'none', border: 'none', padding: 2, color: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} className="tab-action">
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            <style>{`
                                                .tab-action:hover { color: #fff !important; }
                                            `}</style>
                                        </div>
                                    );
                                })}
                                {((!slug) || (problemData?.version?.workspaceConfig?.canCreateFile ?? false)) && (
                                    <button onClick={handleAddFile} style={{ padding: '4px 8px', background: 'none', border: 'none', color: 'var(--accent-purple)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Thêm file mới">
                                        <Plus size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className={mono.className} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            {currentFile ? (
                                <FillInTheBlankEditor
                                    file={{
                                        id: currentFile.filename,
                                        path: currentFile.filename,
                                        content: currentFile.content,
                                        type: (problemData?.languageFiles?.find((lf: any) => lf.path === currentFile.filename)?.type === 'TEMPLATE') ? 'TEMPLATE' : (currentFile.type || 'NORMAL'),
                                    }}
                                    updateFile={(id: string, field: string, value: any) => {
                                        setFiles(prev => prev.map(f => f.filename === id ? { ...f, [field === 'path' ? 'filename' : field]: value } : f));
                                    }}
                                    languages={languages}
                                    isStudent={true}
                                    height="100%"
                                    onMount={(editor: any, monaco: any) => {
                                        editorRef.current = editor;
                                        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                                            if (submitRef.current) submitRef.current()
                                        })
                                    }}
                                />
                            ) : (
                                <div style={{ padding: 20, color: 'var(--text-muted)' }}>Vui lòng chọn hoặc tạo file để bắt đầu...</div>
                            )}
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', height: 230, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', gap: 20, padding: '0 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                                <div onClick={() => setResultTab('output')} style={{ padding: '10px 4px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: resultTab === 'output' ? 'var(--accent-purple)' : 'var(--text-muted)', borderBottom: resultTab === 'output' ? '2px solid var(--accent-purple)' : '2px solid transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Database size={14} /> Kết quả
                                </div>
                                <div onClick={() => setResultTab('input')} style={{ padding: '10px 4px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: resultTab === 'input' ? 'var(--accent-purple)' : 'var(--text-muted)', borderBottom: resultTab === 'input' ? '2px solid var(--accent-purple)' : '2px solid transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Terminal size={14} /> Custom Input
                                </div>
                            </div>

                            <div style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
                                {resultTab === 'input' ? (
                                    <textarea value={customInput} onChange={(e) => setCustomInput(e.target.value)} placeholder="Nhập dữ liệu đầu vào tại đây (stdin)..." style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 12, resize: 'none', fontFamily: 'monospace', lineHeight: 1.6 }} />
                                ) : (
                                    <>
                                        {status === "QUEUED" && <div style={{ color: 'var(--accent-cyan)', fontSize: 13 }} className="blink">Đang chờ chấm...</div>}
                                        {runResult && (
                                            <div style={{ fontSize: 12 }}>
                                                <div style={{ fontWeight: 'bold', color: runResult.status === 'ACCEPTED' ? 'var(--accent-green)' : 'var(--accent-red)' }}>Trạng thái: {runResult.status}</div>
                                                {runResult.runtime && <div>Thời gian: {runResult.runtime}ms</div>}
                                                {runResult.compileOutput && <pre style={{ background: '#000', padding: 8, marginTop: 4, color: '#f87171' }}>{runResult.compileOutput}</pre>}
                                                {runResult.output && <pre style={{ background: '#000', padding: 8, marginTop: 4 }}>{runResult.output}</pre>}
                                            </div>
                                        )}
                                        {submitResult && (
                                            <div style={{ fontSize: 12 }}>
                                                <div style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--accent-purple)' }}>Điểm: {submitResult.score} / 100</div>
                                                <div style={{ marginBottom: 8 }}>Vượt qua: {submitResult.testcasesPassed} / {submitResult.testcasesTotal} testcases</div>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 8 }}>
                                                    {submitResult.results?.map((res: any, idx: number) => (
                                                        <div key={idx} style={{ padding: '4px 8px', borderRadius: 4, textAlign: 'center', fontSize: 10, background: res.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${res.passed ? 'var(--accent-green)' : 'var(--accent-red)'}` }}>TC {idx + 1}</div>
                                                    ))}
                                                </div>
                                                {submitResult.error && <div style={{ color: 'var(--accent-red)', marginTop: 8 }}>{submitResult.error}</div>}
                                            </div>
                                        )}
                                        {!runResult && !submitResult && status === "IDLE" && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Chưa có kết quả. Nhấn Chạy code hoặc Nộp bài.</div>}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {rightCollapsed ? (
                        <div className="card" style={{ padding: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, cursor: 'pointer', background: 'rgba(30, 35, 48, 0.4)' }} onClick={() => setRightCollapsed(false)} title="Mở AI Assistant">
                            <PanelRightOpen size={20} color="var(--accent-purple)" />
                            <div style={{ writingMode: 'vertical-rl', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 2 }}>AI ASSISTANT</div>
                        </div>
                    ) : (
                        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', minHeight: 0, background: 'rgba(30, 35, 48, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--gradient-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow-purple)' }}>
                                        <Bot size={16} color="white" />
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.01em' }}>AI Assistant</span>
                                </div>
                                <button onClick={() => setRightCollapsed(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }} title="Thu nhỏ">
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            <div style={{ flex: 1, padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {chatMessages.map((m, i) => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 4 }}>
                                        <div style={{
                                            maxWidth: '90%', padding: '10px 14px', borderRadius: m.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                                            background: m.role === 'user' ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.05)',
                                            color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.6, boxShadow: m.role === 'user' ? '0 4px 12px rgba(139, 92, 246, 0.2)' : 'none', overflowWrap: 'break-word', wordBreak: 'break-word'
                                        }}>
                                            {m.role === 'assistant' ? (
                                                <div className="markdown-body" style={{ fontSize: 13, background: 'transparent' }}>
                                                    <style>{`
                                                        .markdown-body pre { white-space: pre-wrap !important; word-break: break-all !important; background: rgba(0,0,0,0.3) !important; padding: 10px !important; border-radius: 8px !important; margin: 8px 0 !important; }
                                                        .markdown-body code { white-space: pre-wrap !important; word-break: break-all !important; }
                                                    `}</style>
                                                    <ReactMarkdown>{m.msg}</ReactMarkdown>
                                                </div>
                                            ) : (m.msg)}
                                        </div>
                                    </div>
                                ))}
                                {isAiLoading && (
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px', color: 'var(--text-muted)' }}>
                                        <div className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-purple)' }} />
                                        <span style={{ fontSize: 12, fontWeight: 500 }}>AI đang suy nghĩ...</span>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <div style={{ padding: '14px', borderTop: '1px solid var(--border)', background: 'rgba(0, 0, 0, 0.2)', display: 'flex', gap: 8 }}>
                                <input className="input" value={userMsg} onChange={(e) => setUserMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Hỏi AI..." style={{ flex: 1, borderRadius: 12, background: 'rgba(255, 255, 255, 0.03)', fontSize: 13, height: 36, paddingLeft: 12 }} disabled={isAiLoading} />
                                <button className="btn btn-primary" onClick={handleSendMessage} style={{ width: 36, height: 36, padding: 0, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={isAiLoading || !userMsg.trim()}>
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL COMPONENT */}
            {modal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ width: 400, padding: '24px', background: 'rgba(18, 22, 36, 0.98)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 20, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative', color: '#fff' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{modal.title}</h3>
                        {modal.message && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 24, lineHeight: 1.5 }}>{modal.message}</p>}
                        {modal.type === 'input' && (
                            <input
                                autoFocus
                                type="text"
                                defaultValue={modal.defaultValue}
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 15, color: '#fff', outline: 'none', marginBottom: 24, transition: 'border-color 0.2s' }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') { modal.onConfirm((e.target as any).value); setModal(null); }
                                    if (e.key === 'Escape') setModal(null);
                                }}
                                id="modal-input-field"
                            />
                        )}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setModal(null)}
                                style={{ minWidth: 90, height: 40, borderRadius: 10, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {modal.cancelText || 'Hủy'}
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => { const val = (document.getElementById('modal-input-field') as HTMLInputElement)?.value; modal.onConfirm(val); setModal(null); }}
                                style={{ minWidth: 110, height: 40, borderRadius: 10, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none' }}
                            >
                                {modal.confirmText || 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalSlideUp { from { opacity: 0; transform: scale(0.95) translateY(30px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            `}</style>
        </>
    )
}