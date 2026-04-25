'use client';

import { usePathname } from 'next/navigation';
import { useCurrentUserInfo } from "../_api/queries";
import {
  Search,
  Bell,
  ChevronRight,
  Command,
  LayoutGrid
} from 'lucide-react';
import Link from 'next/link';

const routeLabels: Record<string, string> = {
  'student': 'Sinh viên',
  'lecturer': 'Giảng viên',
  'admin': 'Quản trị viên',
  'problems': 'Bài tập',
  'leaderboard': 'Bảng xếp hạng',
  'learning-path': 'Lộ trình học tập',
  'code-battle': 'Code Battle',
  'rooms': 'Phòng học',
  'analytics': 'Thống kê',
  'auto-grader': 'Chấm điểm',
  'plagiarism': 'Đạo văn',
  'question-bank': 'Ngân hàng câu hỏi',
  'users': 'Người dùng',
  'sandbox': 'Sandbox',
  'audit-log': 'Nhật ký',
  'system-config': 'Cấu hình',
  'create': 'Tạo mới',
  'edit': 'Chỉnh sửa',
  'code-editor': 'Soạn thảo code',
};

export default function Topbar() {
  const { data: user } = useCurrentUserInfo();
  const pathname = usePathname();

  const pathSegments = pathname.split('/').filter(Boolean);

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'rgba(13, 17, 23, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
      gap: 20,
      position: 'sticky',
      top: 0,
      zIndex: 90,
    }}>
      {/* Left: Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <div style={{
          padding: '6px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.03)',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <LayoutGrid size={18} />
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}>
          {pathSegments.map((segment, index) => {
            const label = routeLabels[segment] || segment;
            const href = '/' + pathSegments.slice(0, index + 1).join('/');
            const isLast = index === pathSegments.length - 1;

            return (
              <div key={href} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ChevronRight size={14} color="#475569" />
                <Link
                  href={href}
                  style={{
                    textDecoration: 'none',
                    color: isLast ? 'var(--text-primary)' : '#64748b',
                    transition: 'color 0.2s',
                    padding: '2px 4px',
                    borderRadius: '4px'
                  }}
                  onMouseEnter={e => !isLast && (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={e => !isLast && (e.currentTarget.style.color = '#64748b')}
                >
                  {label}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Search Trigger */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          padding: '8px 14px',
          width: 240,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
        >
          <Search size={16} color="#64748b" />
          <span style={{ color: '#64748b', fontSize: 13, flex: 1 }}>Tìm kiếm nhanh...</span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
            padding: '2px 4px',
            fontSize: 10,
            color: '#475569',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <Command size={10} />
            <span>K</span>
          </div>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <div style={{
            width: 38, height: 38, borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94a3b8',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <Bell size={18} />
          </div>
          <div style={{
            position: 'absolute', top: -2, right: -2,
            width: 18, height: 18, borderRadius: '50%',
            background: '#ef4444',
            border: '2px solid #0d1117',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: 'white',
          }}>3</div>
        </div>

        <div style={{ width: 1, height: 24, background: 'rgba(255, 255, 255, 0.05)' }} />

        {/* Semester Info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 2
        }}>
          <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Học kỳ hiện tại</span>
          <span style={{ fontSize: 12, color: '#a78bfa', fontWeight: 700 }}>HK2 (2025 - 2026)</span>
        </div>
      </div>
    </header>
  );
}
