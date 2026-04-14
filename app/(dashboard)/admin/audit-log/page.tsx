

const logs = [
  { id: 'LOG-0091', time: '22:41:02', user: 'GV. Nguyễn Văn A', role: 'Lecturer', action: 'UPDATE_SCORE', target: 'SV001 - Bài BFS - 8.5 → 9.0', ip: '192.168.1.12', severity: 'warning' },
  { id: 'LOG-0090', time: '22:38:55', user: 'GV. Trần Thị B', role: 'Lecturer', action: 'DELETE_EXAM', target: 'Đề thi: "Kiểm tra giữa kỳ HK1"', ip: '192.168.1.45', severity: 'danger' },
  { id: 'LOG-0089', time: '22:35:10', user: 'GV. Lê Văn C', role: 'Lecturer', action: 'CREATE_EXAM', target: 'Đề thi: "Kiểm tra cuối kỳ HK2"', ip: '192.168.1.78', severity: 'info' },
  { id: 'LOG-0088', time: '22:30:47', user: 'Admin System', role: 'Admin', action: 'CONFIG_UPDATE', target: 'Python timeout: 5s → 10s', ip: '127.0.0.1', severity: 'warning' },
  { id: 'LOG-0087', time: '22:28:31', user: 'GV. Nguyễn Văn A', role: 'Lecturer', action: 'UPDATE_SCORE', target: 'SV005 - Bài DP - 5.0 → 7.5', ip: '192.168.1.12', severity: 'warning' },
  { id: 'LOG-0086', time: '22:20:15', user: 'Admin System', role: 'Admin', action: 'USER_LOGIN', target: 'Admin dashboard', ip: '203.113.1.5', severity: 'info' },
  { id: 'LOG-0085', time: '22:15:03', user: 'GV. Phạm Thị D', role: 'Lecturer', action: 'CREATE_EXERCISE', target: 'Bài: Maximum Subarray (Medium)', ip: '192.168.1.99', severity: 'info' },
  { id: 'LOG-0084', time: '21:58:42', user: 'GV. Trần Thị B', role: 'Lecturer', action: 'KICK_STUDENT', target: 'SV012 - Phòng #A3F2', ip: '192.168.1.45', severity: 'danger' },
];

const actionMeta: Record<string, { label: string; cls: string; icon: string }> = {
  UPDATE_SCORE: { label: 'Sửa điểm', cls: 'badge-yellow', icon: '✏️' },
  DELETE_EXAM: { label: 'Xóa đề thi', cls: 'badge-red', icon: '🗑' },
  CREATE_EXAM: { label: 'Tạo đề thi', cls: 'badge-green', icon: '➕' },
  CONFIG_UPDATE: { label: 'Cấu hình', cls: 'badge-orange', icon: '⚙' },
  USER_LOGIN: { label: 'Đăng nhập', cls: 'badge-cyan', icon: '🔑' },
  CREATE_EXERCISE: { label: 'Tạo bài tập', cls: 'badge-green', icon: '📝' },
  KICK_STUDENT: { label: 'Kick sinh viên', cls: 'badge-red', icon: '⛔' },
};

const severityLeft: Record<string, string> = { info: '#06b6d4', warning: '#f59e0b', danger: '#ef4444' };

export default function AuditLogPage() {
  return (
    <>
      <div className="page-container animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">📋 Log & Audit Trail</h1>
            <p className="page-subtitle">Lịch sử thao tác hệ thống — Bảo đảm tính minh bạch</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost">📤 Export CSV</button>
            <button className="btn btn-ghost">📤 Export PDF</button>
          </div>
        </div>

        <div className="grid-4">
          {[
            { label: 'Hôm nay', value: '91', icon: '📋', color: '#7c3aed' },
            { label: 'Cảnh báo', value: '12', icon: '⚠️', color: '#f59e0b' },
            { label: 'Nguy hiểm', value: '3', icon: '🚨', color: '#ef4444' },
            { label: 'Người dùng', value: '8', icon: '👤', color: '#06b6d4' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1, marginTop: 4 }}>{s.value}</div>
                </div>
                <span style={{ fontSize: 26 }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '14px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="input" placeholder="🔍 Tìm theo user, action, target..." style={{ flex: 1, minWidth: 260 }} />
          <select className="select"><option>Tất cả loại</option><option>Sửa điểm</option><option>Xóa đề thi</option><option>Cấu hình</option></select>
          <select className="select"><option>Tất cả mức độ</option><option>Info</option><option>Cảnh báo</option><option>Nguy hiểm</option></select>
          <select className="select"><option>Tất cả user</option><option>GV. Nguyễn Văn A</option><option>GV. Trần Thị B</option></select>
          <input type="date" className="select" defaultValue="2026-03-06" style={{ width: 140 }} />
          <button className="btn btn-primary">🔍 Lọc</button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr><th>Log ID</th><th>Thời gian</th><th>Người dùng</th><th>Hành động</th><th>Mục tiêu</th><th>IP Address</th><th>Mức độ</th><th></th></tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const meta = actionMeta[log.action] || { label: log.action, cls: 'badge-purple', icon: '•' };
                return (
                  <tr key={log.id} style={{ borderLeft: `3px solid ${severityLeft[log.severity]}` }}>
                    <td><code style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{log.id}</code></td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{log.time}</td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{log.user}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{log.role}</div>
                    </td>
                    <td><span className={`badge ${meta.cls}`}>{meta.icon} {meta.label}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 240 }}>{log.target}</td>
                    <td><code style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{log.ip}</code></td>
                    <td>
                      <span className={`badge ${log.severity === 'danger' ? 'badge-red' : log.severity === 'warning' ? 'badge-yellow' : 'badge-cyan'}`}>
                        {log.severity === 'danger' ? '🚨 Nguy hiểm' : log.severity === 'warning' ? '⚠️ Cảnh báo' : 'ℹ️ Info'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: 11 }}>Chi tiết</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>
            <span>Hiển thị 8 / 91 logs hôm nay</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['‹‹', '‹', '1', '2', '3', '...', '12', '›', '››'].map((p, i) => (
                <button key={i} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11, background: p === '1' ? 'rgba(124,58,237,0.15)' : 'transparent', borderColor: p === '1' ? 'var(--accent-purple)' : 'var(--border)', color: p === '1' ? 'var(--accent-purple-light)' : '' }}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
