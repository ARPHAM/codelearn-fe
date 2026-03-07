'use client';
import Modal from '@/app/components/ui/Modal';
import { toast } from '@/app/components/ui/Toast';

interface SkillNodeModalProps {
  open: boolean;
  onClose: () => void;
}

const exercises = [
  { id: 'Q047', title: 'Binary Search Basics',          status: 'done',   diff: 'easy'   },
  { id: 'Q048', title: 'Binary Search on Answer',        status: 'done',   diff: 'medium' },
  { id: 'Q049', title: 'Search in Rotated Sorted Array', status: 'active', diff: 'medium' },
  { id: 'Q050', title: 'Find Peak Element',              status: 'active', diff: 'medium' },
  { id: 'Q051', title: 'Median of Two Sorted Arrays',    status: 'locked', diff: 'hard'   },
];

const diffColors: Record<string, string> = { easy: 'badge-green', medium: 'badge-yellow', hard: 'badge-red' };
const statusIcons: Record<string, string> = { done: '✅', active: '▶', locked: '🔒' };

export default function SkillNodeModal({ open, onClose }: SkillNodeModalProps) {
  const done = exercises.filter(e => e.status === 'done').length;

  return (
    <Modal open={open} onClose={onClose} title="🎯 Binary Search" subtitle="Kỹ năng · Độ khó trung bình" size="md"
      footer={
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
          <button className="btn btn-primary" onClick={() => { toast({ type: 'success', title: '▶ Tiếp tục luyện tập Binary Search!' }); onClose(); }}>
            ▶ Tiếp tục học
          </button>
        </div>
      }
    >
      {/* Progress circle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '0 0 18px', borderBottom: '1px solid var(--border)', marginBottom: 18 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(124,58,237,0.1)', border: '3px solid var(--accent-purple)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-glow-purple)', flexShrink: 0,
        }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent-purple-light)', lineHeight: 1 }}>{Math.round((done / exercises.length) * 100)}%</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>hoàn thành</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>
            Kỹ thuật tìm kiếm hiệu quả trên mảng đã sắp xếp với độ phức tạp O(log n).
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${(done / exercises.length) * 100}%`, background: 'var(--accent-purple)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11 }}>
            <span style={{ color: 'var(--text-muted)' }}>{done}/{exercises.length} bài</span>
            <span style={{ color: 'var(--accent-purple-light)', fontWeight: 600 }}>+340 XP khi hoàn thành</span>
          </div>
        </div>
      </div>

      {/* Prerequisite */}
      <div style={{ marginBottom: 16, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>🔓 Yêu cầu trước:</span>
        <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>✅ Array Basics</span>
        <span>·</span>
        <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>✅ Two Pointers</span>
      </div>

      {/* Exercise list */}
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>📋 Danh sách bài tập</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {exercises.map(ex => (
          <div key={ex.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8,
            background: ex.status === 'active' ? 'rgba(124,58,237,0.08)' : 'var(--bg-tertiary)',
            border: `1px solid ${ex.status === 'active' ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
            opacity: ex.status === 'locked' ? 0.5 : 1,
          }}>
            <span style={{ fontSize: 16 }}>{statusIcons[ex.status]}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: ex.status === 'active' ? 700 : 500 }}>{ex.title}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>{ex.id}</div>
            </div>
            <span className={`badge ${diffColors[ex.diff]}`}>{ex.diff}</span>
            {ex.status === 'active' && (
              <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 11 }}
                onClick={() => toast({ type: 'info', title: `Mở bài: ${ex.title}` })}>
                Làm →
              </button>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}
