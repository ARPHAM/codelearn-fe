import DashboardLayout from '@/app/components/layout/DashboardLayout';

const opponents = [
  { name: 'Phạm Thu Hà', rank: '#1', win: 42, rating: 1850, avatar: '#f59e0b', status: 'ready' },
  { name: 'Trần Thị Lan', rank: '#3', win: 31, rating: 1720, avatar: '#06b6d4', status: 'battle' },
  { name: 'Vũ Đức Nam', rank: '#6', win: 20, rating: 1560, avatar: '#f97316', status: 'ready' },
];

const battleCode = [
  '// Tìm dãy con có tổng lớn nhất (Kadane\'s Algorithm)',
  'def max_subarray(nums):',
  '    max_sum = nums[0]',
  '    cur_sum = nums[0]',
  '    for n in nums[1:]:',
  '        cur_sum = max(n, cur_sum + n)',
  '        max_sum = max(max_sum, cur_sum) |',
];

export default function CodeBattlePage() {
  const timeLeft = { min: '11', sec: '34' };
  return (
    <DashboardLayout>
      <div className="page-container animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">⚔️ Code Battle</h1>
            <p className="page-subtitle">Thi đấu thuật toán 1v1 hoặc theo nhóm — Thời gian giới hạn</p>
          </div>
        </div>

        {/* Active battle banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(249,115,22,0.1))',
          border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: 12, padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} className="pulse-glow" />
            <span style={{ fontWeight: 800, fontSize: 16, color: '#f87171' }}>⚡ TRẬN ĐẤU ĐANG DIỄN RA</span>
            <span className="badge badge-red">LIVE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Thời gian còn lại</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#f87171', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
                {timeLeft.min}:{timeLeft.sec}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Lobby */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Battle modes */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🎮 Chọn chế độ đấu</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { mode: '1 vs 1', desc: 'Đấu đơn', icon: '⚔️', color: '#7c3aed', active: true },
                  { mode: 'Team 2v2', desc: 'Đấu đội', icon: '👥', color: '#06b6d4', active: false },
                  { mode: 'Battle Royale', desc: '8 người', icon: '🏟️', color: '#f97316', active: false },
                  { mode: 'Speed Run', desc: '5 phút', icon: '⚡', color: '#f59e0b', active: false },
                ].map(m => (
                  <div key={m.mode} style={{
                    padding: '12px', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                    background: m.active ? `rgba(124,58,237,0.12)` : 'var(--bg-secondary)',
                    border: `1px solid ${m.active ? m.color : 'var(--border)'}`,
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{m.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: m.active ? m.color : 'var(--text-primary)' }}>{m.mode}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Problem */}
            <div className="card" style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-purple-light)' }}>📋 Bài thi hiện tại</div>
                <span className="badge badge-yellow">Medium</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Maximum Subarray</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                Cho một mảng số nguyên <code style={{ background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: 3, fontFamily: 'monospace' }}>nums</code>,
                tìm dãy con liên tiếp có tổng lớn nhất và trả về tổng đó.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Input', val: '[-2,1,-3,4,-1,2,1,-5,4]' },
                  { label: 'Output', val: '6' },
                ].map(ex => (
                  <div key={ex.label} style={{ background: 'var(--bg-primary)', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{ex.label}</div>
                    <code style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent-cyan-light)' }}>{ex.val}</code>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>⚔️ Tìm đối thủ ngay</button>
            </div>

            {/* Matchmaking */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>
                🔍 Lobby ({opponents.filter(o => o.status === 'ready').length} đang chờ)
              </div>
              {opponents.map((op, i) => (
                <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar" style={{ background: op.avatar, color: 'white' }}>
                    {op.name.split(' ').pop()?.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{op.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{op.rank} · {op.win} thắng · Rating {op.rating}</div>
                  </div>
                  <span className={`badge ${op.status === 'ready' ? 'badge-green' : 'badge-red'}`}>
                    {op.status === 'ready' ? '● Sẵn sàng' : '⚔️ Đang đấu'}
                  </span>
                  {op.status === 'ready' && (
                    <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: 11 }}>Thách đấu</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live battle view */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* VS header */}
            <div className="card" style={{ padding: '14px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                  <div className="avatar" style={{ background: '#7c3aed', color: 'white', width: 40, height: 40 }}>K</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Minh Khoa (Bạn)</div>
                    <div style={{ fontSize: 11, color: 'var(--accent-purple-light)' }}>Rating 1680 ⭐</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '0 16px' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent-red)' }}>VS</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700 }}>Phạm Thu Hà</div>
                    <div style={{ fontSize: 11, color: '#f59e0b' }}>Rating 1850 🏆</div>
                  </div>
                  <div className="avatar" style={{ background: '#f59e0b', color: 'white', width: 40, height: 40 }}>H</div>
                </div>
              </div>
              {/* Progress bars */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 8 }}>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: '65%', background: 'var(--accent-purple)', float: 'right' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-purple)', minWidth: 32, textAlign: 'center' }}>65%</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', minWidth: 32, textAlign: 'center' }}>82%</span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: '82%', background: '#f59e0b' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
                  <span>13/20 test cases</span>
                  <span>Tiến độ</span>
                  <span>16/20 test cases</span>
                </div>
              </div>
            </div>

            {/* Live code */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>💻 Code của bạn</span>
                <span className="badge badge-cyan">Python 3.11</span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '10px 0', minHeight: 200 }}>
                {battleCode.map((line, i) => (
                  <div key={i} style={{ padding: '2px 16px', display: 'flex', alignItems: 'center' }}>
                    <span className="code-line-number">{i + 1}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, color: i === 0 ? 'var(--text-muted)' : i === 1 ? '#ff7b72' : i === 2 || i === 3 ? '#79c0ff' : 'var(--text-primary)' }}>
                      {line.includes('|') ? (
                        <>{line.replace('|', '')}<span className="blink" style={{ display: 'inline-block', width: 2, height: 14, background: 'var(--accent-purple)', marginLeft: 1 }} /></>
                      ) : line}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>▶ Submit</button>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>🧹 Reset</button>
              </div>
            </div>

            {/* Real-time leaderboard in battle */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>📊 Live Standings</div>
              {[
                { rank: 1, name: 'Phạm Thu Hà', pass: 16, color: '#f59e0b' },
                { rank: 2, name: 'Minh Khoa (Tôi)', pass: 13, color: '#7c3aed' },
              ].map(s => (
                <div key={s.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontWeight: 800, color: s.rank === 1 ? '#f59e0b' : 'var(--text-muted)', minWidth: 16 }}>#{s.rank}</span>
                  <span style={{ fontSize: 12, flex: 1 }}>{s.name}</span>
                  <div className="progress-bar" style={{ width: 80 }}>
                    <div className="progress-fill" style={{ width: `${(s.pass / 20) * 100}%`, background: s.color }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.color, minWidth: 36 }}>{s.pass}/20</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
