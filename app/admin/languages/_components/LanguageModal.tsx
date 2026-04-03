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
      });
    }
  }, [initialData, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
