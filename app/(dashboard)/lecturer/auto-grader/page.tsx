
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLecturerProblems } from '@/hooks/useProblems';
import { submissionsApi, Submission } from '@/api/submissions.api';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  RefreshCcw,
  Clock,
  Cpu,
  Database as MemoryIcon
} from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { color: string; label: string; icon: any }> = {
    PASS: { color: 'var(--accent-green)', label: 'Đạt', icon: CheckCircle2 },
    FAIL: { color: 'var(--accent-red)', label: 'Thất bại', icon: XCircle },
    PARTIAL: { color: 'var(--accent-yellow)', label: 'Một phần', icon: AlertCircle },
    PENDING: { color: 'var(--text-muted)', label: 'Đang chờ', icon: RefreshCcw },
  };
  const c = cfg[status] || cfg.FAIL;
  const Icon = c.icon;
  return (
    <span className="badge" style={{ 
      background: 'rgba(255,255,255,0.03)', 
      color: c.color, 
      border: `1px solid ${c.color}33`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px'
    }}>
      <Icon size={14} className={status === 'PENDING' ? 'spin' : ''} />
      {c.label}
    </span>
  );
}

export default function AutoGraderPage() {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  // 1. Fetch lecturer's problems
  const { data: problemsData, isLoading: loadingProblems } = useLecturerProblems();

  // 2. Fetch submissions for selected exercise
  const { data: submissionsData, isLoading: loadingSubmissions, refetch } = useQuery({
    queryKey: ['exercise-submissions', selectedExerciseId],
    queryFn: async () => {
      const resp = await submissionsApi.getExerciseSubmissions(selectedExerciseId);
      return resp.data.data;
    },
    enabled: !!selectedExerciseId,
  });

  const activeSubmissions: Submission[] = submissionsData || [];

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚡ Auto-Grader</h1>
          <p className="page-subtitle">Quản lý và theo dõi kết quả nộp bài tự động của sinh viên</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select 
            className="select" 
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            style={{ minWidth: 260, height: 44, borderRadius: 12 }}
          >
            <option value="">-- Chọn bài tập để xem --</option>
            {problemsData?.items?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <button 
            className="btn btn-primary" 
            onClick={() => refetch()}
            disabled={!selectedExerciseId || loadingSubmissions}
            style={{ gap: 8 }}
          >
            <RefreshCcw size={18} className={loadingSubmissions ? 'spin' : ''} />
            <span>Cập nhật</span>
          </button>
        </div>
      </div>

      {!selectedExerciseId ? (
        <div className="card" style={{ padding: '80px 0', textAlign: 'center', opacity: 0.7 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>☝️</div>
          <p style={{ color: 'var(--text-secondary)' }}>Vui lòng chọn một bài tập ở trên để xem lịch sử nộp bài.</p>
        </div>
      ) : loadingSubmissions ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Loader2 className="animate-spin" size={40} color="var(--accent-purple)" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 }}>
          {/* Left: Submissions Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Danh sách nộp bài</span>
                <span className="badge" style={{ fontSize: 10, background: 'var(--bg-tertiary)' }}>{activeSubmissions.length} kết quả</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                 <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input" placeholder="Tìm sinh viên..." style={{ width: 180, paddingLeft: 32, height: 36, fontSize: 12 }} />
                 </div>
              </div>
            </div>
            
            {activeSubmissions.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                Chưa có sinh viên nào nộp bài cho thử thách này.
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Sinh viên</th>
                    <th>Ngôn ngữ</th>
                    <th>Điểm</th>
                    <th>Thời gian</th>
                    <th style={{ textAlign: 'right' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSubmissions.map(s => {
                    const isSelected = selectedSubmissionId === s.id;
                    return (
                      <tr 
                        key={s.id} 
                        style={{ 
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(139, 92, 246, 0.05)' : 'transparent'
                        }}
                        onClick={() => setSelectedSubmissionId(s.id)}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar" style={{ background: 'var(--gradient-purple)', width: 32, height: 32, fontSize: 11 }}>
                              {s.user.fullName.split(' ').pop()?.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{s.user.fullName}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(s.createdAt).toLocaleString('vi-VN')}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge" style={{ background: 'var(--bg-tertiary)', fontSize: 11 }}>{s.language}</span>
                        </td>
                        <td>
                          <span style={{ 
                            fontWeight: 800, 
                            fontSize: 15,
                            color: s.score >= 80 ? 'var(--accent-green)' : s.score >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)'
                          }}>
                            {s.score}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
                            <Clock size={12} />
                            {s.executionTime || 0}ms
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <StatusBadge status={s.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Right Panel: Detail or Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {selectedSubmissionId ? (
              <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--accent-purple-light)22' }}>
                <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderBottom: '1px solid var(--border)' }}>
                   <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>📋 Chi tiết thực thi</h3>
                   <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 0' }}>Mã nộp bài: {selectedSubmissionId.substring(0, 13)}...</p>
                </div>
                
                <div style={{ padding: 20 }}>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                      <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 12 }}>
                         <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>CPU Time</div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                            <Cpu size={16} color="var(--accent-cyan)" />
                            <span>--ms</span>
                         </div>
                      </div>
                      <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 12 }}>
                         <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Memory</div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                            <MemoryIcon size={16} color="var(--accent-purple)" />
                            <span>--MB</span>
                         </div>
                      </div>
                   </div>

                   <p style={{ fontSize: 12, textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
                      (Chi tiết kết quả test case và mã nguồn đang được tải...)
                   </p>
                </div>
              </div>
            ) : (
              <div className="card" style={{ background: 'rgba(6,182,212,0.05)', borderColor: 'rgba(6,182,212,0.2)' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-cyan-light)', marginBottom: 16 }}>🐳 Docker Sandbox Stats</div>
                {[
                  { label: 'Uptime', value: '99.9%' },
                  { label: 'Container Active', value: '4/10' },
                  { label: 'Avg Execution', value: '420ms' },
                  { label: 'Peak Memory', value: '512MB' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.value}</span>
                  </div>
                ))}
                <div className="divider" style={{ margin: '16px 0' }} />
                <p style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--text-muted)' }}>
                  Hệ thống sử dụng gVisor để cô lập hoàn toàn môi trường thực thi, đảm bảo an toàn tuyệt đối cho hệ thống chủ.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
