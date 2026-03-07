'use client';
import { useState } from 'react';
import Modal from '@/app/components/ui/Modal';
import ConfirmDialog from '@/app/components/ui/ConfirmDialog';
import { toast } from '@/app/components/ui/Toast';

interface PlagiarismDetailModalProps {
  open: boolean;
  onClose: () => void;
}

const codeA = [
  { n: 42, code: 'def bfs(graph, start):', match: false },
  { n: 43, code: '    visited = set()', match: false },
  { n: 44, code: '    queue = deque([start])', match: true },
  { n: 45, code: '    result = []', match: true },
  { n: 46, code: '    while queue:', match: true },
  { n: 47, code: '        node = queue.popleft()', match: true },
  { n: 48, code: '        if node not in visited:', match: false },
  { n: 49, code: '            visited.add(node)', match: true },
  { n: 50, code: '            result.append(node)', match: true },
  { n: 51, code: '    return result', match: false },
];

const codeB = [
  { n: 15, code: 'def bfs_traversal(g, src):', match: false },
  { n: 16, code: '    seen = set()', match: false },
  { n: 17, code: '    q = deque([src])', match: true },
  { n: 18, code: '    out = []', match: true },
  { n: 19, code: '    while q:', match: true },
  { n: 20, code: '        v = q.popleft()', match: true },
  { n: 21, code: '        if v in seen: continue', match: false },
  { n: 22, code: '            seen.add(v)', match: true },
  { n: 23, code: '            out.append(v)', match: true },
  { n: 24, code: '    return out', match: false },
];

export default function PlagiarismDetailModal({ open, onClose }: PlagiarismDetailModalProps) {
  const [flagOpen, setFlagOpen] = useState(false);
  const [action, setAction] = useState('warn');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFlag = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setFlagOpen(false);
      onClose();
      toast({ type: 'error', title: 'Đã đánh dấu đạo văn', message: 'Nguyễn M. Khoa ↔ Đỗ Quang Vinh đã bị báo cáo.' });
    }, 1200);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="🔍 Chi tiết Đạo văn"
        subtitle="Nguyễn M. Khoa ↔ Đỗ Quang Vinh · Bài: BFS Graph Traversal"
        size="xl"
        footer={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <span className="badge badge-red" style={{ fontSize: 12 }}>Tương đồng: 82%</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Dòng trùng: 42–67, 88–102</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={onClose}>Bỏ qua</button>
              <button className="btn btn-danger" onClick={() => setFlagOpen(true)}>⚠️ Đánh dấu Đạo văn</button>
            </div>
          </div>
        }
      >
        {/* Similarity score banner */}
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#f87171', lineHeight: 1, fontFamily: 'monospace' }}>82%</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#f87171' }}>🚨 Mức độ tương đồng rất cao</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
              Thuật toán AST + Token phát hiện 14/17 đoạn trùng khớp cấu trúc logic
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Khối trùng</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>14/17</div>
          </div>
        </div>

        {/* Code diff - 2 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { name: 'Nguyễn M. Khoa', id: 'SV001', color: '#7c3aed', lines: codeA },
            { name: 'Đỗ Quang Vinh',  id: 'SV005', color: '#ef4444', lines: codeB },
          ].map((sv) => (
            <div key={sv.id} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{
                padding: '10px 14px', background: 'var(--bg-tertiary)',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div className="avatar" style={{ background: sv.color, color: 'white', width: 26, height: 26, fontSize: 10 }}>
                  {sv.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{sv.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{sv.id}</div>
                </div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '6px 0' }}>
                {sv.lines.map((line) => (
                  <div key={line.n} className={line.match ? 'diff-match' : ''}
                    style={{ display: 'flex', padding: '1px 10px', alignItems: 'center' }}>
                    <span className="code-line-number" style={{ minWidth: 28 }}>{line.n}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5, color: line.match ? '#fbbf24' : 'var(--text-secondary)' }}>
                      {line.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8 }}>
          <span style={{ fontSize: 12, color: '#fbbf24' }}>🔶 Các dòng nền vàng = đoạn code có cấu trúc AST giống nhau (tên biến khác nhưng logic giống)</span>
        </div>
      </Modal>

      {/* Flag confirmation */}
      <Modal open={flagOpen} onClose={() => setFlagOpen(false)} title="⚠️ Đánh dấu Đạo văn" size="sm"
        footer={
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button className="btn btn-ghost" onClick={() => setFlagOpen(false)} disabled={loading}>Hủy</button>
            <button className="btn btn-danger" onClick={handleFlag} disabled={loading} style={{ minWidth: 120, justifyContent: 'center' }}>
              {loading ? <span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} /> : '⚠️ Xác nhận'}
            </button>
          </div>
        }
      >
        <div>
          <label className="form-label">Hành động</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {[
              { val: 'warn',   label: '⚠️ Cảnh báo' ,       desc: 'Gửi email cảnh báo đến sinh viên' },
              { val: 'deduct', label: '📉 Trừ điểm (50%)',   desc: 'Bài nộp bị trừ 50% điểm' },
              { val: 'zero',   label: '❌ Hủy bài nộp',      desc: 'Sinh viên nhận 0 điểm cho bài này' },
            ].map(opt => (
              <label key={opt.val} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                background: action === opt.val ? 'rgba(239,68,68,0.08)' : 'var(--bg-tertiary)',
                border: `1px solid ${action === opt.val ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}>
                <input type="radio" name="flag-action" value={opt.val} checked={action === opt.val} onChange={() => setAction(opt.val)}
                  style={{ marginTop: 3, accentColor: '#ef4444' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
          <label className="form-label">Ghi chú lý do</label>
          <textarea className="textarea" placeholder="Nhập lý do đánh dấu..." value={note} onChange={e => setNote(e.target.value)} style={{ minHeight: 70 }} />
        </div>
      </Modal>
    </>
  );
}
