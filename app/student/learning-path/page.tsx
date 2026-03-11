import DashboardLayout from '@/components/layout/DashboardLayout';

type NodeStatus = 'done' | 'active' | 'locked';

const pathNodes: Array<{
  id: string; title: string; tag: string; difficulty: 'easy' | 'medium' | 'hard';
  status: NodeStatus; x: number; y: number; progress: number;
  children: string[];
}> = [
    { id: 'A', title: 'Array & String Basics', tag: 'Arrays', difficulty: 'easy', status: 'done', x: 50, y: 60, progress: 100, children: ['B', 'C'] },
    { id: 'B', title: 'Two Pointers', tag: 'Pointers', difficulty: 'easy', status: 'done', x: 20, y: 35, progress: 100, children: ['D'] },
    { id: 'C', title: 'Sliding Window', tag: 'Arrays', difficulty: 'medium', status: 'done', x: 80, y: 35, progress: 100, children: ['E'] },
    { id: 'D', title: 'Binary Search', tag: 'Search', difficulty: 'medium', status: 'active', x: 20, y: 15, progress: 60, children: ['F'] },
    { id: 'E', title: 'Stack & Queue', tag: 'DS', difficulty: 'medium', status: 'active', x: 72, y: 15, progress: 30, children: ['F'] },
    { id: 'F', title: 'Graph BFS/DFS', tag: 'Graph', difficulty: 'hard', status: 'locked', x: 46, y: 0, progress: 0, children: [] },
  ];

const suggested = [
  { id: 'Q047', title: 'Binary Search in Rotated Array', tag: 'Binary Search', diff: 'medium', reason: 'Bạn đang yếu Binary Search' },
  { id: 'Q103', title: 'Min Stack Implementation', tag: 'Stack', diff: 'easy', reason: 'Nâng cao từ Stack & Queue' },
  { id: 'Q201', title: 'Number of Islands', tag: 'Graph', diff: 'medium', reason: 'Chuẩn bị cho Graph BFS/DFS' },
];

const diffColors: Record<string, string> = { easy: 'badge-green', medium: 'badge-yellow', hard: 'badge-red' };
const statusColors: Record<NodeStatus, string> = { done: '#10b981', active: '#7c3aed', locked: '#374151' };

export default function LearningPathPage() {
  return (
    <DashboardLayout>
      <div className="page-container animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">🗺️ Lộ trình Học tập</h1>
            <p className="page-subtitle">AI gợi ý bài tập dựa trên kỹ năng còn yếu — CS101 Data Structures & Algorithms</p>
          </div>
          <button className="btn btn-primary">🤖 Cập nhật gợi ý AI</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          {/* Skill tree visualization */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🌳 Skill Tree</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 20 }}>
                <span style={{ color: '#10b981' }}>● Hoàn thành</span>
                <span style={{ color: '#7c3aed', marginLeft: 12 }}>● Đang học</span>
                <span style={{ color: '#374151', marginLeft: 12 }}>● Chưa mở khóa</span>
              </div>

              {/* SVG Tree */}
              <div style={{ position: 'relative', height: 380, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                  {/* Connection lines */}
                  {pathNodes.map(node =>
                    node.children.map(cid => {
                      const child = pathNodes.find(n => n.id === cid);
                      if (!child) return null;
                      return (
                        <line key={`${node.id}-${cid}`}
                          x1={`${node.x}%`} y1={`${node.y + 8}%`}
                          x2={`${child.x}%`} y2={`${child.y + 8}%`}
                          stroke={node.status === 'done' ? '#10b981' : '#30363d'}
                          strokeWidth="2" strokeDasharray={child.status === 'locked' ? '5,4' : '0'}
                          opacity="0.6"
                        />
                      );
                    })
                  )}
                </svg>

                {/* Nodes */}
                {pathNodes.map(node => (
                  <div key={node.id} style={{
                    position: 'absolute',
                    left: `${node.x}%`, top: `${node.y + 4}%`,
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    cursor: node.status !== 'locked' ? 'pointer' : 'default',
                    zIndex: 2,
                  }}>
                    <div style={{
                      width: node.status === 'active' ? 64 : 52,
                      height: node.status === 'active' ? 64 : 52,
                      borderRadius: '50%',
                      background: node.status === 'done' ? 'rgba(16,185,129,0.2)' : node.status === 'active' ? 'rgba(124,58,237,0.2)' : 'var(--bg-secondary)',
                      border: `3px solid ${statusColors[node.status]}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto',
                      boxShadow: node.status === 'active' ? 'var(--shadow-glow-purple)' : 'none',
                      transition: 'all 0.2s',
                      fontSize: node.status === 'done' ? 20 : node.status === 'locked' ? 16 : 22,
                    }}>
                      {node.status === 'done' ? '✅' : node.status === 'locked' ? '🔒' : node.id}
                    </div>
                    <div style={{
                      marginTop: 6, fontSize: 10, fontWeight: 700,
                      color: node.status === 'active' ? 'var(--accent-purple-light)' : node.status === 'done' ? 'var(--accent-green)' : 'var(--text-muted)',
                      maxWidth: 80, lineHeight: 1.3,
                    }}>{node.title}</div>
                    {node.status === 'active' && (
                      <div style={{ marginTop: 4 }}>
                        <div className="progress-bar" style={{ width: 64, margin: '0 auto', height: 4 }}>
                          <div className="progress-fill" style={{ width: `${node.progress}%`, background: 'var(--accent-purple)' }} />
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--accent-purple-light)', marginTop: 2 }}>{node.progress}%</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Current skill detail */}
            <div className="card" style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-purple-light)' }}>🎯 Đang học: Binary Search</div>
                <span className="badge badge-yellow">Active</span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Tiến độ</div>
                  <div className="progress-bar" style={{ height: 8 }}>
                    <div className="progress-fill" style={{ width: '60%', background: 'var(--accent-purple)' }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--accent-purple-light)', fontWeight: 700, marginTop: 3 }}>6/10 bài</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Thời gian TB</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>24<span style={{ fontSize: 11, fontWeight: 400 }}>m</span></div>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>▶ Tiếp tục luyện tập</button>
            </div>
          </div>

          {/* Right: AI suggestions + weak skills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* AI suggested exercises */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>🤖 AI Gợi ý cho bạn</span>
                <span className="badge badge-purple">Powered by AI</span>
              </div>
              {suggested.map(ex => (
                <div key={ex.id} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{ex.title}</div>
                    <span className={`badge ${diffColors[ex.diff]}`} style={{ marginLeft: 8, flexShrink: 0 }}>{ex.diff}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--accent-cyan)', marginBottom: 8 }}>💡 {ex.reason}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 11 }}>Làm ngay →</button>
                    <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>Bỏ qua</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Weak skills analysis */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>📉 Kỹ năng cần cải thiện</div>
              {[
                { skill: 'Binary Search', score: 40, color: 'var(--accent-red)' },
                { skill: 'Dynamic Programming', score: 28, color: 'var(--accent-red)' },
                { skill: 'Graph Algorithms', score: 55, color: 'var(--accent-yellow)' },
                { skill: 'Stack & Queue', score: 62, color: 'var(--accent-yellow)' },
                { skill: 'Sorting', score: 88, color: 'var(--accent-green)' },
              ].map(s => (
                <div key={s.skill} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{s.skill}</span>
                    <span style={{ fontWeight: 700, color: s.color }}>{s.score}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${s.score}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Overall progress */}
            <div className="card" style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.25)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#34d399', marginBottom: 12 }}>🏅 Tiến độ tổng thể</div>
              {[
                { label: 'Bài đã hoàn thành', value: '47 / 120' },
                { label: 'Kỹ năng đạt được', value: '3 / 8' },
                { label: 'Điểm XP', value: '2,840 XP' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
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
