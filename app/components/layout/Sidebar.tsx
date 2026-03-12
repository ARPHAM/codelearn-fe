'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentUserInfo } from '../_api/queries';

const navGroups = [
  {
    label: '🎓 Giảng viên',
    color: '#7c3aed',
    items: [
      { href: '/lecturer/analytics', icon: '📊', label: 'Analytics Dashboard' },
      { href: '/lecturer/auto-grader', icon: '⚡', label: 'Auto-Grader' },
      { href: '/lecturer/plagiarism', icon: '🔍', label: 'Phát hiện Đạo văn' },
      { href: '/lecturer/question-bank', icon: '🗃️', label: 'Ngân hàng Câu hỏi' },
    ],
  },
  {
    label: '🎮 Sinh viên',
    color: '#06b6d4',
    items: [
      { href: '/student/code-editor', icon: '💻', label: 'Code Editor + AI' },
      { href: '/student/pair-programming', icon: '👥', label: 'Pair Programming' },
      { href: '/student/code-battle', icon: '⚔️', label: 'Code Battle' },
      { href: '/student/learning-path', icon: '🗺️', label: 'Lộ trình Học tập' },
      { href: '/student/leaderboard', icon: '🏆', label: 'Leaderboard' },
    ],
  },
  {
    label: '⚙️ Admin',
    color: '#f59e0b',
    items: [
      { href: '/admin/sandbox', icon: '🐳', label: 'Sandbox Resources' },
      { href: '/admin/audit-log', icon: '📋', label: 'Log & Audit' },
      { href: '/admin/system-config', icon: '🔧', label: 'Cấu hình Hệ thống' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const { data: user } = useCurrentUserInfo()

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      minWidth: 'var(--sidebar-width)',
      height: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 36, height: 36,
          background: 'var(--gradient-purple)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
          boxShadow: 'var(--shadow-glow-purple)',
          flexShrink: 0,
        }}>{'</>'}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>CodeLearn</div>
          <div style={{ fontSize: 10, color: 'var(--accent-purple-light)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Platform</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: 8 }}>
            <div style={{
              padding: '8px 20px 4px',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: group.color,
            }}>{group.label}</div>
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 20px',
                    marginBottom: 1,
                    borderRadius: 0,
                    background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
                    borderLeft: active ? `3px solid ${group.color}` : '3px solid transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-hover)';
                        (e.currentTarget as HTMLDivElement).style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                        (e.currentTarget as HTMLDivElement).style.color = 'var(--text-secondary)';
                      }
                    }}>
                    <span style={{ fontSize: 15 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User info */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div className="avatar" style={{ background: 'var(--gradient-purple)', color: 'white' }}>{user?.avatar ? user?.avatar?.charAt(0).toUpperCase() : user?.role?.slice(0, 2).toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name || 'Hi'}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{user?.role || 'User'}</div>
        </div>
        <div style={{ fontSize: 16, cursor: 'pointer', color: 'var(--text-muted)' }}>⚙</div>
      </div>
    </aside>
  );
}
