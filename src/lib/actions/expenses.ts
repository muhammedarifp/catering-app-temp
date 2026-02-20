'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { ExpenseCategory } from '@prisma/client'

function serializeExpense(expense: any): any {
  if (!expense) return null
  return {
    ...expense,
    amount: Number(expense.amount),
    event: expense.event ? { ...expense.event } : undefined,
  }
}

export async function createExpense(data: {
  eventId: string
  category: ExpenseCategory
  description: string
  amount: number
  date?: Date
}) {
  try {
    const expense = await prisma.otherExpense.create({
      data: {
        eventId: data.eventId,
        category: data.category,
        description: data.description,
        amount: data.amount,
        date: data.date || new Date(),
      },
      include: {
        event: true,
      },
    })

    revalidatePath('/other-expenses')
    revalidatePath('/events')
    return { success: true, data: serializeExpense(expense) }
  } catch (error) {
    console.error('Failed to create expense:', error)
    return { success: false, error: 'Failed to create expense' }
  }
}

export async function getExpensesByEvent(eventId: string) {
  try {
    const expenses = await prisma.otherExpense.findMany({
      where: { eventId },
      orderBy: {
        date: 'desc',
      },
    })

    return { success: true, data: expenses.map(serializeExpense) }
  } catch (error) {
    console.error('Failed to fetch expenses:', error)
    return { success: false, error: 'Failed to fetch expenses' }
  }
}

export async function getAllExpenses(category?: ExpenseCategory) {
  try {
    const expenses = await prisma.otherExpense.findMany({
      where: category ? { category } : undefined,
      include: {
        event: {
          select: {
            name: true,
            eventType: true,
            eventDate: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    return { success: true, data: expenses.map(serializeExpense) }
  } catch (error) {
    console.error('Failed to fetch expenses:', error)
    return { success: false, error: 'Failed to fetch expenses' }
  }
}

export async function updateExpense(
  id: string,
  data: {
    category?: ExpenseCategory
    description?: string
    amount?: number
    date?: Date
  }
) {
  try {
    const expense = await prisma.otherExpense.update({
      where: { id },
      data,
    })

    revalidatePath('/other-expenses')
    return { success: true, data: serializeExpense(expense) }
  } catch (error) {
    console.error('Failed to update expense:', error)
    return { success: false, error: 'Failed to update expense' }
  }
}

export async function deleteExpense(id: string) {
  try {
    await prisma.otherExpense.delete({
      where: { id },
    })

    revalidatePath('/other-expenses')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete expense:', error)
    return { success: false, error: 'Failed to delete expense' }
  }
}
