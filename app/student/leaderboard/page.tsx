import DashboardLayout from '@/app/components/layout/DashboardLayout';

const leaderboard = [
  { rank: 1,  name: 'Phạm Thu Hà',    score: 4820, badge: '🥇', streak: 15, solved: 87, win: 42, avatar: '#f59e0b' },
  { rank: 2,  name: 'Nguyễn M. Khoa', score: 4560, badge: '🥈', streak: 12, solved: 82, win: 38, avatar: '#7c3aed' },
  { rank: 3,  name: 'Trần Thị Lan',   score: 4210, badge: '🥉', streak: 9,  solved: 76, win: 31, avatar: '#06b6d4' },
  { rank: 4,  name: 'Đỗ Quang Vinh',  score: 3890, badge: '',   streak: 7,  solved: 71, win: 27, avatar: '#10b981' },
  { rank: 5,  name: 'Hoàng Thị Mai',  score: 3640, badge: '',   streak: 6,  solved: 68, win: 24, avatar: '#ec4899' },
  { rank: 6,  name: 'Vũ Đức Nam',     score: 3320, badge: '',   streak: 5,  solved: 64, win: 20, avatar: '#f97316' },
  { rank: 7,  name: 'Bùi Thị Thúy',   score: 3100, badge: '',   streak: 3,  solved: 59, win: 17, avatar: '#8b5cf6' },
  { rank: 8,  name: 'Lê Văn Hùng',    score: 2850, badge: '',   streak: 2,  solved: 54, win: 14, avatar: '#64748b' },
];

const badges = [
  { icon: '⚡', name: 'Speed Coder',    desc: 'Giải trong < 5 phút', color: '#f59e0b', earned: true },
  { icon: '🔥', name: 'On Fire',        desc: 'Streak 7 ngày',       color: '#ef4444', earned: true },
  { icon: '🎯', name: 'Perfect Score',  desc: '100% test cases',     color: '#10b981', earned: true },
  { icon: '🤝', name: 'Helper',         desc: 'Giúp 10 bạn',       color: '#06b6d4', earned: false },
  { icon: '🏆', name: 'Battle Master',  desc: 'Thắng 50 trận',      color: '#7c3aed', earned: false },
  { icon: '🧠', name: 'Algorithm God',  desc: 'Giải 100 bài hard',  color: '#ec4899', earned: false },
];

export default function LeaderboardPage() {
  return (
    <DashboardLayout>
      <div className="page-container animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">🏆 Leaderboard & Danh hiệu</h1>
            <p className="page-subtitle">Bảng xếp hạng tuần — CS101 · Cập nhật lúc 22:48</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {['Tuần này', 'Tháng này', 'All-time'].map((t, i) => (
              <button key={t} className={i === 0 ? 'btn btn-primary' : 'btn btn-ghost'} style={{ padding: '7px 14px' }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Top 3 podium */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, padding: '20px 0' }}>
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((sv, podiumI) => {
            const heights = [140, 180, 120];
            const pos = [2, 1, 3];
            return (
              <div key={sv.rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 28 }}>{sv.badge}</div>
                <div className="avatar" style={{
                  background: sv.avatar, color: 'white',
                  width: podiumI === 1 ? 56 : 44, height: podiumI === 1 ? 56 : 44,
                  fontSize: podiumI === 1 ? 16 : 13,
                  boxShadow: podiumI === 1 ? '0 0 24px rgba(245,158,11,0.5)' : 'none',
                  border: podiumI === 1 ? '2px solid #f59e0b' : '2px solid var(--border)',
                }}>
                  {sv.name.split(' ').pop()?.charAt(0)}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>
                  {sv.name.split(' ').slice(-2).join(' ')}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: podiumI === 1 ? '#f59e0b' : 'var(--text-secondary)' }}>
                  {sv.score.toLocaleString()} pts
                </div>
                <div style={{
                  width: podiumI === 1 ? 100 : 80,
                  height: heights[podiumI],
                  background: podiumI === 1 ? 'linear-gradient(to top, rgba(245,158,11,0.3), rgba(245,158,11,0.1))' : 'var(--bg-card)',
                  border: `1px solid ${podiumI === 1 ? '#f59e0b' : 'var(--border)'}`,
                  borderRadius: '8px 8px 0 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 900, color: podiumI === 1 ? '#f59e0b' : 'var(--text-muted)',
                }}>#{pos[podiumI]}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          {/* Full leaderboard */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>
              📋 Bảng xếp hạng đầy đủ
            </div>
            <table className="table">
              <thead>
                <tr><th>#</th><th>Sinh viên</th><th>Điểm</th><th>Solved</th><th>Win Rate</th><th>Streak</th></tr>
              </thead>
              <tbody>
                {leaderboard.map(sv => (
                  <tr key={sv.rank} style={{ background: sv.rank === 2 ? 'rgba(124,58,237,0.04)' : 'transparent' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: sv.rank <= 3 ? '#f59e0b' : 'var(--text-muted)' }}>{sv.rank}</span>
                        {sv.badge && <span>{sv.badge}</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ background: sv.avatar, color: 'white', width: 30, height: 30, fontSize: 11 }}>
                          {sv.name.split(' ').pop()?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{sv.name}</div>
                          {sv.rank === 2 && <span style={{ fontSize: 10, color: 'var(--accent-purple-light)', fontWeight: 600 }}>⭐ Bạn</span>}
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontWeight: 800, fontSize: 15, color: sv.rank === 1 ? '#f59e0b' : 'var(--text-primary)' }}>{sv.score.toLocaleString()}</span></td>
                    <td><span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{sv.solved}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 60 }}>
                          <div className="progress-fill" style={{ width: `${Math.round((sv.win / sv.solved) * 100)}%`, background: 'var(--accent-green)' }} />
                        </div>
                        <span style={{ fontSize: 11 }}>{Math.round((sv.win / sv.solved) * 100)}%</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>🔥 {sv.streak}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>🎖️ Huy chương của bạn</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {badges.map(b => (
                  <div key={b.name} style={{
                    padding: '14px 12px', borderRadius: 10, textAlign: 'center',
                    background: b.earned ? `rgba(${b.color === '#f59e0b' ? '245,158,11' : b.color === '#ef4444' ? '239,68,68' : b.color === '#10b981' ? '16,185,129' : '124,58,237'}, 0.1)` : 'var(--bg-secondary)',
                    border: `1px solid ${b.earned ? b.color + '55' : 'var(--border)'}`,
                    opacity: b.earned ? 1 : 0.4,
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{b.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: b.earned ? 'var(--text-primary)' : 'var(--text-muted)', marginBottom: 3 }}>{b.name}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.3 }}>{b.desc}</div>
                    {b.earned && <div style={{ fontSize: 9, color: b.color, fontWeight: 700, marginTop: 6 }}>✓ ĐẠT ĐƯỢC</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Personal stats */}
            <div className="card" style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.25)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-purple-light)', marginBottom: 14 }}>📊 Thống kê cá nhân</div>
              {[
                { label: 'Hạng hiện tại', value: '#2 / 120', icon: '🏅' },
                { label: 'Điểm tuần này', value: '+340', icon: '⬆️', color: 'var(--accent-green)' },
                { label: 'Streak', value: '12 ngày 🔥', icon: '📅' },
                { label: 'Bài đã giải', value: '82 / 120', icon: '✅' },
                { label: 'Battle thắng', value: '38 / 50', icon: '⚔️' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{s.icon} {s.label}</span>
                  <span style={{ fontWeight: 700, color: s.color || 'var(--text-primary)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
