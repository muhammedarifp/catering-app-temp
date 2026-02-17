'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { EventType, EventStatus } from '@prisma/client'

export async function createEvent(data: {
  name: string
  eventType: EventType
  clientName: string
  clientContact: string
  location: string
  eventDate: Date
  eventTime: string
  guestCount: number
  dishes: Array<{ dishId: string; quantity: number; pricePerPlate: number }>
  services: Array<{ serviceName: string; description?: string; price: number }>
  notes?: string
  createdById: string
}) {
  try {
    // Calculate total amount
    const dishesTotal = data.dishes.reduce((sum, d) => sum + (d.quantity * Number(d.pricePerPlate)), 0)
    const servicesTotal = data.services.reduce((sum, s) => sum + Number(s.price), 0)
    const totalAmount = dishesTotal + servicesTotal

    const event = await prisma.event.create({
      data: {
        name: data.name,
        eventType: data.eventType,
        clientName: data.clientName,
        clientContact: data.clientContact,
        location: data.location,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        guestCount: data.guestCount,
        totalAmount,
        paidAmount: 0,
        balanceAmount: totalAmount,
        notes: data.notes,
        createdById: data.createdById,
        dishes: {
          create: data.dishes.map(d => ({
            dishId: d.dishId,
            quantity: d.quantity,
            pricePerPlate: d.pricePerPlate,
          })),
        },
        services: {
          create: data.services.map(s => ({
            serviceName: s.serviceName,
            description: s.description,
            price: s.price,
          })),
        },
      },
      include: {
        dishes: {
          include: {
            dish: true,
          },
        },
        services: true,
      },
    })

    revalidatePath('/events')
    revalidatePath('/')
    return { success: true, data: event }
  } catch (error) {
    console.error('Failed to create event:', error)
    return { success: false, error: 'Failed to create event' }
  }
}

export async function getEvents(eventType?: EventType, status?: EventStatus) {
  try {
    const events = await prisma.event.findMany({
      where: {
        ...(eventType && { eventType }),
        ...(status && { status }),
      },
      include: {
        dishes: {
          include: {
            dish: true,
          },
        },
        services: true,
        expenses: true,
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        eventDate: 'asc',
      },
    })

    return { success: true, data: events }
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return { success: false, error: 'Failed to fetch events' }
  }
}

export async function getEventById(id: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        dishes: {
          include: {
            dish: true,
          },
        },
        services: true,
        expenses: true,
        invoices: true,
        enquiry: true,
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    return { success: true, data: event }
  } catch (error) {
    console.error('Failed to fetch event:', error)
    return { success: false, error: 'Failed to fetch event' }
  }
}

export async function updateEventStatus(eventId: string, status: EventStatus) {
  try {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: { status },
    })

    revalidatePath('/events')
    revalidatePath('/')
    return { success: true, data: event }
  } catch (error) {
    console.error('Failed to update event status:', error)
    return { success: false, error: 'Failed to update event status' }
  }
}

export async function updateEventPayment(eventId: string, paidAmount: number) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    const newPaidAmount = Number(event.paidAmount) + paidAmount
    const balanceAmount = Number(event.totalAmount) - newPaidAmount

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        paidAmount: newPaidAmount,
        balanceAmount,
      },
    })

    revalidatePath('/events')
    revalidatePath('/')
    return { success: true, data: updatedEvent }
  } catch (error) {
    console.error('Failed to update event payment:', error)
    return { success: false, error: 'Failed to update event payment' }
  }
}

export async function bulkUploadEvents(events: Array<{
  name: string
  eventType: EventType
  status: EventStatus
  clientName: string
  clientContact: string
  location: string
  eventDate: Date
  eventTime: string
  guestCount: number
  totalAmount: number
  paidAmount: number
  createdById: string
}>) {
  try {
    const createdEvents = await prisma.event.createMany({
      data: events.map(e => ({
        ...e,
        balanceAmount: e.totalAmount - e.paidAmount,
      })),
    })

    revalidatePath('/events')
    revalidatePath('/')
    return { success: true, data: createdEvents }
  } catch (error) {
    console.error('Failed to bulk upload events:', error)
    return { success: false, error: 'Failed to bulk upload events' }
  }
}

// Get events for grocery purchase (tomorrow's events by default)
export async function getEventsForGroceryPurchase(date?: Date) {
  try {
    const targetDate = date || new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow by default

    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const events = await prisma.event.findMany({
      where: {
        eventDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['UPCOMING', 'IN_PROGRESS'],
        },
      },
      include: {
        dishes: {
          include: {
            dish: {
              include: {
                ingredients: true,
              },
            },
          },
        },
      },
    })

    return { success: true, data: events }
  } catch (error) {
    console.error('Failed to fetch events for grocery purchase:', error)
    return { success: false, error: 'Failed to fetch events' }
  }
}
