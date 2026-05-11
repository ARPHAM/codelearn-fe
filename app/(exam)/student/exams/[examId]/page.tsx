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
    Layout,
    Plus,
    Edit2,
    Star,
    Trash2,
    Play,
    Upload,
    Terminal,
    FileCode,
    Split
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import FillInTheBlankEditor from '@/src/components/FillInTheBlankEditor';
import { socket } from '@/features/realtime/socket';
import { useLanguages } from '@/hooks/useLanguages';
import ProblemUiStudent from '../../../../(dashboard)/student/components/problem-ui-student';

interface PageProps {
    params: Promise<{ examId: string }>;
}

export default function StudentExamPage({ params }: PageProps) {
    const { examId } = use(params);
    const router = useRouter();
    const queryClient = useCurrentUserInfo();

    // Data
    const { data: exam, isLoading: isLoadingExam } = useExamDetail(examId);
    const { mutateAsync: startExam, isPending: isStarting } = useStartExam();
    const { mutate: logViolation } = useLogViolation();
    const { mutateAsync: finishExam, isPending: isFinishing } = useFinishExam();
    const submitMutation = useSubmitCode();

    // State quản lý chi tiết từng bài tập
    const { data: languages = [] } = useLanguages();
    const [problems, setProblems] = useState<any[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // problemId -> State của bài đó
    const [problemStates, setProblemStates] = useState<Record<string, any>>({});

    const [submissions, setSubmissions] = useState<Record<string, any>>({});
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [cheatCount, setCheatCount] = useState(0);
    const [fibValues, setFibValues] = useState<Record<string, Record<string, string>>>({});
    const [runResult, setRunResult] = useState<any>(null);
    const [customInput, setCustomInput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialization
    useEffect(() => {
        if (exam && !isInitialized && languages.length > 0) {
            // Tập hợp ngôn ngữ cho phép của kì thi
            const allowedIds: number[] = exam.allowedLanguageIds || [];

            startExam(examId).then(data => {
                setProblems(data);
                const initialStates: Record<string, any> = {};

                data.forEach((p: any) => {
                    const problem = p.problem;
                    const version = problem.latestVersion;
                    const problemFiles = version?.problemFiles || [];

                    // Lọc file: Chỉ lấy TEMPLATE/NEUTRAL
                    const validFiles = problemFiles.filter((f: any) =>
                        f.type !== 'HIDDEN' && f.type !== 'SOLUTION'
                    ).map((f: any) => ({
                        filename: f.path,
                        content: f.content || '',
                        language: f.language?.name?.toLowerCase() || 'text',
                        languageId: f.languageId,
                        type: f.type,
                        isFillInTheBlank: !!f.isFillInTheBlank,
                    }));

                    // Xác định file chính — ưu tiên ngôn ngữ nằm trong allowedIds
                    const entryPath = version?.entryFile;
                    let mainFile = validFiles.find((f: any) => f.filename === entryPath);
                    if (!mainFile && allowedIds.length > 0) {
                        mainFile = validFiles.find((f: any) => allowedIds.includes(f.languageId));
                    }
                    mainFile = mainFile || validFiles[0];

                    // Nếu vẫn chưa khớp, fallback về ngôn ngữ đầu tiên trong allowedIds
                    let selLangId = mainFile?.languageId;
                    let selLang = mainFile?.language || 'text';
                    if (allowedIds.length > 0 && !allowedIds.includes(selLangId)) {
                        const fallbackLang = languages.find(l => allowedIds.includes(l.id));
                        if (fallbackLang) {
                            selLangId = fallbackLang.id;
                            selLang = fallbackLang.name.toLowerCase();
                        }
                    }

                    initialStates[problem.id] = {
                        files: validFiles,
                        activeFileName: mainFile?.filename || '',
                        mainFileName: mainFile?.filename || '',
                        language: selLang,
                        selectedLanguageId: selLangId,
                        canCreateFile: version?.workspaceConfig?.canCreateFile ?? true,
                        canChangeMainFile: version?.workspaceConfig?.canChangeMainFile ?? true,
                    };
                });

                setProblemStates(initialStates);
                setIsInitialized(true);
            });

            // Timer logic
            const endTime = new Date(exam.endTime).getTime();
            const now = new Date().getTime();
            const initialTime = Math.floor((endTime - now) / 1000);
            setTimeLeft(initialTime > 0 ? initialTime : 0);
        }
    }, [exam, examId, startExam, languages, isInitialized]);

    // Timer Interval
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const cheatCountRef = useRef(0);

    const getMonacoLanguage = (ext: string): string => {
        const mapping: Record<string, string> = {
            '.py': 'python', '.cpp': 'cpp', '.cxx': 'cpp', '.java': 'java',
            '.js': 'javascript', '.ts': 'typescript', '.cs': 'csharp',
            '.go': 'go', '.rs': 'rust', '.php': 'php', '.rb': 'ruby',
            '.sql': 'sql', '.css': 'css', '.html': 'html',
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

    const reconstructFIB = (content: string, values: Record<string, string>) => {
        const parts = content.split(/(\{\{.*?\}\})/g);
        return parts.map((part, i) => {
            if (part.startsWith('{{') && part.endsWith('}}')) {
                return values[i] || '';
            }
            return part;
        }).join('');
    };

    // File Handlers
    const handleAddFile = (problemId: string) => {
        const state = problemStates[problemId];
        const name = prompt('Nhập tên file mới (ví dụ: utils.java):');
        if (!name) return;

        let finalName = name;
        if (!finalName.includes('.')) {
            const langObj = languages.find(l => l.name.toLowerCase() === state.language.toLowerCase());
            if (langObj) finalName += langObj.ext;
            else finalName += '.txt';
        }

        const uniqueName = getUniqueFilename(finalName, state.files);
        const langObjFound = languages.find(l => l.ext === getExt(uniqueName));

        const newFiles = [...state.files, {
            filename: uniqueName,
            language: langObjFound?.name.toLowerCase() || 'text',
            content: "",
            languageId: langObjFound?.id
        }];

        setProblemStates(prev => ({
            ...prev,
            [problemId]: { ...state, files: newFiles, activeFileName: uniqueName }
        }));
    };

    const handleRenameFile = (problemId: string, oldName: string) => {
        const state = problemStates[problemId];
        const newName = prompt(`Nhập tên mới cho file ${oldName}:`, oldName);
        if (!newName || newName === oldName) return;

        if (state.files.find((f: any) => f.filename === newName)) {
            toast({ type: 'error', title: 'Lỗi', message: 'Tên file đã tồn tại.' });
            return;
        }

        const newFiles = state.files.map((f: any) => f.filename === oldName ? { ...f, filename: newName } : f);
        const updates: any = { files: newFiles };
        if (state.activeFileName === oldName) updates.activeFileName = newName;
        if (state.mainFileName === oldName) updates.mainFileName = newName;

        setProblemStates(prev => ({
            ...prev,
            [problemId]: { ...state, ...updates }
        }));
    };

    const handleDeleteFile = (problemId: string, name: string) => {
        const state = problemStates[problemId];
        if (state.files.length <= 1) return;
        if (name === state.mainFileName) {
            toast({ type: 'warning', title: 'Cảnh báo', message: 'Không thể xóa file chính.' });
            return;
        }
        const newFiles = state.files.filter((f: any) => f.filename !== name);
        const updates: any = { files: newFiles };
        if (state.activeFileName === name) updates.activeFileName = state.mainFileName;

        setProblemStates(prev => ({
            ...prev,
            [problemId]: { ...state, ...updates }
        }));
    };

    const handleSetMain = (problemId: string, name: string) => {
        const state = problemStates[problemId];
        const ext = getExt(name);
        const lang = languages.find(l => l.ext === ext);

        const updates: any = { mainFileName: name };
        if (lang) {
            updates.language = lang.name.toLowerCase();
            updates.selectedLanguageId = lang.id;
        }

        setProblemStates(prev => ({
            ...prev,
            [problemId]: { ...state, ...updates }
        }));
        toast({ type: 'info', title: 'Đã cập nhật', message: `Đã đặt ${name} làm file chính.` });
    };

    const handleLanguageChange = (problemId: string, newLang: string) => {
        const state = problemStates[problemId];
        const langObj = languages.find(l => l.name.toLowerCase() === newLang.toLowerCase());
        if (!langObj) return;

        const updates: any = { language: newLang, selectedLanguageId: langObj.id };

        if (state.mainFileName) {
            const ext = getExt(state.mainFileName);
            if (ext !== langObj.ext) {
                const parts = state.mainFileName.split('.');
                const base = parts.length > 1 ? parts.slice(0, -1).join('.') : state.mainFileName;
                const newMainName = getUniqueFilename(base + langObj.ext, state.files.filter((f: any) => f.filename !== state.mainFileName));

                if (confirm(`Bạn muốn đổi ngôn ngữ sang ${newLang}? File chính sẽ được đổi tên thành ${newMainName}`)) {
                    updates.mainFileName = newMainName;
                    updates.files = state.files.map((f: any) => {
                        if (f.filename === state.mainFileName) {
                            return { ...f, filename: newMainName, language: newLang.toLowerCase(), languageId: langObj.id };
                        }
                        return f;
                    });
                    if (state.activeFileName === state.mainFileName) updates.activeFileName = newMainName;
                } else {
                    return;
                }
            }
        }

        setProblemStates(prev => ({
            ...prev,
            [problemId]: { ...state, ...updates }
        }));
    };

    // Anti-cheat logic
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setCheatCount(prev => {
                    const next = prev + 1;
                    cheatCountRef.current = next;
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

    useEffect(() => {
        if (cheatCount > 0) {
            toast({
                type: 'error',
                title: 'Cảnh báo vi phạm',
                message: `Bạn vừa rời khỏi trang thi (Lần ${cheatCount}). Hành vi này đã được ghi lại!`
            });

            logViolation({
                id: examId,
                metadata: {
                    type: 'VISIBILITY_HIDDEN',
                    timestamp: new Date().toISOString(),
                    count: cheatCount
                }
            });
        }
    }, [cheatCount, examId, logViolation]);

    // Full screen toggle
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

    const handleRun = async () => {
        const currentProblem = problems[currentIdx]?.problem;
        if (!currentProblem) return;
        const state = problemStates[currentProblem.id];
        if (!state) return;

        setIsRunning(true);
        setRunResult(null);

        const answers: Record<string, string[]> = {};
        state.files.forEach((f: any) => {
            const fileAnswers = extractAnswers(f.content);
            if (fileAnswers.length > 0) answers[f.filename] = fileAnswers;
        });

        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/problem/run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    languageId: state.selectedLanguageId || 1,
                    language: state.language,
                    entryFile: state.mainFileName,
                    files: state.files.map((f: any) => ({ filename: f.filename, content: f.content, language: f.language })),
                    answers,
                    input: customInput,
                    problemVersionId: currentProblem.latestVersion?.id,
                    examId
                })
            }).then(r => r.json());

            if (resp.id) {
                const checkResult = async () => {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submission/run-result/${resp.id}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    }).then(r => r.json());

                    if (res.status === 'QUEUED' || res.status === 'PROCESSING') {
                        setTimeout(checkResult, 1000);
                    } else {
                        setRunResult(res);
                        setIsRunning(false);
                    }
                };
                checkResult();
            } else {
                setIsRunning(false);
                toast({ type: 'error', title: 'Lỗi', message: resp.message || 'Không thể thực thi mã nguồn.' });
            }
        } catch (err) {
            setIsRunning(false);
            toast({ type: 'error', title: 'Lỗi', message: 'Không thể kết nối máy chủ biên dịch.' });
        }
    };

    const handleSubmitAll = async () => {
        if (!confirm('Bạn có chắc chắn muốn nộp toàn bộ bài làm và kết thúc kỳ thi không?')) return;

        try {
            toast({ type: 'info', title: 'Đang xử lý', message: 'Đang nộp toàn bộ bài làm của bạn...' });

            for (const p of problems) {
                const prob = p.problem;
                const state = problemStates[prob.id];
                if (!state) continue;

                // Chuẩn bị file để nộp — FIB content đã được cập nhật trực tiếp vào state
                const filesToSubmit = state.files.map((f: any) => ({
                    filePath: f.filename,
                    content: f.content
                }));

                await submitMutation.mutateAsync({
                    problemVersionId: prob.latestVersion?.id || prob.id,
                    languageId: state.selectedLanguageId || 1,
                    entryFile: state.mainFileName,
                    files: filesToSubmit,
                    examId: examId
                });
            }

            const resp = await finishExam(examId);
            if (resp.success) {
                toast({ type: 'success', title: 'Thành công', message: 'Bạn đã hoàn thành kỳ thi.' });
                router.push(`/student/exams/${examId}/result`);
            }
        } catch (err) {
            toast({ type: 'error', title: 'Lỗi', message: 'Không thể nộp bài. Vui lòng thử lại.' });
        }
    };

    const currentProblem = problems[currentIdx]?.problem;
    const currentState = currentProblem ? problemStates[currentProblem.id] : null;

    if (isLoadingExam || isStarting || !isInitialized) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0b0f1a', color: '#fff' }}>
                <Loader2 className="animate-spin" size={48} color="var(--accent-cyan)" />
                <p style={{ marginTop: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>Đang chuẩn bị đề thi...</p>
            </div>
        );
    }

    if (!exam || problems.length === 0) return <div style={{ padding: 40, color: '#fff' }}>Không tìm thấy thông tin kỳ thi hoặc bài tập.</div>;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0b0f1a', color: '#fff', overflow: 'hidden' }}>
            <header style={{
                height: 64, background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backdropFilter: 'blur(10px)', zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--gradient-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldAlert size={24} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{exam.title}</h1>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Mã kỳ thi: {exam.id}</p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(239, 68, 68, 0.1)', padding: '6px 16px', borderRadius: 10, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <Clock size={18} color="var(--accent-red)" className="animate-pulse" />
                        <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-red)', fontFamily: 'monospace' }}>
                            {timeLeft !== null ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}` : '--:--'}
                        </span>
                    </div>

                    <button
                        className="btn"
                        style={{ background: 'var(--gradient-purple)', color: '#fff', fontWeight: 700, padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
                        onClick={handleSubmitAll}
                        disabled={isFinishing}
                    >
                        {isFinishing ? <Loader2 className="animate-spin" size={18} /> : 'NỘP BÀI & KẾT THÚC'}
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <aside style={{
                    width: 240, borderRight: '1px solid rgba(255,255,255,0.05)', background: 'rgba(13, 17, 23, 0.3)',
                    display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <h2 style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Danh sách câu hỏi</h2>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
                        {problems.map((p, idx) => (
                            <div
                                key={p.id}
                                onClick={() => setCurrentIdx(idx)}
                                style={{
                                    padding: '12px 14px', borderRadius: 12, cursor: 'pointer', marginBottom: 4, transition: 'all 0.2s',
                                    background: currentIdx === idx ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
                                    border: `1px solid ${currentIdx === idx ? 'rgba(34, 211, 238, 0.2)' : 'transparent'}`,
                                    display: 'flex', alignItems: 'center', gap: 12
                                }}
                            >
                                <div style={{
                                    width: 28, height: 28, borderRadius: 8, fontSize: 12, fontWeight: 800,
                                    background: submissions[p.problem.id] ? 'var(--accent-green)' : 'rgba(255,255,255,0.05)',
                                    color: submissions[p.problem.id] ? '#fff' : 'var(--text-muted)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {submissions[p.problem.id] ? <CheckCircle2 size={16} /> : idx + 1}
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: currentIdx === idx ? '#fff' : 'var(--text-secondary)' }}>Câu {idx + 1}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.score} điểm</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                <section style={{
                    width: 400, borderRight: '1px solid rgba(255,255,255,0.05)', background: '#0d1117',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden'
                }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileCode size={16} color="var(--accent-cyan)" />
                        <span style={{ fontSize: 13, fontWeight: 700 }}>Nội dung đề bài</span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {currentProblem && (
                            <ProblemUiStudent
                                title={currentProblem.title}
                                description={currentProblem.latestVersion?.description}
                                testcases={currentProblem.latestVersion?.testcases}
                                difficulty={currentProblem.difficulty}
                                timeLimit={currentProblem.timeLimit}
                                memoryLimit={currentProblem.memoryLimit}
                            />
                        )}
                    </div>
                </section>

                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0b0f1a', overflow: 'hidden' }}>
                    <div style={{
                        height: 44, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15, 23, 42, 0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', height: '100%', overflowX: 'auto', flex: 1 }} className="hide-scrollbar">
                            {currentState?.files.map((file: any) => {
                                const isActive = currentState.activeFileName === file.filename;
                                const isMain = currentState.mainFileName === file.filename;
                                return (
                                    <div
                                        key={file.filename}
                                        onClick={() => setProblemStates(prev => ({
                                            ...prev,
                                            [currentProblem.id]: { ...currentState, activeFileName: file.filename }
                                        }))}
                                        style={{
                                            height: '100%', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                                            fontSize: 12, fontWeight: 600,
                                            borderTop: 'none',
                                            borderLeft: 'none',
                                            borderBottom: isActive ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                                            borderRight: '1px solid rgba(255,255,255,0.05)',
                                            background: isActive ? 'rgba(34, 211, 238, 0.05)' : 'transparent',
                                            color: isActive ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s',
                                        }}
                                    >
                                        {isMain && <Star size={11} fill="var(--accent-yellow)" color="var(--accent-yellow)" />}
                                        {file.filename}
                                        {isActive && (
                                            <div style={{ display: 'flex', gap: 4, marginLeft: 4 }}>
                                                {!isMain && currentState?.canChangeMainFile && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleSetMain(currentProblem.id, file.filename); }} style={{ padding: 4, color: 'var(--text-muted)' }} title="Đặt làm file chính"><Star size={12} /></button>
                                                )}
                                                {!isMain && currentState?.canCreateFile && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteFile(currentProblem.id, file.filename); }} style={{ padding: 4, color: 'var(--accent-red)' }} title="Xóa file"><Trash2 size={12} /></button>
                                                )}
                                                {currentState?.canCreateFile && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleRenameFile(currentProblem.id, file.filename); }} style={{ padding: 4, color: 'var(--text-muted)' }} title="Đổi tên"><Edit2 size={12} /></button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {currentState?.canCreateFile && (
                                <button
                                    onClick={() => handleAddFile(currentProblem.id)}
                                    style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
                                >
                                    <Plus size={18} />
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 12 }}>
                            <select
                                value={currentState?.language || ''}
                                onChange={(e) => handleLanguageChange(currentProblem.id, e.target.value)}
                                style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 11, padding: '4px 8px', borderRadius: 6, fontWeight: 700 }}
                            >
                                {languages
                                    .filter(l => !exam.allowedLanguageIds?.length || exam.allowedLanguageIds.includes(l.id))
                                    .map(l => <option key={l.id} value={l.name.toLowerCase()}>{l.name}</option>)}
                            </select>
                            <button
                                className="btn"
                                style={{ height: 32, fontSize: 12, padding: '0 12px', background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(34, 211, 238, 0.2)' }}
                                onClick={handleRun}
                                disabled={isRunning}
                            >
                                {isRunning ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} fill="currentColor" />}
                                <span style={{ marginLeft: 6 }}>Chạy thử</span>
                            </button>
                        </div>
                    </div>

                    <div style={{ flex: 1, position: 'relative' }}>
                        {currentState && (
                            (() => {
                                const activeFile = currentState.files.find((f: any) => f.filename === currentState.activeFileName);
                                const isFIB = activeFile?.isFillInTheBlank === true;
                                if (isFIB) {
                                    return (
                                        <FillInTheBlankEditor
                                            file={{
                                                id: activeFile.filename,
                                                path: activeFile.filename,
                                                content: activeFile.content,
                                                type: 'TEMPLATE',
                                                isFillInTheBlank: true,
                                                languageId: activeFile.languageId,
                                            }}
                                            updateFile={(fileId: string, field: string, val: any) => {
                                                if (field === 'content') {
                                                    const newFiles = currentState.files.map((f: any) =>
                                                        f.filename === fileId ? { ...f, content: val } : f
                                                    );
                                                    setProblemStates(prev => ({
                                                        ...prev,
                                                        [currentProblem.id]: { ...currentState, files: newFiles }
                                                    }));
                                                }
                                            }}
                                            languages={languages}
                                            isStudent={true}
                                            height="100%"
                                        />
                                    );
                                }
                                return (
                                    <Editor
                                        height="100%"
                                        theme="vs-dark"
                                        language={getMonacoLanguage(getExt(currentState.activeFileName))}
                                        value={activeFile?.content || ''}
                                        onChange={(val) => {
                                            const newFiles = currentState.files.map((f: any) =>
                                                f.filename === currentState.activeFileName ? { ...f, content: val } : f
                                            );
                                            setProblemStates(prev => ({
                                                ...prev,
                                                [currentProblem.id]: { ...currentState, files: newFiles }
                                            }));
                                        }}
                                        options={{
                                            fontSize: 14,
                                            minimap: { enabled: false },
                                            scrollBeyondLastLine: false,
                                            automaticLayout: true,
                                            padding: { top: 16 }
                                        }}
                                    />
                                );
                            })()
                        )}
                    </div>

                    <div style={{ height: 200, borderTop: '1px solid rgba(255,255,255,0.05)', background: '#0d1117', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: 36, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 24 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-cyan)', borderBottom: '2px solid var(--accent-cyan)', height: '100%', display: 'flex', alignItems: 'center' }}>
                                <Terminal size={14} style={{ marginRight: 6 }} /> CONSOLE
                            </div>
                        </div>
                        <div style={{ flex: 1, padding: 16, overflowY: 'auto', fontSize: 13, fontFamily: 'monospace' }}>
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Custom Input:</div>
                                <textarea
                                    style={{ width: '100%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, color: '#fff', padding: 8, fontSize: 12, resize: 'none' }}
                                    rows={2}
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    placeholder="Nhập input để chạy thử bài làm..."
                                />
                            </div>
                            {runResult && (
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ color: runResult.success ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>
                                            {runResult.success ? '✓ Chạy thành công' : '✗ Lỗi thực thi'}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{runResult.time}ms · {runResult.memory}KB</span>
                                    </div>
                                    <pre style={{ margin: 0, color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{runResult.output || runResult.error || 'No output'}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
