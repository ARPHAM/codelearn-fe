

const submissions = [
  { id: 'SV001', name: 'Nguyễn Minh Khoa', exercise: 'BFS Graph Traversal', lang: 'C++', time: '2 phút trước', score: 95, pass: 19, total: 20, mem: '4.2MB', cpu: '0.18s', status: 'pass' },
  { id: 'SV002', name: 'Trần Thị Lan', exercise: 'Dynamic Programming', lang: 'Python', time: '5 phút trước', score: 70, pass: 14, total: 20, mem: '8.1MB', cpu: '0.42s', status: 'partial' },
  { id: 'SV003', name: 'Lê Văn Hùng', exercise: 'BFS Graph Traversal', lang: 'Java', time: '8 phút trước', score: 0, pass: 0, total: 20, mem: '-', cpu: '-', status: 'fail' },
  { id: 'SV004', name: 'Phạm Thu Hà', exercise: 'Sorting Algorithms', lang: 'C++', time: '12 phút trước', score: 100, pass: 20, total: 20, mem: '2.8MB', cpu: '0.09s', status: 'pass' },
  { id: 'SV005', name: 'Đỗ Quang Vinh', exercise: 'Dynamic Programming', lang: 'C++', time: '15 phút trước', score: 55, pass: 11, total: 20, mem: '6.3MB', cpu: '1.21s', status: 'partial' },
  { id: 'SV006', name: 'Hoàng Thị Mai', exercise: 'Sorting Algorithms', lang: 'Python', time: '18 phút trước', score: 100, pass: 20, total: 20, mem: '3.1MB', cpu: '0.15s', status: 'pass' },
];

const testCases = [
  { id: 1, input: 'n=5, edges=[(0,1),(1,2)]', expected: '[0,1,2]', got: '[0,1,2]', time: '12ms', status: 'pass' },
  { id: 2, input: 'n=3, edges=[(0,2),(2,1)]', expected: '[0,2,1]', got: '[0,2,1]', time: '8ms', status: 'pass' },
  { id: 3, input: 'n=6 (disconnected)', expected: '[0,1,3]', got: '[0,1]', time: '15ms', status: 'fail' },
  { id: 4, input: 'n=100, complete graph', expected: 'BFS order', got: 'BFS order', time: '45ms', status: 'pass' },
  { id: 5, input: 'Empty graph n=0', expected: '[]', got: '[]', time: '2ms', status: 'pass' },
];

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; label: string; icon: string }> = {
    pass: { cls: 'badge-green', label: 'Passed', icon: '✅' },
    fail: { cls: 'badge-red', label: 'Failed', icon: '❌' },
    partial: { cls: 'badge-yellow', label: 'Partial', icon: '⚠️' },
  };
  const c = cfg[status] || cfg.fail;
  return <span className={`badge ${c.cls}`}>{c.icon} {c.label}</span>;
}

export default function AutoGraderPage() {
  return (
    <>
      <div className="page-container animate-in">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">⚡ Auto-Grader</h1>
            <p className="page-subtitle">Chấm bài tự động qua Docker sandbox — Kết quả tức thì</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select className="select" style={{ fontSize: 13 }}>
              <option>BFS Graph Traversal</option>
              <option>Dynamic Programming</option>
              <option>Sorting Algorithms</option>
            </select>
            <button className="btn btn-primary">▶ Chạy lại tất cả</button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid-4">
          {[
            { label: 'Tổng nộp bài', value: '148', icon: '📥', color: '#7c3aed', sub: 'Hôm nay' },
            { label: 'Passed', value: '89', icon: '✅', color: '#10b981', sub: '60.1%' },
            { label: 'Partial', value: '34', icon: '⚠️', color: '#f59e0b', sub: '23.0%' },
            { label: 'Failed', value: '25', icon: '❌', color: '#ef4444', sub: '16.9%' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginTop: 4, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{s.sub}</div>
                </div>
                <span style={{ fontSize: 28 }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Submissions table + test cases panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
          {/* Left: Submission list */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Danh sách nộp bài</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" placeholder="Tìm sinh viên..." style={{ width: 200 }} />
                <select className="select">
                  <option>Tất cả</option><option>Passed</option><option>Failed</option>
                </select>
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Sinh viên</th><th>Bài tập</th><th>Ngôn ngữ</th>
                  <th>Điểm</th><th>Test cases</th><th>CPU</th><th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(s => (
                  <tr key={s.id} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar" style={{ background: 'var(--gradient-purple)', color: 'white', width: 28, height: 28, fontSize: 10 }}>
                          {s.name.split(' ').pop()?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 12.5 }}>{s.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.id} · {s.time}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, maxWidth: 140 }}>{s.exercise}</td>
                    <td>
                      <span className={`badge ${s.lang === 'Python' ? 'badge-cyan' : s.lang === 'Java' ? 'badge-orange' : 'badge-purple'}`}>{s.lang}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: s.score >= 100 ? 'var(--accent-green)' : s.score === 0 ? 'var(--accent-red)' : 'var(--accent-yellow)', fontSize: 14 }}>{s.score}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: 12 }}>{s.pass}/{s.total}</div>
                      <div className="progress-bar" style={{ marginTop: 4, width: 60 }}>
                        <div className="progress-fill" style={{ width: `${(s.pass / s.total) * 100}%`, background: s.pass === s.total ? 'var(--accent-green)' : s.pass === 0 ? 'var(--accent-red)' : 'var(--accent-yellow)' }} />
                      </div>
                    </td>
                    <td style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{s.cpu}</td>
                    <td><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: Test case panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(124,58,237,0.06)' }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>📋 Test Cases — Trần Thị Lan</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Dynamic Programming · Python</div>
              </div>
              {testCases.map(tc => (
                <div key={tc.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 14, marginTop: 1 }}>{tc.status === 'pass' ? '✅' : '❌'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>Test #{tc.id} · {tc.time}</div>
                    <div className="code-block" style={{ padding: '6px 10px', fontSize: 10.5 }}>
                      <div><span className="code-comment">// Input</span></div>
                      <div>{tc.input}</div>
                      {tc.status === 'fail' && (
                        <>
                          <div style={{ marginTop: 4 }}><span className="code-keyword">Expected:</span> <span className="code-string">{tc.expected}</span></div>
                          <div><span className="code-keyword">Got:</span> <span style={{ color: 'var(--accent-red)' }}>{tc.got}</span></div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Docker sandbox info */}
            <div className="card" style={{ background: 'rgba(6,182,212,0.05)', borderColor: 'rgba(6,182,212,0.2)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent-cyan-light)', marginBottom: 12 }}>🐳 Docker Sandbox</div>
              {[
                { label: 'Image', value: 'python:3.11-slim' },
                { label: 'CPU Limit', value: '0.5 vCPU' },
                { label: 'RAM Limit', value: '128 MB' },
                { label: 'Timeout', value: '5 giây' },
                { label: 'Network', value: 'Disabled' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 600 }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
