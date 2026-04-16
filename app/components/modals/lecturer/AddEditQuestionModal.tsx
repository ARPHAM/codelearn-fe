'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { Plus, Pencil, Save, Rocket, FileText, Beaker, Lightbulb, Trash2, X } from 'lucide-react';

interface AddEditQuestionModalProps {
  open: boolean;
  onClose: () => void;
  mode?: 'add' | 'edit';
}

const initialTestCases = [
  { input: '[1, 2, 3]', output: '6', hidden: false },
  { input: '[-1, 0, 1]', output: '0', hidden: false },
  { input: '[100, 200, 300]', output: '600', hidden: true },
];

export default function AddEditQuestionModal({ open, onClose, mode = 'add' }: AddEditQuestionModalProps) {
  const [tab, setTab] = useState<'problem' | 'testcases' | 'hints'>('problem');
  const [testCases, setTestCases] = useState(initialTestCases);
  const [tags, setTags] = useState(['Array', 'Prefix Sum']);
  const [newTag, setNewTag] = useState('');

  const handleSave = (publish: boolean) => {
    toast({ type: 'success', title: publish ? 'Đã xuất bản câu hỏi' : 'Đã lưu nháp', message: 'Sum of Array · Medium · 10 điểm' });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'add' ? <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={20} /> Thêm câu hỏi mới</div> : <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Pencil size={20} /> Sửa câu hỏi</div>}
      subtitle="Ngân hàng câu hỏi · CS101"
      size="lg"
      footer={
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn-ghost" style={{ borderColor: 'rgba(124,58,237,0.4)', color: 'var(--accent-purple-light)', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => handleSave(false)}>
            <Save size={16} /> Lưu nháp
          </button>
          <button className="btn btn-primary" onClick={() => handleSave(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Rocket size={16} /> Xuất bản
          </button>
        </div>
      }
    >
      {/* Tabs */}
      <div className="modal-tabs">
        {[
          { id: 'problem', label: 'Đề bài', icon: <FileText size={16} /> },
          { id: 'testcases', label: `Test Cases (${testCases.length})`, icon: <Beaker size={16} /> },
          { id: 'hints', label: 'Gợi ý', icon: <Lightbulb size={16} /> },
        ].map(t => (
          <div key={t.id} className={`modal-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id as typeof tab)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {t.icon} {t.label}
          </div>
        ))}
      </div>

      {/* Tab: Problem */}
      {tab === 'problem' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="form-label">Tiêu đề câu hỏi</label>
            <input className="input" placeholder="VD: Sum of Array Elements" defaultValue={mode === 'edit' ? 'Sum of Array Elements' : ''} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Độ khó</label>
              <select className="select" style={{ width: '100%' }}>
                <option>Easy</option><option selected>Medium</option><option>Hard</option>
              </select>
            </div>
            <div>
              <label className="form-label">Ngôn ngữ</label>
              <select className="select" style={{ width: '100%' }}>
                <option>Any</option><option>C++</option><option>Python</option><option>Java</option>
              </select>
            </div>
            <div>
              <label className="form-label">Điểm</label>
              <input className="input" type="number" defaultValue={10} min={1} max={100} />
            </div>
          </div>
          <div>
            <label className="form-label">Mô tả bài toán</label>
            <textarea className="textarea" style={{ minHeight: 120 }} defaultValue={mode === 'edit' ? 'Cho mảng số nguyên nums, tính tổng tất cả phần tử và trả về kết quả.' : ''} placeholder="Mô tả bài toán (hỗ trợ Markdown)..." />
          </div>
          <div>
            <label className="form-label">Skill Tags</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {tags.map(tag => (
                <div key={tag} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
                  borderRadius: 20, padding: '3px 10px', fontSize: 12, color: 'var(--accent-purple-light)',
                }}>
                  {tag}
                  <span style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                    onClick={() => setTags(tags.filter(t => t !== tag))}><X size={12} /></span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" placeholder="Thêm tag..." value={newTag} onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newTag.trim()) { setTags([...tags, newTag.trim()]); setNewTag(''); } }}
                style={{ flex: 1 }} />
              <button className="btn btn-ghost" onClick={() => { if (newTag.trim()) { setTags([...tags, newTag.trim()]); setNewTag(''); } }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={14} /> Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Test Cases */}
      {tab === 'testcases' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {testCases.map((tc, i) => (
            <div key={i} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Test Case #{i + 1}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={tc.hidden}
                      onChange={e => setTestCases(prev => prev.map((t, j) => j === i ? { ...t, hidden: e.target.checked } : t))}
                      style={{ accentColor: 'var(--accent-purple)' }} />
                    Hidden
                  </label>
                  <button onClick={() => setTestCases(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: 16, padding: 0, display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="form-label">Input</label>
                  <textarea className="textarea" style={{ minHeight: 60, fontFamily: 'monospace', fontSize: 12 }}
                    value={tc.input} onChange={e => setTestCases(prev => prev.map((t, j) => j === i ? { ...t, input: e.target.value } : t))} />
                </div>
                <div>
                  <label className="form-label">Expected Output</label>
                  <textarea className="textarea" style={{ minHeight: 60, fontFamily: 'monospace', fontSize: 12 }}
                    value={tc.output} onChange={e => setTestCases(prev => prev.map((t, j) => j === i ? { ...t, output: e.target.value } : t))} />
                </div>
              </div>
            </div>
          ))}
          <button className="btn btn-ghost" onClick={() => setTestCases([...testCases, { input: '', output: '', hidden: false }])}
            style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Thêm Test Case
          </button>
        </div>
      )}

      {/* Tab: Hints */}
      {tab === 'hints' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '10px 12px', background: 'rgba(6,182,212,0.06)', borderRadius: 8, border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lightbulb size={16} color="var(--accent-cyan-light)" />
            <span>Gợi ý được hiển thị theo từng cấp độ. Sinh viên xin gợi ý sẽ thấy Hint 1 trước, sau đó Hint 2, v.v.</span>
          </div>
          {['Gợi ý 1 (Nhẹ)', 'Gợi ý 2 (Trung bình)', 'Gợi ý 3 (Chi tiết)'].map((h, i) => (
            <div key={i}>
              <label className="form-label">{h}</label>
              <textarea className="textarea" placeholder={`Nhập gợi ý ${i + 1}...`}
                defaultValue={i === 0 ? 'Thử dùng một biến để tích lũy tổng.' : i === 1 ? 'Duyệt từng phần tử và cộng vào biến total.' : ''} />
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
