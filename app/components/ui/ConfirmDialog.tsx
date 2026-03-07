'use client';
import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const variantConfig = {
  danger:  { icon: '🚨', color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)',   btnCls: 'btn-danger' },
  warning: { icon: '⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', btnCls: 'btn-primary' },
  info:    { icon: 'ℹ️', color: '#06b6d4', bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.25)',  btnCls: 'btn-cyan' },
};

export default function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Xác nhận', cancelLabel = 'Hủy',
  variant = 'danger', loading = false,
}: ConfirmDialogProps) {
  const cfg = variantConfig[variant];
  return (
    <Modal open={open} onClose={onClose} title="" size="sm"
      footer={
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', width: '100%' }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>{cancelLabel}</button>
          <button className={`btn ${cfg.btnCls}`} onClick={onConfirm} disabled={loading} style={{ minWidth: 110, justifyContent: 'center' }}>
            {loading ? <span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} /> : confirmLabel}
          </button>
        </div>
      }
    >
      <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
        {/* Icon banner */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
          background: cfg.bg, border: `2px solid ${cfg.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
        }}>{cfg.icon}</div>
        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 12, color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{message}</div>
      </div>
    </Modal>
  );
}
