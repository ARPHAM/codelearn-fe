'use client';

import { useQuery } from '@tanstack/react-query';
import { examApi } from '@/api/exam.api';
import { 
  Loader2, 
  Calendar, 
  Clock, 
  Play,
  CheckCircle2,
  AlertCircle,
  Trophy,
  History,
  Timer
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function StudentExamsPage() {
  const { data: exams, isLoading } = useQuery({
    queryKey: ['student-exams'],
    queryFn: () => examApi.getExams(), // Ideally filtered by student enrollment in BE
  });

  const now = new Date();
  
  const upcomingExams = exams?.filter((exam: any) => 
    exam.status === 'APPROVED' && new Date(exam.endTime) > now
  ) || [];

  const pastExams = exams?.filter((exam: any) => 
    new Date(exam.endTime) <= now
  ) || [];

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Kỳ thi của tôi</h1>
          <p className="page-subtitle">Xem lịch thi sắp tới và lịch sử các bài kiểm tra đã thực hiện</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {/* Sắp diễn ra */}
        <section>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Timer size={22} color="var(--accent-cyan)" /> Kỳ thi sắp diễn ra & Đang mở
          </h2>
          
          {isLoading ? (
            <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : upcomingExams.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              Hiện chưa có kỳ thi nào sắp diễn ra.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
              {upcomingExams.map((exam: any) => {
                const startTime = new Date(exam.startTime);
                const isOngoing = now >= startTime && now <= new Date(exam.endTime);
                
                return (
                  <div key={exam.id} className="card" style={{ 
                    padding: 24, 
                    border: isOngoing ? '1px solid var(--accent-cyan)' : '1px solid var(--border)',
                    background: isOngoing ? 'rgba(34, 211, 238, 0.05)' : 'rgba(255, 255, 255, 0.02)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                            {exam.course?.name || 'Lớp học'}
                        </span>
                        {isOngoing && (
                            <span className="badge badge-cyan" style={{ fontSize: 10 }}>ĐANG DIỄN RA</span>
                        )}
                    </div>
                    
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{exam.title}</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                            <Calendar size={14} /> 
                            {format(startTime, 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                            <Clock size={14} /> 
                            {exam.duration} phút
                        </div>
                    </div>

                    <Link href={`/student/exams/${exam.id}`}>
                        <button 
                            className={`btn ${isOngoing ? 'btn-primary' : 'btn-ghost'}`} 
                            style={{ 
                                width: '100%', 
                                background: isOngoing ? 'var(--accent-cyan)' : 'transparent',
                                color: isOngoing ? '#000' : 'var(--text-primary)',
                                border: isOngoing ? 'none' : '1px solid var(--border)'
                            }}
                        >
                            {isOngoing ? (
                                <><Play size={16} style={{ marginRight: 8 }} /> Vào thi ngay</>
                            ) : (
                                'Xem chi tiết'
                            )}
                        </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Lịch sử */}
        <section>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <History size={22} color="var(--text-muted)" /> Lịch sử thi cử
          </h2>
          
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
                        <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600 }}>Tên kỳ thi</th>
                        <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600 }}>Ngày thi</th>
                        <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600 }}>Thời gian</th>
                        <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, textAlign: 'right' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {pastExams.length === 0 ? (
                        <tr>
                            <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có dữ liệu lịch sử.</td>
                        </tr>
                    ) : (
                        pastExams.map((exam: any) => (
                            <tr key={exam.id} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontWeight: 600 }}>{exam.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{exam.course?.name}</div>
                                </td>
                                <td style={{ padding: '16px 24px', fontSize: 13 }}>
                                    {format(new Date(exam.startTime), 'dd/MM/yyyy', { locale: vi })}
                                </td>
                                <td style={{ padding: '16px 24px', fontSize: 13 }}>
                                    {exam.duration} phút
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <Link href={`/student/exams/${exam.id}/result`}>
                                        <button className="btn btn-ghost" style={{ fontSize: 12, color: 'var(--accent-purple-light)' }}>
                                            Xem kết quả
                                        </button>
                                    </Link>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
