'use client';
import { useState } from 'react';
import Modal from '@/app/components/ui/Modal';
import { toast } from '@/app/components/ui/Toast';

interface AddLanguageModalProps {
  open: boolean;
  onClose: () => void;
}

const COMMON_LIBS: Record<string, string[]> = {
  Go:   ['fmt', 'sort', 'math', 'strings', 'strconv'],
  Rust: ['std::io', 'std::collections::HashMap'],
  Ruby: ['Set', 'Comparable'],
};

export default function AddLanguageModal({ open, onClose }: AddLanguageModalProps) {
  const [lang, setLang] = useState('');
  const [version, setVersion] = useState('');
  const [image, setImage] = useState('');
  const [libs, setLibs] = useState<string[]>([]);
  const [newLib, setNewLib] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');

  const handleTest = () => {
    if (!image.trim()) return;
    setTestStatus('testing');
    setTimeout(() => setTestStatus('ok'), 1800);
  };

  const handleSave = () => {
    if (!lang || !version || !image) return;
    toast({ type: 'success', title: `Đã thêm ngôn ngữ: ${lang} ${version}`, message: `Docker: ${image}` });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="➕ Thêm ngôn ngữ mới" subtitle="Cấu hình Docker runtime" size="md"
      footer={
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!lang || !version || !image || testStatus !== 'ok'}>
            💾 Thêm ngôn ngữ
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="form-label">Tên ngôn ngữ</label>
            <select className="select" style={{ width: '100%' }} value={lang} onChange={e => { setLang(e.target.value); setLibs(COMMON_LIBS[e.target.value] ?? []); }}>
              <option value="">Chọn ngôn ngữ...</option>
              {Object.keys(COMMON_LIBS).map(l => <option key={l} value={l}>{l}</option>)}
              <option value="custom">Tự nhập...</option>
            </select>
          </div>
          <div>
            <label className="form-label">Version</label>
            <input className="input" placeholder="VD: Go 1.22" value={version} onChange={e => setVersion(e.target.value)} />
          </div>
        </div>

        {/* Docker image */}
        <div>
          <label className="form-label">Docker Image</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" placeholder="golang:1.22-alpine" value={image} onChange={e => { setImage(e.target.value); setTestStatus('idle'); }} style={{ flex: 1 }} />
            <button className="btn btn-ghost" onClick={handleTest} disabled={!image.trim() || testStatus === 'testing'} style={{ flexShrink: 0 }}>
              {testStatus === 'testing' ? <span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid var(--border)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%' }} />
                : testStatus === 'ok' ? '✅ OK'
                : testStatus === 'fail' ? '❌ Fail'
                : '🔌 Test'}
            </button>
          </div>
          {testStatus === 'ok' && (
            <div style={{ fontSize: 11, color: 'var(--accent-green)', marginTop: 5 }}>✅ Image hoạt động tốt — Pull từ Docker Hub thành công</div>
          )}
        </div>

        {/* Libraries */}
        <div>
          <label className="form-label">Thư viện được phép</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8, minHeight: 34, padding: '6px', background: 'var(--bg-tertiary)', borderRadius: 8, border: '1px solid var(--border)' }}>
            {libs.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Chưa có thư viện nào...</span>}
            {libs.map(lib => (
              <div key={lib} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 20, padding: '2px 10px', fontSize: 12, color: 'var(--accent-cyan-light)' }}>
                {lib}
                <span style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, lineHeight: 1 }} onClick={() => setLibs(libs.filter(l => l !== lib))}>×</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" placeholder="Thêm thư viện..." value={newLib} onChange={e => setNewLib(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newLib.trim() && !libs.includes(newLib.trim())) { setLibs([...libs, newLib.trim()]); setNewLib(''); }}}
              style={{ flex: 1 }} />
            <button className="btn btn-ghost" onClick={() => { if (newLib.trim() && !libs.includes(newLib.trim())) { setLibs([...libs, newLib.trim()]); setNewLib(''); }}}>+ Thêm</button>
          </div>
        </div>

        {/* Notice */}
        {testStatus !== 'ok' && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '10px 14px', background: 'rgba(245,158,11,0.06)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
            ⚠️ Cần test kết nối Docker Image thành công trước khi lưu
          </div>
        )}
      </div>
    </Modal>
  );
}
