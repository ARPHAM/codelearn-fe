'use client';
import Modal from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { Target, Play, Unlock, CheckCircle2, Lock, List, ArrowRight } from 'lucide-react';

interface SkillNodeModalProps {
  open: boolean;
  onClose: () => void;
}

const exercises = [
  { id: 'Q047', title: 'Binary Search Basics', status: 'done', diff: 'easy' },
  { id: 'Q048', title: 'Binary Search on Answer', status: 'done', diff: 'medium' },
  { id: 'Q049', title: 'Search in Rotated Sorted Array', status: 'active', diff: 'medium' },
  { id: 'Q050', title: 'Find Peak Element', status: 'active', diff: 'medium' },
  { id: 'Q051', title: 'Median of Two Sorted Arrays', status: 'locked', diff: 'hard' },
];

const diffColors: Record<string, string> = { easy: 'badge-green', medium: 'badge-yellow', hard: 'badge-red' };
const statusIcons: Record<string, any> = { done: CheckCircle2, active: Play, locked: Lock };

export default function SkillNodeModal({ open, onClose }: SkillNodeModalProps) {
  const done = exercises.filter(e => e.status === 'done').length;

  return (
    <Modal open={open} onClose={onClose} title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Target size={20} /> Binary Search</div>} subtitle="Kỹ năng · Độ khó trung bình" size="md"
      footer={
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
          <button className="btn btn-primary" onClick={() => { toast({ type: 'success', title: 'Tiếp tục luyện tập Binary Search!' }); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Play size={16} /> Tiếp tục học
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
        <Unlock size={14} /> <span>Yêu cầu trước:</span>
        <span style={{ color: 'var(--accent-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} /> Array Basics</span>
        <span>·</span>
        <span style={{ color: 'var(--accent-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} /> Two Pointers</span>
      </div>

      {/* Exercise list */}
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <List size={18} /> Danh sách bài tập
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {exercises.map(ex => (
          <div key={ex.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8,
            background: ex.status === 'active' ? 'rgba(124,58,237,0.08)' : 'var(--bg-tertiary)',
            border: `1px solid ${ex.status === 'active' ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
            opacity: ex.status === 'locked' ? 0.5 : 1,
          }}>
            <span style={{ fontSize: 16, display: 'flex', alignItems: 'center', color: ex.status === 'done' ? 'var(--accent-green)' : ex.status === 'active' ? 'var(--accent-purple)' : 'inherit' }}>
                {(() => { const Icon = statusIcons[ex.status]; return <Icon size={18} /> })()}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: ex.status === 'active' ? 700 : 500 }}>{ex.title}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>{ex.id}</div>
            </div>
            <span className={`badge ${diffColors[ex.diff]}`}>{ex.diff}</span>
            {ex.status === 'active' && (
              <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => toast({ type: 'info', title: `Mở bài: ${ex.title}` })}>
                Làm <ArrowRight size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}
