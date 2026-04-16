'use client';

import { useQuery } from '@tanstack/react-query';
import { auditApi, AuditLog } from '@/api/audit.api';
import { useState } from 'react';
import { Loader2, Search, Filter, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const actionMeta: Record<string, { label: string; cls: string; icon: string }> = {
  'POST /api/v1/admin/settings': { label: 'Cập nhật cấu hình', cls: 'badge-orange', icon: '⚙' },
  'PATCH /api/v1/admin/settings': { label: 'Cập nhật cấu hình', cls: 'badge-orange', icon: '⚙' },
  'POST /api/v1/admin/languages': { label: 'Thêm ngôn ngữ', cls: 'badge-green', icon: '➕' },
  'PATCH /api/v1/admin/languages': { label: 'Sửa ngôn ngữ', cls: 'badge-yellow', icon: '✏️' },
  'DELETE /api/v1/admin/languages': { label: 'Xóa ngôn ngữ', cls: 'badge-red', icon: '🗑' },
  'POST /api/v1/banks': { label: 'Tạo ngân hàng', cls: 'badge-purple', icon: '🗃️' },
};

const severityLeft: Record<string, string> = { info: '#06b6d4', warning: '#f59e0b', danger: '#ef4444' };

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', page, search],
    queryFn: async () => {
      const resp = await auditApi.getLogs({ page, limit: 15, search });
      return resp;
    },
  });

  const logs = data?.items || [];
  const total = data?.total || 0;

  const parseAction = (action: string) => {
    const meta = actionMeta[action];
    if (meta) return meta;
    
    // Fallback parsing
    const [method, url] = action.split(' ');
    if (method === 'DELETE') return { label: 'Xóa dữ liệu', cls: 'badge-red', icon: '🗑' };
    if (method === 'POST') return { label: 'Tạo mới', cls: 'badge-green', icon: '➕' };
    if (method === 'PATCH' || method === 'PUT') return { label: 'Cập nhật', cls: 'badge-yellow', icon: '✏️' };
    
    return { label: action, cls: 'badge-gray', icon: '•' };
  };

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Nhật ký hệ thống</h1>
          <p className="page-subtitle">Lịch sử thao tác của các quản trị viên và giảng viên</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost">📤 Xuất báo cáo</button>
        </div>
      </div>

      <div className="card" style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            className="input" 
            placeholder="Tìm theo hành động hoặc ID người dùng..." 
            style={{ paddingLeft: 36, width: '100%' }} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-ghost"><Filter size={16} /> Lọc nâng cao</button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Loader2 className="animate-spin" size={40} color="var(--accent-purple)" />
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Hành động</th>
                <th>Người dùng</th>
                <th>Thông tin bổ sung</th>
                <th>Thời gian</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: AuditLog) => {
                const meta = parseAction(log.action);
                return (
                  <tr key={log.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className={`badge ${meta.cls}`} style={{ width: 'fit-content' }}>
                          {meta.icon} {meta.label}
                        </span>
                        <code style={{ fontSize: 10, color: 'var(--text-muted)' }}>{log.action}</code>
                      </div>
                    </td>
                    <td>
                       <div style={{ fontSize: 13, fontWeight: 600 }}>{log.userId || 'Hệ thống'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                         IP: {log.metadata?.ip || 'N/A'} • {JSON.stringify(log.metadata?.body || {})}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost" style={{ padding: '6px' }} title="Xem chi tiết">
                        <FileText size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                   <td colSpan={5} style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                      Chưa có ghi chép nào trong hệ thống.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Tổng cộng: <strong>{total}</strong> ghi chép
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
               <button 
                 className="btn btn-ghost" 
                 style={{ padding: 8 }} 
                 disabled={page === 1}
                 onClick={() => setPage(p => p - 1)}
               >
                 <ChevronLeft size={18} />
               </button>
               <span style={{ fontSize: 13, fontWeight: 600 }}>Trang {page}</span>
               <button 
                 className="btn btn-ghost" 
                 style={{ padding: 8 }}
                 disabled={logs.length < 15}
                 onClick={() => setPage(p => p + 1)}
               >
                 <ChevronRight size={18} />
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
