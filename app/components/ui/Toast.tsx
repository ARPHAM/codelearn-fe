'use client';
import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Global toast store
let _addToast: ((t: Omit<ToastItem, 'id'>) => void) | null = null;

export interface ToastFunction {
  (item: Omit<ToastItem, 'id'>): void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

export const toast: ToastFunction = (item: Omit<ToastItem, 'id'>) => {
  _addToast?.(item);
};

toast.success = (title: string, message?: string) => toast({ type: 'success', title, message });
toast.error = (title: string, message?: string) => toast({ type: 'error', title, message });
toast.warning = (title: string, message?: string) => toast({ type: 'warning', title, message });
toast.info = (title: string, message?: string) => toast({ type: 'info', title, message });

const toastCfg: Record<ToastType, { icon: any; color: string; border: string }> = {
  success: { icon: CheckCircle2, color: '#10b981', border: 'rgba(16,185,129,0.35)' },
  error:   { icon: XCircle, color: '#ef4444', border: 'rgba(239,68,68,0.35)' },
  warning: { icon: AlertTriangle, color: '#f59e0b', border: 'rgba(245,158,11,0.35)' },
  info:    { icon: Info, color: '#06b6d4', border: 'rgba(6,182,212,0.35)' },
};

export default function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...item, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, item.duration ?? 3500);
  }, []);

  useEffect(() => {
    _addToast = addToast;
    return () => { _addToast = null; };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => {
        const cfg = toastCfg[t.type];
        return (
          <div key={t.id} className="animate-in" style={{
            background: 'var(--bg-card)',
            border: `1px solid ${cfg.border}`,
            borderLeft: `4px solid ${cfg.color}`,
            borderRadius: 10,
            padding: '12px 16px',
            minWidth: 280, maxWidth: 380,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'flex-start', gap: 10,
            pointerEvents: 'auto',
          }}>
            <cfg.icon size={20} color={cfg.color} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: t.message ? 3 : 0 }}>{t.title}</div>
              {t.message && <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t.message}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
