'use client';
import Link from 'next/link';
import { redirect, usePathname, useRouter } from 'next/navigation';
import { useCurrentUserInfo } from '../_api/queries';
import { useState } from 'react';
import { useLogout } from '../_api/mutations';
import {
  LayoutDashboard,
  Zap,
  Search,
  FolderLock,
  Database,
  Target,
  Users,
  Swords,
  Map,
  Trophy,
  Home,
  Settings,
  ShieldCheck,
  Box,
  ClipboardList,
  LogOut,
  User as UserIcon,
  ChevronRight,
  ChevronLeft,
  Terminal,
  GraduationCap,
  BookOpen
} from 'lucide-react';

const navGroups = [
  {
    label: 'Giảng viên',
    role: 'LECTURER',
    color: '#a78bfa',
    items: [
      { href: '/lecturer/analytics', icon: LayoutDashboard, label: 'Thống kê & Phân tích' },
      { href: '/lecturer/courses', icon: BookOpen, label: 'Lớp học giảng dạy' },
      { href: '/lecturer/auto-grader', icon: Zap, label: 'Chấm điểm Tự động' },
      { href: '/lecturer/problems', icon: FolderLock, label: 'Quản lý Bài tập' },
      { href: '/lecturer/question-bank', icon: Database, label: 'Ngân hàng Câu hỏi' },
    ],
  },
  {
    label: 'Sinh viên',
    role: 'STUDENT',
    color: '#22d3ee',
    items: [
      { href: '/student/problems', icon: Target, label: 'Luyện tập (Bài tập)' },
      { href: '/student/courses', icon: GraduationCap, label: 'Lớp học của tôi' },
      { href: '/student/code-battle', icon: Swords, label: 'Code Battle' },
      { href: '/student/learning-path', icon: Map, label: 'Lộ trình Học tập' },
      { href: '/student/leaderboard', icon: Trophy, label: 'Bảng xếp hạng' },
      { href: '/student/rooms', icon: Home, label: 'Phòng học trực tuyến' },
    ],
  },
  {
    label: 'Quản trị viên',
    role: 'ADMIN',
    color: '#fbbf24',
    items: [
      { href: '/admin/users', icon: Users, label: 'Quản lý Người dùng' },
      { href: '/admin/courses', icon: GraduationCap, label: 'Quản lý Lớp học' },
      { href: '/admin/problems', icon: ShieldCheck, label: 'Phê duyệt Bài tập' },
      { href: '/admin/sandbox', icon: Box, label: 'Tài nguyên Sandbox' },
      { href: '/admin/audit-log', icon: ClipboardList, label: 'Nhật ký hệ thống' },
      { href: '/admin/system-config', icon: Settings, label: 'Cấu hình Hệ thống' },
      { href: '/admin/rooms', icon: Home, label: 'Quản lý Phòng học' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  const [isDropdownClicked, setIsDropdownClicked] = useState(false);

  const { data: user, isPending } = useCurrentUserInfo();
  const { mutate: logout } = useLogout();

  if (isPending) return null;
  if (!user) redirect('/login');

  const rawRole = user.role;
  const userRole = typeof rawRole === 'string' ? rawRole.toUpperCase() : '';
  const filteredGroups = navGroups.filter(g =>
    g.role === 'ALL' ||
    g.role === userRole ||
    (Array.isArray(rawRole) && rawRole.some(r => r.toUpperCase() === g.role))
  );

  return (
    <aside style={{
      width: isCollapsed ? 80 : 260,
      minWidth: isCollapsed ? 80 : 260,
      height: '100vh',
      background: 'rgba(13, 17, 23, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      zIndex: 200,
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      willChange: 'width',
      boxShadow: isCollapsed ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
    }}>
      <div style={{
        padding: isCollapsed ? '24px 0' : '24px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: 12,
        marginBottom: 10,
        position: 'relative'
      }}>
        <div style={{
          width: 40, height: 40,
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
          flexShrink: 0,
          color: 'white',
          fontWeight: 'bold'
        }}><Terminal size={22} strokeWidth={2.5} /></div>
        <div style={{
          opacity: isCollapsed ? 0 : 1,
          width: isCollapsed ? 0 : 'auto',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          whiteSpace: 'nowrap'
        }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>CodeLearn</div>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Platform</div>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            position: 'absolute',
            right: isCollapsed ? -12 : -12, // Always slightly out for better visual balance
            top: 32,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#1c2333',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer',
            zIndex: 210,
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }} className="custom-scrollbar">
        {filteredGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: 24 }}>
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: isCollapsed ? 0 : 12,
                    padding: '10px 12px',
                    marginBottom: 4,
                    borderRadius: 10,
                    background: active ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                    color: active ? '#a78bfa' : '#94a3b8',
                    fontSize: 14,
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                  }}
                    className="sidebar-item"
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                      }
                    }}>
                    <Icon size={18} strokeWidth={active ? 2.5 : 2} style={{ transition: 'transform 0.2s', flexShrink: 0 }} />
                    <span style={{
                      flex: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      opacity: isCollapsed ? 0 : 1,
                      width: isCollapsed ? 0 : 'auto',
                      transition: 'opacity 0.2s, width 0.2s',
                      marginLeft: isCollapsed ? 0 : 12,
                    }}>{item.label}</span>
                    {active && (
                      <div style={{
                        position: 'absolute',
                        left: -4,
                        width: 4,
                        height: 20,
                        background: '#8b5cf6',
                        borderRadius: 2,
                        boxShadow: '0 0 10px #8b5cf6'
                      }} />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div
        style={{
          padding: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(0, 0, 0, 0.2)',
          position: 'relative',
        }}
        onMouseEnter={() => setIsDropdownHovered(true)}
        onMouseLeave={() => setIsDropdownHovered(false)}
      >
        <div
          onClick={() => setIsDropdownClicked(!isDropdownClicked)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: isCollapsed ? 0 : 12,
            padding: isCollapsed ? '8px 0' : '8px',
            borderRadius: 12,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div className="avatar" style={{
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            color: 'white',
            width: 36, height: 36,
            fontSize: 14,
            fontWeight: 'bold',
            borderRadius: 10,
            flexShrink: 0
          }}>
            {user?.avatar ? user?.avatar?.charAt(0).toUpperCase() : user?.role?.slice(0, 2).toUpperCase()}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flex: 1,
            opacity: isCollapsed ? 0 : 1,
            width: isCollapsed ? 0 : 'auto',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            whiteSpace: 'nowrap'
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>{user.name || 'Người dùng'}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{user.role}</div>
            </div>
            <ChevronRight size={16} color="#64748b" style={{
              transform: isDropdownClicked ? 'rotate(-90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }} />
          </div>
        </div>

        {(isDropdownHovered || isDropdownClicked) && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: isCollapsed ? 12 : 16,
              right: isCollapsed ? 'auto' : 16,
              width: isCollapsed ? 220 : 'auto',
              paddingBottom: 12, // Invisible bridge to maintain hover state
              zIndex: 50,
            }}
          >
            <div style={{
              background: '#161b22',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
              padding: '6px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              <div
                style={{
                  padding: '10px 12px',
                  fontSize: 13,
                  color: '#e6edf3',
                  cursor: 'pointer',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => { 
                  setIsDropdownClicked(false); 
                  setIsDropdownHovered(false); 
                  router.push('/profile');
                }}
              >
                <UserIcon size={16} />
                Thông tin cá nhân
              </div>
              <div
                style={{
                  padding: '10px 12px',
                  fontSize: 13,
                  color: '#f87171',
                  cursor: 'pointer',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => {
                  setIsDropdownClicked(false);
                  setIsDropdownHovered(false);
                  logout();
                }}
              >
                <LogOut size={16} />
                Đăng xuất
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
