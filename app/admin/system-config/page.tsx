import DashboardLayout from '@/components/layout/DashboardLayout';

const languages = [
  { lang: 'C++', version: 'GCC 13.2', icon: '⚙️', color: '#06b6d4', enabled: true, libs: ['STL', 'bits/stdc++.h'], timeout: 5, mem: 256 },
  { lang: 'Python', version: 'CPython 3.11', icon: '🐍', color: '#f59e0b', enabled: true, libs: ['math', 'collections', 'itertools', 'heapq'], timeout: 10, mem: 128 },
  { lang: 'Java', version: 'OpenJDK 21', icon: '☕', color: '#ef4444', enabled: true, libs: ['java.util.*', 'java.math.*'], timeout: 10, mem: 512 },
  { lang: 'JavaScript', version: 'Node.js 20 LTS', icon: '🟨', color: '#10b981', enabled: false, libs: ['lodash'], timeout: 8, mem: 128 },
  { lang: 'Go', version: 'Go 1.22', icon: '🐹', color: '#7c3aed', enabled: false, libs: ['fmt', 'sort', 'math'], timeout: 5, mem: 128 },
];

const systemSettings = [
  {
    group: 'Sandbox', settings: [
      { key: 'Max concurrent executions', value: '20', type: 'number' },
      { key: 'Default timeout (s)', value: '5', type: 'number' },
      { key: 'Default memory limit (MB)', value: '128', type: 'number' },
      { key: 'Enable network access', value: 'false', type: 'toggle' },
    ]
  },
  {
    group: 'Plagiarism', settings: [
      { key: 'Detection algorithm', value: 'AST + Token', type: 'select' },
      { key: 'Warning threshold (%)', value: '40', type: 'number' },
      { key: 'Danger threshold (%)', value: '70', type: 'number' },
      { key: 'Auto-flag submissions', value: 'true', type: 'toggle' },
    ]
  },
];

export default function SystemConfigPage() {
  return (
    <DashboardLayout>
      <div className="page-container animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">🔧 Cấu hình Hệ thống</h1>
            <p className="page-subtitle">Quản lý ngôn ngữ lập trình, compiler settings và cấu hình toàn cục</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost">↩ Khôi phục mặc định</button>
            <button className="btn btn-primary">💾 Lưu tất cả</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          {/* Languages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              🖥️ Ngôn ngữ lập trình được hỗ trợ
              <span className="badge badge-green">{languages.filter(l => l.enabled).length} active</span>
            </div>

            {languages.map(lang => (
              <div key={lang.lang} className="card" style={{ opacity: lang.enabled ? 1 : 0.6, borderLeft: `3px solid ${lang.enabled ? lang.color : 'var(--border)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{lang.icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{lang.lang}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{lang.version}</div>
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <span style={{ fontSize: 12, color: lang.enabled ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {lang.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <div style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: lang.enabled ? 'var(--accent-green)' : 'var(--bg-hover)',
                      position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
                    }}>
                      <div style={{
                        position: 'absolute', top: 3, left: lang.enabled ? 22 : 3,
                        width: 18, height: 18, borderRadius: '50%', background: 'white',
                        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                      }} />
                    </div>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                  {[
                    { label: 'Timeout', val: `${lang.timeout}s`, icon: '⏱' },
                    { label: 'Memory', val: `${lang.mem} MB`, icon: '🧠' },
                    { label: 'Network', val: 'Disabled', icon: '🌐' },
                  ].map(r => (
                    <div key={r.label} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{r.icon} {r.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{r.val}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    📦 Thư viện cho phép
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {lang.libs.map(lib => (
                      <span key={lib} style={{
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                        borderRadius: 20, padding: '3px 10px', fontSize: 11,
                        fontFamily: 'monospace', color: lang.enabled ? lang.color : 'var(--text-muted)',
                      }}>{lib}</span>
                    ))}
                    <span style={{
                      background: 'transparent', border: '1px dashed var(--border)',
                      borderRadius: 20, padding: '3px 10px', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer',
                    }}>+ Thêm</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: System settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {systemSettings.map(group => (
              <div key={group.group} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>
                  ⚙️ {group.group} Settings
                </div>
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {group.settings.map(s => (
                    <div key={s.key}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.key}</label>
                      {s.type === 'toggle' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                            background: s.value === 'true' ? 'var(--accent-green)' : 'var(--bg-hover)', position: 'relative',
                          }}>
                            <div style={{ position: 'absolute', top: 3, left: s.value === 'true' ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                          </div>
                          <span style={{ fontSize: 12, color: s.value === 'true' ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 600 }}>
                            {s.value === 'true' ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      ) : s.type === 'select' ? (
                        <select className="select" style={{ width: '100%' }}>
                          <option>{s.value}</option>
                          <option>MOSS</option>
                        </select>
                      ) : (
                        <input type="number" className="input" defaultValue={s.value} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Docker info */}
            <div className="card" style={{ background: 'rgba(6,182,212,0.06)', borderColor: 'rgba(6,182,212,0.25)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent-cyan-light)', marginBottom: 12 }}>🐳 Docker Info</div>
              {[
                { label: 'Docker version', value: '24.0.7' },
                { label: 'Base image: C++', value: 'gcc:13-slim' },
                { label: 'Base image: Python', value: 'python:3.11-slim' },
                { label: 'Base image: Java', value: 'eclipse-temurin:21' },
                { label: 'Registry', value: 'localhost:5000' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 11 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
