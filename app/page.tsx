"use client";

import { redirect } from 'next/navigation';
import { useCurrentUserInfo } from './components/_api/queries';

export default function Home() {
  const { data: user, isPending } = useCurrentUserInfo()

  if (isPending) {
    return null
  }

  const roleRedirects: Record<string, string> = {
    admin: '/admin/users',
    lecturer: '/lecturer/analytics',
    student: '/student/problems', // Chuyển về danh sách bài tập là hợp lý nhất cho sinh viên
  };

  if (!user) {
    redirect('/login');
  }

  const userRole = user.role?.toLowerCase();
  
  if (userRole && roleRedirects[userRole]) {
    redirect(roleRedirects[userRole]);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>Vui lòng đợi...</h2>
        <div className="spin" style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent-purple)', borderRadius: '50%', margin: '0 auto' }} />
      </div>
    </div>
  );
}
