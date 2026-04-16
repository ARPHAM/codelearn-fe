'use client';
import Modal from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { User, BarChart2, MessageSquare, AlertTriangle, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface StudentProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const weekProgress = [20, 35, 28, 45, 52, 38, 30];
const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const stuckExercises = [
  { name: 'Dynamic Programming', stuck: '4.2 giờ', status: 'stuck' },
  { name: 'Graph BFS/DFS', stuck: '2.8 giờ', status: 'stuck' },
  { name: 'Sorting Algorithms', stuck: '0.5 giờ', status: 'done' },
];

export default function StudentProfileModal({ open, onClose }: StudentProfileModalProps) {
  const maxProg = Math.max(...weekProgress);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><User size={20} /> Hồ sơ Sinh viên</div>}
      size="md"
      footer={
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
          <button className="btn btn-ghost" onClick={() => { toast({ type: 'info', title: 'Mở trang hồ sơ đầy đủ...' }); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <BarChart2 size={16} /> Xem toàn bộ
          </button>
          <button className="btn btn-primary" onClick={() => { toast({ type: 'success', title: 'Đã mở cửa sổ chat!' }); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MessageSquare size={16} /> Nhắn tin
          </button>
        </div>
      }
    >
      {/* Profile header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 0 18px', borderBottom: '1px solid var(--border)', marginBottom: 18 }}>
        <div className="avatar" style={{ background: 'var(--gradient-fire)', color: 'white', width: 56, height: 56, fontSize: 20 }}>H</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Lê Văn Hùng</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>MSSV: 2151063 · CS101-A</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <span className="badge badge-red" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={12} /> Cần hỗ trợ
            </span>
            <span className="badge" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Hạng #42</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 18 }}>
        {[
          { label: 'Bài đã giải', val: '31', color: 'var(--accent-green)' },
          { label: 'Tỷ lệ qua', val: '58%', color: 'var(--accent-yellow)' },
          { label: 'Thời gian TB', val: '51 phút', color: 'var(--accent-cyan)' },
          { label: 'Đang stuck', val: '2 bài', color: 'var(--accent-red)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-tertiary)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={18} /> Hoạt động tuần này
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
          {weekProgress.map((v, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
              <div style={{
                width: '100%', height: `${(v / maxProg) * 48}px`,
                background: v === Math.max(...weekProgress) ? 'var(--accent-purple)' : 'rgba(124,58,237,0.35)',
                borderRadius: '3px 3px 0 0', minHeight: 4, transition: 'height 0.5s',
              }} />
              <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{days[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stuck exercises */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={18} color="var(--accent-red)" /> Bài tập đang gặp khó
        </div>
        {stuckExercises.map(ex => (
          <div key={ex.name} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
            borderBottom: '1px solid var(--border-light)',
          }}>
            <span style={{ fontSize: 14, display: 'flex', alignItems: 'center' }}>
              {ex.status === 'stuck' ? <AlertCircle size={16} color="var(--accent-red)" /> : <CheckCircle2 size={16} color="var(--accent-green)" />}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{ex.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Thời gian stuck: {ex.stuck}</div>
            </div>
            {ex.status === 'stuck' && (
              <span className="badge badge-red" style={{ fontSize: 9 }}>Stuck</span>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}
