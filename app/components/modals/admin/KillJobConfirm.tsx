'use client';
import ConfirmDialog from '@/app/components/ui/ConfirmDialog';
import { toast } from '@/app/components/ui/Toast';

interface KillJobConfirmProps {
  open: boolean;
  onClose: () => void;
  jobId?: string;
  studentName?: string;
  exercise?: string;
}

export default function KillJobConfirm({ open, onClose, jobId = 'JOB-4823', studentName = 'Lê Văn Hùng', exercise = 'Dynamic Programming' }: KillJobConfirmProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={() => {
        toast({ type: 'error', title: `Job ${jobId} đã bị kill`, message: `${studentName} — ${exercise} → Trạng thái: FAILED` });
        onClose();
      }}
      variant="danger"
      title="Kill Container Job?"
      message={
        <div>
          <p>Bạn đang chuẩn bị dừng container job:</p>
          <div style={{ margin: '12px 0', background: 'var(--bg-tertiary)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', textAlign: 'left' }}>
            <div style={{ fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: 'var(--text-muted)' }}>Job ID: </span>
              <code style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{jobId}</code>
            </div>
            <div style={{ fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: 'var(--text-muted)' }}>Sinh viên: </span>
              <strong style={{ color: 'var(--text-primary)' }}>{studentName}</strong>
            </div>
            <div style={{ fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Bài tập: </span>
              <span style={{ color: 'var(--text-primary)' }}>{exercise}</span>
            </div>
          </div>
          <p style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>
            ⚠️ Bài nộp sẽ bị tính là <strong>FAILED</strong>. Hành động này không thể hoàn tác.
          </p>
        </div>
      }
      confirmLabel="⛔ Kill ngay"
      cancelLabel="Giữ lại"
    />
  );
}
