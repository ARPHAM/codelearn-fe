import { useState, useEffect, useRef, useCallback } from 'react';

import Editor from '@monaco-editor/react';
import { socket } from '@/features/realtime/socket';
import { ParticipantData, WorkspaceFile, createFileApi, deleteFileApi, getWorkspaceFiles } from '@/features/room/api';
import { useCurrentUserInfo } from '@/app/components/_api/queries';
import { File, Plus, Trash2, Pencil, MousePointer2 } from 'lucide-react';
import styles from './CodeEditor.module.css';

interface CodeEditorProps {
    roomId: string;
    viewingUser: ParticipantData | null;
    workspaceId?: string;
    initialContent?: string;
    defaultFilePath?: string;
    hideSidebar?: boolean;
    activeFilePath?: string;
    onRenameFile?: (path: string) => void;
    onDeleteFile?: (path: string) => void;
    onSetMain?: (path: string) => void;
    onAddFile?: () => void;
    files?: WorkspaceFile[];
    onFilesChange?: (files: WorkspaceFile[]) => void;
    mainFilePath?: string;
    onActiveFileChange?: (path: string) => void;
    isViewing?: boolean;
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

const getLanguage = (path: string) => {
    if (path.endsWith('.py')) return 'python';
    if (path.endsWith('.js')) return 'javascript';
    if (path.endsWith('.ts')) return 'typescript';
    if (path.endsWith('.cpp')) return 'cpp';
    if (path.endsWith('.java')) return 'java';
    if (path.endsWith('.sql')) return 'sql';
    return 'text';
};

export default function CodeEditor({ 
    roomId, 
    viewingUser, 
    workspaceId, 
    initialContent = '// Write your code here...', 
    defaultFilePath = 'main.ts',
    hideSidebar = false,
    activeFilePath,
    onRenameFile,
    onDeleteFile,
    onSetMain,
    onAddFile,
    files: propsFiles,
    onFilesChange,
    mainFilePath,
    onActiveFileChange,
    isViewing: isViewingProp = false
}: CodeEditorProps) {
    const { data: currentUser } = useCurrentUserInfo();
    const isViewing = isViewingProp || (!!viewingUser && viewingUser.userId !== currentUser?.id);

    const [internalFiles, setInternalFiles] = useState<WorkspaceFile[]>([]);
    const [content, setContent] = useState<string>('');
    const [filePath, setFilePath] = useState<string>(activeFilePath || defaultFilePath);

    const files = propsFiles || internalFiles;
    
    const updateFiles = useCallback((updater: (prev: WorkspaceFile[]) => WorkspaceFile[]) => {
        if (onFilesChange && propsFiles) {
            onFilesChange(updater(propsFiles));
        } else {
            setInternalFiles(updater);
        }
    }, [onFilesChange, propsFiles]);
    
    // Sync internal filePath with prop
    useEffect(() => {
        if (activeFilePath && activeFilePath !== filePath) {
            setFilePath(activeFilePath);
        }
    }, [activeFilePath]);
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
            if (propsFiles) return; 
            const targetWorkspaceId = isViewing ? viewingUser?.workspaceId : workspaceId;
            if (targetWorkspaceId) {
                try {
                    const remoteFiles = await getWorkspaceFiles(targetWorkspaceId);
                    updateFiles(() => remoteFiles);
                    if (remoteFiles.length > 0 && !remoteFiles.find(f => f.filePath === filePath)) {
                        setFilePath(remoteFiles[0].filePath);
                    }
                } catch (err: any) {
                    console.error("Failed to fetch workspace files", err.response?.status);
                }
            }
        };
        fetchFiles();
    }, [isViewing, viewingUser?.workspaceId, workspaceId, !!propsFiles]);

    // Removed redundant handleAddFile and handleDeleteFile as they are handled by props/parent

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
            const file = files.find(f => f.filePath === filePath);
            if (file) {
                // CRITICAL FIX: Only update content if it's different AND we're not currently typing
                // This prevents the "2 characters" bug where local updates trigger a remote-like block
                if (file.content !== currentContentRef.current && !timeoutRef.current) {
                    isRemoteUpdateRef.current = true;
                    setContent(file.content);
                }
            } else {
                // Fallback to storage only if not in files
                let storage = getFileStorage(roomId, filePath);
                if (!storage) {
                    storage = { content: initialContent, lastSavedContent: initialContent, updatedAt: Date.now() };
                    setFileStorage(roomId, filePath, storage);
                }
                isRemoteUpdateRef.current = true;
                setContent(storage.content);
            }
        }
    }, [roomId, filePath, isViewing, viewingUser?.userId, files]);

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

        // File created/deleted are now handled by the parent RoomPage to ensure single source of truth

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
        socket.on('file_switched', handleFileSwitched);
        socket.on('cursor_moved', handleCursorMoved);
        socket.on('selection_moved', handleSelectionMoved);
        socket.on('cursor_move', handleCursorMoved);
        socket.on('selection_move', handleSelectionMoved);

        return () => {
            socket.off('request_user_code', handleCodeRequest);
            socket.off('code_update', handleCodeUpdate);
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

    const flushChanges = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            const storage = getFileStorage(roomId, currentFilePathRef.current);
            setFileStorage(roomId, currentFilePathRef.current, {
                content: currentContentRef.current,
                lastSavedContent: storage?.lastSavedContent ?? initialContent,
                updatedAt: Date.now()
            });
            socket.emit('code_change', { 
                roomId: roomIdRef.current, 
                filePath: currentFilePathRef.current, 
                content: currentContentRef.current 
            });
            timeoutRef.current = null;
        }
    }, [roomId, initialContent]);

    // Flush changes when filePath changes
    useEffect(() => {
        return () => {
            flushChanges();
        };
    }, [filePath, flushChanges]);

    const handleEditorChange = (value: string | undefined) => {
        const newContent = value || '';
        setContent(newContent);
        
        if (isRemoteUpdateRef.current || isViewing) {
            isRemoteUpdateRef.current = false;
            return;
        }

        // Sync back to parent state immediately for consistency
        updateFiles(prev => prev.map(f => f.filePath === filePath ? { ...f, content: newContent } : f));

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            const storage = getFileStorage(roomId, filePath);
            setFileStorage(roomId, filePath, {
                content: newContent,
                lastSavedContent: storage?.lastSavedContent ?? initialContent,
                updatedAt: Date.now()
            });
            socket.emit('code_change', { roomId, filePath, content: newContent });
            timeoutRef.current = null;
        }, 100);
    };

    // Last-second save on refresh/tab close
    useEffect(() => {
        const handleUnload = () => {
            flushChanges();
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, [flushChanges]);

    const handleEditorMount = (editor: any, monaco: any) => {
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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0b0f1a', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
            {/* FILE TABS (Horizontal) */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                background: '#0b0f1a', 
                borderBottom: '1px solid var(--border)',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                height: 38
            }}>
                {files.map((file) => {
                    const isActive = file.filePath === filePath;
                    const isMain = file.filePath === mainFilePath;
                    
                    return (
                        <div
                            key={file.id || file.filePath}
                            onClick={() => {
                                if (isViewing) return;
                                setFilePath(file.filePath);
                                onActiveFileChange?.(file.filePath);
                                // Emit event to notify observers
                                socket.emit('file_switch', { roomId, filePath: file.filePath });
                            }}
                            style={{
                                padding: '0 12px',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                cursor: isViewing ? 'default' : 'pointer',
                                background: isActive ? '#1e293b' : 'transparent',
                                borderRight: '1px solid var(--border)',
                                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                                fontSize: 13,
                                fontWeight: isActive ? 600 : 400,
                                transition: 'all 0.2s',
                                position: 'relative',
                                minWidth: 'fit-content'
                            }}
                        >
                            {isMain && <div style={{ color: '#eab308', marginRight: -2 }}>★</div>}
                            <File size={13} color={isActive ? 'var(--accent-purple)' : 'var(--text-muted)'} />
                            <span style={{ whiteSpace: 'nowrap' }}>{file.filePath}</span>
                            
                            {!isViewing && isActive && (
                                <div style={{ display: 'flex', gap: 6, marginLeft: 4, animation: 'fadeIn 0.2s ease' }}>
                                    {onRenameFile && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onRenameFile(file.filePath); }}
                                            style={{ background: 'none', border: 'none', padding: 2, color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                                            title="Đổi tên"
                                        >
                                            <Pencil size={11} />
                                        </button>
                                    )}
                                    {onSetMain && !isMain && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onSetMain(file.filePath); }}
                                            style={{ background: 'none', border: 'none', padding: 2, color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                                            title="Đặt làm file chính"
                                        >
                                            <div style={{ fontSize: 10 }}>★</div>
                                        </button>
                                    )}
                                    {onDeleteFile && files.length > 1 && !isMain && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDeleteFile(file.filePath); }}
                                            style={{ background: 'none', border: 'none', padding: 2, color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                                            title="Xóa"
                                        >
                                            <Trash2 size={11} />
                                        </button>
                                    )}
                                </div>
                            )}
                            
                            {isActive && (
                                <div style={{ 
                                    position: 'absolute', bottom: 0, left: 0, right: 0, 
                                    height: 2, background: 'var(--accent-purple)' 
                                }} />
                            )}
                        </div>
                    );
                })}
                
                {!isViewing && onAddFile && (
                    <button 
                        onClick={onAddFile}
                        style={{ padding: '0 12px', background: 'none', border: 'none', color: 'var(--accent-purple)', cursor: 'pointer', height: '100%', display: 'flex', alignItems: 'center' }}
                    >
                        <Plus size={18} />
                    </button>
                )}
            </div>

            {/* EDITOR AREA */}
            <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                {viewingLoading && (
                    <div className={styles['sync-overlay']}>
                        <div className={styles['sync-content']}>
                            <div className={styles.spinner}></div>
                            <span className={styles['sync-text']}>Đang đồng bộ workspace...</span>
                        </div>
                    </div>
                )}
                
                <Editor
                    height="100%"
                    path={filePath}
                    language={getLanguage(filePath)}
                    value={content}
                    theme="aiDark"
                    onChange={handleEditorChange}
                    onMount={handleEditorMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                        fontLigatures: true,
                        wordWrap: 'on',
                        automaticLayout: true,
                        readOnly: isViewing,
                        scrollBeyondLastLine: false,
                        padding: { top: 16, bottom: 16 },
                        lineHeight: 22,
                        letterSpacing: 0.5,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        smoothScrolling: true,
                        renderLineHighlight: 'all',
                        scrollbar: {
                            vertical: 'visible',
                            horizontal: 'visible',
                            verticalScrollbarSize: 10,
                            horizontalScrollbarSize: 10,
                        },
                        bracketPairColorization: {
                            enabled: true
                        }
                    }}
                />
            </div>
        </div>
    );
}
