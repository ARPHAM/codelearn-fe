'use client';

import { useCurrentUserInfo } from "../_api/queries";

export default function Topbar() {
  const { data: user } = useCurrentUserInfo()

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      flexShrink: 0,
      gap: 16,
    }}>
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 400 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '7px 14px', flex: 1, cursor: 'text',
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>🔍</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Tìm kiếm bài tập, sinh viên...</span>
          <span style={{
            marginLeft: 'auto', background: 'var(--bg-secondary)',
            border: '1px solid var(--border)', borderRadius: 4,
            padding: '1px 6px', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace',
          }}>⌘K</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Semester badge */}
        <div style={{
          background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 6, padding: '5px 12px',
          fontSize: 12, fontWeight: 600, color: 'var(--accent-purple-light)',
        }}>HK2 2025-2026</div>

        {/* Notification */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>🔔</div>
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 16, height: 16, borderRadius: '50%',
            background: 'var(--accent-red)', border: '2px solid var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: 'white',
          }}>3</div>
        </div>

        {/* User avatar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          padding: '4px 10px 4px 4px',
          borderRadius: 8, border: '1px solid var(--border)',
          background: 'var(--bg-tertiary)',
          transition: 'border-color 0.2s',
        }}>
          <div className="avatar" style={{ background: 'var(--gradient-purple)', color: 'white', width: 28, height: 28, fontSize: 11 }}>{user?.avatar ?? user?.role?.slice(0, 2).toUpperCase() ?? 'Hi'}</div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{user?.name ?? 'Hi'}</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>▾</span>
        </div>
      </div>
    </header>
  );
}
