'use client';
import Modal from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { Eye, Dices, FileDown, CheckCircle2, Info } from 'lucide-react';

interface PreviewExamModalProps {
  open: boolean;
  onClose: () => void;
}

const examQuestions = [
  { id: 'Q001', title: 'Cài đặt BFS trên đồ thị có hướng', diff: 'easy', score: 5, tags: ['Graph', 'BFS'] },
  { id: 'Q003', title: 'Sắp xếp nhanh (Quicksort)', diff: 'easy', score: 5, tags: ['Sorting'] },
  { id: 'Q005', title: 'Phát hiện chu trình trong đồ thị', diff: 'medium', score: 10, tags: ['Graph', 'DFS'] },
  { id: 'Q006', title: 'Dãy con tăng dài nhất (LIS)', diff: 'medium', score: 10, tags: ['DP', 'Sequence'] },
  { id: 'Q002', title: 'Bài toán Ba lô 0/1 (Knapsack)', diff: 'hard', score: 15, tags: ['DP', 'Optimization'] },
];

const diffMap: Record<string, string> = { easy: 'badge-green', medium: 'badge-yellow', hard: 'badge-red' };
const totalScore = examQuestions.reduce((s, q) => s + q.score, 0);

export default function PreviewExamModal({ open, onClose }: PreviewExamModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Eye size={20} /> Preview Đề thi</div>}
      subtitle="Kiểm tra HK2 2025-2026 · 90 phút · CS101"
      size="xl"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
          <div style={{ flex: 1, display: 'flex', gap: 8 }}>
            <span className="badge badge-purple">{examQuestions.length} câu</span>
            <span className="badge badge-cyan">90 phút</span>
            <span className="badge badge-yellow">{totalScore} điểm</span>
          </div>
          <button className="btn btn-ghost" onClick={() => toast({ type: 'info', title: 'Shuffle lại đề thi...' })} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Dices size={16} /> Shuffle lại
          </button>
          <button className="btn btn-ghost" onClick={() => toast({ type: 'info', title: 'Đang xuất PDF...' })} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileDown size={16} /> Xuất PDF
          </button>
          <button className="btn btn-primary" onClick={() => { toast({ type: 'success', title: 'Đề thi đã được lưu!', message: 'Kiểm tra HK2 2025-2026 · 5 câu · 45 điểm' }); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={16} /> Tạo đề này
          </button>
        </div>
      }
    >
      {/* Exam header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.06))',
        border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: '18px 20px', marginBottom: 20,
        textAlign: 'center',
      }}>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>KIỂM TRA CUỐI KỲ HK2 2025–2026</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Môn: Cấu trúc dữ liệu & Giải thuật · Lớp CS101</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12 }}>
          {[
            { label: 'Thời gian', val: '90 phút' },
            { label: 'Số câu', val: `${examQuestions.length} bài` },
            { label: 'Tổng điểm', val: `${totalScore} điểm` },
            { label: 'Ngôn ngữ', val: 'C++ / Python / Java' },
          ].map(i => (
            <div key={i.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{i.label}</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', marginTop: 2 }}>{i.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Questions list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {examQuestions.map((q, i) => (
          <div key={q.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: 'var(--gradient-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 15, color: 'white',
            }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: 4 }}>{q.id}</span>
                <span className={`badge ${diffMap[q.diff]}`}>{q.diff}</span>
                <span className="badge badge-purple">{q.score} điểm</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{q.title}</div>
              <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
                {q.tags.map(tag => (
                  <span key={tag} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 20, padding: '2px 8px', fontSize: 10, color: 'var(--text-secondary)' }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(6,182,212,0.06)', borderRadius: 8, border: '1px solid rgba(6,182,212,0.2)', fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Info size={16} color="var(--accent-cyan-light)" />
        <span>Đây là preview trước khi lưu. Thứ tự câu hỏi sẽ được xáo trộn ngẫu nhiên cho từng sinh viên khi vào thi.</span>
      </div>
    </Modal>
  );
}
