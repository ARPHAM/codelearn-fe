'use client';
import Modal from '@/app/components/ui/Modal';
import { toast } from '@/app/components/ui/Toast';

interface ProfileCardModalProps {
  open: boolean;
  onClose: () => void;
}

const badges = [
  { icon: '⚡', name: 'Speed Coder', earned: true },
  { icon: '🔥', name: 'On Fire',     earned: true },
  { icon: '🎯', name: 'Perfect',     earned: true },
  { icon: '🏆', name: 'Battle Master', earned: false },
];

export default function ProfileCardModal({ open, onClose }: ProfileCardModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="" size="sm" noPadding
      footer={
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Đóng</button>
          <button className="btn btn-cyan" style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => { toast({ type: 'info', title: '🗺️ Mở lộ trình của Phạm Thu Hà...' }); onClose(); }}>
            🗺️ Lộ trình
          </button>
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => { toast({ type: 'success', title: '⚔️ Lời thách đấu đã gửi!' }); onClose(); }}>
            ⚔️ Thách đấu
          </button>
        </div>
      }
    >
      {/* Profile header gradient */}
      <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(124,58,237,0.12))', padding: '24px 22px 16px', textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
          <div className="avatar" style={{ background: '#f59e0b', color: 'white', width: 66, height: 66, fontSize: 24, boxShadow: '0 0 24px rgba(245,158,11,0.5)', border: '3px solid #f59e0b' }}>H</div>
          <div style={{ position: 'absolute', bottom: -2, right: -2, background: '#f59e0b', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: '2px solid var(--bg-primary)' }}>🥇</div>
        </div>
        <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 4 }}>Phạm Thu Hà</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>MSSV: 2151021 · CS101-A</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
          <span className="badge badge-yellow">🏅 Hạng #1</span>
          <span className="badge badge-purple">Rating 1850</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '16px 22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Đã giải', val: '87', icon: '✅' },
            { label: 'Thắng', val: '42', icon: '⚔️' },
            { label: 'Streak', val: '15🔥', icon: '' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-tertiary)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badges earned */}
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>🎖️ Huy chương</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {badges.map(b => (
            <div key={b.name} style={{
              flex: 1, textAlign: 'center', padding: '10px 6px', borderRadius: 8,
              background: b.earned ? 'rgba(245,158,11,0.1)' : 'var(--bg-tertiary)',
              border: `1px solid ${b.earned ? 'rgba(245,158,11,0.35)' : 'var(--border)'}`,
              opacity: b.earned ? 1 : 0.4,
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{b.icon}</div>
              <div style={{ fontSize: 9, color: b.earned ? '#fbbf24' : 'var(--text-muted)', fontWeight: 600, lineHeight: 1.3 }}>{b.name}</div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
