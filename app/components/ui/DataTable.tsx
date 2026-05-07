'use client';

import { ReactNode } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Loader2 
} from 'lucide-react';

interface Column<T> {
  header: string;
  key: string;
  render?: (value: any, item: T) => ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  total?: number;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
}

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  total = 0,
  page = 1,
  limit = 10,
  onPageChange,
  emptyMessage = "Không tìm thấy dữ liệu phù hợp."
}: DataTableProps<T>) {
  
  const totalPages = Math.ceil(total / limit);

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;
    
    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (page < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }} className="custom-scrollbar">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  style={{ 
                    width: col.width, 
                    textAlign: col.align || 'left',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ position: 'relative', minHeight: data.length === 0 ? 200 : 'auto' }}>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <Loader2 className="animate-spin" size={32} color="var(--accent-purple)" />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((item, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col) => (
                    <td 
                      key={col.key} 
                      style={{ textAlign: col.align || 'left' }}
                    >
                      {col.render ? col.render((item as any)[col.key], item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <Search size={48} opacity={0.2} />
                    <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && onPageChange && (
        <div style={{ 
          padding: '16px 20px', 
          borderTop: '1px solid var(--border)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Hiển thị <strong>{data.length}</strong> / <strong>{total}</strong> kết quả
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button 
              className="pagination-btn" 
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft size={16} />
            </button>
            
            <div style={{ display: 'flex', gap: 6 }}>
              {getPageNumbers().map((n, i) => (
                n === '...' ? (
                  <span key={`ellipsis-${i}`} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>
                ) : (
                  <button 
                    key={n} 
                    className={`pagination-btn ${page === n ? 'active' : ''}`}
                    onClick={() => onPageChange(n as number)}
                    disabled={loading}
                  >
                    {n}
                  </button>
                )
              ))}
            </div>

            <button 
              className="pagination-btn" 
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || totalPages === 0 || loading}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .pagination-btn {
          height: 32px;
          min-width: 32px;
          padding: 0 8px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pagination-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          border-color: var(--accent-purple-light);
        }
        .pagination-btn.active {
          background: var(--accent-purple);
          color: #fff;
          border-color: var(--accent-purple);
          box-shadow: var(--shadow-glow-purple);
        }
        .pagination-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
      `}</style>
    </div>
  );
}
