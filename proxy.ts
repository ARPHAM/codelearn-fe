import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get('refreshToken')

  const { pathname } = request.nextUrl

  const protectedRoutes = ['/dashboard', '/admin', '/profile', '/student', '/teacher', '/demo', '/auth', '/forgot-password', '/reset-password', '/verify-email', '/resend-verification-email', '/resend-reset-password-email', '/resend-reset-password-email']

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtected && !accessToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/student/:path*',
    '/teacher/:path*',
    '/demo/:path*',
    '/auth/:path*',
    '/forgot-password/:path*',
    '/reset-password/:path*',
    '/verify-email/:path*',
    '/resend-verification-email/:path*',
    '/resend-reset-password-email/:path*',
    '/resend-reset-password-email/:path*',
  ],
}