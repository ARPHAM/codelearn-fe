'use client';

import { useQuery } from '@tanstack/react-query';
import { examApi } from '@/api/exam.api';
import { 
  Loader2, 
  Search, 
  Calendar, 
  Clock, 
  Plus,
  Trophy,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function LecturerExamsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: exams, isLoading } = useQuery({
    queryKey: ['lecturer-exams'],
    queryFn: () => examApi.getExams(), // In a real app, this should be filtered by lecturer in BE
  });

  const filteredExams = exams?.filter((exam: any) => 
    exam.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Kỳ thi của tôi</h1>
          <p className="page-subtitle">Tạo, chỉnh sửa và theo dõi trạng thái các kỳ thi bạn phụ trách</p>
        </div>
        <Link href="/lecturer/exams/new">
          <button className="btn btn-primary" style={{ background: 'var(--accent-cyan)', color: '#000', fontWeight: 700 }}>
            <Plus size={20} /> Tạo kì thi mới
          </button>
        </Link>
      </div>

      <div className="card" style={{ marginBottom: 24, padding: 16 }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          <input 
            className="input" 
            placeholder="Tìm kiếm kỳ thi theo tên..." 
            style={{ width: '100%', paddingLeft: 40 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
          <Loader2 className="animate-spin" size={40} color="var(--accent-cyan)" />
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="card" style={{ padding: '80px 0', textAlign: 'center', border: '1px dashed var(--border)' }}>
          <Trophy size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Chưa có kỳ thi nào</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>Bắt đầu bằng cách tạo một kỳ thi mới cho lớp học của bạn.</p>
          <Link href="/lecturer/exams/new">
            <button className="btn btn-primary">Tạo ngay</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 24 }}>
          {filteredExams.map((exam: any) => (
            <div key={exam.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div className={`badge ${
                    exam.status === 'APPROVED' ? 'badge-green' : 
                    exam.status === 'PENDING' ? 'badge-orange' : 'badge-gray'
                  }`}>
                    {exam.status === 'APPROVED' ? 'Đã duyệt' : 
                     exam.status === 'PENDING' ? 'Đang chờ duyệt' : 'Bản nháp'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID: {exam.id}</div>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, minHeight: 50 }}>{exam.title}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Calendar size={14} /> 
                    Bắt đầu: {format(new Date(exam.startTime), 'HH:mm - dd/MM/yyyy', { locale: vi })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Clock size={14} /> 
                    Thời lượng: {exam.duration} phút
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Lớp: <span style={{ color: 'var(--text-secondary)' }}>{exam.course?.name || 'Chưa gán'}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/admin/exams/${exam.id}`}> {/* Using admin detail for now as it has monitoring */}
                        <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }}>
                            <Activity size={14} style={{ marginRight: 6 }} /> Giám sát
                        </button>
                    </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
