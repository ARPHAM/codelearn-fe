

const aiMessages = [
  {
    role: 'assistant',
    msg: '👋 Xin chào! Tôi là AI Assistant. Tôi thấy code của bạn gặp lỗi **IndexError** tại dòng 8. Để tôi giải thích nhé!',
  },
  {
    role: 'assistant',
    msg: '**Nguyên nhân:** Bạn đang truy cập `arr[i+1]` nhưng khi `i = len(arr)-1` thì `i+1` vượt ra ngoài phạm vi mảng.\n\n**Gợi ý sửa:** Thêm điều kiện `i < len(arr) - 1` trước khi truy cập.',
  },
  { role: 'user', msg: 'Nếu mảng rỗng thì sao?' },
  {
    role: 'assistant',
    msg: 'Câu hỏi hay! 🎯 Nếu mảng rỗng (`len(arr) == 0`), bạn nên kiểm tra đầu hàm và trả về ngay:\n```python\nif not arr: return -1\n```',
  },
];

const editorLines = [
  { n: 1, code: 'def find_peak(arr):', err: false },
  { n: 2, code: '    if not arr:', err: false },
  { n: 3, code: '        return -1', err: false },
  { n: 4, code: '    peak = 0', err: false },
  { n: 5, code: '    for i in range(len(arr)):', err: false },
  { n: 6, code: '        if arr[i] > arr[peak]:', err: false },
  { n: 7, code: '            peak = i', err: false },
  { n: 8, code: '        if i < len(arr) - 1 and arr[i] < arr[i+1]:', err: true },
  { n: 9, code: '            continue', err: false },
  { n: 10, code: '    return peak', err: false },
  { n: 11, code: '', err: false },
  { n: 12, code: '# Test', err: false },
  { n: 13, code: 'print(find_peak([1, 3, 2, 5, 4]))', err: false },
];

export default function CodeEditorPage() {
  const stuckMinutes = 32;
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 14 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 className="page-title">💻 Code Editor + 🤖 AI Assistant</h1>
            <p className="page-subtitle">Bài: Find Peak Element · Python 3.11 · CS101-A</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Stuck timer */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: '6px 14px',
            }}>
              <span style={{ fontSize: 14 }}>⏱</span>
              <div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Đang stuck</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#f87171' }}>{stuckMinutes} phút</div>
              </div>
              <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />
              <div style={{ fontSize: 11, color: '#f87171', fontWeight: 600 }}>AI đang hỗ trợ 🤖</div>
            </div>
            <button className="btn btn-ghost">💾 Lưu</button>
            <button className="btn btn-primary">▶ Chạy code</button>
            <button className="btn btn-ghost" style={{ color: 'var(--accent-green)', borderColor: 'rgba(16,185,129,0.4)' }}>📤 Nộp bài</button>
          </div>
        </div>

        {/* Main 3-panel layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 340px', gap: 14, flex: 1, minHeight: 0 }}>

          {/* Left: Problem statement */}
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>📋 Đề bài</div>
              <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
                <span className="badge badge-yellow">Medium</span>
                <span className="badge badge-cyan">Search</span>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Find Peak Element</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
                Một phần tử đỉnh là phần tử lớn hơn các phần tử kề cạnh. Cho mảng <code style={{ background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: 3, fontFamily: 'monospace' }}>nums</code>,
                tìm và trả về chỉ số của một phần tử đỉnh bất kỳ.
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Ví dụ:</div>
              {[
                { input: '[1, 2, 3, 1]', output: '2', note: 'nums[2]=3 là đỉnh' },
                { input: '[1, 2, 1, 3, 5, 6, 4]', output: '5', note: 'nums[5]=6 là đỉnh' },
              ].map((ex, i) => (
                <div key={i} style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px', marginBottom: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Ví dụ {i + 1}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11 }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Input:</span> <span className="code-string">{ex.input}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Output:</span> <span className="code-number">{ex.output}</span></div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 2 }}>{ex.note}</div>
                  </div>
                </div>
              ))}

              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)', marginTop: 14 }}>Ràng buộc:</div>
              {['1 ≤ nums.length ≤ 1000', 'O(log n) (Bonus)', 'nums[i] ≠ nums[i+1]'].map(c => (
                <div key={c} style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '4px 0', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--accent-purple)' }}>•</span> {c}
                </div>
              ))}

              {/* Test cases */}
              <div style={{ marginTop: 16, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Test Cases (5/10):</div>
              {[
                { n: 1, status: 'pass' }, { n: 2, status: 'pass' }, { n: 3, status: 'fail' },
                { n: 4, status: 'pass' }, { n: 5, status: 'pass' },
              ].map(tc => (
                <div key={tc.n} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, fontSize: 11 }}>
                  <span>{tc.status === 'pass' ? '✅' : '❌'}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Test #{tc.n}</span>
                  <span style={{ marginLeft: 'auto', color: tc.status === 'pass' ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600, fontSize: 10 }}>
                    {tc.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Code editor */}
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Editor header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <div style={{ padding: '10px 18px', fontSize: 12, fontWeight: 600, borderBottom: '2px solid var(--accent-purple)', color: 'var(--text-primary)' }}>solution.py</div>
              <div style={{ marginLeft: 'auto', padding: '0 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
                <select className="select" style={{ padding: '4px 10px', fontSize: 11 }}>
                  <option>Python 3.11</option><option>C++ 17</option><option>Java 21</option>
                </select>
                <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>🔀 Format</button>
              </div>
            </div>

            {/* Code lines */}
            <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-primary)', padding: '8px 0' }}>
              {editorLines.map((line) => (
                <div key={line.n} style={{
                  display: 'flex', alignItems: 'center', padding: '2px 16px',
                  background: line.err ? 'rgba(239,68,68,0.08)' : 'transparent',
                  borderLeft: line.err ? '3px solid var(--accent-red)' : '3px solid transparent',
                }}>
                  <span className="code-line-number" style={{ color: line.err ? '#f87171' : undefined }}>{line.n}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, flex: 1 }}>
                    {line.code.startsWith('def ') ? <><span className="code-keyword">def </span><span className="code-func">{line.code.slice(4)}</span></> :
                      line.code.startsWith('#') ? <span className="code-comment">{line.code}</span> :
                        line.code.startsWith('    if') || line.code.startsWith('    for') ? <><span style={{ color: 'var(--text-muted)' }}>{'    '}</span><span className="code-keyword">{line.code.trim().split(' ')[0]}</span><span className="code-string"> {line.code.trim().slice(line.code.trim().split(' ')[0].length)}</span></> :
                          <span>{line.code}</span>}
                  </span>
                  {line.err && <span style={{ fontSize: 11, color: '#f87171' }}>⚠ IndexError</span>}
                </div>
              ))}
              {/* Cursor */}
              <div style={{ display: 'flex', padding: '2px 16px', alignItems: 'center' }}>
                <span className="code-line-number">14</span>
                <span className="blink" style={{ display: 'inline-block', width: 2, height: 16, background: 'var(--accent-purple)' }} />
              </div>
            </div>

            {/* Terminal output */}
            <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid var(--border)', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Terminal</span>
                <span className="badge badge-red" style={{ fontSize: 9 }}>ERROR</span>
              </div>
              <div className="code-block" style={{ margin: '10px 16px', borderColor: 'rgba(239,68,68,0.3)' }}>
                <div><span className="code-comment">$ python solution.py</span></div>
                <div style={{ color: '#f87171', marginTop: 4 }}>IndexError: list index out of range</div>
                <div style={{ color: '#f87171', fontSize: 11 }}>  File &quot;solution.py&quot;, line 8, in find_peak</div>
                <div style={{ color: '#f87171', fontSize: 11 }}>    if i &lt; len(arr) - 1 and arr[i] &lt; arr[i+1]:</div>
              </div>
            </div>
          </div>

          {/* Right: AI Assistant */}
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderColor: 'rgba(124,58,237,0.4)' }}>
            {/* AI header */}
            <div style={{
              padding: '14px 16px', borderBottom: '1px solid rgba(124,58,237,0.2)',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.08))',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'var(--gradient-purple)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, boxShadow: 'var(--shadow-glow-purple)',
              }}>🤖</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13 }}>AI Code Assistant</div>
                <div style={{ fontSize: 10, color: 'var(--accent-purple-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 4px var(--accent-green)' }} />
                  Đang phân tích code
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span className="badge badge-purple" style={{ fontSize: 9 }}>Gemini</span>
              </div>
            </div>

            {/* AI quick actions */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['🐛 Giải thích lỗi', '💡 Gợi ý fix', '📚 Hint'].map(a => (
                <button key={a} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>{a}</button>
              ))}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {aiMessages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                  {m.role === 'assistant' && (
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--gradient-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth: '85%',
                    background: m.role === 'user' ? 'rgba(124,58,237,0.15)' : 'var(--bg-secondary)',
                    border: `1px solid ${m.role === 'user' ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
                    borderRadius: m.role === 'user' ? '12px 0 12px 12px' : '0 12px 12px 12px',
                    padding: '10px 12px',
                    fontSize: 12, lineHeight: 1.6,
                  }}>
                    {m.msg.split('\n').map((line, li) => {
                      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      return <div key={li} dangerouslySetInnerHTML={{ __html: bold }} />;
                    })}
                  </div>
                </div>
              ))}

              {/* AI typing */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--gradient-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🤖</div>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '0 12px 12px 12px', padding: '10px 14px', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-purple)', animation: `blink 1.2s ${d}s infinite` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Input */}
            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <input className="input" placeholder="Hỏi AI về code..." style={{ flex: 1, fontSize: 12 }} />
              <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: 14 }}>➤</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
