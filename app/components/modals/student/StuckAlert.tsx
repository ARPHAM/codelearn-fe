'use client';
import { toast } from '@/components/ui/Toast';
import { Bot, Lightbulb, Check } from 'lucide-react';

interface StuckAlertProps {
  onAccept: () => void;
  onDismiss: () => void;
  minutesStuck: number;
}

export default function StuckAlert({ onAccept, onDismiss, minutesStuck }: StuckAlertProps) {
  return (
    <div className="stuck-alert">
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid rgba(124,58,237,0.5)',
        borderRadius: 14,
        padding: '16px 18px',
        boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 24px rgba(124,58,237,0.2)',
      }}>
        {/* AI avatar */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'var(--gradient-purple)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-glow-purple)', color: 'white'
          }}><Bot size={22} /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 3 }}>AI Assistant</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 6px var(--accent-green)' }} />
              <span style={{ fontSize: 10, color: 'var(--accent-green)', fontWeight: 600 }}>Đang quan sát</span>
              <span className="badge badge-orange" style={{ fontSize: 9, marginLeft: 4 }}>+{minutesStuck} phút stuck</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
          Bạn đang gặp khó với bài này đã <strong style={{ color: 'var(--accent-yellow)' }}>{minutesStuck} phút</strong>.
          Tôi có thể gợi ý hướng tiếp cận không?
        </div>

        {/* Typing dots preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: 12, color: 'var(--text-muted)' }}>
          <Lightbulb size={14} color="var(--accent-yellow)" />
          <span>Gợi ý:</span>
          <em>&quot;Thử nghĩ về binary search...&quot;</em>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-primary"
            onClick={() => {
              onAccept();
              toast({ type: 'info', title: 'AI đang chuẩn bị gợi ý...', message: 'Mở AI panel bên phải' });
            }}
            style={{ flex: 1, justifyContent: 'center', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Bot size={14} /> Có, gợi ý đi!
          </button>
          <button
            className="btn btn-ghost"
            onClick={onDismiss}
            style={{ flex: 1, justifyContent: 'center', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Không cần <Check size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
