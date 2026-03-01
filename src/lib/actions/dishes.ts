'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { recalculateDishCost } from './ingredients'

// Helper to serialize Decimal fields to numbers
function serializeDish(dish: any): any {
  return {
    ...dish,
    estimatedCostPerPlate: Number(dish.estimatedCostPerPlate),
    pricePerPlate: Number(dish.pricePerPlate ?? 0),
    priceUnit: dish.priceUnit ?? 'per plate',
    sellingPricePerPlate: Number(dish.sellingPricePerPlate ?? 0),
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
  estimatedCostPerPlate?: number
  pricePerPlate?: number
  priceUnit?: string
  sellingPricePerPlate?: number
  isVeg?: boolean
  ingredients: Array<{ ingredientName: string; quantity: number; unit: string; ingredientId?: string }>
  imageUrl?: string
}) {
  try {
    const dish = await prisma.dish.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        estimatedCostPerPlate: data.estimatedCostPerPlate || 0,
        pricePerPlate: data.pricePerPlate || 0,
        priceUnit: data.priceUnit || 'per plate',
        sellingPricePerPlate: data.sellingPricePerPlate || 0,
        isVeg: data.isVeg ?? true,
        imageUrl: data.imageUrl,
        ingredients: {
          create: data.ingredients.map(i => ({
            ingredientName: i.ingredientName,
            quantity: i.quantity,
            unit: i.unit,
            ingredientId: i.ingredientId || undefined,
          })),
        },
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    })

    await recalculateDishCost(dish.id)

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
        ingredients: {
          include: {
            ingredient: true,
          },
        },
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
        ingredients: {
          include: {
            ingredient: true,
          }
        },
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
    estimatedCostPerPlate?: number
    pricePerPlate?: number
    priceUnit?: string
    sellingPricePerPlate?: number
    isVeg?: boolean
    imageUrl?: string
    isActive?: boolean
    ingredients?: Array<{ ingredientName: string; quantity: number; unit: string; ingredientId?: string }>
  }
) {
  try {
    const { ingredients, ...dishData } = data

    const dish = await prisma.dish.update({
      where: { id },
      data: {
        ...dishData,
        ...(ingredients !== undefined && {
          ingredients: {
            deleteMany: {},
            create: ingredients.map(i => ({
              ingredientName: i.ingredientName,
              quantity: i.quantity,
              unit: i.unit,
              ingredientId: i.ingredientId || undefined,
            })),
          },
        }),
      },
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
  priceUnit?: string
  estimatedCostPerPlate?: number
  sellingPricePerPlate?: number
  isVeg?: boolean
  ingredients?: Array<{ ingredientName: string; quantity: number; unit: string; ingredientId?: string }>
}>) {
  try {
    const createdDishes = await Promise.all(
      dishes.map(dish =>
        prisma.dish.create({
          data: {
            name: dish.name,
            description: dish.description,
            category: dish.category,
            estimatedCostPerPlate: dish.estimatedCostPerPlate || 0,
            pricePerPlate: dish.pricePerPlate || 0,
            priceUnit: dish.priceUnit || 'per plate',
            sellingPricePerPlate: dish.sellingPricePerPlate || 0,
            isVeg: dish.isVeg ?? true,
            ingredients: dish.ingredients
              ? {
                create: dish.ingredients.map(i => ({
                  ingredientName: i.ingredientName,
                  quantity: i.quantity,
                  unit: i.unit,
                  ingredientId: i.ingredientId || undefined,
                })),
              }
              : undefined,
          },
        })
      )
    )

    for (const dish of createdDishes) {
      await recalculateDishCost(dish.id)
    }

    revalidatePath('/dishes')
    return { success: true, data: createdDishes.map(serializeDish) }
  } catch (error) {
    console.error('Failed to bulk upload dishes:', error)
    return { success: false, error: 'Failed to bulk upload dishes' }
  }
}
