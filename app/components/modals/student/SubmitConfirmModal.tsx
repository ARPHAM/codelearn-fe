import Modal from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { Send, Play, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface SubmitConfirmModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SubmitConfirmModal({ open, onClose }: SubmitConfirmModalProps) {
  const passCnt = 13;
  const total = 20;
  const pct = Math.round((passCnt / total) * 100);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Send size={20} /> Xác nhận Nộp bài</div>}
      subtitle="Find Peak Element · CS101"
      size="sm"
      footer={
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Play size={14} /> Chạy lại trước
          </button>
          <button className="btn btn-primary" onClick={() => {
            toast({ type: 'success', title: 'Đã nộp bài thành công!', message: `Score: ${pct}/100 — ${passCnt}/${total} test cases passed` });
            onClose();
          }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Send size={16} /> Nộp ngay
          </button>
        </div>
      }
    >
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        {/* Score circle */}
        <div style={{
          width: 90, height: 90, borderRadius: '50%', margin: '0 auto 16px',
          background: pct >= 90 ? 'rgba(16,185,129,0.1)' : pct >= 60 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
          border: `3px solid ${pct >= 90 ? 'var(--accent-green)' : pct >= 60 ? 'var(--accent-yellow)' : 'var(--accent-red)'}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: pct >= 90 ? 'var(--accent-green)' : pct >= 60 ? 'var(--accent-yellow)' : 'var(--accent-red)' }}>{pct}%</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>điểm</div>
        </div>

        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Sẵn sàng nộp bài?</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Kết quả hiện tại gồm <strong style={{ color: 'var(--text-primary)' }}>{passCnt}/{total} test cases</strong> đã vượt qua</div>

        {/* Test summary bar */}
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '12px 16px', marginBottom: 14, textAlign: 'left' }}>
          <div className="progress-bar" style={{ height: 10, marginBottom: 10 }}>
            <div className="progress-fill" style={{
              width: `${pct}%`,
              background: pct >= 90 ? 'var(--accent-green)' : pct >= 60 ? 'var(--accent-yellow)' : 'var(--accent-red)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={14} /> {passCnt} Passed
            </span>
            <span style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <XCircle size={14} /> {total - passCnt} Failed
            </span>
          </div>
        </div>

        {pct < 100 && (
          <div style={{ fontSize: 12, color: '#f87171', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <AlertTriangle size={14} /> Bạn chưa vượt qua hết test case. Vẫn muốn nộp?
          </div>
        )}
      </div>
    </Modal>
  );
}
