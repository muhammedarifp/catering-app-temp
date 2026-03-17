'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { EnquiryStatus } from '@prisma/client'

function serializeEnquiry(enquiry: any): any {
  if (!enquiry) return null
  return {
    ...enquiry,
    totalAmount: Number(enquiry.totalAmount),
    finalPrice: Number(enquiry.finalPrice ?? 0),
    advanceAmount: Number(enquiry.advanceAmount ?? 0),
    revisionNumber: enquiry.revisionNumber ?? 1,
    costItems: enquiry.costItems?.map((c: any) => ({
      ...c,
      qty: Number(c.qty),
      rate: Number(c.rate),
    })),
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
          ingredient: i.ingredient ? {
            ...i.ingredient,
            pricePerUnit: Number(i.ingredient.pricePerUnit),
          } : null,
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

export async function reviseEnquiry(id: string) {
  try {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        dishes: { include: { dish: { select: { name: true, priceUnit: true } } } },
        services: true,
      },
    })

    if (!enquiry) return { success: false, error: 'Enquiry not found' }
    if (enquiry.status !== 'PRICE_QUOTED') {
      return { success: false, error: 'Only a quoted enquiry can be revised' }
    }

    const currentRev = enquiry.revisionNumber || 1
    const newRevision = currentRev + 1

    // Snapshot the current PRICE_QUOTED state before reopening
    await prisma.enquiryRevisionSnapshot.create({
      data: {
        enquiryId: id,
        revisionNumber: currentRev,
        dishes: enquiry.dishes.map(d => ({
          dishId: d.dishId,
          dishName: d.dish?.name || '',
          quantity: d.quantity,
          pricePerPlate: Number(d.pricePerPlate),
          priceUnit: d.dish?.priceUnit || 'per plate',
        })),
        services: enquiry.services.map(s => ({
          serviceName: s.serviceName,
          description: s.description || '',
          price: Number(s.price),
        })),
        finalPrice: enquiry.finalPrice,
        advanceAmount: enquiry.advanceAmount,
        paymentTerms: enquiry.paymentTerms,
      },
    })

    const updated = await prisma.enquiry.update({
      where: { id },
      data: {
        status: 'PENDING',
        revisionNumber: newRevision,
        finalPrice: 0,
        updates: {
          create: {
            updateType: 'REVISION',
            description: `Revision ${newRevision} started — quotation reopened for changes`,
            oldValue: 'PRICE_QUOTED',
            newValue: 'PENDING',
          },
        },
      },
    })

    revalidatePath(`/enquiries/${id}`)
    revalidatePath('/enquiries')
    return { success: true, data: serializeEnquiry(updated) }
  } catch (error) {
    console.error('Failed to revise enquiry:', error)
    return { success: false, error: 'Failed to revise enquiry' }
  }
}

export async function restoreRevision(enquiryId: string, snapshotId: string) {
  try {
    const [snapshot, enquiry] = await Promise.all([
      prisma.enquiryRevisionSnapshot.findUnique({ where: { id: snapshotId } }),
      prisma.enquiry.findUnique({ where: { id: enquiryId }, select: { status: true, revisionNumber: true } }),
    ])

    if (!snapshot || snapshot.enquiryId !== enquiryId) return { success: false, error: 'Snapshot not found' }
    if (!enquiry) return { success: false, error: 'Enquiry not found' }
    if (enquiry.status === 'SUCCESS' || enquiry.status === 'LOST') {
      return { success: false, error: 'Cannot restore a completed enquiry' }
    }
    if (enquiry.status !== 'PENDING') {
      return { success: false, error: 'Revise the quotation first before restoring a previous revision' }
    }

    const dishes = snapshot.dishes as Array<{ dishId: string; quantity: number; pricePerPlate: number }>
    const services = snapshot.services as Array<{ serviceName: string; description: string; price: number }>

    // Delete current dishes & services, recreate from snapshot
    await prisma.enquiryDish.deleteMany({ where: { enquiryId } })
    await prisma.enquiryService.deleteMany({ where: { enquiryId } })

    if (dishes.length > 0) {
      await prisma.enquiryDish.createMany({
        data: dishes.map(d => ({
          enquiryId,
          dishId: d.dishId,
          quantity: d.quantity,
          pricePerPlate: d.pricePerPlate,
        })),
      })
    }

    if (services.length > 0) {
      await prisma.enquiryService.createMany({
        data: services.map(s => ({
          enquiryId,
          serviceName: s.serviceName,
          description: s.description || undefined,
          price: s.price,
        })),
      })
    }

    await prisma.enquiry.update({
      where: { id: enquiryId },
      data: {
        finalPrice: snapshot.finalPrice,
        advanceAmount: snapshot.advanceAmount,
        paymentTerms: snapshot.paymentTerms,
        updates: {
          create: {
            updateType: 'RESTORE',
            description: `Restored to Rev. ${snapshot.revisionNumber} — menu and pricing rolled back`,
            oldValue: String(enquiry.revisionNumber),
            newValue: String(snapshot.revisionNumber),
          },
        },
      },
    })

    revalidatePath(`/enquiries/${enquiryId}`)
    revalidatePath('/enquiries')
    return { success: true }
  } catch (error) {
    console.error('Failed to restore revision:', error)
    return { success: false, error: 'Failed to restore revision' }
  }
}

export async function updateEnquiryPricing(
  id: string,
  data: { finalPrice?: number; advanceAmount?: number; paymentTerms?: string }
) {
  try {
    const enquiry = await prisma.enquiry.update({ where: { id }, data })
    revalidatePath(`/enquiries/${id}`)
    revalidatePath('/enquiries')
    return { success: true, data: serializeEnquiry(enquiry) }
  } catch (error) {
    console.error('Failed to update enquiry pricing:', error)
    return { success: false, error: 'Failed to update pricing' }
  }
}

export async function updateEnquiryDetails(
  id: string,
  data: { occasion?: string[]; serviceType?: string[] }
) {
  try {
    const enquiry = await prisma.enquiry.update({
      where: { id },
      data,
    })
    revalidatePath('/enquiries')
    return { success: true, data: serializeEnquiry(enquiry) }
  } catch (error) {
    console.error('Failed to update enquiry details:', error)
    return { success: false, error: 'Failed to update enquiry details' }
  }
}

export async function createEnquiry(data: {
  clientName: string
  clientContact: string
  peopleCount: number
  location: string
  eventDate: Date
  eventTime: string
  occasion?: string[]
  serviceType?: string[]
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
        occasion: data.occasion,
        serviceType: data.serviceType,
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
    revalidatePath('/enquiries')
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
      // Calculate internal cost from costing items
      const costItems = await prisma.costItem.findMany({ where: { enquiryId } })
      const internalCost = costItems.reduce((sum, i) => sum + Number(i.qty) * Number(i.rate), 0)

      // Use finalPrice if set, otherwise fall back to totalAmount
      const agreedTotal = Number(enquiry.finalPrice) > 0 ? Number(enquiry.finalPrice) : Number(enquiry.totalAmount)

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
          totalAmount: agreedTotal,
          paidAmount: Number(enquiry.advanceAmount) || 0,
          balanceAmount: agreedTotal - (Number(enquiry.advanceAmount) || 0),
          internalCost,
          advanceAmount: Number(enquiry.advanceAmount) || 0,
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

      // Copy costing items to the event
      if (costItems.length > 0) {
        await prisma.costItem.createMany({
          data: costItems.map(i => ({
            eventId: event.id,
            section: i.section,
            itemName: i.itemName,
            qty: i.qty,
            unit: i.unit,
            rate: i.rate,
            orderIndex: i.orderIndex,
          })),
        })
      }

      revalidatePath('/')
      revalidatePath('/enquiries')
      revalidatePath(`/enquiries/${enquiryId}`)
      revalidatePath('/events')
      return { success: true, data: serializeEnquiry(updatedEnquiry), event: { id: event.id } }
    }

    revalidatePath('/')
    revalidatePath('/enquiries')
    revalidatePath(`/enquiries/${enquiryId}`)
    return { success: true, data: serializeEnquiry(updatedEnquiry) }
  } catch (error) {
    console.error('Failed to update enquiry status:', error)
    return { success: false, error: 'Failed to update enquiry status' }
  }
}

export async function getEnquiries(
  status?: EnquiryStatus,
  dateRange?: { start: Date; end: Date }
) {
  try {
    const enquiries = await prisma.enquiry.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(dateRange && {
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        }),
      },
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
            dish: {
              include: {
                ingredients: {
                  include: {
                    ingredient: true,
                  },
                },
              },
            },
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
        costItems: {
          orderBy: [{ section: 'asc' }, { orderIndex: 'asc' }, { createdAt: 'asc' }],
        },
        revisionSnapshots: {
          orderBy: { revisionNumber: 'asc' },
        },
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
    revalidatePath('/enquiries')
    revalidatePath(`/enquiries/${enquiryId}`)
    return { success: true, data: { ...update } }
  } catch (error) {
    console.error('Failed to add enquiry update:', error)
    return { success: false, error: 'Failed to add update' }
  }
}

// ==========================================
// QUOTATION EDITING (DISHES & SERVICES)
// ==========================================

export async function recalculateEnquiryTotal(enquiryId: string) {
  try {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id: enquiryId },
      include: { dishes: true, services: true },
    })

    if (!enquiry) return null

    const dishesTotal = enquiry.dishes.reduce((sum, d) => sum + (d.quantity * Number(d.pricePerPlate)), 0)
    const servicesTotal = enquiry.services.reduce((sum, s) => sum + Number(s.price), 0)
    const newTotal = dishesTotal + servicesTotal

    await prisma.enquiry.update({
      where: { id: enquiryId },
      data: { totalAmount: newTotal },
    })

    return newTotal
  } catch (error) {
    console.error("Failed to recalculate total:", error)
    return null
  }
}

export async function addEnquiryDish(enquiryId: string, data: { dishId: string, quantity: number, pricePerPlate: number }) {
  try {
    await prisma.enquiryDish.create({
      data: {
        enquiryId,
        dishId: data.dishId,
        quantity: data.quantity,
        pricePerPlate: data.pricePerPlate,
      }
    })
    await recalculateEnquiryTotal(enquiryId)
    revalidatePath(`/enquiries/${enquiryId}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to add dish:", error)
    return { success: false, error: "Failed to add dish" }
  }
}

export async function updateEnquiryDish(id: string, enquiryId: string, data: { quantity: number, pricePerPlate: number }) {
  try {
    await prisma.enquiryDish.update({
      where: { id },
      data: {
        quantity: data.quantity,
        pricePerPlate: data.pricePerPlate,
      }
    })
    await recalculateEnquiryTotal(enquiryId)
    revalidatePath(`/enquiries/${enquiryId}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to update dish:", error)
    return { success: false, error: "Failed to update dish" }
  }
}

export async function removeEnquiryDish(id: string, enquiryId: string) {
  try {
    await prisma.enquiryDish.delete({ where: { id } })
    await recalculateEnquiryTotal(enquiryId)
    revalidatePath(`/enquiries/${enquiryId}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to remove dish:", error)
    return { success: false, error: "Failed to remove dish" }
  }
}

export async function addEnquiryService(enquiryId: string, data: { serviceName: string, price: number }) {
  try {
    await prisma.enquiryService.create({
      data: {
        enquiryId,
        serviceName: data.serviceName,
        price: data.price,
      }
    })
    await recalculateEnquiryTotal(enquiryId)
    revalidatePath(`/enquiries/${enquiryId}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to add service:", error)
    return { success: false, error: "Failed to add service" }
  }
}

export async function updateEnquiryService(id: string, enquiryId: string, data: { serviceName: string, price: number }) {
  try {
    await prisma.enquiryService.update({
      where: { id },
      data: {
        serviceName: data.serviceName,
        price: data.price,
      }
    })
    await recalculateEnquiryTotal(enquiryId)
    revalidatePath(`/enquiries/${enquiryId}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to update service:", error)
    return { success: false, error: "Failed to update service" }
  }
}

export async function removeEnquiryService(id: string, enquiryId: string) {
  try {
    await prisma.enquiryService.delete({ where: { id } })
    await recalculateEnquiryTotal(enquiryId)
    revalidatePath(`/enquiries/${enquiryId}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to remove service:", error)
    return { success: false, error: "Failed to remove service" }
  }
}
