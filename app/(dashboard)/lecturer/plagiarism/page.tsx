

const students = ['Nguyễn M. Khoa', 'Trần T. Lan', 'Lê V. Hùng', 'Phạm T. Hà', 'Đỗ Q. Vinh', 'Hoàng T. Mai', 'Vũ Đức Nam', 'Bùi T. Thúy'];

const matrix = [
  [100, 82, 5, 3, 78, 12, 8, 4],
  [82, 100, 6, 2, 75, 10, 7, 3],
  [5, 6, 100, 15, 4, 9, 22, 11],
  [3, 2, 15, 100, 3, 8, 19, 14],
  [78, 75, 4, 3, 100, 11, 6, 2],
  [12, 10, 9, 8, 11, 100, 18, 27],
  [8, 7, 22, 19, 6, 18, 100, 35],
  [4, 3, 11, 14, 2, 27, 35, 100],
];

const detectedPairs = [
  { a: 'Nguyễn M. Khoa', b: 'Đỗ Q. Vinh', sim: 82, risk: 'high', lines: '42–67, 88–102' },
  { a: 'Trần T. Lan', b: 'Đỗ Q. Vinh', sim: 75, risk: 'high', lines: '15–38, 55–71' },
  { a: 'Vũ Đức Nam', b: 'Bùi T. Thúy', sim: 35, risk: 'medium', lines: '22–29' },
  { a: 'Hoàng T. Mai', b: 'Bùi T. Thúy', sim: 27, risk: 'medium', lines: '78–84' },
];

function simColor(v: number): string {
  if (v >= 70) return '#ef4444';
  if (v >= 40) return '#f59e0b';
  if (v >= 20) return '#7c3aed';
  if (v === 100) return '#374151';
  return 'transparent';
}
function simTextColor(v: number): string {
  if (v === 100) return '#6b7280';
  if (v >= 70) return '#fff';
  if (v >= 20) return '#fff';
  return 'var(--text-muted)';
}

export default function PlagiarismPage() {
  return (
    <>
      <div className="page-container animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">🔍 Phát hiện Đạo văn</h1>
            <p className="page-subtitle">Phân tích tương đồng mã nguồn (AST Similarity) — Bài: BFS Graph Traversal</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select className="select">
              <option>BFS Graph Traversal</option>
              <option>Dynamic Programming</option>
            </select>
            <button className="btn btn-primary">🔄 Phân tích lại</button>
            <button className="btn btn-ghost">📤 Xuất báo cáo</button>
          </div>
        </div>

        {/* Legend + stats */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Mức độ tương đồng:</span>
          {[
            { color: '#ef4444', label: '≥70% Nguy hiểm' },
            { color: '#f59e0b', label: '40–69% Cảnh báo' },
            { color: '#7c3aed', label: '20–39% Chú ý' },
            { color: 'var(--bg-hover)', label: '<20% Bình thường' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: l.color }} />
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{l.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
          {/* Similarity Matrix */}
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>
              📊 Ma trận tương đồng
            </div>
            <div style={{ padding: 20, overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'separate', borderSpacing: 3 }}>
                <thead>
                  <tr>
                    <th style={{ width: 100, padding: '4px 8px', textAlign: 'left', fontSize: 10, color: 'var(--text-muted)' }}></th>
                    {students.map(s => (
                      <th key={s} style={{ padding: '4px 6px', fontSize: 9, color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.split(' ').slice(-1)[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((rowStudent, i) => (
                    <tr key={rowStudent}>
                      <td style={{ padding: '4px 8px', fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {rowStudent.split(' ').slice(0, 2).join(' ')}
                      </td>
                      {matrix[i].map((val, j) => (
                        <td key={j} style={{
                          width: 44, height: 38, textAlign: 'center',
                          background: i === j ? 'var(--bg-secondary)' : simColor(val),
                          borderRadius: 4,
                          fontSize: 11, fontWeight: 700,
                          color: i === j ? 'var(--text-muted)' : simTextColor(val),
                          position: 'relative',
                          cursor: val >= 40 && i !== j ? 'pointer' : 'default',
                        }}>
                          {i === j ? '—' : val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detected pairs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>
                🚨 Cặp bị phát hiện ({detectedPairs.length})
              </div>
              {detectedPairs.map((pair, i) => (
                <div key={i} style={{
                  padding: '14px 16px', borderBottom: '1px solid var(--border-light)',
                  borderLeft: `3px solid ${pair.risk === 'high' ? '#ef4444' : '#f59e0b'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>
                      {pair.a} ↔ {pair.b}
                    </div>
                    <span className={`badge ${pair.risk === 'high' ? 'badge-red' : 'badge-yellow'}`}>
                      {pair.sim}%
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    📌 Dòng trùng: <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan-light)' }}>{pair.lines}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>👁 Xem chi tiết</button>
                    <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 11 }}>⚠️ Đánh dấu</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Code diff sample */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 13, color: 'var(--accent-red)' }}>
                📎 Đoạn code trùng khớp
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                {['Nguyễn M. Khoa', 'Đỗ Q. Vinh'].map((name, idx) => (
                  <div key={name} style={{ padding: 12, borderRight: idx === 0 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>{name}</div>
                    <div className="code-block" style={{ padding: '8px 10px', fontSize: 10.5 }}>
                      {['def bfs(graph, start):', '    visited = set()', '    queue = [start]', '    while queue:', '        node = queue.pop(0)', '        visited.add(node)'].map((line, li) => (
                        <div key={li} style={{
                          background: li >= 2 && li <= 4 ? 'rgba(239,68,68,0.12)' : 'transparent',
                          margin: '0 -8px', padding: '1px 8px', borderRadius: 2,
                        }}>
                          <span className="code-line-number">{li + 42}</span>
                          <span className={li === 0 ? 'code-keyword' : li === 1 || li === 2 ? 'code-func' : ''}>{line}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
