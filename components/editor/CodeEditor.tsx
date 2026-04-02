import { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { socket } from '@/features/realtime/socket';
import { ParticipantData, WorkspaceFile, createFileApi, deleteFileApi, getWorkspaceFiles } from '@/features/room/api';
import { useCurrentUserInfo } from '@/app/components/_api/queries';
import { File, Plus, Trash2, ChevronRight, MousePointer2 } from 'lucide-react';
import './CodeEditor.css';

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

    const [files, setFiles] = useState<WorkspaceFile[]>([]);
    const [content, setContent] = useState<string>('');
    const [filePath, setFilePath] = useState<string>(defaultFilePath);
    const [viewingLoading, setViewingLoading] = useState(false);
    const [isAddingFile, setIsAddingFile] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [isFollowing, setIsFollowing] = useState(true);

    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const currentContentRef = useRef<string>(content);
    const currentFilePathRef = useRef<string>(filePath);
    const isRemoteUpdateRef = useRef<boolean>(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const decorationsRef = useRef<string[]>([]);
    const remoteCursorPosRef = useRef<{ line: number, column: number, filePath: string } | null>(null);
    const remoteSelectionRef = useRef<any>(null);

    const isViewingRef = useRef<boolean>(isViewing);
    const viewingUserRef = useRef<ParticipantData | null>(viewingUser);
    const roomIdRef = useRef<string>(roomId);
    const currentUserRef = useRef<any>(currentUser);

    useEffect(() => { currentContentRef.current = content; }, [content]);
    useEffect(() => { currentFilePathRef.current = filePath; }, [filePath]);
    useEffect(() => { isViewingRef.current = isViewing; }, [isViewing]);
    useEffect(() => { viewingUserRef.current = viewingUser; }, [viewingUser]);
    useEffect(() => { roomIdRef.current = roomId; }, [roomId]);
    useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

    const renderRemoteCursor = useCallback((line: number, column: number, filePathToMatch: string, selection?: any) => {
        if (!editorRef.current || !monacoRef.current) return;
        const model = editorRef.current.getModel();
        if (!model) return;

        const isViewingNow = isViewingRef.current;
        const currentViewingUser = viewingUserRef.current;
        const currentPath = currentFilePathRef.current;

        const matchesUser = isViewingNow && currentViewingUser;
        const matchesPath = String(filePathToMatch || '').trim().toLowerCase() === String(currentPath || '').trim().toLowerCase();

        if (matchesUser && matchesPath) {
            const maxLine = model.getLineCount();
            const safeLine = Math.min(Math.max(1, line), maxLine);
            const maxColumn = model.getLineMaxColumn(safeLine);
            const safeColumn = Math.min(Math.max(1, column), maxColumn);

            const newDecorations = [];

            const hasSelection = selection && (
                selection.startLineNumber !== selection.endLineNumber || 
                selection.startColumn !== selection.endColumn
            );
            
            if (hasSelection) {
                newDecorations.push({
                    range: new monacoRef.current.Range(
                        selection.startLineNumber, selection.startColumn,
                        selection.endLineNumber, selection.endColumn
                    ),
                    options: {
                        className: 'remote-selection',
                        stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                    }
                });
            }

            newDecorations.push({
                range: new monacoRef.current.Range(safeLine, safeColumn, safeLine, safeColumn),
                options: {
                    beforeContentClassName: 'remote-cursor-v6-combined',
                    stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                    hoverMessage: { value: currentViewingUser?.user?.fullName || 'User' }
                }
            });

            decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecorations);
        }
    }, []);

    useEffect(() => {
        const fetchFiles = async () => {
            const targetWorkspaceId = isViewing ? viewingUser?.workspaceId : workspaceId;
            if (targetWorkspaceId) {
                try {
                    const remoteFiles = await getWorkspaceFiles(targetWorkspaceId);
                    setFiles(remoteFiles);
                    if (remoteFiles.length > 0 && !remoteFiles.find(f => f.filePath === filePath)) {
                        setFilePath(remoteFiles[0].filePath);
                    }
                } catch (err: any) {
                    console.error("Failed to fetch workspace files", err.response?.status);
                }
            }
        };
        fetchFiles();
    }, [isViewing, viewingUser?.workspaceId, workspaceId]);

    const handleAddFile = async () => {
        if (!newFileName) return;
        if (isViewing) return;
        if (!workspaceId) return;

        if (files.some(f => f.filePath === newFileName)) {
            alert("Tên file đã tồn tại");
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
            socket.emit('file_switch', { roomId, filePath: newFile.filePath });
        } catch (err: any) {
            console.error("Failed to create file", err);
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

    useEffect(() => {
        if (isViewing) {
            setViewingLoading(true);
            isRemoteUpdateRef.current = true;
            setContent('// Đang tải code...');
            remoteCursorPosRef.current = null;

            const delay = setTimeout(() => {
                socket.emit('request_user_code', {
                    roomId,
                    targetUserId: viewingUser?.userId,
                    filePath: isFollowing ? "" : filePath,
                });
            }, 300);

            const handleSnapshot = (data: { userId?: string; filePath: string; content: string }) => {
                const senderId = String(data.userId || '').trim();
                const expectedId = String(viewingUser?.userId || '').trim();
                if (senderId === expectedId && (isFollowing || data.filePath === filePath)) {
                    if (isFollowing) setFilePath(data.filePath);
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
        };

        const handleCodeUpdate = (data: { userId: string, filePath: string, content: string }) => {
            if (isViewing && data.userId === viewingUser?.userId && data.filePath === filePath) {
                isRemoteUpdateRef.current = true;
                setContent(data.content);
                if (viewingLoading) setViewingLoading(false);
            }
        };

        const handleFileCreate = (data: { userId: string, workspaceId: string, filePath: string, id: string }) => {
            const targetWorkspaceId = isViewing ? viewingUser?.workspaceId : workspaceId;
            if (data.workspaceId === targetWorkspaceId) {
                setFiles(prev => {
                    if (prev.some(f => f.filePath === data.filePath)) return prev;
                    return [...prev, { id: data.id, filePath: data.filePath, content: '' }];
                });
                if (isFollowing) setFilePath(data.filePath);
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

        const handleCursorMoved = (data: { userId: string, filePath: string, line: number, column: number }) => {
            const isViewingNow = isViewingRef.current;
            const currentPath = currentFilePathRef.current;
            const userMatches = isViewingNow && data.userId === viewingUserRef.current?.userId;
            const pathMatch = String(data.filePath || '').trim().toLowerCase() === String(currentPath || '').trim().toLowerCase();

            if (userMatches) {
                remoteCursorPosRef.current = { line: data.line, column: data.column, filePath: data.filePath };
                renderRemoteCursor(data.line, data.column, data.filePath, remoteSelectionRef.current);

                if (isFollowing && pathMatch && editorRef.current) {
                    const position = { lineNumber: data.line, column: data.column };
                    editorRef.current.revealPositionInCenter(position, monacoRef.current.editor.ScrollType.Smooth);
                }
            }
        };

        const handleSelectionMoved = (data: { userId: string, filePath: string, selection: any }) => {
            const isViewingNow = isViewingRef.current;
            const currentPath = currentFilePathRef.current;
            const userMatches = isViewingNow && data.userId === viewingUserRef.current?.userId;
            
            if (userMatches && String(data.filePath || '').trim().toLowerCase() === String(currentPath || '').trim().toLowerCase()) {
                remoteSelectionRef.current = data.selection;
                renderRemoteCursor(
                    data.selection.positionLineNumber, 
                    data.selection.positionColumn, 
                    data.filePath, 
                    data.selection
                );
            }
        };

        socket.on('request_user_code', handleCodeRequest);
        socket.on('code_update', handleCodeUpdate);
        socket.on('file_create', handleFileCreate);
        socket.on('file_delete', handleFileDelete);
        socket.on('file_switched', handleFileSwitched);
        socket.on('cursor_moved', handleCursorMoved);
        socket.on('selection_moved', handleSelectionMoved);
        socket.on('cursor_move', handleCursorMoved);
        socket.on('selection_move', handleSelectionMoved);

        return () => {
            socket.off('request_user_code', handleCodeRequest);
            socket.off('code_update', handleCodeUpdate);
            socket.off('file_create', handleFileCreate);
            socket.off('file_delete', handleFileDelete);
            socket.off('file_switched', handleFileSwitched);
            socket.off('cursor_moved', handleCursorMoved);
            socket.off('selection_moved', handleSelectionMoved);
            socket.off('cursor_move', handleCursorMoved);
            socket.off('selection_move', handleSelectionMoved);
        };
    }, [roomId, isViewing, viewingUser?.userId, filePath, isFollowing, currentUser?.id]);

    const handleCursorChange = (e: any) => {
        if (!isViewingRef.current && socket.connected) {
            socket.emit('cursor_move', {
                roomId: roomIdRef.current,
                userId: currentUserRef.current?.id,
                filePath: currentFilePathRef.current,
                line: e.position.lineNumber,
                column: e.position.column
            });
        }
    };

    const handleSelectionChange = (e: any) => {
        if (!isViewingRef.current && socket.connected) {
            const plainSelection = {
                startLineNumber: e.selection.startLineNumber,
                startColumn: e.selection.startColumn,
                endLineNumber: e.selection.endLineNumber,
                endColumn: e.selection.endColumn,
                positionLineNumber: e.selection.positionLineNumber,
                positionColumn: e.selection.positionColumn,
            };
            
            socket.emit('selection_move', {
                roomId: roomIdRef.current,
                userId: currentUserRef.current?.id,
                filePath: currentFilePathRef.current,
                selection: plainSelection
            });
        }
    };

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

        monaco.editor.defineTheme('aiDark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: '8b5cf6' },
                { token: 'string', foreground: '22d3ee' },
                { token: 'comment', foreground: '64748b' },
                { token: 'number', foreground: 'a78bfa' },
                { token: 'function', foreground: 'c084fc' },
            ],
            colors: {
                'editor.background': '#0b0f1a',
                'editorCursor.foreground': '#8b5cf6',
                'editor.lineHighlightBackground': '#1b1f3a',
                'editor.selectionBackground': '#6d28d933',
                'editorLineNumber.foreground': '#64748b',
                'editorLineNumber.activeForeground': '#c084fc',
                'editorIndentGuide.background': '#1e293b',
                'editorIndentGuide.activeBackground': '#8b5cf6',
            },
        });

        monaco.editor.setTheme('aiDark');

        editor.onDidChangeCursorPosition(handleCursorChange);
        editor.onDidChangeCursorSelection(handleSelectionChange);

        editor.onDidChangeModelContent(() => {
            if (isViewingRef.current && remoteCursorPosRef.current) {
                const { line, column, filePath } = remoteCursorPosRef.current;
                renderRemoteCursor(line, column, filePath, remoteSelectionRef.current);
            }
        });

        editor.onMouseDown(() => setIsFollowing(false));
    };

    return (
        <div 
            className="editor-container"
            style={{ '--remote-user-name': `"${viewingUser?.user?.fullName || 'User'}"` } as any}
        >
            <div className="editor-sidebar">
                <div className="sidebar-header">
                    <span className="sidebar-title">Explorer</span>
                    {!isViewing && (
                        <button onClick={() => setIsAddingFile(true)} className="btn-icon">
                            <Plus size={16} />
                        </button>
                    )}
                </div>

                <div className="sidebar-content">
                    {isAddingFile && (
                        <div className="add-file-container">
                            <input
                                autoFocus
                                className="add-file-input"
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
                                onMouseDown={(e) => e.preventDefault()}
                                className="btn-confirm"
                                title="Add File"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}

                    <div className="file-list">
                        {files.map((f) => (
                            <div
                                key={f.filePath}
                                className={`file-item ${filePath === f.filePath ? 'active' : 'inactive'}`}
                                onClick={() => {
                                    setFilePath(f.filePath);
                                    socket.emit('file_switch', { roomId, filePath: f.filePath });
                                }}
                            >
                                <div className="file-item-left">
                                    <File size={14} className={filePath === f.filePath ? 'text-blue-400' : 'text-gray-500'} />
                                    <span className="file-name">{f.filePath}</span>
                                </div>
                                {!isViewing && f.filePath !== 'main.ts' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteFile(f.filePath); }}
                                        className="btn-delete"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {isViewing && (
                    <div className="sidebar-footer">
                        <button
                            onClick={() => setIsFollowing(!isFollowing)}
                            className={`btn-follow ${isFollowing ? 'following' : 'not-following'}`}
                        >
                            <MousePointer2 size={14} />
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    </div>
                )}
            </div>

            <div className="editor-main">
                {viewingLoading && (
                    <div className="sync-overlay">
                        <div className="sync-content">
                            <div className="spinner"></div>
                            <span className="sync-text">Syncing view...</span>
                        </div>
                    </div>
                )}

                <Editor
                    height="100%"
                    language={(filePath || '').endsWith('.ts') ? 'typescript' : 'javascript'}
                    theme="aiDark"
                    value={content}
                    onChange={handleEditorChange}
                    onMount={onMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        wordWrap: 'on',
                        automaticLayout: true,
                        readOnly: isViewing,
                        scrollBeyondLastLine: false,
                        padding: { top: 14 },
                    }}
                />
            </div>
        </div>
    );
}
