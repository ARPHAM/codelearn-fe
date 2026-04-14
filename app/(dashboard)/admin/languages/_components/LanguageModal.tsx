'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Language } from '@/api/languages.api';

interface LanguageModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Language>) => void;
  initialData?: Language | null;
  title: string;
}

export default function LanguageModal({
  open,
  onClose,
  onSubmit,
  initialData,
  title,
}: LanguageModalProps) {
  const [formData, setFormData] = useState<Partial<Language>>({
    name: '',
    version: '',
    dockerImage: '',
    ext: '',
    template: '',
    compileCmd: '',
    runCmd: '',
    defaultMemoryLimit: 256,
    defaultCpuLimit: 0.5,
    defaultTimeout: 5000,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        version: '',
        dockerImage: '',
        ext: '',
        template: '',
        compileCmd: '',
        runCmd: '',
        defaultMemoryLimit: 256,
        defaultCpuLimit: 0.5,
        defaultTimeout: 5000,
      });
    }
  }, [initialData, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" form="language-form" className="btn btn-primary">
            Lưu thay đổi
          </button>
        </div>
      }
    >
      <form id="language-form" onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="form-label">Tên ngôn ngữ</label>
            <input
              name="name"
              className="input"
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Python"
              required
            />
          </div>
          <div>
            <label className="form-label">Phiên bản</label>
            <input
              name="version"
              className="input"
              value={formData.version}
              onChange={handleChange}
              placeholder="VD: 3.10"
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="form-label">Docker Image</label>
            <input
              name="dockerImage"
              className="input"
              value={formData.dockerImage}
              onChange={handleChange}
              placeholder="VD: python:3.10-slim"
              required
            />
          </div>
          <div>
            <label className="form-label">Phần mở rộng (Extension)</label>
            <input
              name="ext"
              className="input"
              value={formData.ext}
              onChange={handleChange}
              placeholder="VD: .py"
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, background: 'var(--bg-secondary)', padding: 12, borderRadius: 8 }}>
          <div>
            <label className="form-label">RAM Limit (MB)</label>
            <input
              name="defaultMemoryLimit"
              type="number"
              className="input"
              value={formData.defaultMemoryLimit}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="form-label">CPU Limit (vCPU)</label>
            <input
              name="defaultCpuLimit"
              type="number"
              step="0.1"
              className="input"
              value={formData.defaultCpuLimit}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="form-label">Timeout (ms)</label>
            <input
              name="defaultTimeout"
              type="number"
              step="100"
              className="input"
              value={formData.defaultTimeout}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <label className="form-label">Lệnh biên dịch (Tùy chọn)</label>
          <input
            name="compileCmd"
            className="input"
            value={formData.compileCmd || ''}
            onChange={handleChange}
            placeholder="VD: g++ {file} -o {bin}"
          />
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            Sử dụng `{"{file}"}` và `{"{bin}"}` làm placeholder.
          </p>
        </div>

        <div>
          <label className="form-label">Lệnh chạy</label>
          <input
            name="runCmd"
            className="input"
            value={formData.runCmd}
            onChange={handleChange}
            placeholder="VD: python3 {file}"
            required
          />
        </div>

        <div>
          <label className="form-label">Template Code mặc định</label>
          <textarea
            name="template"
            className="input"
            style={{ height: 120, fontFamily: 'monospace' }}
            value={formData.template}
            onChange={handleChange}
            placeholder="Nhập code mẫu..."
            required
          />
        </div>
      </form>
    </Modal>
  );
}
