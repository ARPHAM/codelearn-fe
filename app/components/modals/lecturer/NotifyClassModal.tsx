'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';

interface NotifyClassModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NotifyClassModal({ open, onClose }: NotifyClassModalProps) {
  const [content, setContent] = useState('');
  const [channels, setChannels] = useState({ inapp: true, email: false });
  const [target, setTarget] = useState('all');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!content.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
      toast({ type: 'success', title: 'Đã gửi thông báo!', message: target === 'all' ? 'Toàn bộ 120 sinh viên' : '28 sinh viên đang bị stuck' });
    }, 1000);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="📣 Thông báo cả lớp"
      subtitle="Gửi thông báo đến sinh viên trong CS101"
      size="sm"
      footer={
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSend} disabled={loading || !content.trim()} style={{ minWidth: 120, justifyContent: 'center' }}>
            {loading
              ? <span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
              : '📤 Gửi thông báo'
            }
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Target */}
        <div>
          <label className="form-label">Đối tượng nhận</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { val: 'all', label: '👥 Toàn bộ lớp', desc: '120 sinh viên' },
              { val: 'stuck', label: '⚠️ Sinh viên đang stuck', desc: '28 sinh viên' },
            ].map(opt => (
              <label key={opt.val} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 8, cursor: 'pointer',
                background: target === opt.val ? 'rgba(124,58,237,0.1)' : 'var(--bg-tertiary)',
                border: `1px solid ${target === opt.val ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}>
                <input type="radio" name="target" value={opt.val} checked={target === opt.val} onChange={() => setTarget(opt.val)} style={{ accentColor: 'var(--accent-purple)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="form-label">Nội dung thông báo</label>
          <textarea className="textarea" style={{ minHeight: 100 }}
            placeholder="Nhập nội dung thông báo..."
            value={content} onChange={e => setContent(e.target.value)} />
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>{content.length}/500 ký tự</div>
        </div>

        {/* Channels */}
        <div>
          <label className="form-label">Kênh gửi</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { key: 'inapp', label: '🔔 In-app', icon: '🔔' },
              { key: 'email', label: '📧 Email', icon: '📧' },
            ].map(ch => (
              <label key={ch.key} className="checkbox-row" style={{
                flex: 1, padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                background: channels[ch.key as keyof typeof channels] ? 'rgba(124,58,237,0.1)' : 'var(--bg-tertiary)',
                border: `1px solid ${channels[ch.key as keyof typeof channels] ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}>
                <input type="checkbox" checked={channels[ch.key as keyof typeof channels]}
                  onChange={e => setChannels(prev => ({ ...prev, [ch.key]: e.target.checked }))}
                  style={{ accentColor: 'var(--accent-purple)' }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{ch.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
