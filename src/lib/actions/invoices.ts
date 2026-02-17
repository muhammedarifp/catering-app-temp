'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

export async function getEventForInvoice(eventId: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        dishes: {
          include: {
            dish: true,
          },
        },
        services: true,
        expenses: true,
        enquiry: true,
      },
    })

    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    return { success: true, data: event }
  } catch (error) {
    console.error('Failed to fetch event for invoice:', error)
    return { success: false, error: 'Failed to fetch event' }
  }
}

export async function createInvoice(eventId: string) {
  try {
    // Get latest invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { invoiceNumber: 'desc' },
    })

    const year = new Date().getFullYear()
    const lastNumber = lastInvoice
      ? parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0')
      : 0
    const invoiceNumber = `INV-${year}-${String(lastNumber + 1).padStart(4, '0')}`

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        dishes: {
          include: {
            dish: true,
          },
        },
        services: true,
      },
    })

    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    // Calculate totals
    const dishesTotal = event.dishes.reduce(
      (sum, dish) => sum + Number(dish.pricePerPlate) * dish.quantity,
      0
    )
    const servicesTotal = event.services.reduce(
      (sum, service) => sum + Number(service.price),
      0
    )
    const subtotal = dishesTotal + servicesTotal
    const tax = subtotal * 0.18 // 18% GST
    const totalAmount = subtotal + tax

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        eventId,
        subtotal,
        tax,
        totalAmount,
        paidAmount: Number(event.paidAmount),
        balanceAmount: totalAmount - Number(event.paidAmount),
        status: Number(event.paidAmount) >= totalAmount ? 'PAID' : 'SENT',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    })

    revalidatePath('/events')
    return { success: true, data: invoice }
  } catch (error) {
    console.error('Failed to create invoice:', error)
    return { success: false, error: 'Failed to create invoice' }
  }
}

export async function getInvoiceByEvent(eventId: string) {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { eventId },
      include: {
        event: {
          include: {
            dishes: {
              include: {
                dish: true,
              },
            },
            services: true,
          },
        },
      },
    })

    return { success: true, data: invoice }
  } catch (error) {
    console.error('Failed to fetch invoice:', error)
    return { success: false, error: 'Failed to fetch invoice' }
  }
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED',
  paidAmount?: number
) {
  try {
    const updateData: any = { status }

    if (paidAmount !== undefined) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
      })

      if (!invoice) {
        return { success: false, error: 'Invoice not found' }
      }

      updateData.paidAmount = paidAmount
      updateData.balanceAmount = Number(invoice.totalAmount) - paidAmount

      if (status === 'PAID') {
        updateData.paidDate = new Date()
      }
    }

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: updateData,
    })

    revalidatePath('/events')
    return { success: true, data: invoice }
  } catch (error) {
    console.error('Failed to update invoice:', error)
    return { success: false, error: 'Failed to update invoice' }
  }
}
