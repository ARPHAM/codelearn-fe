import { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { socket } from '@/features/realtime/socket';
import { ParticipantData, WorkspaceFile, createFileApi, deleteFileApi, getWorkspaceFiles } from '@/features/room/api';
import { useCurrentUserInfo } from '@/app/components/_api/queries';
import { File, Plus, Trash2, ChevronRight, MousePointer2 } from 'lucide-react';

interface CodeEditorProps {
    roomId: string;
    viewingUser: ParticipantData | null;
    workspaceId?: string;
    initialContent?: string;
    defaultFilePath?: string;
}

export interface FileStorage {
    content: string;
    lastSavedContent: string;
    updatedAt: number;
}

const getFileKey = (roomId: string, filePath: string) => `room:${roomId}:file:${filePath}`;

const getFileStorage = (roomId: string, filePath: string): FileStorage | null => {
    const key = getFileKey(roomId, filePath);
    const val = localStorage.getItem(key);
    if (val) {
        try {
            return JSON.parse(val);
        } catch {
            return null;
        }
    }
    return null;
};

const setFileStorage = (roomId: string, filePath: string, data: FileStorage) => {
    const key = getFileKey(roomId, filePath);
    localStorage.setItem(key, JSON.stringify(data));
};

export default function CodeEditor({ roomId, viewingUser, workspaceId, initialContent = '// Write your code here...', defaultFilePath = 'main.ts' }: CodeEditorProps) {
    const isViewing = !!viewingUser;
    const { data: currentUser } = useCurrentUserInfo();

    // --- States ---
    const [files, setFiles] = useState<WorkspaceFile[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [content, setContent] = useState<string>('');
    const [filePath, setFilePath] = useState<string>(defaultFilePath);
    const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());
    const [viewingLoading, setViewingLoading] = useState(false);
    const [isAddingFile, setIsAddingFile] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [isFollowing, setIsFollowing] = useState(true);

    // --- Refs ---
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const currentContentRef = useRef<string>(content);
    const currentFilePathRef = useRef<string>(filePath);
    const isRemoteUpdateRef = useRef<boolean>(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Cursor tracking refs
    const decorationsRef = useRef<string[]>([]);
    const remoteCursorPosRef = useRef<{ line: number, column: number, filePath: string } | null>(null);

    const isViewingRef = useRef<boolean>(isViewing);
    const viewingUserRef = useRef<ParticipantData | null>(viewingUser);

    useEffect(() => { currentContentRef.current = content; }, [content]);
    useEffect(() => { currentFilePathRef.current = filePath; }, [filePath]);
    useEffect(() => { isViewingRef.current = isViewing; }, [isViewing]);
    useEffect(() => { viewingUserRef.current = viewingUser; }, [viewingUser]);

    // Define renderRemoteCursor outside useEffect so it's accessible to onMount
    const renderRemoteCursor = useCallback((line: number, column: number, filePathToMatch: string) => {
        if (!editorRef.current || !monacoRef.current) return;
        const model = editorRef.current.getModel();
        if (!model) return;

        const isViewingNow = isViewingRef.current;
        const currentViewingUser = viewingUserRef.current;
        const currentPath = currentFilePathRef.current;

        const matchesUser = isViewingNow && currentViewingUser;
        const matchesPath = String(filePathToMatch || '').trim().toLowerCase() === String(currentPath || '').trim().toLowerCase();

        if (matchesUser && matchesPath) {
            console.log("[renderRemoteCursor] Rendering at:", line, column);
            const maxLine = model.getLineCount();
            const safeLine = Math.min(Math.max(1, line), maxLine);
            const maxColumn = model.getLineMaxColumn(safeLine);
            
            const safeColumn = Math.min(Math.max(1, column), maxColumn);
            const endColumn = Math.min(safeColumn + 1, maxColumn);

            const newDecorations = [
                {
                    range: new monacoRef.current.Range(safeLine, safeColumn, safeLine, endColumn),
                    options: {
                        beforeContentClassName: 'remote-cursor-v6-combined',
                        stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                        hoverMessage: { value: currentViewingUser?.user?.fullName || 'User' }
                    }
                }
            ];
            decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecorations);
        } else {
            console.log("[renderRemoteCursor] Skip rendering. Matches:", { matchesUser, matchesPath, filePathToMatch, currentPath });
        }
    }, [isFollowing]); // isFollowing affects the scroll logic which was moved, so we can keep this light

    // --- Initial File Loading ---
    useEffect(() => {
        const fetchFiles = async () => {
            const targetWorkspaceId = isViewing ? viewingUser?.workspaceId : workspaceId;
            console.log(`[fetchFiles] isViewing: ${isViewing}, targetWorkspaceId: ${targetWorkspaceId}`);
            if (targetWorkspaceId) {
                setIsLoadingFiles(true);
                try {
                    const remoteFiles = await getWorkspaceFiles(targetWorkspaceId);
                    setFiles(remoteFiles);
                    if (remoteFiles.length > 0 && !remoteFiles.find(f => f.filePath === filePath)) {
                        setFilePath(remoteFiles[0].filePath);
                    }
                } catch (err: any) {
                    console.error("Failed to fetch workspace files", err.response?.status);
                } finally {
                    setIsLoadingFiles(false);
                }
            }
        };
        fetchFiles();
    }, [isViewing, viewingUser?.workspaceId, workspaceId]);

    // --- File Operations ---
    const handleAddFile = async () => {
        if (!newFileName) {
            alert("Vui lòng nhập tên file");
            return;
        }
        if (isViewing) return;
        if (!workspaceId) {
            console.error("Missing workspaceId for current user");
            alert("Lỗi: Không tìm thấy ID không gian làm việc. Vui lòng tải lại trang.");
            return;
        }

        if (files.some(f => f.filePath === newFileName)) {
            alert("Tên file đã tồn tại trong workspace này.");
            return;
        }

        try {
            const newFile = await createFileApi(workspaceId, newFileName);
            setFiles(prev => {
                if (prev.some(f => f.filePath === newFile.filePath)) return prev;
                return [...prev, newFile];
            });
            setIsAddingFile(false);
            setNewFileName('');
            setFilePath(newFile.filePath);
        } catch (err: any) {
            console.error("Failed to create file", err);
            const errorMsg = err.response?.data?.message || err.message;
            alert(`Lỗi tạo file: ${errorMsg}`);
        }
    };

    const handleDeleteFile = async (pathToDelete: string) => {
        if (isViewing || !workspaceId) return;
        try {
            await deleteFileApi(workspaceId, pathToDelete);
            setFiles(prev => prev.filter(f => f.filePath !== pathToDelete));
            if (filePath === pathToDelete) {
                setFilePath(files[0]?.filePath || 'main.ts');
            }
        } catch (err) {
            console.error("Failed to delete file", err);
        }
    };

    // Load file content on switch/viewing change
    useEffect(() => {
        if (isViewing) {
            setViewingLoading(true);
            isRemoteUpdateRef.current = true;
            setContent('// Đang tải code...');
            remoteCursorPosRef.current = null; // Clear old position on switch

            // Use a small delay to ensure the target client has settled its state after a switch
            const delay = setTimeout(() => {
                socket.emit('request_user_code', {
                    roomId,
                    targetUserId: viewingUser?.userId,
                    filePath,
                });
            }, 300);

            const handleSnapshot = (data: { userId?: string; filePath: string; content: string }) => {
                const senderId = String(data.userId || '').trim();
                const expectedId = String(viewingUser?.userId || '').trim();
                if (senderId === expectedId && data.filePath === filePath) {
                    isRemoteUpdateRef.current = true;
                    setContent(data.content);
                    setViewingLoading(false);
                }
            };

            socket.on('user_code_snapshot', handleSnapshot);
            const timeout = setTimeout(() => setViewingLoading(false), 4000);

            return () => {
                clearTimeout(delay);
                socket.off('user_code_snapshot', handleSnapshot);
                clearTimeout(timeout);
            };
        } else {
            let storage = getFileStorage(roomId, filePath);
            if (!storage) {
                storage = { content: initialContent, lastSavedContent: initialContent, updatedAt: Date.now() };
                setFileStorage(roomId, filePath, storage);
            }
            isRemoteUpdateRef.current = true;
            setContent(storage.content);
        }
    }, [roomId, filePath, isViewing, viewingUser?.userId]);

    // --- Socket Listeners (Multi-file & Cursor) ---
    useEffect(() => {
        const handleCodeRequest = (data: { requesterId: string; filePath: string }) => {
            const targetPath = data.filePath || currentFilePathRef.current;
            let contentToRespond;
            if (!isViewing && targetPath === currentFilePathRef.current) {
                contentToRespond = currentContentRef.current;
            } else {
                const storage = getFileStorage(roomId, targetPath);
                contentToRespond = storage?.content ?? initialContent;
            }
            socket.emit('respond_user_code', {
                roomId,
                userId: currentUser?.id,
                requesterId: data.requesterId,
                filePath: targetPath,
                content: contentToRespond,
            });
            console.log(`[handleCodeRequest] Responded to ${data.requesterId} for ${targetPath}. Content length: ${contentToRespond.length}`);
        };

        const handleCodeUpdate = (data: { userId: string, filePath: string, content: string }) => {
            if (isViewing && data.userId === viewingUser?.userId && data.filePath === filePath) {
                isRemoteUpdateRef.current = true;
                setContent(data.content);
                if (viewingLoading) setViewingLoading(false);
            }
        };

        const handleFileCreate = (data: { userId: string, workspaceId: string, filePath: string, id: string }) => {
            // Update sidebar if it's the workspace we are watching
            const targetWorkspaceId = isViewing ? viewingUser?.workspaceId : workspaceId;
            if (data.workspaceId === targetWorkspaceId) {
                setFiles(prev => {
                    if (prev.some(f => f.filePath === data.filePath)) return prev;
                    return [...prev, { id: data.id, filePath: data.filePath, content: '' }];
                });
            }
        };

        const handleFileDelete = (data: { userId: string, workspaceId: string, filePath: string }) => {
            const targetWorkspaceId = isViewing ? viewingUser?.workspaceId : workspaceId;
            if (data.workspaceId === targetWorkspaceId) {
                setFiles(prev => prev.filter(f => f.filePath !== data.filePath));
                if (currentFilePathRef.current === data.filePath) {
                    setFilePath(prev => {
                        const remaining = files.filter(f => f.filePath !== data.filePath);
                        return remaining[0]?.filePath || 'main.ts';
                    });
                }
            }
        };

        const handleFileSwitched = (data: { userId: string, filePath: string }) => {
            if (isViewing && data.userId === viewingUser?.userId) {
                if (isFollowing) {
                    setFilePath(data.filePath);
                }
            }
        };

        // Removed old renderRemoteCursor definition

        const handleCursorMoved = (data: { userId: string, filePath: string, line: number, column: number }) => {
            const isViewingNow = isViewingRef.current;
            const currentPath = currentFilePathRef.current;
            const userMatches = isViewingNow && data.userId === viewingUser?.userId;
            const pathMatch = String(data.filePath || '').trim().toLowerCase() === String(currentPath || '').trim().toLowerCase();

            console.log("[handleCursorMoved] Arrived:", data.userId, "Match User:", userMatches, "Match Path:", pathMatch, "Data Path:", data.filePath, "Editor Path:", currentPath);

            if (userMatches) {
                remoteCursorPosRef.current = { line: data.line, column: data.column, filePath: data.filePath };
                renderRemoteCursor(data.line, data.column, data.filePath);

                if (isFollowing && pathMatch && editorRef.current) {
                    console.log("[handleCursorMoved] Following to:", data.line, data.column);
                    const position = { lineNumber: data.line, column: data.column };
                    editorRef.current.revealPositionInCenter(position, monacoRef.current.editor.ScrollType.Smooth);
                }
            }
        };

        socket.on('request_user_code', handleCodeRequest);
        socket.on('code_update', handleCodeUpdate);
        socket.on('file_create', handleFileCreate);
        socket.on('file_delete', handleFileDelete);
        socket.on('file_switched', handleFileSwitched);
        socket.on('cursor_moved', handleCursorMoved);
        // Fallback for simple relay
        socket.on('cursor_move', handleCursorMoved);

        return () => {
            socket.off('request_user_code', handleCodeRequest);
            socket.off('code_update', handleCodeUpdate);
            socket.off('file_create', handleFileCreate);
            socket.off('file_delete', handleFileDelete);
            socket.off('file_switched', handleFileSwitched);
            socket.off('cursor_moved', handleCursorMoved);
            socket.off('cursor_move', handleCursorMoved);
        };
    }, [roomId, isViewing, viewingUser?.userId, filePath, isFollowing, currentUser?.id]);

    // Emit cursor move
    const handleCursorChange = (e: any) => {
        if (!isViewingRef.current && socket.connected) {
            console.log("[handleCursorChange] Emitting:", e.position.lineNumber, e.position.column);
            socket.emit('cursor_move', {
                roomId,
                userId: currentUser?.id,
                filePath: currentFilePathRef.current,
                line: e.position.lineNumber,
                column: e.position.column
            });
        }
    };

    // Handle Local Content Change
    const handleEditorChange = (value: string | undefined) => {
        const newContent = value || '';
        setContent(newContent);
        if (isRemoteUpdateRef.current || isViewing) {
            isRemoteUpdateRef.current = false;
            return;
        }
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            const storage = getFileStorage(roomId, filePath);
            setFileStorage(roomId, filePath, {
                content: newContent,
                lastSavedContent: storage?.lastSavedContent ?? initialContent,
                updatedAt: Date.now()
            });
            socket.emit('code_change', { roomId, filePath, content: newContent });
        }, 400);
    };

    const onMount = (editor: any, monaco: any) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        editor.onDidChangeCursorPosition(handleCursorChange);

        // Re-render remote cursor on content change (fix Monaco clearing decorations)
        editor.onDidChangeModelContent(() => {
            if (isViewingRef.current && remoteCursorPosRef.current) {
                const { line, column, filePath } = remoteCursorPosRef.current;
                renderRemoteCursor(line, column, filePath);
            }
        });

        editor.onMouseDown(() => setIsFollowing(false));
    };

    return (
        <div className="flex h-full bg-[#1e1e1e] border border-gray-800 rounded-lg overflow-hidden">
            {/* Sidebar: File Explorer */}
            <div className="w-64 bg-[#252526] border-r border-gray-800 flex flex-col">
                <div className="p-3 flex items-center justify-between border-b border-gray-800">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Explorer</span>
                    {!isViewing && (
                        <button onClick={() => setIsAddingFile(true)} className="p-1 hover:bg-gray-700 rounded text-gray-400">
                            <Plus size={16} />
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {isAddingFile && (
                        <div className="mb-2 px-2 flex gap-1">
                            <input
                                autoFocus
                                className="flex-1 bg-[#3c3c3c] text-white text-xs p-1 rounded border border-blue-500 outline-none"
                                placeholder="filename.ts"
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddFile();
                                    if (e.key === 'Escape') {
                                        setIsAddingFile(false);
                                        setNewFileName('');
                                    }
                                }}
                                onBlur={() => {
                                    if (newFileName.trim() === '') {
                                        setIsAddingFile(false);
                                    }
                                }}
                            />
                            <button
                                onClick={handleAddFile}
                                onMouseDown={(e) => e.preventDefault()} // Prevent blur from firing before click
                                className="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
                                title="Add File"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}

                    {/* File List */}
                    <div className="space-y-1">
                        {/* If files is empty but we have a workspace, show actual list. If no workspace yet, show fallback */}
                        {files.map((f) => (
                            <div
                                key={f.filePath}
                                className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-sm transition-all border-l-2
                                    ${filePath === f.filePath
                                        ? 'bg-[#37373d] text-blue-400 border-blue-500 font-medium'
                                        : 'text-gray-400 border-transparent hover:bg-[#2a2d2e] hover:text-gray-200'}`}
                                onClick={() => {
                                    setFilePath(f.filePath);
                                    socket.emit('file_switch', { roomId, filePath: f.filePath });
                                }}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <File size={14} className={filePath === f.filePath ? 'text-blue-400' : 'text-gray-500'} />
                                    <span className="truncate">{f.filePath}</span>
                                </div>
                                {!isViewing && f.filePath !== 'main.ts' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteFile(f.filePath); }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {isViewing && (
                    <div className="p-3 border-t border-gray-800">
                        <button
                            onClick={() => setIsFollowing(!isFollowing)}
                            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-medium transition-all
                                ${isFollowing ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            <MousePointer2 size={14} />
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content: Editor */}
            <div className="flex-1 flex flex-col relative min-w-0">
                {viewingLoading && (
                    <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-white text-xs font-medium">Syncing view...</span>
                        </div>
                    </div>
                )}

                <Editor
                    height="100%"
                    language={(filePath || '').endsWith('.ts') ? 'typescript' : 'javascript'}
                    theme="vs-dark"
                    value={content}
                    onChange={handleEditorChange}
                    onMount={onMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        automaticLayout: true,
                        readOnly: isViewing,
                        scrollBeyondLastLine: false,
                        padding: { top: 10 },
                    }}
                />
            </div>

            <style jsx global>{`
                @keyframes cursor-blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .remote-cursor-v6-combined {
                    position: absolute;
                    width: 0;
                    height: 100%;
                }
                /* Cursor bar */
                .remote-cursor-v6-combined::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    border-left: 2px solid #3b82f6;
                    height: 1.25em;
                    animation: cursor-blink 1s step-end infinite;
                    animation-delay: 500ms; /* Chỉ bắt đầu nháy sau 500ms đứng yên */
                }
                /* Name label */
                .remote-cursor-v6-combined::after {
                    content: '${viewingUser?.user?.fullName || 'User'}';
                    position: absolute;
                    top: -16px;
                    left: 0;
                    background: rgba(59, 130, 246, 0.7);
                    color: white;
                    font-size: 10px;
                    padding: 0 4px;
                    border-radius: 2px;
                    white-space: nowrap;
                    pointer-events: none;
                    z-index: 10;
                }
            `}</style>
        </div>
    );
}
