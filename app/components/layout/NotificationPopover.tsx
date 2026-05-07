'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  MessageSquare,
  ShieldCheck,
  MoreHorizontal,
  MailOpen,
  Trash2
} from 'lucide-react';
import { useNotifications } from '@/src/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';


export default function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, isLoading } = useNotifications();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 size={16} color="#10b981" />;
      case 'ERROR': return <XCircle size={16} color="#ef4444" />;
      case 'WARNING': return <Clock size={16} color="#fbbf24" />;
      case 'INFO': return <ShieldCheck size={16} color="#3b82f6" />;
      default: return <AlertCircle size={16} color="#94a3b8" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={popoverRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 38, height: 38, borderRadius: '10px',
          background: isOpen ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${isOpen ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isOpen ? '#a78bfa' : '#94a3b8',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          if (!isOpen) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }}
        onMouseLeave={e => {
          if (!isOpen) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
            e.currentTarget.style.color = '#94a3b8';
          }
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: -2, right: -2,
            width: 18, height: 18, borderRadius: '50%',
            background: '#ef4444',
            border: '2px solid #0d1117',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: 'white',
          }}>{unreadCount > 9 ? '9+' : unreadCount}</div>
        )}
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 12px)', right: 0,
          width: 360, maxHeight: 480,
          background: 'rgba(22, 27, 34, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          zIndex: 100,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideDown 0.2s ease-out'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Thông báo</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                title="Đánh dấu tất cả đã đọc" 
                onClick={() => markAllAsRead()}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
              >
                <MailOpen size={16} />
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} className="custom-scrollbar">
            {isLoading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Đang tải thông báo...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Không có thông báo nào</div>
            ) : notifications.map((n: any) => (
              <div key={n.id} style={{
                padding: '14px 20px',
                display: 'flex', gap: 14,
                cursor: 'pointer',
                transition: 'background 0.2s',
                background: n.isRead ? 'transparent' : 'rgba(139, 92, 246, 0.03)',
                position: 'relative'
              }}
              onClick={() => !n.isRead && markAsRead(n.id)}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(139, 92, 246, 0.03)'}>
                {!n.isRead && (
                  <div style={{
                    position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                    width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6',
                    boxShadow: '0 0 8px #8b5cf6'
                  }} />
                )}
                <div style={{
                  width: 32, height: 32, borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getIcon(n.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.title}</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: vi })}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                  style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#4b5563', opacity: 0 }}
                  className="delete-btn"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'center'
          }}>
            <button style={{
              background: 'none', border: 'none',
              fontSize: 12, fontWeight: 600, color: '#a78bfa',
              cursor: 'pointer'
            }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
               onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        div:hover > .delete-btn {
          opacity: 1;
        }
        .delete-btn:hover {
          color: #ef4444 !important;
        }
      `}</style>
    </div>
  );
}
