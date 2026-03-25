'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Editor from '@monaco-editor/react'
import './styles.module.css'
import { JetBrains_Mono } from 'next/font/google'
import { io, Socket } from 'socket.io-client'
import { useSubmitCode, useGetSubmissionDetails } from './_api/mutation'

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
    { label: "C++", value: "cpp", extension: ".cpp" },
    { label: "Java", value: "java", extension: ".java" },
    { label: "Python", value: "python", extension: ".py" },
    { label: "JavaScript", value: "javascript", extension: ".js" },
    { label: "TypeScript", value: "typescript", extension: ".ts" },
    { label: "PHP", value: "php", extension: ".php" },
    { label: "Ruby", value: "ruby", extension: ".rb" },
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
            setMainFile(files[0].filename + languageOptions.find(l => l.value === files[0].language)?.extension)
        }
    }, [files, activeFile, mainFile])

    // --- Actions ---
    const handleEditorChange = (value: string | undefined) => {
        if (!activeFile) return;
        setFiles(prev => prev.map(f => f.filename === activeFile ? { ...f, content: value || "" } : f))
    }

    const handleSubmit = async () => {
        if (runStatus === "RUNNING") return;
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
                language: files.find(f => f.filename === activeFile)?.language || files[0].language,
                mainFile: mainFile + languageOptions.find(l => l.value === files[0].language)?.extension,
                files: files.map(f => ({
                    filename: f.filename + languageOptions.find(l => l.value === f.language)?.extension,
                    content: f.content
                }))
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                        <h1 className="page-title">💻 Code Editor + 🤖 AI Assistant</h1>
                        <p className="page-subtitle">Bài: Find Peak Element · Python 3.11 · CS101-A</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        {/* Stuck timer */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 8, padding: '6px 14px',
                        }}>
                            <span style={{ fontSize: 14 }}>⏱</span>
                            <div>
                                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Đang stuck</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: '#f87171' }}>{stuckMinutes} phút</div>
                            </div>
                            <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />
                            <div style={{ fontSize: 11, color: '#f87171', fontWeight: 600 }}>AI đang hỗ trợ 🤖</div>
                        </div>
                        <button className="btn btn-ghost">💾 Lưu</button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={runStatus === "RUNNING"}>
                            {runStatus === "RUNNING" ? "Đang chạy..." : "▶ Chạy code"}
                        </button>
                        <button className="btn btn-ghost" style={{ color: 'var(--accent-green)', borderColor: 'rgba(16,185,129,0.4)' }}>📤 Nộp bài</button>
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
                    <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>📋 Đề bài</div>
                            <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
                                <span className="badge badge-yellow">Medium</span>
                                <span className="badge badge-cyan">Search</span>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Find Peak Element</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
                                Một phần tử đỉnh là phần tử lớn hơn các phần tử kề cạnh. Cho mảng <code style={{ background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: 3, fontFamily: 'monospace' }}>nums</code>,
                                tìm và trả về chỉ số của một phần tử đỉnh bất kỳ.
                            </div>

                            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Ví dụ:</div>
                            {[
                                { input: '[1, 2, 3, 1]', output: '2', note: 'nums[2]=3 là đỉnh' },
                                { input: '[1, 2, 1, 3, 5, 6, 4]', output: '5', note: 'nums[5]=6 là đỉnh' },
                            ].map((ex, i) => (
                                <div key={i} style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px', marginBottom: 8, border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Ví dụ {i + 1}</div>
                                    <div style={{ fontFamily: 'monospace', fontSize: 11 }}>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Input:</span> <span className="code-string">{ex.input}</span></div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Output:</span> <span className="code-number">{ex.output}</span></div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 2 }}>{ex.note}</div>
                                    </div>
                                </div>
                            ))}

                            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)', marginTop: 14 }}>Ràng buộc:</div>
                            {['1 ≤ nums.length ≤ 1000', 'O(log n) (Bonus)', 'nums[i] ≠ nums[i+1]'].map(c => (
                                <div key={c} style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '4px 0', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ color: 'var(--accent-purple)' }}>•</span> {c}
                                </div>
                            ))}

                            {/* Test cases */}
                            <div style={{ marginTop: 16, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Test Cases (5/10):</div>
                            {[
                                { n: 1, status: 'pass' }, { n: 2, status: 'pass' }, { n: 3, status: 'fail' },
                                { n: 4, status: 'pass' }, { n: 5, status: 'pass' },
                            ].map(tc => (
                                <div key={tc.n} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, fontSize: 11 }}>
                                    <span>{tc.status === 'pass' ? '✅' : '❌'}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>Test #{tc.n}</span>
                                    <span style={{ marginLeft: 'auto', color: tc.status === 'pass' ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600, fontSize: 10 }}>
                                        {tc.status.toUpperCase()}
                                    </span>
                                </div>
                            ))}
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
                                        <span>{f.filename + languageOptions.find(l => l.value === f.language)?.extension}</span>
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

                            <select onChange={(e) => setFiles(prev => prev.map(f => f.filename === activeFile ? { ...f, language: e.target.value } : f))} className="select" value={files.find(f => f.filename === activeFile)?.language || files[0].language}>
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
                                    language={files.find(f => f.filename === activeFile)?.language || files[0].language}
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
                    <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderColor: 'rgba(124,58,237,0.4)' }}>
                        {/* AI header */}
                        <div style={{
                            padding: '14px 16px', borderBottom: '1px solid rgba(124,58,237,0.2)',
                            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.08))',
                            display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: '50%',
                                background: 'var(--gradient-purple)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 16, boxShadow: 'var(--shadow-glow-purple)',
                            }}>🤖</div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 13 }}>AI Code Assistant</div>
                                <div style={{ fontSize: 10, color: 'var(--accent-purple-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 4px var(--accent-green)' }} />
                                    Đang phân tích code
                                </div>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                                <span className="badge badge-purple" style={{ fontSize: 9 }}>Gemini</span>
                            </div>
                        </div>

                        {/* AI quick actions */}
                        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {['🐛 Giải thích lỗi', '💡 Gợi ý fix', '📚 Hint'].map(a => (
                                <button key={a} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>{a}</button>
                            ))}
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {aiMessages.map((m, i) => (
                                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                                    {m.role === 'assistant' && (
                                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--gradient-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>🤖</div>
                                    )}
                                    <div style={{
                                        maxWidth: '85%',
                                        background: m.role === 'user' ? 'rgba(124,58,237,0.15)' : 'var(--bg-secondary)',
                                        border: `1px solid ${m.role === 'user' ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
                                        borderRadius: m.role === 'user' ? '12px 0 12px 12px' : '0 12px 12px 12px',
                                        padding: '10px 12px',
                                        fontSize: 12, lineHeight: 1.6,
                                    }}>
                                        {m.msg.split('\n').map((line, li) => {
                                            const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                            return <div key={li} dangerouslySetInnerHTML={{ __html: bold }} />;
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* AI typing */}
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--gradient-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🤖</div>
                                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '0 12px 12px 12px', padding: '10px 14px', display: 'flex', gap: 4, alignItems: 'center' }}>
                                    {[0, 0.2, 0.4].map((d, i) => (
                                        <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-purple)', animation: `blink 1.2s ${d}s infinite` }} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Input */}
                        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                            <input className="input" placeholder="Hỏi AI về code..." style={{ flex: 1, fontSize: 12 }} />
                            <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: 14 }}>➤</button>
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