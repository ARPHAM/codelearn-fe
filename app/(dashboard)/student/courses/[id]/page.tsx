'use client';

import { useParams, useRouter } from 'next/navigation';
import { useExamsByCourse, useStartExam } from '@/hooks/useExams';
import { useExercisesByCourse } from '@/hooks/useExercises';
import { 
    Clock, 
    Play, 
    CheckCircle, 
    AlertCircle, 
    Loader2, 
    Calendar,
    Award,
    ChevronLeft,
    ShieldAlert,
    FileText,
    Target,
    ArrowRight
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { Skeleton } from '@/app/components/ui/Skeleton';

export default function StudentCourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    const { data: exams, isLoading } = useExamsByCourse(courseId);
    const { data: exercisesData, isLoading: isExercisesLoading } = useExercisesByCourse(courseId);
    const startExamMutation = useStartExam();

    const handleStartExam = async (exam: any) => {
        // Kiểm tra thời gian
        const now = new Date().getTime();
        const start = new Date(exam.startTime).getTime();
        const end = new Date(exam.endTime).getTime();

        if (now < start) {
            toast({ type: 'warning', title: 'Chưa tới giờ', message: 'Kỳ thi chưa bắt đầu.' });
            return;
        }
        if (now > end) {
            toast({ type: 'error', title: 'Đã kết thúc', message: 'Kỳ thi đã kết thúc.' });
            return;
        }

        try {
            // No need to fetch problems here, the dedicated exam page will handle it
            router.push(`/student/exams/${exam.id}`);
        } catch (e: any) {
            toast({ type: 'error', title: 'Lỗi', message: e.response?.data?.message || 'Không thể bắt đầu thi.' });
        }
    };

    const getStatusInfo = (exam: any) => {
        const now = new Date().getTime();
        const start = new Date(exam.startTime).getTime();
        const end = new Date(exam.endTime).getTime();

        if (exam.status !== 'APPROVED') return { label: 'Chưa sẵn sàng', color: 'var(--text-muted)', icon: AlertCircle };
        if (now < start) return { label: 'Sắp diễn ra', color: 'var(--accent-cyan)', icon: Clock };
        if (now > end) return { label: 'Đã kết thúc', color: 'var(--text-muted)', icon: CheckCircle };
        return { label: 'Đang diễn ra', color: 'var(--accent-green)', icon: Play };
    };

    return (
        <div className="page-container animate-in">
            <div style={{ marginBottom: 24 }}>
                <button className="btn btn-ghost" onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
                    <ChevronLeft size={16} /> Quay lại danh sách lớp
                </button>
            </div>

            <div className="page-header">
                <div>
                    <h1 className="page-title">Chi tiết Lớp học</h1>
                    <p className="page-subtitle">Quản lý các kì thi và kết quả học tập của bạn</p>
                </div>
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldAlert size={20} color="var(--accent-purple)" /> Danh sách kì thi
            </h2>

            {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1, 2].map(i => <Skeleton key={i} height={100} borderRadius={16} />)}
                </div>
            ) : exams?.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', border: '1px dashed var(--border)', background: 'transparent' }}>
                    <p>Lớp học này hiện chưa có kì thi nào.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {exams?.map((exam: any) => {
                        const status = getStatusInfo(exam);
                        const isLive = status.label === 'Đang diễn ra';

                        return (
                            <div key={exam.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
                                {isLive && <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: 'var(--accent-green)' }} />}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{exam.title}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: status.color, fontSize: 12, fontWeight: 700 }}>
                                            <status.icon size={14} /> {status.label}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 20, color: 'var(--text-secondary)', fontSize: 13 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Calendar size={14} /> {new Date(exam.startTime).toLocaleString('vi-VN')}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Clock size={14} /> {exam.duration} phút
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 12 }}>
                                    {isLive && (
                                        <button 
                                            className="btn btn-primary" 
                                            style={{ background: 'var(--accent-green)', borderColor: 'var(--accent-green)' }}
                                            onClick={() => handleStartExam(exam)}
                                            disabled={startExamMutation.isPending}
                                        >
                                            {startExamMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Play size={14} fill="currentColor" /> Vào thi ngay</div>}
                                        </button>
                                    )}
                                    {new Date().getTime() > new Date(exam.endTime).getTime() && (
                                        <button 
                                            className="btn btn-ghost"
                                            onClick={() => router.push(`/student/exams/${exam.id}/result`)}
                                        >
                                            <Award size={16} /> Xem kết quả
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div style={{ marginTop: 48, marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileText size={20} color="var(--accent-cyan)" /> Bài tập & Thực hành
                </h2>
            </div>

            {isExercisesLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1, 2, 3].map(i => <Skeleton key={i} height={72} borderRadius={16} />)}
                </div>
            ) : !exercisesData?.exercises || exercisesData.exercises.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', border: '1px dashed var(--border)', background: 'transparent' }}>
                    <p>Hiện chưa có bài tập nào được giao.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {exercisesData.exercises.map((ex: any) => (
                        <div key={ex.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ 
                                    width: 40, height: 40, borderRadius: 12, 
                                    background: 'rgba(6, 182, 212, 0.1)', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                }}>
                                    <Target size={20} color="var(--accent-cyan)" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 15 }}>{ex.title}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                        Độ khó: <span style={{ color: ex.difficulty === 'EASY' ? 'var(--accent-green)' : ex.difficulty === 'MEDIUM' ? 'var(--accent-orange)' : 'var(--accent-red)' }}>{ex.difficulty}</span> • {ex.score} điểm
                                    </div>
                                </div>
                            </div>
                            <button 
                                className="btn btn-ghost" 
                                style={{ padding: 8 }}
                                onClick={() => router.push(`/student/problems/code-editor?slug=${ex.slug}`)}
                            >
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
