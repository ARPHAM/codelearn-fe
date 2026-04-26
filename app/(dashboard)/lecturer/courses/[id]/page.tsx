'use client';

import { useParams, useRouter } from 'next/navigation';
import { useExamsByCourse, useRegradeExam } from '@/hooks/useExams';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { examApi } from '@/api/exam.api';
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
    Search
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

export default function LecturerCourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const courseId = params.id as string;

    const { data: exams, isLoading } = useExamsByCourse(courseId);
    const regradeMutation = useRegradeExam();

    const approveMutation = useMutation({
        mutationFn: (id: string) => examApi.approveExam(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exams', courseId] });
            toast({ type: 'success', title: 'Thành công', message: 'Kì thi đã được phê duyệt.' });
        }
    });

    const handleApprove = (id: string) => {
        if (confirm('Bạn có chắc chắn muốn phê duyệt kì thi này?')) {
            approveMutation.mutate(id);
        }
    };

    const handleRegrade = (id: string) => {
        if (confirm('Bắt đầu quá trình chấm lại toàn bộ bài thi? (Hệ thống sẽ giữ điểm cao nhất)')) {
            regradeMutation.mutate(id);
            toast({ type: 'info', title: 'Đang xử lý', message: 'Hệ thống đang thực hiện chấm lại trong nền.' });
        }
    };

    return (
        <div className="page-container animate-in">
            <div style={{ marginBottom: 24 }}>
                <button className="btn btn-ghost" onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
                    <ChevronLeft size={16} /> Quay lại danh sách lớp
                </button>
            </div>

            <div className="page-header" style={{ marginBottom: 40 }}>
                <div>
                    <h1 className="page-title">Quản lý Lớp học</h1>
                    <p className="page-subtitle">Thiết kế kì thi, phê duyệt đề bài và chấm lại khi có khiếu nại</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-primary" style={{ background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-purple-light)', border: '1px solid var(--accent-purple)' }}>
                        <Users size={16} /> Danh sách sinh viên
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => router.push(`/lecturer/courses/${courseId}/plagiarism`)}
                        style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple-light)', border: '1px solid rgba(139, 92, 246, 0.2)' }}
                    >
                        <Search size={16} /> Kiểm tra Đạo văn
                    </button>
                    <button className="btn btn-primary">
                        <Plus size={16} /> Tạo kì thi mới
                    </button>
                </div>
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={20} color="var(--accent-cyan)" /> Quản lý Kì thi
            </h2>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                    <Loader2 className="animate-spin" size={40} color="var(--accent-cyan)" />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {exams?.map((exam: any) => (
                        <div key={exam.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                    <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{exam.title}</h3>
                                    <span className={`badge ${exam.status === 'APPROVED' ? 'badge-green' : exam.status === 'PENDING' ? 'badge-orange' : 'badge-red'}`} style={{ fontSize: 10 }}>
                                        {exam.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={16} /> {new Date(exam.startTime).toLocaleString('vi-VN')}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={16} /> {exam.duration} phút</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={16} /> {exam.isPerUserRandom ? 'Bốc đề ngẫu nhiên' : 'Đề chung'}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                {exam.status === 'PENDING' && (
                                    <button className="btn btn-primary" style={{ background: 'var(--accent-green)', borderColor: 'var(--accent-green)' }} onClick={() => handleApprove(exam.id)} disabled={approveMutation.isPending}>
                                        {approveMutation.isPending ? <Loader2 className="animate-spin" /> : 'Phê duyệt'}
                                    </button>
                                )}
                                <button className="btn btn-ghost" onClick={() => handleRegrade(exam.id)} disabled={regradeMutation.isPending} title="Chấm lại toàn bộ">
                                    {regradeMutation.isPending ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} />}
                                </button>
                                <button className="btn btn-secondary"><Settings size={18} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
