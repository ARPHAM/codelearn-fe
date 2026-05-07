'use client'

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExamDetail, useExamMonitoring } from '@/src/hooks/useExams';
import { useCourseStudents } from '@/src/hooks/useCourses';
import { examApi } from '@/api/exam.api';
import { toast } from '@/components/ui/Toast';
import { 
    Clock, 
    Calendar, 
    ChevronLeft, 
    Settings, 
    Users, 
    FileText, 
    Activity,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ShieldAlert,
    BookOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function AdminExamDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { data: exam, isLoading } = useExamDetail(id);
    const { data: students } = useCourseStudents(exam?.course?.id);
    const { data: monitoringData } = useExamMonitoring(id);
    const [isRegrading, setIsRegrading] = useState(false);
    const [isRecalculating, setIsRecalculating] = useState(false);

    const handleRegrade = async () => {
        if (!confirm('Bạn có chắc chắn muốn chấm lại toàn bộ bài làm? Hành động này sẽ đẩy tất cả bài nộp vào hàng đợi chấm.')) return;
        setIsRegrading(true);
        try {
            await examApi.regradeExam(id);
            toast({ type: 'success', title: 'Thành công', message: 'Đã bắt đầu quá trình chấm lại.' });
        } catch (e) {
            toast({ type: 'error', title: 'Lỗi', message: 'Không thể bắt đầu chấm lại.' });
        } finally {
            setIsRegrading(false);
        }
    };

    const handleRecalculate = async () => {
        setIsRecalculating(true);
        try {
            await examApi.recalculateScores(id);
            toast({ type: 'success', title: 'Thành công', message: 'Đã tính toán lại điểm cho tất cả thí sinh.' });
        } catch (e) {
            toast({ type: 'error', title: 'Lỗi', message: 'Không thể tính toán lại điểm.' });
        } finally {
            setIsRecalculating(false);
        }
    };

    if (isLoading) return (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={32} color="var(--accent-purple)" />
        </div>
    );

    if (!exam) return (
        <div style={{ padding: 40, textAlign: 'center' }}>
            <AlertCircle size={48} color="var(--accent-red)" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Không tìm thấy kỳ thi</h2>
            <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={() => router.back()}>Quay lại</button>
        </div>
    );

    const isLive = new Date() >= new Date(exam.startTime) && new Date() <= new Date(exam.endTime);

    return (
        <div className="page-container animate-in">
            <div className="page-header" style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => router.back()}>
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="page-title" style={{ fontSize: 28 }}>{exam.title}</h1>
                        <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {format(new Date(exam.startTime), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {exam.duration} phút</span>
                            <span className={`badge ${exam.status === 'APPROVED' ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: 10 }}>
                                {exam.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                            </span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-ghost" style={{ border: '1px solid var(--border)' }} onClick={() => router.push(`/admin/exams/${id}/monitoring`)}>
                        <Activity size={18} style={{ marginRight: 8 }} /> Giám sát thi
                    </button>
                    <button className="btn btn-primary" style={{ background: 'var(--accent-purple)' }}>
                        <Settings size={18} style={{ marginRight: 8 }} /> Chỉnh sửa
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 32 }}>
                <div>
                    <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <BookOpen size={20} color="var(--accent-purple)" /> Mô tả & Quy định
                        </h3>
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 14 }}>
                            {exam.description || 'Không có mô tả cho kỳ thi này.'}
                        </div>
                    </div>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <ShieldAlert size={20} color="var(--accent-cyan)" /> Cấu trúc đề thi (Rules)
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {(!exam.generationRules || exam.generationRules.length === 0) ? (
                                <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Chưa có cấu trúc đề thi.
                                </div>
                            ) : (
                                exam.generationRules.map((rule: any, idx: number) => (
                                    <div key={idx} style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 700 }}>Ngân hàng: {rule.bankName || rule.bankId}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                                Độ khó: <span style={{ color: rule.difficulty === 'EASY' ? 'var(--accent-green)' : 'var(--accent-red)' }}>{rule.difficulty}</span> • Số lượng: {rule.count} câu
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-purple)' }}>{rule.scorePerQuestion * rule.count} đ</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{rule.scorePerQuestion} đ/câu</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Thống kê nhanh</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Tổng số thí sinh</span>
                                <span style={{ fontWeight: 700 }}>{students?.length || 0}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Đã bắt đầu thi</span>
                                <span style={{ fontWeight: 700 }}>{monitoringData?.length || 0}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Đã hoàn thành</span>
                                <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>
                                    {monitoringData?.filter((m: any) => m.status === 'COMPLETED').length || 0}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Trạng thái hiện tại</span>
                                <span style={{ fontWeight: 700, color: isLive ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                                    {isLive ? 'Đang diễn ra' : 'Sắp diễn ra'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: 24, background: 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--accent-purple-light)' }}>Hành động Quản trị</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {(exam.status?.toUpperCase() === 'PENDING') && (
                                <button 
                                    className="btn btn-primary" 
                                    style={{ width: '100%', background: 'var(--accent-green)', color: '#000', fontWeight: 700 }}
                                    onClick={async () => {
                                        try {
                                            await examApi.approveExam(id);
                                            toast({ type: 'success', title: 'Thành công', message: 'Kỳ thi đã được phê duyệt.' });
                                            router.refresh();
                                        } catch (e) {
                                            toast({ type: 'error', title: 'Lỗi', message: 'Không thể duyệt kỳ thi.' });
                                        }
                                    }}
                                >
                                    <CheckCircle2 size={18} style={{ marginRight: 8 }} /> Duyệt đề thi này
                                </button>
                            )}
                            <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', width: '100%', fontSize: 13 }} onClick={() => router.push(`/admin/courses/${exam.course.id}/users`)}>
                                <Users size={16} style={{ marginRight: 10 }} /> Quản lý danh sách thi
                            </button>
                            <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', width: '100%', fontSize: 13 }} onClick={handleRegrade} disabled={isRegrading}>
                                {isRegrading ? <Loader2 className="animate-spin" size={16} style={{ marginRight: 10 }} /> : <Activity size={16} style={{ marginRight: 10 }} />}
                                Chấm lại toàn bộ
                            </button>
                            <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', width: '100%', fontSize: 13 }} onClick={handleRecalculate} disabled={isRecalculating}>
                                {isRecalculating ? <Loader2 className="animate-spin" size={16} style={{ marginRight: 10 }} /> : <CheckCircle2 size={16} style={{ marginRight: 10 }} />}
                                Tính lại tổng điểm
                            </button>
                            <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', width: '100%', fontSize: 13 }}>
                                <FileText size={16} style={{ marginRight: 10 }} /> Xuất báo cáo kết quả
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
