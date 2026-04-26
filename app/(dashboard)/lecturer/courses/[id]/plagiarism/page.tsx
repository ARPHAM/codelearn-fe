'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useLecturerProblems } from '@/hooks/useProblems';
import { plagiarismApi, PlagiarismPair } from '@/api/plagiarism.api';
import { 
  Loader2, 
  Search, 
  RefreshCcw,
  AlertTriangle,
  Users,
  FileCode,
  ShieldAlert,
  Target,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';

function RiskBadge({ similarity }: { similarity: number }) {
  let color = 'var(--accent-green)';
  let label = 'Thấp';
  
  if (similarity >= 70) {
    color = 'var(--accent-red)';
    label = 'Cao';
  } else if (similarity >= 40) {
    color = 'var(--accent-yellow)';
    label = 'Trung bình';
  }

  return (
    <span className="badge" style={{ 
      background: 'rgba(255,255,255,0.03)', 
      color: color, 
      border: `1px solid ${color}33`,
      fontSize: 10,
      fontWeight: 700
    }}>
      {label} ({similarity}%)
    </span>
  );
}

export default function PlagiarismPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [threshold, setThreshold] = useState(70);

  // 1. Fetch lecturer's problems for THIS course
  const { data: problemsData } = useLecturerProblems({ courseId });

  // 2. Fetch plagiarism results
  const { data: resultsData, isLoading: loadingResults, refetch } = useQuery({
    queryKey: ['plagiarism-results', selectedExerciseId],
    queryFn: async () => {
      const resp = await plagiarismApi.getResults(selectedExerciseId);
      return resp;
    },
    enabled: !!selectedExerciseId,
  });

  const pairs: PlagiarismPair[] = resultsData?.pairs || [];

  const handleStartCheck = async () => {
    if (!selectedExerciseId) return;
    try {
      await plagiarismApi.check(selectedExerciseId, threshold);
      refetch();
    } catch (err) {
      console.error('Lỗi khi chạy phân tích:', err);
    }
  };

  return (
    <div className="page-container animate-in">
      <div style={{ marginBottom: 20 }}>
        <button 
          className="btn btn-ghost" 
          onClick={() => router.push(`/lecturer/courses/${courseId}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
        >
          <ChevronLeft size={16} /> Quay lại lớp học
        </button>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Search size={28} color="var(--accent-purple-light)" /> Kiểm tra Đạo văn
          </h1>
          <p className="page-subtitle">Phân tích tương đồng mã nguồn trong khóa học này</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select 
            className="select" 
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            style={{ minWidth: 260, height: 44, borderRadius: 12 }}
          >
            <option value="">-- Chọn bài tập trong lớp --</option>
            {problemsData?.items?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <button 
            className="btn btn-primary" 
            onClick={handleStartCheck}
            disabled={!selectedExerciseId || loadingResults}
            style={{ gap: 8 }}
          >
            <RefreshCcw size={18} className={loadingResults ? 'spin' : ''} />
            <span>Phân tích lại</span>
          </button>
        </div>
      </div>

      {!selectedExerciseId ? (
        <div className="card" style={{ padding: '80px 0', textAlign: 'center', opacity: 0.7 }}>
          <div style={{ marginBottom: 16 }}>
            <Target size={48} color="var(--accent-purple-light)" style={{ margin: '0 auto', opacity: 0.5 }} />
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Vui lòng chọn một bài tập để xem kết quả kiểm tra đạo văn.</p>
        </div>
      ) : loadingResults ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Loader2 className="animate-spin" size={40} color="var(--accent-purple)" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
          {/* Left: Results Summary & Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="grid-3" style={{ gap: 16 }}>
               {[
                 { label: 'Tổng bài nộp', value: resultsData?.summary?.totalSubmissions || 0, color: 'var(--accent-purple)', icon: Users },
                 { label: 'Cặp trùng khớp', value: pairs.length, color: 'var(--accent-yellow)', icon: ShieldAlert },
                 { label: 'Nguy cơ cao', value: pairs.filter(p => p.similarity >= 70).length, color: 'var(--accent-red)', icon: AlertTriangle },
               ].map((s, i) => (
                 <div key={i} className="stat-card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div>
                          <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, margin: 0, textTransform: 'uppercase' }}>{s.label}</p>
                          <h3 style={{ fontSize: 24, fontWeight: 800, color: s.color, margin: '4px 0 0' }}>{s.value}</h3>
                       </div>
                       <s.icon size={24} color={s.color} style={{ opacity: 0.4 }} />
                    </div>
                 </div>
               ))}
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Các cặp tương đồng phát hiện được</span>
              </div>
              
              {pairs.length === 0 ? (
                <div style={{ padding: '60px 0', textAlign: 'center' }}>
                  <CheckCircle2 size={40} color="var(--accent-green)" style={{ opacity: 0.5, marginBottom: 12 }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Không phát hiện cặp bài làm nào có sự tương đồng đáng ngờ.</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Cặp sinh viên</th>
                      <th>Mức độ</th>
                      <th>Dòng trùng</th>
                      <th style={{ textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pairs.map((pair) => (
                      <tr key={pair.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                             <div style={{ fontSize: 13, fontWeight: 600 }}>{pair.studentA}</div>
                             <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>↔</span>
                             <div style={{ fontSize: 13, fontWeight: 600 }}>{pair.studentB}</div>
                          </div>
                        </td>
                        <td>
                          <RiskBadge similarity={pair.similarity} />
                        </td>
                        <td>
                           <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--accent-cyan-light)' }}>
                              {pair.matchingLines || '--'}
                           </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                           <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>Xem chi tiết</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right Panel: AST Analysis Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
             <div className="card" style={{ background: 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                   <FileCode size={18} color="var(--accent-purple-light)" />
                   Cơ chế phân tích AST
                </h3>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
                   Hệ thống sử dụng **Abstract Syntax Tree (AST)** để phát hiện hành vi đổi tên biến, thay đổi cấu trúc vòng lặp nhưng giữ nguyên logic thuật toán.
                </p>
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                   {['Bỏ qua khoảng trắng', 'Chuẩn hóa tên biến', 'Nhận diện hoán đổi câu lệnh'].map((f, i) => (
                     <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-primary)' }}>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-purple-light)' }} />
                        {f}
                     </div>
                   ))}
                </div>
             </div>

             <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f87171', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={16} /> Lưu ý về ngưỡng
                </h3>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                   Các bài tập đơn giản có thể có độ tương đồng cao tự nhiên. Giảng viên nên cân nhắc kỹ trước khi đánh dấu vi phạm đối với các tỷ lệ dưới 70%.
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
