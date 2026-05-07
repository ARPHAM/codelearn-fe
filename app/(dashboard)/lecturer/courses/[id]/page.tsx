'use client';

import { useParams, useRouter } from 'next/navigation';
import { useExamsByCourse, useRegradeExam } from '@/hooks/useExams';
import { useExercisesByCourse } from '@/hooks/useExercises';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { examApi } from '@/api/exam.api';
import { exerciseApi } from '@/api/exercise.api';
import { 
    Clock, 
    Play, 
    CheckCircle, 
    AlertCircle, 
    Loader2, 
    Calendar,
    Settings,
    ChevronLeft,
    Plus,
    RefreshCw,
    Users,
    FileText,
    ShieldCheck,
    Search,
    Trophy,
    ArrowRight,
    Target,
    Activity
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

export default function LecturerCourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const courseId = params.id as string;

    const { data: exams, isLoading: isExamsLoading } = useExamsByCourse(courseId);
    const { data: exercisesData, isLoading: isExercisesLoading } = useExercisesByCourse(courseId);
    const regradeMutation = useRegradeExam();

    const exercises = exercisesData?.exercises || [];

    const handleRegrade = (id: string) => {
        if (confirm('Bắt đầu quá trình chấm lại toàn bộ bài thi? (Hệ thống sẽ giữ điểm cao nhất)')) {
            regradeMutation.mutate(id);
            toast({ type: 'info', title: 'Đang xử lý', message: 'Hệ thống đang thực hiện chấm lại trong nền.' });
        }
    };

    return (
        <div className="page-container animate-in">
            <style jsx>{`
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .item-card {
                    background: rgba(30, 35, 48, 0.4);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    padding: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.2s;
                }
                .item-card:hover {
                    border-color: var(--accent-cyan);
                    background: rgba(30, 35, 48, 0.6);
                }
            `}</style>

            <div style={{ marginBottom: 32 }}>
                <button className="btn btn-ghost" onClick={() => router.push('/lecturer/courses')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', marginLeft: -12, borderRadius: 12 }}>
                    <ChevronLeft size={18} /> Quay lại danh sách lớp
                </button>
            </div>

            <div className="page-header" style={{ marginBottom: 48 }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 32 }}>Quản lý Nội dung Lớp học</h1>
                    <p className="page-subtitle">Thiết kế bài tập, tổ chức kì thi và theo dõi kết quả của sinh viên</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button 
                        className="btn btn-ghost" 
                        onClick={() => router.push(`/lecturer/courses/${courseId}/plagiarism`)}
                        style={{ border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}
                    >
                        <ShieldCheck size={18} style={{ marginRight: 8 }} /> Kiểm tra Đạo văn
                    </button>
                    <button className="btn btn-primary" style={{ background: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)', color: '#000', fontWeight: 700 }}>
                        <Plus size={18} style={{ marginRight: 8 }} /> Tạo nội dung mới
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                {/* Section: Exams */}
                <div>
                    <div className="section-header">
                        <h2 style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Trophy size={24} color="var(--accent-purple)" /> Kì thi
                        </h2>
                        <button className="btn btn-ghost" style={{ fontSize: 13, color: 'var(--accent-purple-light)' }} onClick={() => router.push(`/lecturer/exams/new?courseId=${courseId}`)}>
                            <Plus size={16} /> Thêm kì thi
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {isExamsLoading ? (
                            <div style={{ textAlign: 'center', padding: 40 }}><Loader2 className="animate-spin" color="var(--accent-purple)" /></div>
                        ) : exams?.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
                                Chưa có kì thi nào được tạo.
                            </div>
                        ) : exams?.map((exam: any) => (
                            <div key={exam.id} className="item-card">
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                        <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{exam.title}</h3>
                                        <span className={`badge ${
                                            exam.status?.toUpperCase() === 'APPROVED' ? 'badge-green' : 
                                            exam.status?.toUpperCase() === 'PENDING' ? 'badge-orange' : 
                                            'badge-gray'
                                        }`} style={{ fontSize: 9 }}>
                                            {exam.status?.toUpperCase() === 'APPROVED' ? 'ĐÃ DUYỆT' : 
                                             exam.status?.toUpperCase() === 'PENDING' ? 'CHỜ DUYỆT' : 
                                             'BẢN NHÁP'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {new Date(exam.startTime).toLocaleDateString('vi-VN')}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {exam.duration}p</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {exam.status?.toUpperCase() === 'DRAFT' && (
                                        <button 
                                            className="btn btn-ghost" 
                                            style={{ padding: '8px 12px', color: 'var(--accent-purple-light)', background: 'rgba(139, 92, 246, 0.1)', fontSize: 12 }} 
                                            onClick={async () => {
                                                try {
                                                    await examApi.submitForApproval(exam.id);
                                                    toast({ type: 'success', title: 'Thành công', message: 'Đã gửi đề thi cho Admin duyệt.' });
                                                    queryClient.invalidateQueries({ queryKey: ['exams', courseId] });
                                                } catch (e) {
                                                    toast({ type: 'error', title: 'Lỗi', message: 'Không thể gửi duyệt.' });
                                                }
                                            }}
                                        >
                                            <RefreshCw size={14} style={{ marginRight: 6 }} /> Gửi duyệt
                                        </button>
                                    )}
                                    <button 
                                        className="btn btn-ghost" 
                                        style={{ padding: 8, color: 'var(--accent-cyan)' }} 
                                        onClick={() => router.push(`/admin/exams/${exam.id}/monitoring`)}
                                        title="Giám sát thi"
                                    >
                                        <Activity size={16} />
                                    </button>
                                    <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => router.push(`/lecturer/exams/${exam.id}/edit`)}><Settings size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Exercises */}
                <div>
                    <div className="section-header">
                        <h2 style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <FileText size={24} color="var(--accent-cyan)" /> Bài tập
                        </h2>
                        <button className="btn btn-ghost" style={{ fontSize: 13, color: 'var(--accent-cyan)' }} onClick={() => router.push(`/lecturer/exercises/new?courseId=${courseId}`)}>
                            <Plus size={16} /> Thêm bài tập
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {isExercisesLoading ? (
                            <div style={{ textAlign: 'center', padding: 40 }}><Loader2 className="animate-spin" color="var(--accent-cyan)" /></div>
                        ) : exercises.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
                                Chưa có bài tập nào được gán.
                            </div>
                        ) : exercises.map((ex: any) => (
                            <div key={ex.id} className="item-card">
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                        <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{ex.title}</h3>
                                        <span className={`badge ${
                                            ex.status?.toUpperCase() === 'APPROVED' ? 'badge-green' : 
                                            ex.status?.toUpperCase() === 'PENDING' ? 'badge-orange' : 
                                            ex.status?.toUpperCase() === 'DRAFT' ? 'badge-gray' : 'badge-red'
                                        }`} style={{ fontSize: 9 }}>
                                            {ex.status?.toUpperCase() === 'APPROVED' ? 'ĐÃ DUYỆT' : 
                                             ex.status?.toUpperCase() === 'PENDING' ? 'CHỜ DUYỆT' : 
                                             ex.status?.toUpperCase() === 'DRAFT' ? 'BẢN NHÁP' : 'TỪ CHỐI'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Target size={14} /> {ex.difficulty}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={14} /> {ex.submissionsCount || 0} nộp bài</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {ex.status?.toUpperCase() === 'DRAFT' && (
                                        <button 
                                            className="btn btn-ghost" 
                                            style={{ padding: '8px 12px', color: 'var(--accent-cyan)', background: 'rgba(34, 211, 238, 0.1)', fontSize: 12 }} 
                                            onClick={async () => {
                                                try {
                                                    await exerciseApi.submitForApproval(ex.id);
                                                    toast({ type: 'success', title: 'Thành công', message: 'Đã gửi bài tập cho Admin duyệt.' });
                                                    queryClient.invalidateQueries({ queryKey: ['exercises', courseId] });
                                                } catch (e) {
                                                    toast({ type: 'error', title: 'Lỗi', message: 'Không thể gửi duyệt.' });
                                                }
                                            }}
                                        >
                                            <RefreshCw size={14} style={{ marginRight: 6 }} /> Gửi duyệt
                                        </button>
                                    )}
                                    <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => router.push(`/lecturer/exercises/${ex.id}/edit`)}><ArrowRight size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
