'use client';
import { useEffect, useRef } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<ModalSize, number> = {
  sm: 420,
  md: 580,
  lg: 740,
  xl: 920,
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export default function Modal({ open, onClose, title, subtitle, size = 'md', children, footer, noPadding }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="modal-backdrop"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="modal-box" style={{ maxWidth: sizeMap[size], width: '100%' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, flexShrink: 0, transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tertiary)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
            }}
          >✕</button>
        </div>

        {/* Body */}
        <div className="modal-body" style={noPadding ? { padding: 0 } : {}}>
          {children}
        </div>

        {/* Footer */}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
