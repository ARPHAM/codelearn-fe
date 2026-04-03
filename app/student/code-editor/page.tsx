'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Editor from '@monaco-editor/react'
import './styles.module.css'
import { JetBrains_Mono } from 'next/font/google'
import { io, Socket } from 'socket.io-client'
import { useSubmitCode, useRunCode } from '@/features/problems/mutations'
import { useLanguages } from '@/src/hooks/useLanguages'
import { toast } from '@/components/ui/Toast'

const mono = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
})

const aiMessages = [
    {
        role: 'assistant',
        msg: '👋 Xin chào! Tôi là AI Assistant. Tôi thấy code của bạn gặp lỗi **IndexError** tại dòng 8.',
    },
    {
        role: 'assistant',
        msg: '**Nguyên nhân:** Bạn đang truy cập `arr[i+1]` nhưng khi `i = len(arr)-1` thì `i+1` vượt ra ngoài phạm vi mảng.',
    },
    { role: 'user', msg: 'Nếu mảng rỗng thì sao?' },
    {
        role: 'assistant',
        msg: 'Nếu mảng rỗng (`len(arr)==0`) nên kiểm tra đầu hàm và return sớm.',
    },
]

export default function CodeEditorPage() {
    const editorRef = useRef<any>(null)
    const socketRef = useRef<Socket | null>(null)
    const handlerRef = useRef<((data: any) => void) | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const currentEventNameRef = useRef<string | null>(null)
    const submitRef = useRef<(() => void) | null>(null)

    const stuckMinutes = 32

    const { data: languages = [] } = useLanguages()

    const [language, setLanguage] = useState('python')
    const [files, setFiles] = useState([
        {
            filename: "main",
            language: "python",
            content: `def find_peak(arr):\n    if not arr:\n        return -1\n    peak = 0\n    for i in range(len(arr)):\n        if arr[i] > arr[peak]:\n            peak = i\n        if i < len(arr) - 1 and arr[i] < arr[i+1]:\n            continue\n    return peak\n\n# Test\nprint(find_peak([1,3,2,5,4]))`
        },
        {
            filename: "helper",
            language: "python",
            content: `def helper():\n    return 'Hello'`
        }
    ])

    const [activeFileName, setActiveFileName] = useState<string>("main")
    const [mainFileName, setMainFileName] = useState<string>("main")

    const [status, setStatus] = useState<"IDLE" | "RUNNING" | "QUEUED" | "COMPLETED" | "ERROR">("IDLE")
    const [runResult, setRunResult] = useState<any>(null)
    const [submitResult, setSubmitResult] = useState<any>(null)
    const [customInput, setCustomInput] = useState<string>("")

    const runMutation = useRunCode()
    const submitMutation = useSubmitCode()

    // --- Lazy Socket Loader ---
    const initSocket = () => {
        if (socketRef.current?.connected) return socketRef.current;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const s = io(apiUrl, { autoConnect: true });
        socketRef.current = s;

        s.on('connect', () => console.log("Socket connected for execution results."));

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

    const listenToResult = (id: string) => {
        const s = initSocket();

        if (currentEventNameRef.current && handlerRef.current && s) {
            s.off(currentEventNameRef.current, handlerRef.current)
        }

        const newEventName = `submission-${id}`
        currentEventNameRef.current = newEventName

        if (handlerRef.current && s) {
            s.on(newEventName, handlerRef.current)
        }

        timeoutRef.current = setTimeout(() => {
            if (status === "QUEUED" || status === "RUNNING") {
                setStatus("ERROR")
                toast({ type: 'warning', title: 'Timeout', message: "Không nhận được phản hồi từ server sau 15s." })
            }
        }, 15000)
    }

    const handleRun = async () => {
        const currentFile = files.find(f => f.filename === activeFileName);
        const langInfo = languages.find(l => l.name.toLowerCase() === currentFile?.language.toLowerCase());

        if (!langInfo) {
            toast({ type: 'error', title: 'Lỗi', message: 'Không tìm thấy thông tin ngôn ngữ.' });
            return;
        }

        setStatus("RUNNING")
        setRunResult(null);
        setSubmitResult(null);

        try {
            const resp = await runMutation.mutateAsync({
                languageId: langInfo.id,
                code: currentFile?.content || "",
                input: customInput
            })

            setStatus("QUEUED")
            listenToResult(resp.id)
        } catch (err) {
            setStatus("ERROR")
        }
    }

    const handleSubmit = async () => {
        setStatus("RUNNING")
        setRunResult(null);
        setSubmitResult(null);

        const activeFile = files.find(f => f.filename === activeFileName);
        const langName = activeFile?.language || 'python';
        const langObj = languages.find(l => l.name.toLowerCase() === langName.toLowerCase());
        const ext = langObj?.ext || '.py';

        try {
            const resp = await submitMutation.mutateAsync({
                language: langName,
                mainFile: mainFileName + ext,
                files: files.map(f => {
                    const fLang = languages.find(l => l.name.toLowerCase() === f.language.toLowerCase());
                    const fExt = fLang?.ext || '.py';
                    return {
                        filename: f.filename + fExt,
                        content: f.content
                    }
                })
            })

            setStatus("QUEUED")
            listenToResult(resp.submissionId)
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
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 14 }}>
                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                        <h1 className="page-title">💻 Code Editor + 🤖 AI Assistant</h1>
                        <p className="page-subtitle">Bài: Find Peak Element · {currentFile?.language} · CS101</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <button className="btn btn-ghost" onClick={handleRun} disabled={status === "RUNNING" || status === "QUEUED"}>
                            {status === "RUNNING" || status === "QUEUED" ? "..." : "▶ Chạy code"}
                        </button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={status === "RUNNING" || status === "QUEUED"}>
                            {status === "RUNNING" || status === "QUEUED" ? "Đang xử lý..." : "📤 Nộp bài"}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 340px', gap: 14, flex: 1 }}>
                    {/* LEFT PROBLEM */}
                    <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>📋 Đề bài</div>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', fontSize: 12 }}>
                            <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>Tiện ích chấm bài đang hoạt động. Vui lòng code và nhấn Nộp bài để nhận điểm.</p>
                        </div>
                    </div>

                    {/* CENTER EDITOR */}
                    <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {files.map(f => (
                                    <div
                                        key={f.filename}
                                        onClick={() => setActiveFileName(f.filename)}
                                        style={{
                                            padding: '4px 8px', borderRadius: 4, cursor: 'pointer',
                                            background: activeFileName === f.filename ? 'var(--bg-secondary)' : 'transparent'
                                        }}
                                    >
                                        {f.filename}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={mono.className} style={{ flex: 1 }}>
                            <Editor
                                height="100%"
                                language={currentFile?.language}
                                value={currentFile?.content}
                                onChange={handleEditorChange}
                                onMount={handleMount}
                                theme="aiDark"
                                options={{ fontSize: 13, minimap: { enabled: false } }}
                            />
                        </div>

                        {/* TERMINAL / RESULTS */}
                        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', height: 200, padding: 12, overflowY: 'auto' }}>
                            <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 8 }}>Kết quả</div>

                            {status === "QUEUED" && (
                                <div style={{ color: 'var(--accent-cyan)' }} className="blink">Đang chờ chấm...</div>
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
                        </div>
                    </div>

                    {/* RIGHT AI */}
                    <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '14px', borderBottom: '1px solid var(--border)' }}>🤖 AI Code Assistant</div>
                        <div style={{ flex: 1, padding: '14px', fontSize: 12, color: 'var(--text-secondary)' }}>
                            Tính năng AI đang được nâng cấp...
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}