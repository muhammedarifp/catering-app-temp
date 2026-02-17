import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/actions/users'

// Simple in-memory rate limiting (production should use Redis)
const loginAttempts = new Map<string, { count: number; timestamp: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutes

function getRateLimitKey(request: NextRequest): string {
  // Use IP address for rate limiting
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  return ip
}

function isRateLimited(key: string): boolean {
  const attempt = loginAttempts.get(key)
  if (!attempt) return false

  const now = Date.now()
  if (now - attempt.timestamp > LOCKOUT_TIME) {
    loginAttempts.delete(key)
    return false
  }

  return attempt.count >= MAX_ATTEMPTS
}

function recordLoginAttempt(key: string, success: boolean) {
  if (success) {
    loginAttempts.delete(key)
    return
  }

  const attempt = loginAttempts.get(key)
  const now = Date.now()

  if (!attempt || now - attempt.timestamp > LOCKOUT_TIME) {
    loginAttempts.set(key, { count: 1, timestamp: now })
  } else {
    loginAttempts.set(key, { count: attempt.count + 1, timestamp: attempt.timestamp })
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey(request)

    // Check rate limiting
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      recordLoginAttempt(rateLimitKey, false)
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      recordLoginAttempt(rateLimitKey, false)
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Password length check
    if (password.length < 6) {
      recordLoginAttempt(rateLimitKey, false)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const result = await authenticateUser(email, password)

    if (!result.success) {
      recordLoginAttempt(rateLimitKey, false)
      return NextResponse.json(
        { error: result.error || 'Authentication failed' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!result.data.isActive) {
      recordLoginAttempt(rateLimitKey, false)
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact administrator.' },
        { status: 403 }
      )
    }

    recordLoginAttempt(rateLimitKey, true)

    // Add security headers
    const response = NextResponse.json({ user: result.data })
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')

    return response
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
