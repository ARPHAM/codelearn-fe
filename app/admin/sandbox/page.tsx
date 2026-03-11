import DashboardLayout from '@/components/layout/DashboardLayout';

const sandboxJobs = [
  { id: 'JOB-4821', student: 'Nguyễn M. Khoa', exercise: 'Binary Search', lang: 'C++', cpu: 78, ram: 62, status: 'running', time: '1.2s / 5s' },
  { id: 'JOB-4822', student: 'Trần Thị Lan', exercise: 'BFS Graph', lang: 'Python', cpu: 45, ram: 88, status: 'running', time: '2.8s / 5s' },
  { id: 'JOB-4823', student: 'Lê Văn Hùng', exercise: 'Dynamic Prog', lang: 'Java', cpu: 91, ram: 71, status: 'warning', time: '4.1s / 5s' },
  { id: 'JOB-4820', student: 'Phạm Thu Hà', exercise: 'Quicksort', lang: 'C++', cpu: 0, ram: 0, status: 'done', time: '0.3s / 5s' },
  { id: 'JOB-4819', student: 'Đỗ Quang Vinh', exercise: 'BFS Graph', lang: 'Python', cpu: 0, ram: 0, status: 'timeout', time: '5.0s / 5s' },
];

const langLimits = [
  { lang: 'C++', icon: '⚙️', cpu: '1 vCPU', ram: '256 MB', timeout: '5s', active: true },
  { lang: 'Python', icon: '🐍', cpu: '0.5 vCPU', ram: '128 MB', timeout: '10s', active: true },
  { lang: 'Java', icon: '☕', cpu: '1 vCPU', ram: '512 MB', timeout: '10s', active: true },
  { lang: 'Node.js', icon: '🟢', cpu: '0.5 vCPU', ram: '256 MB', timeout: '10s', active: false },
];

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = { running: '#10b981', warning: '#f59e0b', done: '#374151', timeout: '#ef4444' };
  const labels: Record<string, string> = { running: 'Running', warning: '⚠ High CPU', done: 'Done', timeout: 'Timeout' };
  const badgeMap: Record<string, string> = { running: 'badge-green', warning: 'badge-yellow', done: '', timeout: 'badge-red' };
  return <span className={`badge ${badgeMap[status] || ''}`} style={!badgeMap[status] ? { background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' } : {}}>{labels[status]}</span>;
}

function CPUBar({ val }: { val: number }) {
  const color = val >= 85 ? '#ef4444' : val >= 60 ? '#f59e0b' : '#10b981';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="progress-bar" style={{ width: 64 }}>
        <div className="progress-fill" style={{ width: val ? `${val}%` : '0%', background: color }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: val ? color : 'var(--text-muted)', minWidth: 30 }}>{val ? `${val}%` : '—'}</span>
    </div>
  );
}

export default function SandboxPage() {
  return (
    <DashboardLayout>
      <div className="page-container animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">🐳 Quản lý Sandbox Resources</h1>
            <p className="page-subtitle">Giám sát tài nguyên Docker container — Giới hạn CPU & RAM per submission</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost">🔄 Refresh</button>
            <button className="btn btn-danger">⛔ Kill All</button>
          </div>
        </div>

        {/* System resource overview */}
        <div className="grid-4">
          {[
            { label: 'Jobs đang chạy', value: '3', icon: '▶', color: '#10b981' },
            { label: 'CPU Server TB', value: '68%', icon: '💻', color: '#f59e0b' },
            { label: 'RAM Server TB', value: '74%', icon: '🧠', color: '#06b6d4' },
            { label: 'Jobs hôm nay', value: '284', icon: '📊', color: '#7c3aed' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1, marginTop: 4 }}>{s.value}</div>
                </div>
                <span style={{ fontSize: 26 }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          {/* Active jobs */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>🟢 Container Jobs đang chạy</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 6px var(--accent-green)' }} />
                <span style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 600 }}>Live monitoring</span>
              </div>
            </div>
            <table className="table">
              <thead>
                <tr><th>Job ID</th><th>Sinh viên</th><th>Bài tập</th><th>Lang</th><th>CPU</th><th>RAM</th><th>Thời gian</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {sandboxJobs.map(job => (
                  <tr key={job.id}>
                    <td><code style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--accent-cyan)' }}>{job.id}</code></td>
                    <td style={{ fontSize: 12, fontWeight: 600 }}>{job.student}</td>
                    <td style={{ fontSize: 12 }}>{job.exercise}</td>
                    <td><span className={`badge ${job.lang === 'Python' ? 'badge-cyan' : job.lang === 'Java' ? 'badge-orange' : 'badge-purple'}`}>{job.lang}</span></td>
                    <td><CPUBar val={job.cpu} /></td>
                    <td><CPUBar val={job.ram} /></td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>{job.time}</td>
                    <td><StatusDot status={job.status} /></td>
                    <td>
                      {job.status === 'running' || job.status === 'warning' ? (
                        <button className="btn btn-danger" style={{ padding: '3px 8px', fontSize: 10 }}>Kill</button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resource limits config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>
                ⚙️ Giới hạn tài nguyên / Ngôn ngữ
              </div>
              {langLimits.map(lang => (
                <div key={lang.lang} style={{
                  padding: '14px 16px', borderBottom: '1px solid var(--border-light)',
                  opacity: lang.active ? 1 : 0.5,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{lang.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{lang.lang}</span>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <div style={{
                        width: 36, height: 20, borderRadius: 10,
                        background: lang.active ? 'var(--accent-green)' : 'var(--bg-hover)',
                        position: 'relative', transition: 'background 0.2s',
                      }}>
                        <div style={{
                          position: 'absolute', top: 2, left: lang.active ? 18 : 2, width: 16, height: 16,
                          borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: lang.active ? 'var(--accent-green)' : 'var(--text-muted)' }}>{lang.active ? 'ON' : 'OFF'}</span>
                    </label>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {[{ label: 'CPU', val: lang.cpu }, { label: 'RAM', val: lang.ram }, { label: 'Timeout', val: lang.timeout }].map(r => (
                      <div key={r.label} style={{ background: 'var(--bg-secondary)', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>{r.label}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{r.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ padding: '12px 16px' }}>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>💾 Lưu cấu hình</button>
              </div>
            </div>

            {/* Global limits */}
            <div className="card" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.25)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#f87171', marginBottom: 12 }}>🔒 Giới hạn toàn cục</div>
              {[
                { label: 'Max concurrent jobs', value: '20' },
                { label: 'Max queue size', value: '100' },
                { label: 'Network access', value: 'Disabled' },
                { label: 'File system write', value: '/tmp only' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
