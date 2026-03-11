'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';

interface EditResourceLimitModalProps {
  open: boolean;
  onClose: () => void;
  lang?: string;
}

export default function EditResourceLimitModal({ open, onClose, lang = 'Python' }: EditResourceLimitModalProps) {
  const [cpu, setCpu] = useState(50);
  const [ram, setRam] = useState(128);
  const [timeout, setTimeout_] = useState(10);

  const handleSave = () => {
    toast({ type: 'success', title: `Đã cập nhật giới hạn ${lang}`, message: `CPU: ${cpu}%, RAM: ${ram}MB, Timeout: ${timeout}s` });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`⚙️ Sửa giới hạn — ${lang}`} subtitle="Sandbox resource allocation" size="sm"
      footer={
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave}>💾 Lưu</button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* CPU */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>💻 CPU Limit</label>
            <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 18, color: cpu > 80 ? 'var(--accent-red)' : cpu > 50 ? 'var(--accent-yellow)' : 'var(--accent-green)' }}>
              {cpu < 100 ? `${(cpu / 100).toFixed(1)}` : '1.0'} vCPU
            </div>
          </div>
          <input type="range" className="slider" min={10} max={200} step={10} value={cpu} onChange={e => setCpu(Number(e.target.value))} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            <span>0.1 vCPU</span><span>2.0 vCPU</span>
          </div>
        </div>

        {/* RAM */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>🧠 RAM Limit</label>
            <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 18, color: ram > 400 ? 'var(--accent-red)' : 'var(--accent-cyan)' }}>
              {ram} MB
            </div>
          </div>
          <input type="range" className="slider" min={64} max={1024} step={64} value={ram} onChange={e => setRam(Number(e.target.value))} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            <span>64 MB</span><span>1024 MB</span>
          </div>
        </div>

        {/* Timeout */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>⏱ Timeout</label>
            <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 18, color: 'var(--accent-purple-light)' }}>
              {timeout}s
            </div>
          </div>
          <input type="range" className="slider" min={1} max={30} step={1} value={timeout} onChange={e => setTimeout_(Number(e.target.value))} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            <span>1s</span><span>30s</span>
          </div>
        </div>

        {/* Preview */}
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preview Docker flags</div>
          <code style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--accent-cyan)', lineHeight: 1.8, display: 'block' }}>
            --cpus={cpu < 100 ? (cpu / 100).toFixed(1) : '1.0'}<br />
            --memory={ram}m<br />
            --stop-timeout={timeout}
          </code>
        </div>
      </div>
    </Modal>
  );
}
