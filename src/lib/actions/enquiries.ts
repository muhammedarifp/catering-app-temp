'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { EnquiryStatus } from '@prisma/client'

function serializeEnquiry(enquiry: any): any {
  if (!enquiry) return null
  return {
    ...enquiry,
    totalAmount: Number(enquiry.totalAmount),
    dishes: enquiry.dishes?.map((d: any) => ({
      ...d,
      pricePerPlate: Number(d.pricePerPlate),
      dish: d.dish ? {
        ...d.dish,
        pricePerPlate: Number(d.dish.pricePerPlate),
        estimatedCostPerPlate: Number(d.dish.estimatedCostPerPlate ?? 0),
        sellingPricePerPlate: Number(d.dish.sellingPricePerPlate ?? 0),
        ingredients: d.dish.ingredients?.map((i: any) => ({
          ...i,
          quantity: Number(i.quantity),
        })),
      } : undefined,
    })),
    services: enquiry.services?.map((s: any) => ({
      ...s,
      price: Number(s.price),
    })),
    convertedEvent: enquiry.convertedEvent ? {
      ...enquiry.convertedEvent,
      totalAmount: Number(enquiry.convertedEvent.totalAmount),
      paidAmount: Number(enquiry.convertedEvent.paidAmount),
      balanceAmount: Number(enquiry.convertedEvent.balanceAmount),
    } : undefined,
  }
}

export async function createEnquiry(data: {
  clientName: string
  clientContact: string
  peopleCount: number
  location: string
  eventDate: Date
  eventTime: string
  dishes: Array<{ dishId: string; quantity: number; pricePerPlate: number }>
  services: Array<{ serviceName: string; description?: string; price: number }>
  createdById: string
}) {
  try {
    // Generate quotation number
    const count = await prisma.enquiry.count()
    const quotationNumber = `QT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

    // Calculate total amount
    const dishesTotal = data.dishes.reduce((sum, d) => sum + (d.quantity * Number(d.pricePerPlate)), 0)
    const servicesTotal = data.services.reduce((sum, s) => sum + Number(s.price), 0)
    const totalAmount = dishesTotal + servicesTotal

    const enquiry = await prisma.enquiry.create({
      data: {
        clientName: data.clientName,
        clientContact: data.clientContact,
        peopleCount: data.peopleCount,
        location: data.location,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        quotationNumber,
        totalAmount,
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
        updates: {
          create: {
            updateType: 'STATUS_CHANGE',
            description: 'Enquiry created',
            newValue: 'PENDING',
          },
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

    revalidatePath('/')
    return { success: true, data: serializeEnquiry(enquiry) }
  } catch (error) {
    console.error('Failed to create enquiry:', error)
    return { success: false, error: 'Failed to create enquiry' }
  }
}

export async function updateEnquiryStatus(enquiryId: string, status: EnquiryStatus, userId: string) {
  try {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id: enquiryId },
      include: {
        dishes: {
          include: {
            dish: true,
          },
        },
        services: true,
      },
    })

    if (!enquiry) {
      return { success: false, error: 'Enquiry not found' }
    }

    const oldStatus = enquiry.status

    // Update enquiry status
    const updatedEnquiry = await prisma.enquiry.update({
      where: { id: enquiryId },
      data: {
        status,
        updates: {
          create: {
            updateType: 'STATUS_CHANGE',
            description: `Status changed from ${oldStatus} to ${status}`,
            oldValue: oldStatus,
            newValue: status,
          },
        },
      },
    })

    // If status is SUCCESS, convert to event
    if (status === 'SUCCESS') {
      const event = await prisma.event.create({
        data: {
          name: `${enquiry.clientName}'s Event`,
          eventType: 'MAIN_EVENT',
          status: 'UPCOMING',
          clientName: enquiry.clientName,
          clientContact: enquiry.clientContact,
          location: enquiry.location,
          eventDate: enquiry.eventDate,
          eventTime: enquiry.eventTime,
          guestCount: enquiry.peopleCount,
          totalAmount: enquiry.totalAmount,
          paidAmount: 0,
          balanceAmount: enquiry.totalAmount,
          createdById: userId,
          enquiryId: enquiry.id,
          dishes: {
            create: enquiry.dishes.map(d => ({
              dishId: d.dishId,
              quantity: d.quantity,
              pricePerPlate: d.pricePerPlate,
            })),
          },
          services: {
            create: enquiry.services.map(s => ({
              serviceName: s.serviceName,
              description: s.description,
              price: s.price,
            })),
          },
        },
      })

      revalidatePath('/')
      revalidatePath('/events')
      return { success: true, data: serializeEnquiry(updatedEnquiry), event: { id: event.id } }
    }

    revalidatePath('/')
    return { success: true, data: serializeEnquiry(updatedEnquiry) }
  } catch (error) {
    console.error('Failed to update enquiry status:', error)
    return { success: false, error: 'Failed to update enquiry status' }
  }
}

export async function getEnquiries(status?: EnquiryStatus) {
  try {
    const enquiries = await prisma.enquiry.findMany({
      where: status ? { status } : undefined,
      include: {
        dishes: {
          include: {
            dish: true,
          },
        },
        services: true,
        updates: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { success: true, data: enquiries.map(serializeEnquiry) }
  } catch (error) {
    console.error('Failed to fetch enquiries:', error)
    return { success: false, error: 'Failed to fetch enquiries' }
  }
}

export async function getEnquiryById(id: string) {
  try {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        dishes: {
          include: {
            dish: true,
          },
        },
        services: true,
        updates: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        convertedEvent: true,
      },
    })

    if (!enquiry) {
      return { success: false, error: 'Enquiry not found' }
    }

    return { success: true, data: serializeEnquiry(enquiry) }
  } catch (error) {
    console.error('Failed to fetch enquiry:', error)
    return { success: false, error: 'Failed to fetch enquiry' }
  }
}

export async function addEnquiryUpdate(enquiryId: string, description: string, updateType = 'NOTE_ADDED') {
  try {
    const update = await prisma.enquiryUpdate.create({
      data: {
        enquiryId,
        updateType,
        description,
      },
    })

    revalidatePath('/')
    return { success: true, data: { ...update } }
  } catch (error) {
    console.error('Failed to add enquiry update:', error)
    return { success: false, error: 'Failed to add update' }
  }
}
