'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

export async function createTodo(data: {
  title: string
  description?: string
  priority?: string
  dueDate?: Date
  eventId?: string
  createdById: string
}) {
  try {
    const todo = await prisma.todo.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || 'NORMAL',
        dueDate: data.dueDate,
        eventId: data.eventId,
        createdById: data.createdById,
      },
    })

    revalidatePath('/')
    return { success: true, data: todo }
  } catch (error) {
    console.error('Failed to create todo:', error)
    return { success: false, error: 'Failed to create todo' }
  }
}

export async function getTodos(isCompleted?: boolean) {
  try {
    const todos = await prisma.todo.findMany({
      where: isCompleted !== undefined ? { isCompleted } : undefined,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        {
          isCompleted: 'asc',
        },
        {
          dueDate: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    })

    return { success: true, data: todos }
  } catch (error) {
    console.error('Failed to fetch todos:', error)
    return { success: false, error: 'Failed to fetch todos' }
  }
}

export async function toggleTodoComplete(id: string, isCompleted: boolean) {
  try {
    const todo = await prisma.todo.update({
      where: { id },
      data: { isCompleted },
    })

    revalidatePath('/')
    return { success: true, data: todo }
  } catch (error) {
    console.error('Failed to toggle todo:', error)
    return { success: false, error: 'Failed to toggle todo' }
  }
}

export async function updateTodo(
  id: string,
  data: {
    title?: string
    description?: string
    priority?: string
    dueDate?: Date
  }
) {
  try {
    const todo = await prisma.todo.update({
      where: { id },
      data,
    })

    revalidatePath('/')
    return { success: true, data: todo }
  } catch (error) {
    console.error('Failed to update todo:', error)
    return { success: false, error: 'Failed to update todo' }
  }
}

export async function deleteTodo(id: string) {
  try {
    await prisma.todo.delete({
      where: { id },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete todo:', error)
    return { success: false, error: 'Failed to delete todo' }
  }
}
