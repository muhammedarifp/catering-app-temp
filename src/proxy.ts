import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = [
  '/',
  '/events',
  '/dishes',
  '/other-expenses',
  '/settings',
  '/api/auth/logout',
]

// Public routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, check if user has a session
  if (isProtectedRoute) {
    // In client-side protection, we rely on ProtectedRoute component
    // This middleware is an additional layer for API routes

    // For API routes, we should validate the session
    if (pathname.startsWith('/api/')) {
      // You can add token validation here when implementing JWT
      // For now, we rely on server action authentication
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
