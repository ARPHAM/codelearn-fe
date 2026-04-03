'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  useAdminLanguages,
  useCreateLanguage,
  useUpdateLanguage,
  useDeleteLanguage,
} from '@/hooks/useLanguages';
import { Language } from '@/api/languages.api';
import { toast } from '@/components/ui/Toast';
import LanguageModal from './_components/LanguageModal';

export default function LanguageManagementPage() {
  const { data: languages = [], isLoading, refetch } = useAdminLanguages();
  const createMutation = useCreateLanguage();
  const updateMutation = useUpdateLanguage();
  const deleteMutation = useDeleteLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLang, setEditingLang] = useState<Language | null>(null);

  // Polling for PULLING status
  useEffect(() => {
    const hasPulling = languages.some((l) => l.imageStatus === 'PULLING');
    if (hasPulling) {
      const interval = setInterval(() => {
        refetch();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [languages, refetch]);

  const handleCreate = async (data: Partial<Language>) => {
    try {
      await createMutation.mutateAsync(data);
      toast({ type: 'success', title: 'Thành công', message: 'Đã thêm ngôn ngữ mới.' });
      setIsModalOpen(false);
    } catch (err) {
      toast({ type: 'error', title: 'Lỗi', message: 'Không thể thêm ngôn ngữ.' });
    }
  };

  const handleUpdate = async (data: Partial<Language>) => {
    if (!editingLang) return;
    try {
      await updateMutation.mutateAsync({ id: editingLang.id, data });
      toast({ type: 'success', title: 'Thành công', message: 'Đã cập nhật ngôn ngữ.' });
      setIsModalOpen(false);
      setEditingLang(null);
    } catch (err) {
      toast({ type: 'error', title: 'Lỗi', message: 'Không thể cập nhật ngôn ngữ.' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ngôn ngữ này?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ type: 'success', title: 'Thành công', message: 'Đã xóa ngôn ngữ.' });
    } catch (err) {
      toast({ type: 'error', title: 'Lỗi', message: 'Không thể xóa ngôn ngữ.' });
    }
  };

  const getStatusBadge = (status: Language['imageStatus'], error?: string | null) => {
    switch (status) {
      case 'READY':
        return <span className="badge badge-green">🟢 Sẵn sàng</span>;
      case 'PULLING':
        return (
          <span className="badge badge-yellow">
            <span className="spin" style={{ display: 'inline-block', width: 10, height: 10, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', marginRight: 6 }} />
            Đang tải...
          </span>
        );
      case 'ERROR':
        return (
          <span className="badge badge-red" title={error || ''}>
            🔴 Lỗi tải image
          </span>
        );
      default:
        return <span className="badge badge-ghost">{status}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">🛠️ Quản lý Ngôn ngữ</h1>
            <p className="page-subtitle">Cấu hình trình chạy code và Docker image</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingLang(null);
              setIsModalOpen(true);
            }}
          >
            ➕ Thêm Ngôn ngữ
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Tên & Phiên bản</th>
                <th>Docker Image</th>
                <th>Phần mở rộng</th>
                <th>Trạng thái Image</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>
                    Đang tải...
                  </td>
                </tr>
              ) : languages.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                    Chưa có ngôn ngữ nào được định nghĩa.
                  </td>
                </tr>
              ) : (
                languages.map((lang) => (
                  <tr key={lang.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{lang.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        v{lang.version}
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: 13, background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>
                        {lang.dockerImage}
                      </code>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace' }}>{lang.ext}</span>
                    </td>
                    <td>{getStatusBadge(lang.imageStatus, lang.lastError)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '4px 8px' }}
                          onClick={() => {
                            setEditingLang(lang);
                            setIsModalOpen(true);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '4px 8px', color: 'var(--accent-red)' }}
                          onClick={() => handleDelete(lang.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LanguageModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLang ? 'Chỉnh sửa ngôn ngữ' : 'Thêm ngôn ngữ mới'}
        initialData={editingLang}
        onSubmit={editingLang ? handleUpdate : handleCreate}
      />
    </DashboardLayout>
  );
}
