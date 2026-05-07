'use client'

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useExamDetail, useStartExam, useLogViolation, useFinishExam } from '@/src/hooks/useExams';
import { useSubmitCode, getSubmissionResult } from '@/features/problems/mutations';
import { useCurrentUserInfo } from '@/app/components/_api/queries';
import Editor from '@monaco-editor/react';
import { 
    Clock, 
    ChevronLeft, 
    ChevronRight, 
    Send, 
    AlertCircle, 
    CheckCircle2, 
    Loader2, 
    Maximize2, 
    Minimize2,
    ShieldAlert,
    Save,
    Layout
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { socket } from '@/features/realtime/socket';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PageProps {
    params: Promise<{ examId: string }>;
}

export default function StudentExamPage({ params }: PageProps) {
    const { examId } = use(params);
    const router = useRouter();
    const queryClient = useCurrentUserInfo(); // Not exactly what I need but anyway

    // Data
    const { data: exam, isLoading: isLoadingExam } = useExamDetail(examId);
    const { mutateAsync: startExam, isPending: isStarting } = useStartExam();
    const { mutate: logViolation } = useLogViolation();
    const { mutateAsync: finishExam, isPending: isFinishing } = useFinishExam();
    const submitMutation = useSubmitCode();

    // State
    const [problems, setProblems] = useState<any[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [codes, setCodes] = useState<Record<string, string>>({}); // problemId -> code
    const [submissions, setSubmissions] = useState<Record<string, any>>({}); // problemId -> submission status
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [cheatCount, setCheatCount] = useState(0);

    // Initialization
    useEffect(() => {
        if (exam) {
            startExam(examId).then(data => {
                setProblems(data);
                // Initialize codes from problems
                const initialCodes: Record<string, string> = {};
                data.forEach((p: any) => {
                    initialCodes[p.problem.id] = p.problem.template || '';
                });
                setCodes(initialCodes);
            });

            // Timer logic
            const endTime = new Date(exam.endTime).getTime();
            const now = new Date().getTime();
            const initialTime = Math.floor((endTime - now) / 1000);
            setTimeLeft(initialTime > 0 ? initialTime : 0);
        }
    }, [exam, examId, startExam]);

    // Timer Interval
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Anti-cheat logic
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setCheatCount(prev => {
                    const next = prev + 1;
                    toast({ 
                        type: 'error', 
                        title: 'Cảnh báo vi phạm', 
                        message: `Bạn vừa rời khỏi trang thi (Lần ${next}). Hành vi này đã được ghi lại!` 
                    });
                    
                    logViolation({ 
                        id: examId, 
                        metadata: { 
                            type: 'VISIBILITY_HIDDEN', 
                            timestamp: new Date().toISOString(),
                            count: next
                        } 
                    });
                    
                    return next;
                });
            }
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullScreen(false);
                logViolation({
                    id: examId,
                    metadata: {
                        type: 'FULLSCREEN_EXIT',
                        timestamp: new Date().toISOString()
                    }
                });
            } else {
                setIsFullScreen(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [examId, logViolation]);

    // Handle full screen toggle via state
    useEffect(() => {
        if (isFullScreen) {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => setIsFullScreen(false));
            }
        } else {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        }
    }, [isFullScreen]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    if (isLoadingExam || isStarting) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117' }}>
            <div style={{ textAlign: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="var(--accent-purple)" />
                <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Đang chuẩn bị đề thi cho bạn...</p>
            </div>
        </div>
    );

    if (!exam || problems.length === 0) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117' }}>
            <div style={{ textAlign: 'center', maxWidth: 400 }}>
                <AlertCircle size={48} color="var(--accent-red)" style={{ margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>Không thể tải đề thi</h2>
                <p style={{ marginTop: 8, color: 'var(--text-muted)' }}>Vui lòng kiểm tra lại thời gian bắt đầu hoặc liên hệ giảng viên.</p>
                <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => router.back()}>Quay lại</button>
            </div>
        </div>
    );

    const currentProblem = problems[currentIdx]?.problem;
    const currentCode = codes[currentProblem?.id] || '';

    const handleCodeChange = (val: string | undefined) => {
        if (!currentProblem) return;
        setCodes(prev => ({ ...prev, [currentProblem.id]: val || '' }));
    };

    const handleSubmit = async () => {
        if (!currentProblem) return;
        
        try {
            const resp = await submitMutation.mutateAsync({
                problemVersionId: currentProblem.latestVersionId || currentProblem.id,
                languageId: 1, // Default to Java or detect
                entryFile: 'Main.java',
                files: [{ filePath: 'Main.java', content: currentCode }],
                examId: examId
            });

            const submissionId = resp.submissionId;
            setSubmissions(prev => ({ ...prev, [currentProblem.id]: { status: 'PENDING', id: submissionId } }));
            
            // Listen for result via socket
            socket.once(`submission-${submissionId}`, (result) => {
                setSubmissions(prev => ({ ...prev, [currentProblem.id]: result }));
                if (result.status === 'ACCEPTED') {
                    toast({ type: 'success', title: 'Thành công', message: `Câu ${currentIdx + 1} đã được chấp nhận!` });
                } else {
                    toast({ type: 'warning', title: 'Kết quả', message: `Câu ${currentIdx + 1}: ${result.status}` });
                }
            });
        } catch (err) {
            toast({ type: 'error', title: 'Lỗi', message: 'Không thể nộp bài. Vui lòng thử lại.' });
        }
    };

    return (
        <div style={{ 
            height: '100vh', 
            background: '#0d1117', 
            color: 'white', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'fixed',
            inset: 0,
            zIndex: 1000
        }}>
            {/* Exam Header */}
            <header style={{ 
                height: 64, 
                background: 'rgba(22, 27, 34, 0.8)', 
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <ShieldAlert size={20} color={cheatCount > 0 ? '#ef4444' : '#64748b'} />
                    <div>
                        <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{exam.title}</h1>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mã kỳ thi: {examId}</span>
                    </div>
                </div>

                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12,
                    background: timeLeft && timeLeft < 300 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.03)',
                    padding: '8px 20px',
                    borderRadius: 10,
                    border: `1px solid ${timeLeft && timeLeft < 300 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                    color: timeLeft && timeLeft < 300 ? '#ef4444' : '#a78bfa'
                }}>
                    <Clock size={18} />
                    <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                        {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-ghost" onClick={() => setIsFullScreen(!isFullScreen)}>
                        {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    <button 
                        className="btn btn-primary" 
                        style={{ background: 'var(--gradient-purple)', fontWeight: 700 }}
                        disabled={isFinishing}
                        onClick={async () => {
                            if (confirm('Bạn có chắc chắn muốn nộp bài và kết thúc kỳ thi?')) {
                                try {
                                    await finishExam(examId);
                                    router.push(`/student/exams/${examId}/result`);
                                } catch (err) {
                                    toast({ type: 'error', title: 'Lỗi', message: 'Không thể kết thúc kỳ thi. Vui lòng thử lại.' });
                                }
                            }
                        }}
                    >
                        {isFinishing ? <Loader2 className="animate-spin" size={18} /> : 'Kết thúc & Nộp bài'}
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left Sidebar: Questions */}
                <aside style={{ 
                    width: 280, 
                    borderRight: '1px solid rgba(255,255,255,0.05)', 
                    background: 'rgba(13, 17, 23, 0.5)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <h2 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Danh sách câu hỏi</h2>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                        {problems.map((p, idx) => (
                            <div 
                                key={p.id}
                                onClick={() => setCurrentIdx(idx)}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: 12,
                                    cursor: 'pointer',
                                    background: currentIdx === idx ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                    border: `1px solid ${currentIdx === idx ? 'rgba(139, 92, 246, 0.2)' : 'transparent'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    marginBottom: 4,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: submissions[p.problem.id]?.status === 'ACCEPTED' ? 'var(--accent-green)' : 'rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 12, fontWeight: 800, color: submissions[p.problem.id]?.status === 'ACCEPTED' ? 'white' : 'var(--text-muted)'
                                }}>
                                    {submissions[p.problem.id]?.status === 'ACCEPTED' ? <CheckCircle2 size={16} /> : idx + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: currentIdx === idx ? 'white' : 'var(--text-secondary)' }}>Câu {idx + 1}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {submissions[p.problem.id]?.status === 'PENDING' ? (
                                            <><Loader2 className="animate-spin" size={12} color="var(--accent-purple)" /> Đang chấm...</>
                                        ) : submissions[p.problem.id]?.status || 'Chưa làm'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main Content: Question Description & Editor */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, minHeight: 0 }}>
                        {/* Description */}
                        <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto', padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <span className="badge badge-purple" style={{ fontSize: 10 }}>CÂU {currentIdx + 1}</span>
                                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{currentProblem.title}</h2>
                            </div>
                            
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 15 }}>
                                <div dangerouslySetInnerHTML={{ __html: currentProblem.description }} />
                            </div>
                        </div>

                        {/* Editor */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ 
                                padding: '12px 20px', 
                                background: 'rgba(255,255,255,0.02)', 
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <Layout size={16} color="var(--accent-purple)" />
                                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>SOLUTION.JAVA</span>
                                </div>
                                <button 
                                    className="btn btn-primary" 
                                    style={{ height: 32, padding: '0 16px', fontSize: 13, background: 'var(--gradient-cyan)', color: 'black' }}
                                    onClick={handleSubmit}
                                    disabled={submitMutation.isPending || submissions[currentProblem.id]?.status === 'PENDING'}
                                >
                                    {submitMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                                    <span style={{ marginLeft: 8 }}>Nộp bài</span>
                                </button>
                            </div>
                            <div style={{ flex: 1 }}>
                                <Editor 
                                    height="100%"
                                    defaultLanguage="java"
                                    theme="vs-dark"
                                    value={currentCode}
                                    onChange={handleCodeChange}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        fontFamily: 'JetBrains Mono',
                                        padding: { top: 20 },
                                        scrollBeyondLastLine: false,
                                        lineNumbers: 'on',
                                        renderLineHighlight: 'all',
                                        scrollbar: {
                                            vertical: 'visible',
                                            horizontal: 'hidden'
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Results / Console */}
                    <div style={{ 
                        height: 200, 
                        borderTop: '1px solid rgba(255,255,255,0.05)', 
                        background: 'rgba(13, 17, 23, 0.8)',
                        padding: '16px 24px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <Clock size={16} color="var(--text-muted)" />
                            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Kết quả chấm bài</h3>
                        </div>
                        
                        {submissions[currentProblem.id] ? (
                            <div style={{ 
                                padding: 20, 
                                background: 'rgba(255,255,255,0.03)', 
                                borderRadius: 12,
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    {submissions[currentProblem.id].status === 'ACCEPTED' ? (
                                        <CheckCircle2 color="var(--accent-green)" size={24} />
                                    ) : submissions[currentProblem.id].status === 'PENDING' ? (
                                        <Loader2 className="animate-spin" color="var(--accent-purple)" size={24} />
                                    ) : (
                                        <AlertCircle color="var(--accent-red)" size={24} />
                                    )}
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 16 }}>{submissions[currentProblem.id].status}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            {submissions[currentProblem.id].score !== undefined ? `Điểm: ${submissions[currentProblem.id].score}` : 'Đang chấm...'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 40 }}>
                                Bạn chưa nộp bài cho câu hỏi này.
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <style jsx global>{`
                body { overflow: hidden !important; }
                .badge {
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                }
                .badge-purple { background: rgba(139, 92, 246, 0.2); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); }
            `}</style>
        </div>
    );
}
