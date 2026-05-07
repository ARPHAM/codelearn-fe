'use client';

import { usePathname } from 'next/navigation';
import { useCurrentUserInfo } from "../_api/queries";
import {
  ChevronRight,
  LayoutGrid
} from 'lucide-react';
import Link from 'next/link';
import NotificationPopover from "./NotificationPopover";

const routeLabels: Record<string, string> = {
  'student': 'Sinh viên',
  'lecturer': 'Giảng viên',
  'admin': 'Quản trị viên',
  'problems': 'Bài tập',
  'courses': 'Lớp học',
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
        {/* Notifications */}
        <NotificationPopover />

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
