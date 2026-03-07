import DashboardLayout from '@/app/components/layout/DashboardLayout';

const questions = [
  { id: 'Q001', title: 'Cài đặt BFS trên đồ thị có hướng', difficulty: 'medium', tags: ['Graph', 'BFS', 'Traversal'], lang: 'C++', uses: 12, score: 10 },
  { id: 'Q002', title: 'Bài toán Ba lô 0/1 (Knapsack)', difficulty: 'hard', tags: ['DP', 'Optimization'], lang: 'Any', uses: 8, score: 15 },
  { id: 'Q003', title: 'Sắp xếp nhanh (Quicksort)', difficulty: 'easy', tags: ['Sorting', 'Divide & Conquer'], lang: 'Python', uses: 20, score: 5 },
  { id: 'Q004', title: 'Tìm đường đi ngắn nhất Dijkstra', difficulty: 'hard', tags: ['Graph', 'Shortest Path', 'Priority Queue'], lang: 'C++', uses: 6, score: 20 },
  { id: 'Q005', title: 'Phát hiện chu trình trong đồ thị', difficulty: 'medium', tags: ['Graph', 'DFS', 'Cycle Detection'], lang: 'Any', uses: 9, score: 10 },
  { id: 'Q006', title: 'Dãy con tăng dài nhất (LIS)', difficulty: 'medium', tags: ['DP', 'Sequence'], lang: 'Any', uses: 11, score: 10 },
];

const diffColors: Record<string, string> = { easy: 'badge-green', medium: 'badge-yellow', hard: 'badge-red' };
const diffLabels: Record<string, string> = { easy: '🟢 Dễ', medium: '🟡 Trung bình', hard: '🔴 Khó' };

export default function QuestionBankPage() {
  return (
    <DashboardLayout>
      <div className="page-container animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">🗃️ Ngân hàng Câu hỏi</h1>
            <p className="page-subtitle">Quản lý và tạo đề thi thông minh từ câu hỏi theo kỹ năng & độ khó</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost">📥 Import</button>
            <button className="btn btn-cyan">🎲 Random Đề thi</button>
            <button className="btn btn-primary">➕ Thêm câu hỏi</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          {/* Question list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Filters */}
            <div className="card" style={{ padding: '14px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <input className="input" placeholder="🔍 Tìm câu hỏi..." style={{ flex: 1, minWidth: 200 }} />
              <select className="select"><option>Tất cả độ khó</option><option>Dễ</option><option>Trung bình</option><option>Khó</option></select>
              <select className="select"><option>Tất cả tag</option><option>Graph</option><option>DP</option><option>Sorting</option></select>
              <select className="select"><option>Tất cả ngôn ngữ</option><option>C++</option><option>Python</option><option>Java</option></select>
            </div>

            {/* Question cards */}
            {questions.map(q => (
              <div key={q.id} className="card card-hover" style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '2px 7px', borderRadius: 4 }}>{q.id}</span>
                      <span className={`badge ${diffColors[q.difficulty]}`}>{diffLabels[q.difficulty]}</span>
                      <span className="badge badge-purple">{q.score} điểm</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{q.title}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {q.tags.map(tag => (
                        <span key={tag} style={{
                          background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                          borderRadius: 20, padding: '2px 10px', fontSize: 11,
                          color: 'var(--text-secondary)',
                        }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Ngôn ngữ</div>
                    <span className="badge badge-cyan">{q.lang}</span>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Đã dùng {q.uses} lần</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>👁 Xem</button>
                      <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>✏️</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Random Exam Generator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.25)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-purple-light)', marginBottom: 16 }}>🎲 Tạo đề thi ngẫu nhiên</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tên đề thi</label>
                  <input className="input" placeholder="Kiểm tra giữa kỳ..." defaultValue="Kiểm tra HK2 - 2026" />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Thời gian</label>
                  <select className="select" style={{ width: '100%' }}>
                    <option>60 phút</option><option>90 phút</option><option>120 phút</option>
                  </select>
                </div>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Cấu trúc đề</div>
                  {[
                    { level: 'Dễ', color: '#10b981', count: 2, score: 5 },
                    { level: 'Trung bình', color: '#f59e0b', count: 2, score: 10 },
                    { level: 'Khó', color: '#ef4444', count: 1, score: 15 },
                  ].map(row => (
                    <div key={row.level} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{row.level}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="number" defaultValue={row.count} style={{
                          width: 45, background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                          borderRadius: 4, color: 'var(--text-primary)', padding: '3px 6px', fontSize: 12, textAlign: 'center',
                        }} />
                        <span style={{ color: 'var(--text-muted)' }}>câu × {row.score}đ</span>
                      </div>
                    </div>
                  ))}
                  <div className="divider" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 13 }}>
                    <span>Tổng điểm</span>
                    <span style={{ color: 'var(--accent-purple-light)' }}>55 điểm</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Skill Tags bắt buộc</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['Graph', 'DP', 'Sorting'].map(tag => (
                      <span key={tag} style={{
                        background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.4)',
                        borderRadius: 20, padding: '3px 10px', fontSize: 11, color: 'var(--accent-purple-light)',
                        cursor: 'pointer',
                      }}>✓ {tag}</span>
                    ))}
                    <span style={{
                      background: 'var(--bg-tertiary)', border: '1px dashed var(--border)',
                      borderRadius: 20, padding: '3px 10px', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer',
                    }}>+ Thêm</span>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 4 }}>🎲 Tạo đề ngẫu nhiên</button>
                <button className="btn btn-ghost">👁 Preview đề thi</button>
              </div>
            </div>

            {/* Stats */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>📈 Thống kê ngân hàng</div>
              {[
                { label: 'Tổng câu hỏi', value: '247', icon: '📝' },
                { label: 'Đã phân loại', value: '231', icon: '🏷️' },
                { label: 'Số đề thi đã tạo', value: '18', icon: '📄' },
                { label: 'Câu hỏi chưa dùng', value: '45', icon: '💤' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{s.icon} {s.label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
