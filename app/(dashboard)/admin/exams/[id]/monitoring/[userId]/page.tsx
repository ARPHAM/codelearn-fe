'use client'

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentLogs, useExamDetail } from '@/src/hooks/useExams';
import { 
    ChevronLeft, 
    ShieldAlert, 
    Activity, 
    Clock, 
    User,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Calendar,
    FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PageProps {
    params: Promise<{ id: string, userId: string }>;
}

export default function StudentMonitoringDetailPage({ params }: PageProps) {
    const { id: examId, userId } = use(params);
    const router = useRouter();
    const { data: exam } = useExamDetail(examId);
    const { data: logs, isLoading } = useStudentLogs(examId, userId);

    if (isLoading) return (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={32} color="var(--accent-purple)" />
        </div>
    );

    const violations = logs?.filter((l: any) => l.eventType === 'VISIBILITY_HIDDEN') || [];

    return (
        <div className="page-container animate-in">
            <div className="page-header" style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => router.back()}>
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="page-title" style={{ fontSize: 24 }}>Chi tiết hoạt động sinh viên</h1>
                        <p className="page-subtitle">Kỳ thi: {exam?.title || '...'}</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 32 }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: 20, borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Activity size={18} color="var(--accent-purple)" /> Nhật ký hoạt động (Audit Logs)
                        </h3>
                    </div>
                    <div style={{ padding: 20 }}>
                        {!logs || logs.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                                Không có nhật ký hoạt động nào.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {logs.map((log: any) => (
                                    <div key={log.id} style={{ 
                                        padding: 16, 
                                        borderRadius: 12, 
                                        background: log.eventType === 'VISIBILITY_HIDDEN' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)',
                                        border: '1px solid',
                                        borderColor: log.eventType === 'VISIBILITY_HIDDEN' ? 'rgba(239, 68, 68, 0.2)' : 'var(--border)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 16
                                    }}>
                                        <div style={{ 
                                            width: 40, height: 40, borderRadius: '50%', 
                                            background: log.eventType === 'VISIBILITY_HIDDEN' ? 'var(--accent-red)' : 'var(--accent-blue)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0
                                        }}>
                                            {log.eventType === 'VISIBILITY_HIDDEN' ? <AlertTriangle size={20} /> : <Activity size={20} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>
                                                {log.eventType === 'VISIBILITY_HIDDEN' ? 'Rời khỏi trang thi (Vi phạm)' : 
                                                 log.eventType === 'VISIBILITY_VISIBLE' ? 'Quay lại trang thi' : log.eventType}
                                            </div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                                {log.description || 'Hệ thống tự động ghi nhận'}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>{format(new Date(log.timestamp), 'HH:mm:ss')}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{format(new Date(log.timestamp), 'dd/MM/yyyy')}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Tóm tắt vi phạm</h3>
                        <div style={{ padding: 24, borderRadius: 16, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
                            <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--accent-red)', lineHeight: 1 }}>{violations.length}</div>
                            <div style={{ fontSize: 13, color: 'var(--accent-red)', fontWeight: 600, marginTop: 8 }}>Lần rời khỏi tab</div>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.5 }}>
                            Việc rời khỏi tab thi (mất tiêu điểm trình duyệt) được coi là một hành vi vi phạm quy chế phòng thi trực tuyến.
                        </p>
                    </div>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Ghi chú giám thị</h3>
                        <textarea 
                            className="input" 
                            rows={5} 
                            placeholder="Nhập ghi chú hoặc cảnh báo cho sinh viên này..." 
                            style={{ width: '100%', height: 'auto', fontSize: 13, padding: 12 }}
                        />
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: 12, background: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}>
                            Đánh dấu vi phạm nặng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
