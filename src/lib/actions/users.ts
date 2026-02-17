'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { UserRole, User } from '@prisma/client'
import bcrypt from 'bcrypt'

// Password hashing with bcrypt
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

// Password verification
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: UserRole
  pageAccess?: string[]
  canCreateEvents?: boolean
  canManageEnquiries?: boolean
  canManageDishes?: boolean
  canManageExpenses?: boolean
  canViewReports?: boolean
}) {
  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return { success: false, error: 'Email already exists' }
    }

    // Hash the password before storing
    const hashedPassword = await hashPassword(data.password)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        pageAccess: data.pageAccess || [],
        canCreateEvents: data.canCreateEvents || false,
        canManageEnquiries: data.canManageEnquiries || false,
        canManageDishes: data.canManageDishes || false,
        canManageExpenses: data.canManageExpenses || false,
        canViewReports: data.canViewReports || false,
      },
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    revalidatePath('/settings')
    return { success: true, data: userWithoutPassword }
  } catch (error) {
    console.error('Failed to create user:', error)
    return { success: false, error: 'Failed to create user' }
  }
}

export async function getUsers(role?: UserRole) {
  try {
    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        pageAccess: true,
        canCreateEvents: true,
        canManageEnquiries: true,
        canManageDishes: true,
        canManageExpenses: true,
        canViewReports: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { success: true, data: users }
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return { success: false, error: 'Failed to fetch users' }
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        pageAccess: true,
        canCreateEvents: true,
        canManageEnquiries: true,
        canManageDishes: true,
        canManageExpenses: true,
        canViewReports: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    return { success: true, data: user }
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return { success: false, error: 'Failed to fetch user' }
  }
}

export async function updateUserPermissions(
  id: string,
  data: {
    pageAccess?: string[]
    canCreateEvents?: boolean
    canManageEnquiries?: boolean
    canManageDishes?: boolean
    canManageExpenses?: boolean
    canViewReports?: boolean
    isActive?: boolean
  }
) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        pageAccess: true,
        canCreateEvents: true,
        canManageEnquiries: true,
        canManageDishes: true,
        canManageExpenses: true,
        canViewReports: true,
        isActive: true,
      },
    })

    revalidatePath('/settings')
    return { success: true, data: user }
  } catch (error) {
    console.error('Failed to update user permissions:', error)
    return { success: false, error: 'Failed to update user permissions' }
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    })

    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete user:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}

// Update user password
export async function updateUserPassword(id: string, newPassword: string) {
  try {
    const hashedPassword = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to update password:', error)
    return { success: false, error: 'Failed to update password' }
  }
}

// Authenticate user (for login)
export async function authenticateUser(
  email: string,
  password: string
): Promise<
  | { success: true; data: Omit<User, 'password'> }
  | { success: false; error: string }
> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }

    if (!user.isActive) {
      return { success: false, error: 'Account is inactive' }
    }

    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return { success: true, data: userWithoutPassword }
  } catch (error) {
    console.error('Failed to authenticate user:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

// Notification Settings
export async function getNotificationSettings() {
  try {
    let settings = await prisma.notificationSetting.findFirst()

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.notificationSetting.create({
        data: {},
      })
    }

    return { success: true, data: settings }
  } catch (error) {
    console.error('Failed to fetch notification settings:', error)
    return { success: false, error: 'Failed to fetch notification settings' }
  }
}

export async function updateNotificationSettings(data: {
  invoiceGenerated?: boolean
  eventCreated?: boolean
  eventStatusChanged?: boolean
  enquiryStatusChanged?: boolean
  paymentReceived?: boolean
  lowStockAlert?: boolean
}) {
  try {
    let settings = await prisma.notificationSetting.findFirst()

    if (!settings) {
      settings = await prisma.notificationSetting.create({
        data,
      })
    } else {
      settings = await prisma.notificationSetting.update({
        where: { id: settings.id },
        data,
      })
    }

    revalidatePath('/settings')
    return { success: true, data: settings }
  } catch (error) {
    console.error('Failed to update notification settings:', error)
    return { success: false, error: 'Failed to update notification settings' }
  }
}
