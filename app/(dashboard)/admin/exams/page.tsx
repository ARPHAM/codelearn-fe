'use client';

import { useQuery } from '@tanstack/react-query';
import { examApi } from '@/api/exam.api';
import { 
  Loader2, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Filter,
  Trophy
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function AdminExamsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: exams, isLoading } = useQuery({
    queryKey: ['admin-exams'],
    queryFn: () => examApi.getExams(), // Need to make sure this API returns all exams
  });

  const filteredExams = exams?.filter((exam: any) => {
    // Admin không nên thấy các bản nháp chưa gửi duyệt
    const matchesStatus = filterStatus === 'ALL' 
        ? exam.status !== 'DRAFT' 
        : exam.status === filterStatus;
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Kỳ thi & Kiểm tra</h1>
          <p className="page-subtitle">Phê duyệt và giám sát toàn bộ các kỳ thi trên hệ thống</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24, padding: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input 
              className="input" 
              placeholder="Tìm kiếm tên kỳ thi..." 
              style={{ width: '100%', paddingLeft: 40 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={18} color="var(--text-muted)" />
            <select 
              className="select" 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
          <Loader2 className="animate-spin" size={40} color="var(--accent-purple)" />
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="card" style={{ padding: '80px 0', textAlign: 'center' }}>
          <Trophy size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Không tìm thấy kỳ thi nào</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Hãy thay đổi bộ lọc hoặc thử lại sau.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
          {filteredExams.map((exam: any) => (
            <div key={exam.id} className="card card-hover" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div className={`badge ${exam.status === 'APPROVED' ? 'badge-green' : 'badge-orange'}`}>
                  {exam.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                </div>
                <Link href={`/admin/exams/${exam.id}`}>
                  <button className="btn btn-ghost" style={{ padding: 8 }}>
                    <ExternalLink size={18} />
                  </button>
                </Link>
              </div>
              
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, lineHeight: 1.4 }}>{exam.title}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <Calendar size={14} /> 
                  {format(new Date(exam.startTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <Clock size={14} /> 
                  Thời lượng: {exam.duration} phút
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Lớp học: {exam.course?.name || 'N/A'}</span>
                <Link href={`/admin/exams/${exam.id}`}>
                    <button className="btn btn-ghost" style={{ color: 'var(--accent-purple-light)', fontSize: 13, fontWeight: 600 }}>
                        Chi tiết phê duyệt
                    </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
