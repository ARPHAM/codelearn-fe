'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Editor from '@monaco-editor/react'
import './styles.module.css'
import { JetBrains_Mono } from 'next/font/google'
import { io, Socket } from 'socket.io-client'
import { useSubmitCode, useGetSubmissionDetails } from './_mutation'

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

const languageOptions = [
    { label: "C++", value: "cpp" },
    { label: "Java", value: "java" },
    { label: "Python", value: "python" },
    { label: "JavaScript", value: "javascript" },
    { label: "TypeScript", value: "typescript" },
];

export default function CodeEditorPage() {
    const editorRef = useRef<any>(null)
    const socketRef = useRef<Socket | null>(null)
    const handlerRef = useRef<((data: any) => void) | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const currentEventNameRef = useRef<string | null>(null)
    const submitRef = useRef<(() => void) | null>(null)

    const stuckMinutes = 32

    // --- State Management ---
    const [language, setLanguage] = useState('python')
    const [files, setFiles] = useState([
        {
            filename: "main.py",
            content: `def find_peak(arr):\n    if not arr:\n        return -1\n    peak = 0\n    for i in range(len(arr)):\n        if arr[i] > arr[peak]:\n            peak = i\n        if i < len(arr) - 1 and arr[i] < arr[i+1]:\n            continue\n    return peak\n\n# Test\nprint(find_peak([1,3,2,5,4]))`
        },
        {
            filename: "helper.py",
            content: `def helper():\n    return 'Hello'`
        }
    ])

    const [activeFile, setActiveFile] = useState<string | null>("main.py")
    const [mainFile, setMainFile] = useState<string>("main.py")

    const [runStatus, setRunStatus] = useState<"IDLE" | "RUNNING" | "COMPLETED" | "ERROR">("IDLE")
    const [consoleOutput, setConsoleOutput] = useState<string>("")
    const [errorOutput, setErrorOutput] = useState<string>("")
    const [testResults, setTestResults] = useState<any[]>([])
    const [score, setScore] = useState<number | null>(null)
    const submitCode = useSubmitCode()
    const getSubmissionDetails = useGetSubmissionDetails()

    // --- WebSocket & Refs Initialization ---
    useEffect(() => {
        // Assume API url falls back to localhost if env is empty
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        socketRef.current = io(apiUrl)

        // Stable handler definition
        handlerRef.current = (data: any) => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)

            // Map the different completion statuses
            const isError = ['COMPILE_ERROR', 'RUNTIME_ERROR', 'TIME_LIMIT_EXCEEDED'].includes(data.status);
            setRunStatus(isError ? 'ERROR' : 'COMPLETED')

            setConsoleOutput(data.stdout || "")
            setErrorOutput(data.stderr || (isError && !data.stderr ? data.status : ""))
            setTestResults(data.testResults || [])
            if (data.score !== undefined) setScore(data.score)
        }

        return () => {
            socketRef.current?.disconnect()
        }
    }, [])

    // --- Edge Cases Handling ---
    useEffect(() => {
        // Fallback active file
        if (files.length > 0 && (!activeFile || !files.find(f => f.filename === activeFile))) {
            setActiveFile(files[0].filename)
        } else if (files.length === 0) {
            setActiveFile(null)
        }

        // Auto main file assignment
        if (files.length === 1 && mainFile !== files[0].filename) {
            setMainFile(files[0].filename)
        }
    }, [files, activeFile, mainFile])

    // --- Actions ---
    const handleEditorChange = (value: string | undefined) => {
        if (!activeFile) return;
        setFiles(prev => prev.map(f => f.filename === activeFile ? { ...f, content: value || "" } : f))
    }

    const handleSubmit = async () => {
        if (runStatus === "RUNNING") return; // Prevent double submit
        setRunStatus("RUNNING")
        setConsoleOutput("")
        setErrorOutput("")
        setTestResults([])
        setScore(null)

        // Clear existing timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        try {
            const response = await submitCode.mutateAsync({
                exerciseId: 1,
                language,
                mainFile,
                files
            })

            const data = response.data.data
            const submissionId = data.submissionId
            console.log(data)

            // Listener Cleanup
            if (currentEventNameRef.current && handlerRef.current && socketRef.current) {
                socketRef.current.off(currentEventNameRef.current, handlerRef.current)
            }

            const newEventName = `submission-${submissionId}`
            currentEventNameRef.current = newEventName

            // Bind new listener
            if (handlerRef.current && socketRef.current) {
                socketRef.current.on(newEventName, handlerRef.current)
            }

            // 10s Fallback Timeout
            timeoutRef.current = setTimeout(async () => {
                try {
                    const fallbackResp = await getSubmissionDetails.mutateAsync(submissionId)
                    if (fallbackResp.data) {
                        handlerRef.current?.(fallbackResp.data.data)
                        return;
                    }
                } catch (e) {
                    console.error("Fallback API also failed", e)
                }

                // If fallback fails and we are still here:
                setRunStatus("ERROR")
                setErrorOutput("Timeout: No real-time response received within 10 seconds.")
            }, 10000)

        } catch (error: any) {
            console.error("Error submitting code:", error)
            setRunStatus("ERROR")
            setErrorOutput(error.message || "Network Error: Could not connect to API")
        }
    }

    // Assign to a ref so Monaco command doesn't close over stale closures
    useEffect(() => {
        submitRef.current = handleSubmit
    }, [handleSubmit])


    function handleMount(editor: any, monaco: any) {
        editorRef.current = editor

        // Ctrl + Enter shortcut
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            if (submitRef.current) {
                submitRef.current()
            }
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
                'editorLineNumber.foreground': '#64748b',
                'editorLineNumber.activeForeground': '#c084fc',
                'editorIndentGuide.background': '#1e293b',
                'editorIndentGuide.activeBackground': '#8b5cf6',
            },
        })

        monaco.editor.setTheme('aiDark')
    }

    const currentFileContent = files.find(f => f.filename === activeFile)?.content || ""

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 14 }}>
                {/* HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <h1 className="page-title">💻 Code Editor + 🤖 AI Assistant</h1>
                        <p className="page-subtitle">Find Peak Element · Python 3.11</p>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <div
                            style={{
                                display: 'flex',
                                gap: 8,
                                background: 'rgba(239,68,68,0.1)',
                                borderRadius: 8,
                                padding: '6px 14px',
                            }}
                        >
                            ⏱ Stuck {stuckMinutes} phút
                        </div>

                        <button className="btn btn-ghost">💾 Lưu</button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={runStatus === "RUNNING"}>
                            {runStatus === "RUNNING" ? "Running..." : "▶ Run"}
                        </button>
                        <button className="btn btn-ghost" onClick={handleSubmit}>📤 Submit</button>
                    </div>
                </div>

                {/* MAIN GRID */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '280px 1fr 340px',
                        gap: 14,
                        flex: 1,
                    }}
                >
                    {/* LEFT PANEL */}
                    <div className="card" style={{ padding: 14, overflowY: 'auto' }}>
                        <h3>📋 Problem</h3>
                        <p style={{ fontSize: 13 }}>
                            Một phần tử đỉnh là phần tử lớn hơn các phần tử kề cạnh.
                            Cho mảng nums, tìm index của peak.
                        </p>
                        <div style={{ marginTop: 14 }}>
                            <b>Example</b>
                            <pre>[1,2,3,1] → 2</pre>
                            <pre>[1,2,1,3,5,6,4] → 5</pre>
                        </div>
                    </div>

                    {/* CENTER EDITOR */}
                    <div
                        className="card"
                        style={{
                            padding: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        {/* editor header */}
                        <div
                            style={{
                                padding: '8px 14px',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            {/* FILE TABS */}
                            <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
                                {files.map(f => (
                                    <div
                                        key={f.filename}
                                        onClick={() => setActiveFile(f.filename)}
                                        style={{
                                            padding: '4px 8px',
                                            cursor: 'pointer',
                                            borderRadius: '4px',
                                            background: activeFile === f.filename ? 'var(--bg-secondary)' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6
                                        }}
                                    >
                                        <span>{f.filename}</span>
                                        {mainFile === f.filename && <span title="Entry File">⭐</span>}
                                        {mainFile !== f.filename && activeFile === f.filename && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setMainFile(f.filename); }}
                                                style={{ fontSize: 10, padding: '2px 4px', background: 'var(--primary)', color: 'white', borderRadius: 4, border: 'none', cursor: 'pointer' }}
                                                title="Set as entry file"
                                            >
                                                Main?
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <select onChange={(e) => setLanguage(e.target.value)} className="select" value={language}>
                                {languageOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* MONACO */}
                        <div className={mono.className} style={{ flex: 1 }}>
                            {activeFile ? (
                                <Editor
                                    height="100%"
                                    language={language}
                                    value={currentFileContent}
                                    onChange={handleEditorChange}
                                    onMount={handleMount}
                                    theme="vs-dark"
                                    options={{
                                        fontSize: 13,
                                        fontFamily: 'JetBrains Mono',
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        glyphMargin: true,
                                    }}
                                />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                                    No file selected
                                </div>
                            )}
                        </div>

                        {/* TERMINAL OUTPUT */}
                        <div
                            style={{
                                borderTop: '1px solid var(--border)',
                                minHeight: '150px',
                                maxHeight: '30vh',
                                overflowY: 'auto',
                                padding: 10,
                                background: 'var(--bg-secondary)',
                            }}
                        >
                            <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 8 }}>Terminal</div>

                            {runStatus === "IDLE" && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Ready to run. Use Ctrl + Enter to run code.</div>}

                            {runStatus === "RUNNING" && <div style={{ color: 'var(--primary)', fontSize: 12 }}>Running code...</div>}

                            {['COMPLETED', 'ERROR'].includes(runStatus) && (
                                <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {score !== null && (
                                        <div style={{ fontWeight: 'bold' }}>Score: {score}%</div>
                                    )}

                                    {errorOutput && (
                                        <div>
                                            <strong>Errors</strong>
                                            <pre style={{ color: '#f87171', marginTop: 4 }}>{errorOutput}</pre>
                                        </div>
                                    )}

                                    {consoleOutput && (
                                        <div>
                                            <strong>Console Output</strong>
                                            <pre style={{ color: 'var(--text)', marginTop: 4 }}>{consoleOutput}</pre>
                                        </div>
                                    )}

                                    {testResults && testResults.length > 0 && (
                                        <div>
                                            <strong>Test Results</strong>
                                            <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                {testResults.map((test, idx) => (
                                                    <div key={idx} style={{ padding: 4, background: test.status === 'PASS' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: 4 }}>
                                                        Test {idx + 1}: <span style={{ color: test.status === 'PASS' ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>{test.status}</span>
                                                        <div style={{ fontSize: 11, marginLeft: 8, opacity: 0.8 }}>
                                                            Expected: {test.expected} | Actual: {test.actual}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>

                    {/* RIGHT AI */}
                    <div
                        className="card"
                        style={{
                            padding: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        {/* AI header */}
                        <div
                            style={{
                                padding: 12,
                                borderBottom: '1px solid var(--border)',
                                fontWeight: 700,
                            }}
                        >
                            🤖 AI Assistant
                        </div>

                        {/* messages */}
                        <div
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: 14,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10,
                            }}
                        >
                            {aiMessages.map((m, i) => (
                                <div
                                    key={i}
                                    style={{
                                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                        background:
                                            m.role === 'user'
                                                ? 'rgba(124,58,237,0.15)'
                                                : 'var(--bg-secondary)',
                                        padding: '8px 10px',
                                        borderRadius: 8,
                                        fontSize: 12,
                                        maxWidth: '85%',
                                    }}
                                >
                                    {m.msg}
                                </div>
                            ))}
                        </div>

                        {/* input */}
                        <div
                            style={{
                                padding: 10,
                                borderTop: '1px solid var(--border)',
                                display: 'flex',
                                gap: 8,
                            }}
                        >
                            <input
                                className="input"
                                placeholder="Hỏi AI..."
                                style={{ flex: 1 }}
                            />
                            <button className="btn btn-primary">➤</button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .errorLine {
                    background: rgba(239,68,68,0.15);
                }
                .errorGlyph {
                    background: red;
                    width: 5px;
                }
                ::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: var(--border);
                    border-radius: 4px;
                }
            `}</style>
        </DashboardLayout>
    )
}