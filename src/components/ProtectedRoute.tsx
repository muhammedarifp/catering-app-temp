'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPage?: string
  requiredPermission?: string
}

export default function ProtectedRoute({
  children,
  requiredPage,
  requiredPermission,
}: ProtectedRouteProps) {
  const { user, isLoading, hasAccess } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Not logged in - redirect to login
      if (!user) {
        router.push('/login')
        return
      }

      // Check page access
      if (requiredPage && !hasAccess(requiredPage)) {
        router.push('/')
        return
      }
    }
  }, [user, isLoading, requiredPage, hasAccess, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requiredPage && !hasAccess(requiredPage)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-600 mb-6">You don't have permission to access this page.</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
