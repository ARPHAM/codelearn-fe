'use client'

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExamMonitoring, useExamDetail } from '@/src/hooks/useExams';
import { 
    Users, 
    ShieldAlert, 
    CheckCircle2, 
    Clock, 
    ChevronLeft, 
    Search,
    Loader2,
    Activity,
    AlertTriangle,
    Mail
} from 'lucide-react';
import { Skeleton } from '@/app/components/ui/Skeleton';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ExamMonitoringPage({ params }: PageProps) {
    const { id: examId } = use(params);
    const router = useRouter();
    const { data: exam } = useExamDetail(examId);
    const { data: monitoringData, isLoading } = useExamMonitoring(examId);
    const [search, setSearch] = useState('');

    const filteredData = monitoringData?.filter((m: any) => 
        m.fullName.toLowerCase().includes(search.toLowerCase()) || 
        m.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-container animate-in">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => router.back()}>
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="page-title" style={{ fontSize: 24 }}>Giám sát kỳ thi: {exam?.title || '...'}</h1>
                        <p className="page-subtitle">Theo dõi trạng thái và vi phạm của sinh viên theo thời gian thực</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div className="card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                        <Activity size={18} color="var(--accent-green)" className="animate-pulse" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)' }}>Đang giám sát</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>TỔNG SINH VIÊN</div>
                    {isLoading ? <Skeleton width="40%" height={34} /> : (
                        <div style={{ fontSize: 28, fontWeight: 800 }}>{monitoringData?.length || 0}</div>
                    )}
                </div>
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>ĐANG THI</div>
                    {isLoading ? <Skeleton width="40%" height={34} /> : (
                        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-blue)' }}>{monitoringData?.filter((m: any) => m.status === 'IN_PROGRESS').length || 0}</div>
                    )}
                </div>
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>ĐÃ HOÀN THÀNH</div>
                    {isLoading ? <Skeleton width="40%" height={34} /> : (
                        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-green)' }}>{monitoringData?.filter((m: any) => m.status === 'COMPLETED').length || 0}</div>
                    )}
                </div>
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>CÓ VI PHẠM</div>
                    {isLoading ? <Skeleton width="40%" height={34} /> : (
                        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-red)' }}>{monitoringData?.filter((m: any) => m.violationCount > 0).length || 0}</div>
                    )}
                </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div style={{ position: 'relative', width: 300 }}>
                        <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            className="input" 
                            placeholder="Tìm sinh viên..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: 40, height: 40, borderRadius: 10 }}
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Sinh viên</th>
                                <th>Trạng thái</th>
                                <th>Tiến độ</th>
                                <th>Vi phạm</th>
                                <th>Bắt đầu</th>
                                <th>Điểm số</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? [1, 2, 3, 4, 5].map(i => (
                                <tr key={i}>
                                    <td colSpan={7} style={{ padding: 16 }}>
                                        <Skeleton height={40} />
                                    </td>
                                </tr>
                            )) : filteredData?.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                        Không có dữ liệu sinh viên.
                                    </td>
                                </tr>
                            ) : filteredData?.map((m: any) => (
                                <tr key={m.userId}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div className="avatar" style={{ width: 32, height: 32, background: 'var(--gradient-purple)', color: 'white', fontSize: 12 }}>
                                                {m.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 14 }}>{m.fullName}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Mail size={10} /> {m.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${m.status === 'COMPLETED' ? 'badge-green' : m.status === 'IN_PROGRESS' ? 'badge-blue' : 'badge-gray'}`}>
                                            {m.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang thi'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                                                <div style={{ 
                                                    width: `${(parseInt(m.progress.split('/')[0]) / parseInt(m.progress.split('/')[1])) * 100}%`, 
                                                    height: '100%', 
                                                    background: 'var(--accent-purple)' 
                                                }}></div>
                                            </div>
                                            <span style={{ fontSize: 12, fontWeight: 600 }}>{m.progress}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {m.violationCount > 0 ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-red)', fontWeight: 700 }}>
                                                <AlertTriangle size={14} />
                                                {m.violationCount} lần
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)' }}>Không</span>
                                        )}
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {new Date(m.startTime).toLocaleTimeString('vi-VN')}
                                    </td>
                                    <td style={{ fontWeight: 800 }}>
                                        {m.score !== null ? m.score : '--'}
                                    </td>
                                    <td>
                                        <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => router.push(`/admin/exams/${examId}/monitoring/${m.userId}`)}>
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
