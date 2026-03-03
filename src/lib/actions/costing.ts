'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

function serializeCostItem(item: any) {
  return {
    ...item,
    qty: Number(item.qty),
    rate: Number(item.rate),
  }
}

export async function getCostItems(opts: { enquiryId?: string; eventId?: string }) {
  try {
    const where = opts.enquiryId ? { enquiryId: opts.enquiryId } : { eventId: opts.eventId }
    const items = await prisma.costItem.findMany({
      where,
      orderBy: [{ section: 'asc' }, { orderIndex: 'asc' }, { createdAt: 'asc' }],
    })
    return { success: true, data: items.map(serializeCostItem) }
  } catch (error) {
    console.error('getCostItems error:', error)
    return { success: false, error: 'Failed to fetch cost items' }
  }
}

export async function addCostItem(data: {
  enquiryId?: string
  eventId?: string
  section: string
  itemName: string
  qty: number
  unit: string
  rate: number
}) {
  try {
    const item = await prisma.costItem.create({ data })
    if (data.enquiryId) revalidatePath(`/enquiries/${data.enquiryId}`)
    if (data.eventId) revalidatePath(`/events/${data.eventId}`)
    return { success: true, data: serializeCostItem(item) }
  } catch (error) {
    console.error('addCostItem error:', error)
    return { success: false, error: 'Failed to add cost item' }
  }
}

export async function updateCostItem(
  id: string,
  data: { section?: string; itemName?: string; qty?: number; unit?: string; rate?: number }
) {
  try {
    const item = await prisma.costItem.update({ where: { id }, data })
    if (item.enquiryId) revalidatePath(`/enquiries/${item.enquiryId}`)
    if (item.eventId) revalidatePath(`/events/${item.eventId}`)
    return { success: true, data: serializeCostItem(item) }
  } catch (error) {
    console.error('updateCostItem error:', error)
    return { success: false, error: 'Failed to update cost item' }
  }
}

export async function deleteCostItem(id: string) {
  try {
    const item = await prisma.costItem.delete({ where: { id } })
    if (item.enquiryId) revalidatePath(`/enquiries/${item.enquiryId}`)
    if (item.eventId) revalidatePath(`/events/${item.eventId}`)
    return { success: true }
  } catch (error) {
    console.error('deleteCostItem error:', error)
    return { success: false, error: 'Failed to delete cost item' }
  }
}

export async function copyCostItemsToEvent(enquiryId: string, eventId: string) {
  try {
    const items = await prisma.costItem.findMany({ where: { enquiryId } })
    if (items.length === 0) return { success: true, internalCost: 0 }

    const internalCost = items.reduce((sum, i) => sum + Number(i.qty) * Number(i.rate), 0)

    await prisma.costItem.createMany({
      data: items.map(i => ({
        eventId,
        section: i.section,
        itemName: i.itemName,
        qty: i.qty,
        unit: i.unit,
        rate: i.rate,
        orderIndex: i.orderIndex,
      })),
    })

    return { success: true, internalCost }
  } catch (error) {
    console.error('copyCostItemsToEvent error:', error)
    return { success: false, error: 'Failed to copy cost items' }
  }
}
