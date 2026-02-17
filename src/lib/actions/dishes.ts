'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

// Helper to serialize Decimal fields to numbers
function serializeDish(dish: any): any {
  return {
    ...dish,
    pricePerPlate: Number(dish.pricePerPlate),
    estimatedCostPerPlate: Number(dish.estimatedCostPerPlate),
    sellingPricePerPlate: Number(dish.sellingPricePerPlate),
    ingredients: dish.ingredients?.map((ing: any) => ({
      ...ing,
      quantity: Number(ing.quantity),
    })),
  }
}

export async function createDish(data: {
  name: string
  description?: string
  category: string
  pricePerPlate?: number
  estimatedCostPerPlate?: number
  sellingPricePerPlate?: number
  isVeg?: boolean
  ingredients: Array<{ ingredientName: string; quantity: number; unit: string }>
  imageUrl?: string
}) {
  try {
    const dish = await prisma.dish.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        pricePerPlate: data.sellingPricePerPlate || data.pricePerPlate || 0,
        estimatedCostPerPlate: data.estimatedCostPerPlate || 0,
        sellingPricePerPlate: data.sellingPricePerPlate || data.pricePerPlate || 0,
        isVeg: data.isVeg ?? true,
        imageUrl: data.imageUrl,
        ingredients: {
          create: data.ingredients.map(i => ({
            ingredientName: i.ingredientName,
            quantity: i.quantity,
            unit: i.unit,
          })),
        },
      },
      include: {
        ingredients: true,
      },
    })

    revalidatePath('/dishes')
    return { success: true, data: serializeDish(dish) }
  } catch (error) {
    console.error('Failed to create dish:', error)
    return { success: false, error: 'Failed to create dish' }
  }
}

export async function getDishes(category?: string, isActive?: boolean) {
  try {
    const dishes = await prisma.dish.findMany({
      where: {
        ...(category && { category }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        ingredients: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return { success: true, data: dishes.map(serializeDish) }
  } catch (error) {
    console.error('Failed to fetch dishes:', error)
    return { success: false, error: 'Failed to fetch dishes' }
  }
}

export async function getDishById(id: string) {
  try {
    const dish = await prisma.dish.findUnique({
      where: { id },
      include: {
        ingredients: true,
      },
    })

    if (!dish) {
      return { success: false, error: 'Dish not found' }
    }

    return { success: true, data: serializeDish(dish) }
  } catch (error) {
    console.error('Failed to fetch dish:', error)
    return { success: false, error: 'Failed to fetch dish' }
  }
}

export async function updateDish(
  id: string,
  data: {
    name?: string
    description?: string
    category?: string
    pricePerPlate?: number
    estimatedCostPerPlate?: number
    sellingPricePerPlate?: number
    isVeg?: boolean
    imageUrl?: string
    isActive?: boolean
  }
) {
  try {
    const dish = await prisma.dish.update({
      where: { id },
      data,
      include: {
        ingredients: true,
      },
    })

    revalidatePath('/dishes')
    return { success: true, data: serializeDish(dish) }
  } catch (error) {
    console.error('Failed to update dish:', error)
    return { success: false, error: 'Failed to update dish' }
  }
}

export async function deleteDish(id: string) {
  try {
    await prisma.dish.delete({
      where: { id },
    })

    revalidatePath('/dishes')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete dish:', error)
    return { success: false, error: 'Failed to delete dish' }
  }
}

export async function bulkUploadDishes(dishes: Array<{
  name: string
  description?: string
  category: string
  pricePerPlate?: number
  estimatedCostPerPlate?: number
  sellingPricePerPlate?: number
  isVeg?: boolean
  ingredients?: Array<{ ingredientName: string; quantity: number; unit: string }>
}>) {
  try {
    const createdDishes = await Promise.all(
      dishes.map(dish =>
        prisma.dish.create({
          data: {
            name: dish.name,
            description: dish.description,
            category: dish.category,
            pricePerPlate: dish.sellingPricePerPlate || dish.pricePerPlate || 0,
            estimatedCostPerPlate: dish.estimatedCostPerPlate || 0,
            sellingPricePerPlate: dish.sellingPricePerPlate || dish.pricePerPlate || 0,
            isVeg: dish.isVeg ?? true,
            ingredients: dish.ingredients
              ? {
                create: dish.ingredients.map(i => ({
                  ingredientName: i.ingredientName,
                  quantity: i.quantity,
                  unit: i.unit,
                })),
              }
              : undefined,
          },
        })
      )
    )

    revalidatePath('/dishes')
    return { success: true, data: createdDishes.map(serializeDish) }
  } catch (error) {
    console.error('Failed to bulk upload dishes:', error)
    return { success: false, error: 'Failed to bulk upload dishes' }
  }
}
