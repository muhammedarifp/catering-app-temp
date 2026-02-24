'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { AlertCircle, ChefHat, Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/')
    }
  }, [isLoading, router, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)

    if (!result.success) {
      setError(result.error || 'Login failed')
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-amber-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-amber-700"></div>
          <p className="mt-4 text-slate-600">Loading workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden p-4 sm:p-6 lg:justify-end lg:p-12">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 bg-slate-900">
        <Image
          src="/genuine-catering.png"
          alt="Professional catering setup"
          fill
          className="object-cover object-center opacity-70 lg:opacity-100"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/60 to-slate-900/20 lg:bg-gradient-to-r lg:from-slate-900/40 lg:via-slate-900/80 lg:to-slate-900/95" />
      </div>

      {/* Decorative large screen text */}
      <div className="absolute bottom-12 left-12 z-10 hidden max-w-xl lg:block xl:left-20 xl:max-w-2xl">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-600 shadow-xl shadow-amber-600/30">
          <ChefHat className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md lg:text-4xl xl:text-5xl xl:leading-[1.15]">
          Elevate your catering operations.
        </h1>
        <p className="mt-4 text-base text-slate-200 drop-shadow xl:text-lg">
          Manage bookings, track kitchen execution, and organize your team seamlessly from one premium platform.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium text-slate-200">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
            <span>Event Calendar</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
            <span>Cost Tracking</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
            <span>Team Assignments</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex h-full max-h-[850px] w-full max-w-md flex-col justify-center lg:mr-12 lg:max-w-[26rem] xl:mr-24">
        <div className="flex-none overflow-hidden rounded-[2rem] border border-white/10 bg-white/85 p-5 shadow-2xl backdrop-blur-xl sm:p-6 lg:bg-white/95 lg:p-8 lg:backdrop-blur-2xl">
          <div className="mb-6">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-600 shadow-lg shadow-amber-600/30 lg:hidden">
              <ChefHat className="h-5 w-5 text-white" />
            </div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600 lg:text-amber-700">Catering SaaS</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Sign in</h2>
            <p className="mt-1 text-sm text-slate-600">Access your workspace.</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 backdrop-blur-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-900">Login failed</p>
                <p className="mt-0.5 text-xs text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white/60 px-3 py-2.5 pl-10 text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 lg:py-3 lg:text-base"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white/60 px-3 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 lg:py-3 lg:text-base"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 font-semibold text-white shadow-md shadow-amber-600/20 transition hover:bg-amber-700 hover:shadow-amber-600/30 active:scale-[0.98] disabled:border-amber-200 disabled:bg-amber-100 disabled:text-amber-400 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <LogIn className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50/50 p-3 lg:mt-8 lg:bg-amber-50/80">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">Demo credentials</p>
            <div className="text-xs text-amber-900/80">
              <p>
                <strong>Admin:</strong> admin@example.com / admin123
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 flex-none text-center text-[10px] text-white/50 drop-shadow-md sm:text-white/70 lg:text-slate-500 lg:drop-shadow-none">
          Catering Management System &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
