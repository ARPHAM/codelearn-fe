import DashboardLayout from '@/components/layout/DashboardLayout';

const exercises = [
  { name: 'BFS Graph Traversal', stuck: 68, submitted: 82, total: 120, avg: 47, alert: true },
  { name: 'Dynamic Programming', stuck: 88, submitted: 55, total: 120, avg: 72, alert: true },
  { name: 'Sorting Algorithms', stuck: 12, submitted: 108, total: 120, avg: 28, alert: false },
  { name: 'Binary Search Tree', stuck: 34, submitted: 91, total: 120, avg: 38, alert: false },
  { name: 'Greedy Algorithms', stuck: 71, submitted: 48, total: 120, avg: 65, alert: true },
];

const weeklyData = [65, 72, 58, 80, 91, 76, 88];
const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const weakStudents = [
  { name: 'Lê Văn Hùng', stuck: 3, timeStuck: 4.2, skills: ['Graph', 'DP'] },
  { name: 'Đỗ Quang Vinh', stuck: 2, timeStuck: 2.8, skills: ['DP'] },
  { name: 'Nguyễn Thu An', stuck: 2, timeStuck: 3.5, skills: ['Graph', 'Greedy'] },
];

function MiniBarChart({ data, days }: { data: number[]; days: string[] }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
      {data.map((val, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
          <div style={{
            width: '100%', height: `${(val / max) * 48}px`,
            background: val > 80 ? 'var(--accent-purple)' : 'rgba(124,58,237,0.4)',
            borderRadius: '3px 3px 0 0', minHeight: 4, transition: 'height 0.5s ease',
          }} />
          <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="page-container animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">📊 Analytics Dashboard</h1>
            <p className="page-subtitle">Theo dõi tiến độ lớp học — Phát hiện sớm sinh viên cần hỗ trợ</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select className="select"><option>Tất cả lớp</option><option>CS101-A</option><option>CS101-B</option></select>
            <select className="select"><option>HK2 2025-2026</option><option>HK1 2025-2026</option></select>
            <button className="btn btn-ghost">📤 Xuất báo cáo</button>
          </div>
        </div>

        {/* Top stats */}
        <div className="grid-4">
          {[
            { label: 'Sinh viên', value: '120', icon: '👥', color: '#7c3aed', trend: '+5 tuần này' },
            { label: 'Tỷ lệ hoàn thành', value: '73%', icon: '✅', color: '#10b981', trend: '↑ 8% so tháng trước' },
            { label: 'Đang gặp khó', value: '28', icon: '⚠️', color: '#f59e0b', trend: 'Cần chú ý' },
            { label: 'Bài tập cần review', value: '3', icon: '🚨', color: '#ef4444', trend: '> 60% sv thất bại' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderTop: `2px solid ${s.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1, marginTop: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{s.trend}</div>
                </div>
                <span style={{ fontSize: 28 }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          {/* Exercise progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>📋 Tỷ lệ hoàn thành theo bài tập</div>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>120 sinh viên</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {exercises.map(ex => {
                  const rate = Math.round((ex.submitted / ex.total) * 100);
                  const stuckRate = Math.round((ex.stuck / ex.total) * 100);
                  return (
                    <div key={ex.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{ex.name}</span>
                          {ex.alert && (
                            <span style={{
                              background: 'rgba(239,68,68,0.15)', color: '#f87171',
                              border: '1px solid rgba(239,68,68,0.3)', borderRadius: 999,
                              fontSize: 9, fontWeight: 700, padding: '2px 7px', letterSpacing: '0.06em',
                            }}>🚨 CẦN CHÚ Ý</span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ex.submitted}/{ex.total} nộp</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div className="progress-bar" style={{ height: 8 }}>
                            <div className="progress-fill" style={{
                              width: `${rate}%`,
                              background: rate >= 80 ? 'var(--accent-green)' : rate >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)',
                            }} />
                          </div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, minWidth: 36, color: rate >= 80 ? 'var(--accent-green)' : rate >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)' }}>{rate}%</span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                        <span>⏱ Thời gian TB: {ex.avg} phút</span>
                        <span style={{ color: stuckRate >= 60 ? '#f87171' : 'var(--text-muted)' }}>
                          🔴 Đang stuck: {ex.stuck} sv ({stuckRate}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly activity */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>📈 Hoạt động trong tuần</div>
              <MiniBarChart data={weeklyData} days={days} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11, color: 'var(--text-secondary)' }}>
                <span>Lượt nộp bài / ngày</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>↑ 12% vs tuần trước</span>
              </div>
            </div>
          </div>

          {/* Right: Alerts + weak students */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Alert box */}
            <div className="card" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.3)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#f87171', marginBottom: 12 }}>🚨 Cảnh báo hệ thống</div>
              {[
                { ex: 'Dynamic Programming', pct: 88, msg: 'Cần giảng lại bài' },
                { ex: 'Greedy Algorithms', pct: 71, msg: 'Tỷ lệ thất bại cao' },
                { ex: 'BFS Graph Traversal', pct: 68, msg: 'Nhiều SV bị stuck > 30 phút' },
              ].map(alert => (
                <div key={alert.ex} style={{
                  padding: '10px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)', marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{alert.ex}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#f87171' }}>{alert.pct}% stuck</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>→ {alert.msg}</div>
                </div>
              ))}
              <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                📣 Thông báo cho cả lớp
              </button>
            </div>

            {/* Weak students */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>
                ⚠️ Sinh viên cần hỗ trợ
              </div>
              {weakStudents.map((sv, i) => (
                <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar" style={{ background: 'var(--gradient-fire)', color: 'white', width: 28, height: 28, fontSize: 10 }}>
                        {sv.name.split(' ').pop()?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{sv.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Stuck {sv.stuck} bài · TB {sv.timeStuck}h</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {sv.skills.map(s => (
                      <span key={s} style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: 20, padding: '2px 8px', fontSize: 10, color: '#f87171',
                      }}>{s}</span>
                    ))}
                  </div>
                  <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '5px', fontSize: 11 }}>
                    💬 Nhắn tin hỗ trợ
                  </button>
                </div>
              ))}
            </div>

            {/* Class performance */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>🎯 Điểm phân phối lớp</div>
              {[
                { range: 'A (90-100)', pct: 18, color: 'var(--accent-green)' },
                { range: 'B (70-89)', pct: 35, color: 'var(--accent-cyan)' },
                { range: 'C (50-69)', pct: 28, color: 'var(--accent-yellow)' },
                { range: 'D (< 50)', pct: 19, color: 'var(--accent-red)' },
              ].map(g => (
                <div key={g.range} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{g.range}</span>
                    <span style={{ fontWeight: 700, color: g.color }}>{g.pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${g.pct}%`, background: g.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
