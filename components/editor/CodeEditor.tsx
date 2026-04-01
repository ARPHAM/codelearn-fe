import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { socket } from '@/features/realtime/socket';
import { ParticipantData } from '@/features/room/api';
import { useCurrentUserInfo } from '@/app/components/_api/queries';

interface CodeEditorProps {
    roomId: string;
    viewingUser: ParticipantData | null;
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

export default function CodeEditor({ roomId, viewingUser, initialContent = '// Write your code here...', defaultFilePath = 'main.ts' }: CodeEditorProps) {
    const isViewing = !!viewingUser;
    const { data: currentUser } = useCurrentUserInfo();
    const [content, setContent] = useState<string>('');
    const [filePath, setFilePath] = useState<string>(defaultFilePath);
    const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());
    const [viewingLoading, setViewingLoading] = useState(false);
    
    // Refs to store CURRENT state for socket listeners (avoids dependency loops)
    const currentContentRef = useRef<string>(content);
    const currentFilePathRef = useRef<string>(filePath);
    
    useEffect(() => { currentContentRef.current = content; }, [content]);
    useEffect(() => { currentFilePathRef.current = filePath; }, [filePath]);

    console.log(`[RENDER] isViewing: ${isViewing}, content length: ${content.length}, loading: ${viewingLoading}`);

    const availableFiles = ['main.ts', 'utils.ts'];

    const isRemoteUpdateRef = useRef<boolean>(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateDirtyStateAll = () => {
        const newDirty = new Set<string>();
        availableFiles.forEach(f => {
            const storage = getFileStorage(roomId, f);
            if (storage && storage.content !== storage.lastSavedContent) {
                newDirty.add(f);
            }
        });
        setDirtyFiles(newDirty);
    };

    // Load file on mount or file switch
    useEffect(() => {
        if (isViewing) {
            console.log("Entering viewing mode for:", viewingUser?.userId);
            setViewingLoading(true);
            isRemoteUpdateRef.current = true;
            setContent('// Đang tải code...');

            // Request snapshot from the target user
            socket.emit('request_user_code', {
                roomId,
                targetUserId: viewingUser?.userId,
                filePath,
            });

            const handleSnapshot = (data: { userId?: string; filePath: string; content: string }) => {
                console.log("Snapshot data received:", data);
                
                const senderId = String(data.userId || viewingUser?.userId || '').trim();
                const expectedId = String(viewingUser?.userId || '').trim();
                const receivedPath = String(data.filePath || '').trim();
                const expectedPath = String(filePath || '').trim();

                console.log(`Comparison: ID (${senderId} === ${expectedId}), Path (${receivedPath} === ${expectedPath})`);
                
                if (senderId === expectedId && receivedPath === expectedPath) {
                    console.log("✅ Applying snapshot code. Content length:", data.content?.length);
                    isRemoteUpdateRef.current = true;
                    setContent(data.content);
                    setViewingLoading(false);
                } else {
                    console.warn("❌ Snapshot comparison failed!");
                }
            };

            socket.on('user_code_snapshot', handleSnapshot);

            const timeout = setTimeout(() => {
                if (viewingLoading) {
                    console.warn("Snapshot request timed out for user:", viewingUser?.userId);
                    setViewingLoading(false);
                }
            }, 4000);

            return () => {
                socket.off('user_code_snapshot', handleSnapshot);
                clearTimeout(timeout);
            };
        } else {
            // EDIT MODE: Load from local storage
            let storage = getFileStorage(roomId, filePath);
            if (!storage) {
                storage = {
                    content: initialContent,
                    lastSavedContent: initialContent,
                    updatedAt: Date.now()
                };
                setFileStorage(roomId, filePath, storage);
            }
            isRemoteUpdateRef.current = true;
            setContent(storage.content);
            updateDirtyStateAll();
        }
    }, [roomId, filePath, isViewing, viewingUser?.userId]);

    // Warn before leaving if dirty
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (dirtyFiles.size > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [dirtyFiles]);

    // RESPONDER: When someone requests our code, send it back immediately
    useEffect(() => {
        const handleCodeRequest = (data: { requesterId: string; filePath: string }) => {
            console.log("Received code request from:", data.requesterId, "for file:", data.filePath);
            
            // If the requester asks for a specific file, try to provide it
            // Fallback to our current active content if it matches or if requested path is same
            let contentToRespond = currentContentRef.current;
            
            if (data.filePath && data.filePath !== currentFilePathRef.current) {
                const storage = getFileStorage(roomId, data.filePath);
                contentToRespond = storage?.content ?? initialContent;
            }

            socket.emit('respond_user_code', {
                roomId,
                userId: currentUser?.id, // Explicitly include our ID just in case
                requesterId: data.requesterId,
                filePath: data.filePath || currentFilePathRef.current,
                content: contentToRespond,
            });
        };

        socket.on('request_user_code', handleCodeRequest);
        return () => { socket.off('request_user_code', handleCodeRequest); };
    }, [roomId, initialContent]);

    // Listen for live remote updates
    useEffect(() => {
        const handleCodeUpdate = (data: { userId: string, filePath: string, content: string }) => {
            if (isViewing) {
                if (data.userId === viewingUser?.userId && data.filePath === filePath) {
                    isRemoteUpdateRef.current = true;
                    setContent(data.content);
                    if (viewingLoading) setViewingLoading(false);
                }
                return;
            }
        };

        socket.on('code_update', handleCodeUpdate);
        return () => { socket.off('code_update', handleCodeUpdate); };
    }, [isViewing, viewingUser?.userId, filePath]);

    // Handle local Editor Change
    const handleEditorChange = (value: string | undefined) => {
        const newContent = value || '';
        setContent(newContent);

        const storage = getFileStorage(roomId, filePath);
        const lastSaved = storage?.lastSavedContent ?? initialContent;
        
        const isDirty = lastSaved !== newContent;
        setDirtyFiles(prev => {
            const next = new Set(prev);
            if (isDirty) next.add(filePath);
            else next.delete(filePath);
            return next;
        });

        if (isRemoteUpdateRef.current || isViewing) {
            if (!isViewing) {
                setFileStorage(roomId, filePath, {
                    content: newContent,
                    lastSavedContent: lastSaved, 
                    updatedAt: Date.now()
                });
            }
            isRemoteUpdateRef.current = false;
            return; 
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            setFileStorage(roomId, filePath, {
                content: newContent,
                lastSavedContent: lastSaved,
                updatedAt: Date.now()
            });

            socket.emit('code_change', {
                roomId,
                filePath,
                content: newContent
            });
        }, 400);
    };

    const handleFileChange = (newPath: string) => {
        if (timeoutRef.current) {
            const storage = getFileStorage(roomId, filePath);
            setFileStorage(roomId, filePath, {
                content,
                lastSavedContent: storage?.lastSavedContent ?? initialContent,
                updatedAt: Date.now()
            });
            clearTimeout(timeoutRef.current);
            socket.emit('code_change', { roomId, filePath, content });
        }

        setFilePath(newPath);
        socket.emit('file_switch', {
            roomId,
            filePath: newPath
        });
    };

    const saveFile = (pathToSave: string) => {
        const storage = getFileStorage(roomId, pathToSave);
        if (!storage) return;
        storage.lastSavedContent = storage.content;
        setFileStorage(roomId, pathToSave, storage);
        updateDirtyStateAll();
    };

    const saveAll = () => {
        availableFiles.forEach(f => {
            const storage = getFileStorage(roomId, f);
            if (storage && storage.content !== storage.lastSavedContent) {
                saveFile(f);
            }
        });
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#1e1e1e]">
            <div className="flex bg-[#2d2d2d] text-gray-400 text-sm overflow-x-auto justify-between pr-4 items-center">
                <div className="flex">
                    {availableFiles.map(f => {
                        const isDirty = dirtyFiles.has(f);
                        const isActive = filePath === f;
                        return (
                            <button 
                                key={f}
                                className={`px-4 py-2 border-t-2 flex items-center gap-2 transition-colors
                                    ${isActive ? 'border-blue-500 bg-[#1e1e1e] text-white' : 'border-transparent hover:bg-[#2a2a2a]'} 
                                    ${isDirty && !isActive ? 'text-yellow-100' : ''}`}
                                onClick={() => handleFileChange(f)}
                            >
                                {f}
                                {isDirty && (
                                    <span className={`text-[10px] ${isActive ? 'text-white' : 'text-gray-400'}`}>●</span>
                                )}
                            </button>
                        );
                    })}
                </div>
                {dirtyFiles.size > 0 && (
                    <button 
                        onClick={saveAll} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                    >
                        Save All
                    </button>
                )}
            </div>

            <div className="flex-1 w-full h-full relative">
                {viewingLoading && (
                    <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-white text-sm font-medium">Đang tải code...</span>
                        </div>
                    </div>
                )}
                <Editor
                    key={`${isViewing}-${viewingUser?.userId}-${filePath}`} // Force re-mount on context switch
                    height="100%"
                    width="100%"
                    language={filePath.endsWith('.ts') ? 'typescript' : 'javascript'}
                    theme="vs-dark"
                    value={content}
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        automaticLayout: true,
                        readOnly: isViewing,
                        domReadOnly: isViewing,
                        scrollBeyondLastLine: false,
                    }}
                />
            </div>
        </div>
    );
}
