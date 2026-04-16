'use client';
import Modal from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { ClipboardList, AlertTriangle, Trash2, Package, History, Copy, Check } from 'lucide-react';

interface AuditDetailModalProps {
  open: boolean;
  onClose: () => void;
}

const logEntry = {
  id: 'LOG-0090',
  time: '2026-03-06 22:38:55',
  user: 'GV. Trần Thị B',
  role: 'Lecturer',
  action: 'DELETE_EXAM',
  target: 'Đề thi: "Kiểm tra giữa kỳ HK1"',
  ip: '192.168.1.45',
  session: 'sess_K9xm2P8qR',
  userAgent: 'Chrome 122.0.0.0 / Win 11',
  severity: 'danger',
  before: { title: 'Kiểm tra giữa kỳ HK1', questions: 10, duration: 60, created: '2026-02-20' },
  after: null,
};

export default function AuditDetailModal({ open, onClose }: AuditDetailModalProps) {
  const payload = JSON.stringify({ action: logEntry.action, target: logEntry.target, before: logEntry.before, after: logEntry.after }, null, 2);

  return (
    <Modal open={open} onClose={onClose} title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={20} /> Chi tiết Log</div>} subtitle={`${logEntry.id} · ${logEntry.time}`} size="md"
      footer={
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button className="btn btn-ghost" onClick={() => { navigator.clipboard?.writeText(payload); toast({ type: 'success', title: 'Đã copy JSON!' }); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Copy size={16} /> Copy JSON
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
        </div>
      }
    >
      {/* Severity banner */}
      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <AlertTriangle size={24} color="#f87171" />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#f87171' }}>Hành động nguy hiểm: Xóa đề thi</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Không thể hoàn tác — Đề thi đã bị xóa vĩnh viễn</div>
        </div>
      </div>

      {/* Metadata */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Người thực hiện', val: logEntry.user },
          { label: 'Vai trò', val: logEntry.role },
          { label: 'IP Address', val: logEntry.ip, mono: true },
          { label: 'Session ID', val: logEntry.session, mono: true },
          { label: 'Thời gian', val: logEntry.time, mono: true },
          { label: 'User Agent', val: logEntry.userAgent },
        ].map(f => (
          <div key={f.label} style={{ background: 'var(--bg-tertiary)', borderRadius: 8, padding: '10px 12px' }}>
            <div className="form-label" style={{ marginBottom: 4 }}>{f.label}</div>
            <div style={{ fontSize: 12, fontFamily: f.mono ? 'monospace' : 'inherit', color: 'var(--text-primary)', fontWeight: 600, wordBreak: 'break-all' }}>{f.val}</div>
          </div>
        ))}
      </div>

      {/* Before / After */}
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <History size={18} /> Trạng thái thay đổi
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '12px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-red)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trước</div>
          {Object.entries(logEntry.before).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ fontWeight: 600 }}>{String(v)}</span>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(107,114,128,0.06)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            <div style={{ marginBottom: 6 }}><Trash2 size={28} /></div>
            <div>Đã xóa</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>(Null)</div>
          </div>
        </div>
      </div>

      {/* JSON payload */}
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Package size={18} /> Raw Payload
      </div>
      <div className="code-block" style={{ fontSize: 11, maxHeight: 140, overflowY: 'auto' }}>
        {payload.split('\n').map((line, i) => (
          <div key={i} style={{ color: line.includes('"action"') || line.includes('"DELETE') ? '#ff7b72' : line.includes('null') ? '#f87171' : 'var(--text-secondary)' }}>
            {line}
          </div>
        ))}
      </div>
    </Modal>
  );
}
