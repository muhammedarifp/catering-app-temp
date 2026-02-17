'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'MANAGER'
  pageAccess: string[]
  canCreateEvents: boolean
  canManageEnquiries: boolean
  canManageDishes: boolean
  canManageExpenses: boolean
  canViewReports: boolean
  isActive: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
  hasAccess: (page: string) => boolean
  hasPermission: (permission: keyof User) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user')
    const sessionExpiry = localStorage.getItem('auth_expiry')

    if (storedUser && sessionExpiry) {
      try {
        // Check if session has expired
        const expiryTime = parseInt(sessionExpiry)
        const currentTime = Date.now()

        if (currentTime < expiryTime) {
          setUser(JSON.parse(storedUser))
        } else {
          // Session expired, clear storage
          localStorage.removeItem('auth_user')
          localStorage.removeItem('auth_expiry')
          console.log('Session expired')
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_expiry')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Input validation
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' }
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' }
      }

      // Validate user data
      if (!data.user || !data.user.id || !data.user.email) {
        return { success: false, error: 'Invalid user data received' }
      }

      setUser(data.user)

      // Store user data with expiration (24 hours)
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      localStorage.setItem('auth_expiry', expiryTime.toString())

      router.push('/')
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_expiry')

    // Clear any other sensitive data
    sessionStorage.clear()

    router.push('/login')
  }

  const hasAccess = (page: string): boolean => {
    if (!user) return false
    if (user.role === 'SUPER_ADMIN') return true
    return user.pageAccess.includes(page)
  }

  const hasPermission = (permission: keyof User): boolean => {
    if (!user) return false
    if (user.role === 'SUPER_ADMIN') return true
    return !!user[permission]
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasAccess, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
