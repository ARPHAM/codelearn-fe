"use client";

import { redirect } from 'next/navigation';
import { useCurrentUserInfo } from './components/_api/queries';

export default function Home() {
  const { data: user, isPending } = useCurrentUserInfo()

  if (isPending) {
    return null
  }

  if (!user) {
    redirect('/login')
  }
  if (user.role === 'admin') {
    redirect('/admin/users')
  }
  if (user.role === 'lecturer') {
    redirect('/lecturer/analytics')
  }
  if (user.role === 'student') {
    redirect('/student/code-editor')
  }
  return null
}
