import DashboardLayout from '@/components/layout/DashboardLayout';

const codeLines = [
  { num: 1, code: 'def pair_sum(arr, target):', user: null },
  { num: 2, code: '    seen = {}', user: null },
  { num: 3, code: '    result = []', user: null },
  { num: 4, code: '    for i, num in enumerate(arr):', user: 'A' },
  { num: 5, code: '        complement = target - num', user: 'A' },
  { num: 6, code: '        if complement in seen:', user: null },
  { num: 7, code: '            result.append((seen[complement], i))', user: null },
  { num: 8, code: '        seen[num] = i', user: 'B' },
  { num: 9, code: '    return result', user: null },
  { num: 10, code: '', user: null },
  { num: 11, code: '# Test', user: 'B' },
  { num: 12, code: 'print(pair_sum([2,7,11,15], 9))', user: null },
];

const messages = [
  { user: 'A', name: 'Bạn (Minh Khoa)', msg: 'line 8: dùng seen[num] = i hay seen[i] = num nhỉ?', time: '10:42' },
  { user: 'B', name: 'Trần Thị Lan', msg: 'seen[num] = i đúng rồi! vì key là giá trị, value là index', time: '10:43' },
  { user: 'A', name: 'Bạn (Minh Khoa)', msg: 'ok hiểu rồi 👍', time: '10:43' },
  { user: 'B', name: 'Trần Thị Lan', msg: 'chạy test case thử đi', time: '10:44' },
];

export default function PairProgrammingPage() {
  return (
    <DashboardLayout>
      <div className="page-container animate-in" style={{ gap: 16 }}>
        {/* Header */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <h1 className="page-title">👥 Pair Programming</h1>
              <p className="page-subtitle">Bài: Two Sum — CS101 · Phòng #A3F2</p>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 6px var(--accent-green)' }} />
              <span style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>Live</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Active users */}
            <div style={{ display: 'flex', alignItems: 'center', gap: -4 }}>
              {['#7c3aed', '#06b6d4'].map((c, i) => (
                <div key={i} className="avatar" style={{ background: c, color: 'white', width: 30, height: 30, fontSize: 11, marginLeft: i > 0 ? -8 : 0, border: '2px solid var(--bg-primary)' }}>
                  {i === 0 ? 'A' : 'B'}
                </div>
              ))}
              <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-secondary)' }}>2 người đang code</span>
            </div>
            <button className="btn btn-ghost">🔗 Mời thêm</button>
            <button className="btn btn-primary">▶ Chạy code</button>
          </div>
        </div>

        {/* Main layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 14, flex: 1, minHeight: 0 }}>
          {/* Code editor */}
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', gridColumn: 'span 2' }}>
            {/* Editor tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              {['solution.py', 'test.py'].map((tab, i) => (
                <div key={tab} style={{
                  padding: '10px 18px', fontSize: 12, fontWeight: i === 0 ? 600 : 400,
                  color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderBottom: i === 0 ? '2px solid var(--accent-purple)' : '2px solid transparent',
                  cursor: 'pointer',
                }}>{tab}</div>
              ))}
              <div style={{ marginLeft: 'auto', padding: '0 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <select className="select" style={{ padding: '4px 10px', fontSize: 12 }}>
                  <option>Python 3.11</option><option>C++ 17</option>
                </select>
              </div>
            </div>

            {/* Code area */}
            <div style={{ flex: 1, overflow: 'auto', padding: '10px 0', background: 'var(--bg-primary)' }}>
              {codeLines.map((line) => (
                <div key={line.num} style={{
                  display: 'flex', alignItems: 'center',
                  padding: '1px 16px',
                  background: line.user ? (line.user === 'A' ? 'rgba(124,58,237,0.07)' : 'rgba(6,182,212,0.07)') : 'transparent',
                  position: 'relative',
                }}>
                  <span className="code-line-number">{line.num}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>
                    {line.code}
                  </span>
                  {line.user && (
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: line.user === 'A' ? 'var(--accent-purple)' : 'var(--accent-cyan)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 800, color: 'white', flexShrink: 0,
                    }}>{line.user}</div>
                  )}
                </div>
              ))}
              {/* Cursor B */}
              <div style={{ display: 'flex', padding: '2px 16px', alignItems: 'center' }}>
                <span className="code-line-number">13</span>
                <span style={{ display: 'inline-block', width: 2, height: 16, background: 'var(--accent-cyan)' }} className="blink" />
                <span style={{ fontSize: 10, color: 'var(--accent-cyan)', marginLeft: 6, fontWeight: 600 }}>Trần T. Lan đang gõ...</span>
              </div>
            </div>

            {/* Output */}
            <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: '10px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Output</div>
              <div className="code-block" style={{ padding: '8px 12px', fontSize: 12 }}>
                <span className="code-string">[(0, 1)]</span>
                <br /><span style={{ color: 'var(--accent-green)', fontSize: 11 }}>✓ Chạy thành công · 0.02s</span>
              </div>
            </div>
          </div>

          {/* Chat panel */}
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              💬 Chat nhóm
              <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 6px var(--accent-green)' }} />
            </div>

            {/* Users */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { name: 'Minh Khoa (Bạn)', color: '#7c3aed', role: 'Driver' },
                { name: 'Trần Thị Lan', color: '#06b6d4', role: 'Navigator' },
              ].map(u => (
                <div key={u.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="avatar" style={{ background: u.color, color: 'white', width: 26, height: 26, fontSize: 10 }}>{u.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{u.role}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)' }} />
                </div>
              ))}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div className="avatar" style={{ background: msg.user === 'A' ? '#7c3aed' : '#06b6d4', color: 'white', width: 24, height: 24, fontSize: 9, flexShrink: 0, marginTop: 2 }}>
                    {msg.user}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{msg.name} · {msg.time}</div>
                    <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '0 8px 8px 8px', padding: '8px 10px', fontSize: 12, color: 'var(--text-primary)' }}>
                      {msg.msg}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <input className="input" placeholder="Nhắn tin..." style={{ flex: 1, fontSize: 12 }} />
              <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: 16 }}>➤</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
