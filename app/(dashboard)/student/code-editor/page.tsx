'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

import Editor from '@monaco-editor/react'
import './styles.module.css'
import { JetBrains_Mono } from 'next/font/google'
import { io, Socket } from 'socket.io-client'
import { useSubmitCode, useRunCode } from './_api/mutations'
import { getRunResult, getSubmissionResult } from '@/features/problems/mutations'
import { useLanguages } from '@/src/hooks/useLanguages'
import { useStudentProblemDetail } from '@/src/hooks/useProblems'
import FillInTheBlankEditor from '@/components/FillInTheBlankEditor'
import { toast } from '@/components/ui/Toast'
import { useSearchParams } from 'next/navigation'
import ProblemUiStudent from '../components/problem-ui-student'
import { Bot, Send, Target, ClipboardList, Code2, Play, Upload, Edit2, Star, X, Plus, Database, Terminal, Loader2, Sparkles } from 'lucide-react'
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
    const searchParams = useSearchParams()
    const slug = searchParams.get('slug')
    const { data: problemData, isLoading: isLoadingProblem } = useStudentProblemDetail(slug || '', !!slug)

    const editorRef = useRef<any>(null)
    const socketRef = useRef<Socket | null>(null)
    const handlerRef = useRef<((data: any) => void) | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const currentEventNameRef = useRef<string | null>(null)
    const submitRef = useRef<(() => void) | null>(null)

    const stuckMinutes = 32

    const { data: languages = [] } = useLanguages()

    const [isInitialized, setIsInitialized] = useState(false)
    // ---------------- Tự động cập nhật file khởi tạo khi load đề ----------------
    useEffect(() => {
        if (!isInitialized && !isLoadingProblem && problemData && languages.length > 0) {
            console.log("Initializing student editor...", { problemData, languagesCount: languages.length });
            
            // Trường hợp có file mẫu trong DB
            if (problemData.languageFiles && problemData.languageFiles.length > 0) {
                const templateFiles = problemData.languageFiles.filter(f => f.type === 'TEMPLATE')
                if (templateFiles.length > 0) {
                    const mappedFiles = templateFiles.map(f => {
                        // Thử tìm theo languageId hoặc lấy trực tiếp từ relation f.language
                        const l = languages.find(lx => lx.id === f.languageId) || f.language;
                        const langName = l?.name?.toLowerCase() || 'text';
                        
                        console.log(`Mapping file ${f.path}:`, { languageId: f.languageId, found: !!l, name: langName });
                        
                        return {
                            filename: f.path,
                            language: langName,
                            content: f.content,
                            type: f.type
                        }
                    })
                    
                    setFiles(mappedFiles)
                    setActiveFileName(mappedFiles[0].filename)
                    setMainFileName(problemData?.version?.entryFile || mappedFiles[0].filename)
                    
                    // Cập nhật ngôn ngữ dựa trên file chính
                    if (mappedFiles[0].language !== 'text') {
                        setLanguage(mappedFiles[0].language)
                        setIsInitialized(true) // Chỉ đánh dấu hoàn thành nếu đã gán đúng ngôn ngữ
                    }
                } else {
                    setIsInitialized(true)
                }
            } else {
                // Trường hợp DB rỗng: Khởi tạo 1 file main.py trắng
                console.log("No language files found, using default python template");
                const defaultFiles = [{
                    filename: "main.py",
                    language: "python",
                    content: "",
                    type: "NORMAL"
                }]
                setFiles(defaultFiles)
                setActiveFileName("main.py")
                setMainFileName("main.py")
                setLanguage("python")
                setIsInitialized(true)
            }
        }
    }, [problemData, languages, isInitialized, isLoadingProblem])

    const [language, setLanguage] = useState('python')
    const [files, setFiles] = useState<{filename: string, language: string, content: string, type?: string}[]>([
        {
            filename: "main.py",
            language: "python",
            content: "",
            type: "NORMAL"
        }
    ])

    const [activeFileName, setActiveFileName] = useState<string>("main.py")
    const [mainFileName, setMainFileName] = useState<string>("")

    // --- File Handlers ---
    const handleAddFile = () => {
        let name = prompt("Nhập tên file (VD: utils.py):");
        if (!name) return;

        // Nếu người dùng không nhập đuôi, tự động thêm đuôi theo ngôn ngữ hiện tại
        if (!name.includes('.')) {
            const langObj = languages.find(l => l.name.toLowerCase() === language.toLowerCase());
            if (langObj) name += langObj.ext;
            else name += '.txt';
        }

        const finalName = getUniqueFilename(name, files);
        const langObj = languages.find(l => l.ext === getExt(finalName));
        
        setFiles(prev => [...prev, {
            filename: finalName,
            language: langObj?.name.toLowerCase() || 'text',
            content: langObj?.template || ""
        }]);
        setActiveFileName(finalName);
    };

    const handleRenameFile = (oldName: string) => {
        let newName = prompt("Nhập tên file mới:", oldName);
        if (!newName || newName === oldName) return;

        if (files.find(f => f.filename === newName)) {
            toast({ type: 'error', title: 'Lỗi', message: 'Tên file đã tồn tại.' });
            return;
        }

        setFiles(prev => prev.map(f => f.filename === oldName ? { ...f, filename: newName } : f));
        if (activeFileName === oldName) setActiveFileName(newName);
        if (mainFileName === oldName) setMainFileName(newName);

        // Kiểm tra tính hợp lệ nếu đổi tên file Main
        if (mainFileName === oldName) {
            const ext = getExt(newName);
            const lang = languages.find(l => l.ext === ext);
            if (!lang) {
                toast({ type: 'warning', title: 'Cảnh báo', message: `File chính hiện có đuôi ${ext} không được hỗ trợ bởi các ngôn ngữ lập trình khả dụng.` });
            }
        }
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
        if (!newLang) return; // Trạng thái chưa chọn

        const langObj = languages.find(l => l.name.toLowerCase() === newLang.toLowerCase());
        if (langObj && mainFileName) {
            const ext = getExt(mainFileName);
            if (ext !== langObj.ext) {
                const parts = mainFileName.split('.');
                const base = parts.length > 1 ? parts.slice(0, -1).join('.') : mainFileName;
                const newMainName = getUniqueFilename(base + langObj.ext, files.filter(f => f.filename !== mainFileName));
                
                setFiles(prev => prev.map(f => {
                    if (f.filename === mainFileName) {
                        return { ...f, filename: newMainName, language: newLang.toLowerCase() };
                    }
                    return f;
                }));
                setMainFileName(newMainName);
                if (activeFileName === mainFileName) setActiveFileName(newMainName);
            }
        }
    };

    const [status, setStatus] = useState<"IDLE" | "RUNNING" | "QUEUED" | "COMPLETED" | "ERROR">("IDLE")
    const [runResult, setRunResult] = useState<any>(null)
    const [submitResult, setSubmitResult] = useState<any>(null)
    const [customInput, setCustomInput] = useState<string>("")
    const [resultTab, setResultTab] = useState<'output' | 'input'>('output')

    // --- AI CHAT STATE ---
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

    // --- Lazy Socket Loader ---
    const initSocket = () => {
        if (socketRef.current?.connected) return socketRef.current;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const s = io(apiUrl, {
            autoConnect: true,
            transports: ['websocket'], // Tránh lỗi Session ID unknown
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
        socketRef.current = s;

        s.on('connect', () => console.log("Socket connected for execution results."));

        s.on('connect_error', (err) => {
            console.error("Socket Connection Error:", err.message);
            if (err.message === 'xhr poll error' || err.message === 'websocket error') {
                // Thử lại hoặc thông báo
            }
        });

        handlerRef.current = (data: any) => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            setStatus("COMPLETED")

            if (data.score !== undefined) {
                setSubmitResult(data)
                setRunResult(null)
            } else {
                setRunResult(data)
                setSubmitResult(null)
            }
        }

        return s;
    };

    useEffect(() => {
        return () => {
            socketRef.current?.disconnect()
        }
    }, [])

    const handleEditorChange = (value: string | undefined) => {
        setFiles(prev => prev.map(f => f.filename === activeFileName ? { ...f, content: value || "" } : f))
    }

    const listenToResult = async (id: string, type: 'RUN' | 'SUBMIT') => {
        console.log("listenToResult", id, type);
        const s = initSocket();

        if (currentEventNameRef.current && handlerRef.current && s) {
            s.off(currentEventNameRef.current, handlerRef.current)
        }

        const newEventName = `submission-${id}`
        const altEventName = `run-${id}`
        currentEventNameRef.current = newEventName

        const cleanup = () => {
            if (handlerRef.current && s) {
                s.off(newEventName, handlerRef.current);
                s.off(altEventName, handlerRef.current);
            }
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };

        const wrappedHandler = (data: any) => {
            console.log("Socket Result Received:", data);
            if (handlerRef.current) handlerRef.current(data);
            cleanup();
        };

        if (s) {
            s.on(newEventName, wrappedHandler);
            s.on(altEventName, wrappedHandler); // Phối hợp lắng nghe cả run-id
        }

        // --- BƯỚC HYBRID: KIỂM TRA API NGAY LẬP TỨC ---
        try {
            console.log(`Checking API ${type} result for ID: ${id}...`);
            const data = type === 'RUN' ? await getRunResult(id) : await getSubmissionResult(id);

            if (data && data.status !== 'QUEUED' && data.status !== 'PROCESSING') {
                console.log("API Result Found Immediately:", data);
                if (handlerRef.current) handlerRef.current(data);
                cleanup();
                return;
            }
        } catch (err) {
            console.warn("API check failed, relying on socket:", err);
        }

        timeoutRef.current = setTimeout(() => {
            if (status === "QUEUED" || status === "RUNNING") {
                setStatus("ERROR")
                cleanup();
                toast({ type: 'warning', title: 'Timeout', message: "Không nhận được phản hồi từ server sau 15s." })
            }
        }, 15000)
    }

    const handleRun = async () => {
        const mainFileObj = files.find(f => f.filename === mainFileName) || files[0];
        const langName = mainFileObj.language || 'python';

        setStatus("RUNNING")
        setRunResult(null);
        setSubmitResult(null);

        // FITB Logic: Extract answers for template files
        const answers: Record<string, string[]> = {};
        const otherFiles: any[] = [];
        
        files.forEach(f => {
            const dbFile = problemData?.languageFiles?.find((lf: any) => lf.path === f.filename);
            if (dbFile && dbFile.type === 'TEMPLATE') {
                answers[f.filename] = extractAnswers(f.content);
            } else {
                otherFiles.push({ filePath: f.filename, content: f.content });
            }
        });

        try {
            const resp = await runMutation.mutateAsync({
                language: langName,
                entryFile: mainFileName,
                files: otherFiles,
                answers,
                input: customInput,
                problemVersionId: problemData?.version?.id
            })

            setStatus("QUEUED")
            setResultTab('output') // Tự động chuyển sang tab kết quả khi chạy xong
            console.log("Run Response:", resp);
            listenToResult(resp.id, 'RUN')
        } catch (err) {
            setStatus("ERROR")
        }
    }

    const handleSubmit = async () => {
        setStatus("RUNNING")
        setRunResult(null);
        setSubmitResult(null);

        const mainFileObj = files.find(f => f.filename === mainFileName) || files[0];
        const langName = mainFileObj.language || 'python';

        // FITB Logic: Extract answers for template files
        const answers: Record<string, string[]> = {};
        const otherFiles: any[] = [];
        
        files.forEach(f => {
            const dbFile = problemData?.languageFiles?.find((lf: any) => lf.path === f.filename);
            if (dbFile && dbFile.type === 'TEMPLATE') {
                answers[f.filename] = extractAnswers(f.content);
            } else {
                otherFiles.push({ filePath: f.filename, content: f.content });
            }
        });

        try {
            const resp = await submitMutation.mutateAsync({
                language: langName,
                entryFile: mainFileName,
                files: otherFiles,
                answers,
                problemVersionId: problemData?.version?.id as string
            })

            setStatus("QUEUED")
            console.log("Submit Response:", resp);
            listenToResult(resp.submissionId, 'SUBMIT')
        } catch (err) {
            setStatus("ERROR")
        }
    }

    useEffect(() => { submitRef.current = handleSubmit }, [handleSubmit])

    function handleMount(editor: any, monaco: any) {
        editorRef.current = editor
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            if (submitRef.current) submitRef.current()
        })

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
            },
        })
        monaco.editor.setTheme('aiDark')
    }

    const currentFile = files.find(f => f.filename === activeFileName)

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 124px)', gap: 14, minHeight: 0 }}>
                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Code2 size={24} color="var(--accent-purple)" />
                            Code Editor + {slug ? <><Target size={20} color="var(--accent-cyan)" /> Giải thuật</> : <><Bot size={20} color="var(--accent-purple-light)" /> AI Assistant</>}
                        </h1>
                        <p className="page-subtitle">{problemData?.title ? `Bài: ${problemData.title}` : 'Chế độ Code Tự Do'} · {currentFile?.language}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: slug ? '280px 1fr 340px' : '1fr 340px', gap: 14, flex: 1, minHeight: 0 }}>
                    {/* LEFT PROBLEM */}
                    {slug && (
                        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', minHeight: 0 }}>
                            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ClipboardList size={14} /> Đề bài
                                </div>
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
                                    />
                                )}
                                
                                {!isLoadingProblem && !problemData && (
                                    <div style={{ padding: 16, color: 'red' }}>Lỗi không tải được đề bài!</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* CENTER EDITOR */}
                    <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', minHeight: 0 }}>
                        <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                {files.map(f => {
                                    const isMain = mainFileName === f.filename;
                                    const currentLangObj = languages.find(l => l.name.toLowerCase() === language.toLowerCase());
                                    const fileExt = getExt(f.filename);
                                    const isExtInvalid = isMain && currentLangObj && fileExt !== currentLangObj.ext && !['.txt', ''].includes(fileExt);
                                    const isUnsupported = isMain && !languages.find(l => l.ext === fileExt);

                                    // Xác định xem file này có phải là TEMPLATE trong DB không
                                    const dbFile = problemData?.languageFiles?.find((lf: any) => lf.path === f.filename);
                                    const isTemplateFile = dbFile && dbFile.type === 'TEMPLATE';
                                    const workspaceConfig = problemData?.version?.workspaceConfig || { canCreateFile: false, canChangeMainFile: false };

                                    return (
                                        <div
                                            key={f.filename}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                padding: '4px 10px', borderRadius: '6px 6px 0 0', cursor: 'pointer',
                                                background: activeFileName === f.filename ? '#0b0f1a' : 'transparent',
                                                border: activeFileName === f.filename ? '1px solid var(--border)' : '1px solid transparent',
                                                borderBottom: activeFileName === f.filename ? '1px solid #0b0f1a' : '1px solid transparent',
                                                marginBottom: -1, zIndex: 1,
                                                color: activeFileName === f.filename 
                                                    ? (isMain && (isExtInvalid || isUnsupported) ? 'var(--accent-red)' : 'var(--text-primary)') 
                                                    : 'var(--text-secondary)',
                                                fontSize: 12, fontWeight: activeFileName === f.filename ? 600 : 400,
                                                transition: 'all 0.2s'
                                            }}
                                            onClick={() => setActiveFileName(f.filename)}
                                        >
                                            {isMain && <Star size={12} fill="var(--accent-yellow)" color="var(--accent-yellow)" style={{ marginRight: 4 }} />}
                                            {f.filename}
                                            {activeFileName === f.filename && (
                                                <div style={{ display: 'flex', gap: 4, marginLeft: 4 }}>
                                                    {/* Chỉ cho phép đổi tên nếu KHÔNG phải TEMPLATE */}
                                                    {!isTemplateFile && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleRenameFile(f.filename); }}
                                                            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                            title="Đổi tên file"
                                                        >
                                                            <Edit2 size={10} />
                                                        </button>
                                                    )}
                                                    
                                                    {/* Đặt làm file chính nếu cấu hình cho phép và không phải là main hiện tại */}
                                                    {!isMain && workspaceConfig.canChangeMainFile && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleSetMain(f.filename); }}
                                                            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                            title="Đặt làm file chính"
                                                        >
                                                            <Star size={10} />
                                                        </button>
                                                    )}

                                                    {/* Chỉ cho xóa nếu KHÔNG phải TEMPLATE và KHÔNG phải file chính */}
                                                    {files.length > 1 && !isMain && !isTemplateFile && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteFile(f.filename); }}
                                                            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {(problemData?.version?.workspaceConfig?.canCreateFile ?? false) && (
                                    <button
                                        onClick={handleAddFile}
                                        style={{
                                            padding: '4px 8px', background: 'none', border: 'none',
                                            color: 'var(--accent-purple)', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                        title="Thêm file mới"
                                    >
                                        <Plus size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className={mono.className} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            {currentFile ? (() => {
                                const dbFile = problemData?.languageFiles?.find((lf: any) => lf.path === currentFile.filename);
                                const isTemplateFile = dbFile && dbFile.type === 'TEMPLATE';
                                
                                return (
                                    <FillInTheBlankEditor 
                                        key={activeFileName}
                                        file={{
                                            id: currentFile.filename,
                                            path: currentFile.filename,
                                            content: currentFile.content,
                                            type: isTemplateFile ? 'TEMPLATE' : (currentFile.type || 'NORMAL'), 
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
                                );
                            })() : (
                                <div style={{ padding: 20, color: 'var(--text-muted)' }}>Vui lòng chọn hoặc tạo file để bắt đầu...</div>
                            )}
                        </div>

                        {/* TERMINAL / RESULTS */}
                        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', height: 230, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            {/* TABS HEADER */}
                            <div style={{ display: 'flex', gap: 20, padding: '0 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                                <div 
                                    onClick={() => setResultTab('output')}
                                    style={{ 
                                        padding: '10px 4px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                        color: resultTab === 'output' ? 'var(--accent-purple)' : 'var(--text-muted)',
                                        borderBottom: resultTab === 'output' ? '2px solid var(--accent-purple)' : '2px solid transparent',
                                        transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', gap: 6
                                    }}
                                >
                                    <Database size={14} /> Kết quả
                                </div>
                                <div 
                                    onClick={() => setResultTab('input')}
                                    style={{ 
                                        padding: '10px 4px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                        color: resultTab === 'input' ? 'var(--accent-purple)' : 'var(--text-muted)',
                                        borderBottom: resultTab === 'input' ? '2px solid var(--accent-purple)' : '2px solid transparent',
                                        transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', gap: 6
                                    }}
                                >
                                    <Terminal size={14} /> Custom Input
                                </div>
                            </div>

                            <div style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
                                {resultTab === 'input' ? (
                                    <textarea 
                                        value={customInput}
                                        onChange={(e) => setCustomInput(e.target.value)}
                                        placeholder="Nhập dữ liệu đầu vào tại đây (stdin)..."
                                        style={{
                                            width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none',
                                            color: 'var(--text-primary)', fontSize: 12, resize: 'none', fontFamily: 'monospace',
                                            lineHeight: 1.6
                                        }}
                                    />
                                ) : (
                                    <>
                                        {status === "QUEUED" && (
                                            <div style={{ color: 'var(--accent-cyan)', fontSize: 13 }} className="blink">Đang chờ chấm...</div>
                                        )}

                                        {runResult && (
                                            <div style={{ fontSize: 12 }}>
                                                <div style={{ fontWeight: 'bold', color: runResult.status === 'ACCEPTED' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                                    Trạng thái: {runResult.status}
                                                </div>
                                                {runResult.runtime && <div>Thời gian: {runResult.runtime}ms</div>}
                                                {runResult.compileOutput && (
                                                    <pre style={{ background: '#000', padding: 8, marginTop: 4, color: '#f87171' }}>{runResult.compileOutput}</pre>
                                                )}
                                                {runResult.output && (
                                                    <pre style={{ background: '#000', padding: 8, marginTop: 4 }}>{runResult.output}</pre>
                                                )}
                                            </div>
                                        )}

                                        {submitResult && (
                                            <div style={{ fontSize: 12 }}>
                                                <div style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--accent-purple)' }}>
                                                    Điểm: {submitResult.score} / 100
                                                </div>
                                                <div style={{ marginBottom: 8 }}>Vượt qua: {submitResult.testcasesPassed} / {submitResult.testcasesTotal} testcases</div>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 8 }}>
                                                    {submitResult.results?.map((res: any, idx: number) => (
                                                        <div key={idx} style={{
                                                            padding: '4px 8px', borderRadius: 4, textAlign: 'center', fontSize: 10,
                                                            background: res.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                                            border: `1px solid ${res.passed ? 'var(--accent-green)' : 'var(--accent-red)'}`
                                                        }}>
                                                            TC {idx + 1}
                                                        </div>
                                                    ))}
                                                </div>
                                                {submitResult.error && (
                                                    <div style={{ color: 'var(--accent-red)', marginTop: 8 }}>{submitResult.error}</div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {!runResult && !submitResult && status === "IDLE" && (
                                            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Chưa có kết quả. Nhấn Chạy code hoặc Nộp bài.</div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT AI */}
                    <div className="card" style={{ 
                        padding: 0, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        overflow: 'hidden',
                        height: '100%',
                        minHeight: 0,
                        background: 'rgba(30, 35, 48, 0.4)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <div style={{ 
                            padding: '14px 18px', 
                            borderBottom: '1px solid var(--border)', 
                            background: 'rgba(255, 255, 255, 0.02)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}>
                            <div style={{ 
                                width: 32, height: 32, borderRadius: 10, 
                                background: 'var(--gradient-purple)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: 'var(--shadow-glow-purple)'
                            }}>
                                <Bot size={18} color="white" />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.01em' }}>AI Code Assistant</span>
                        </div>
                        
                        <div style={{ flex: 1, padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {chatMessages.map((m, i) => (
                                <div key={i} style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                                    gap: 4
                                }}>
                                    <div style={{ 
                                        maxWidth: '90%',
                                        padding: '10px 14px',
                                        borderRadius: m.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                                        background: m.role === 'user' ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.05)',
                                        color: 'var(--text-primary)',
                                        fontSize: 13,
                                        lineHeight: 1.6,
                                        boxShadow: m.role === 'user' ? '0 4px 12px rgba(139, 92, 246, 0.2)' : 'none',
                                        overflowWrap: 'break-word',
                                        wordBreak: 'break-word'
                                    }}>
                                        {m.role === 'assistant' ? (
                                            <div className="markdown-body" style={{ 
                                                fontSize: 13,
                                                background: 'transparent',
                                            }}>
                                                <style>{`
                                                    .markdown-body pre {
                                                        white-space: pre-wrap !important;
                                                        word-break: break-all !important;
                                                        background: rgba(0,0,0,0.3) !important;
                                                        padding: 10px !important;
                                                        border-radius: 8px !important;
                                                        margin: 8px 0 !important;
                                                    }
                                                    .markdown-body code {
                                                        white-space: pre-wrap !important;
                                                        word-break: break-all !important;
                                                    }
                                                `}</style>
                                                <ReactMarkdown>{m.msg}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            m.msg
                                        )}
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

                        <div style={{ 
                            padding: '14px', 
                            borderTop: '1px solid var(--border)',
                            background: 'rgba(0, 0, 0, 0.2)',
                            display: 'flex',
                            gap: 8
                        }}>
                            <input 
                                className="input"
                                value={userMsg}
                                onChange={(e) => setUserMsg(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Hỏi AI về code hoặc bài tập..."
                                style={{ 
                                    flex: 1, 
                                    borderRadius: 12, 
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    fontSize: 13,
                                    height: 40,
                                    paddingLeft: 12
                                }}
                                disabled={isAiLoading}
                            />
                            <button 
                                className="btn btn-primary"
                                onClick={handleSendMessage}
                                style={{ 
                                    width: 40, height: 40, padding: 0, borderRadius: 12,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                disabled={isAiLoading || !userMsg.trim()}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}