'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { recalculateDishCost } from './ingredients'

type DishType = 'RECIPE' | 'LIVE' | 'FIXED'

function serializeDish(dish: any): any {
  return {
    ...dish,
    dishType: dish.dishType ?? 'RECIPE',
    estimatedCostPerPlate: Number(dish.estimatedCostPerPlate),
    labourCost: Number(dish.labourCost ?? 0),
    pricePerPlate: Number(dish.pricePerPlate ?? 0),
    priceUnit: dish.priceUnit ?? 'per plate',
    sellingPricePerPlate: Number(dish.sellingPricePerPlate ?? 0),
    ingredients: dish.ingredients?.map((ing: any) => ({
      ...ing,
      quantity: Number(ing.quantity),
      ingredient: ing.ingredient
        ? { ...ing.ingredient, pricePerUnit: Number(ing.ingredient.pricePerUnit) }
        : null,
    })),
  }
}

export async function createDish(data: {
  name: string
  description?: string
  category: string
  dishType?: DishType
  estimatedCostPerPlate?: number
  labourCost?: number
  pricePerPlate?: number
  priceUnit?: string
  sellingPricePerPlate?: number
  isVeg?: boolean
  ingredients: Array<{ ingredientName: string; quantity: number; unit: string; ingredientId?: string }>
  imageUrl?: string
}) {
  try {
    const dishType = data.dishType ?? 'RECIPE'
    // LIVE/FIXED dishes don't have ingredients or labour cost
    const ingredients = dishType === 'RECIPE' ? data.ingredients : []

    const dish = await prisma.dish.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        dishType,
        labourCost: dishType === 'RECIPE' ? (data.labourCost ?? 0) : 0,
        estimatedCostPerPlate: data.estimatedCostPerPlate || 0,
        pricePerPlate: data.pricePerPlate || 0,
        priceUnit: data.priceUnit || 'per plate',
        sellingPricePerPlate: data.sellingPricePerPlate || 0,
        isVeg: data.isVeg ?? true,
        imageUrl: data.imageUrl,
        ingredients: {
          create: ingredients.map(i => ({
            ingredientName: i.ingredientName,
            quantity: i.quantity,
            unit: i.unit,
            ingredientId: i.ingredientId || undefined,
          })),
        },
      },
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
    })

    if (dishType === 'RECIPE') {
      await recalculateDishCost(dish.id)
    }

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
          include: { ingredient: true },
        },
      },
      orderBy: { name: 'asc' },
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
          include: { ingredient: true },
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
    dishType?: DishType
    estimatedCostPerPlate?: number
    labourCost?: number
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
    const dishType = dishData.dishType

    const dish = await prisma.dish.update({
      where: { id },
      data: {
        ...dishData,
        // LIVE/FIXED: clear labour cost and ingredients
        ...(dishType === 'LIVE' || dishType === 'FIXED'
          ? { labourCost: 0, ingredients: { deleteMany: {} } }
          : ingredients !== undefined
          ? {
              ingredients: {
                deleteMany: {},
                create: ingredients.map(i => ({
                  ingredientName: i.ingredientName,
                  quantity: i.quantity,
                  unit: i.unit,
                  ingredientId: i.ingredientId || undefined,
                })),
              },
            }
          : {}),
      },
      include: {
        ingredients: { include: { ingredient: true } },
      },
    })

    // Re-fetch to get the current dishType if not provided in update
    const currentDishType = dishType ?? (dish as any).dishType ?? 'RECIPE'
    if (currentDishType === 'RECIPE') {
      await recalculateDishCost(dish.id)
    }

    revalidatePath('/dishes')
    return { success: true, data: serializeDish(dish) }
  } catch (error) {
    console.error('Failed to update dish:', error)
    return { success: false, error: 'Failed to update dish' }
  }
}

export async function deleteDish(id: string) {
  try {
    await prisma.dish.delete({ where: { id } })
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
  dishType?: DishType
  labourCost?: number
  pricePerPlate?: number
  priceUnit?: string
  estimatedCostPerPlate?: number
  sellingPricePerPlate?: number
  isVeg?: boolean
  ingredients?: Array<{ ingredientName: string; quantity: number; unit: string; ingredientId?: string }>
}>) {
  try {
    const createdDishes = await Promise.all(
      dishes.map(dish => {
        const dishType = dish.dishType ?? 'RECIPE'
        const ingredients = dishType === 'RECIPE' ? (dish.ingredients ?? []) : []
        return prisma.dish.create({
          data: {
            name: dish.name,
            description: dish.description,
            category: dish.category,
            dishType,
            labourCost: dishType === 'RECIPE' ? (dish.labourCost ?? 0) : 0,
            estimatedCostPerPlate: dish.estimatedCostPerPlate || 0,
            pricePerPlate: dish.pricePerPlate || 0,
            priceUnit: dish.priceUnit || 'per plate',
            sellingPricePerPlate: dish.sellingPricePerPlate || 0,
            isVeg: dish.isVeg ?? true,
            ingredients: ingredients.length
              ? {
                  create: ingredients.map(i => ({
                    ingredientName: i.ingredientName,
                    quantity: i.quantity,
                    unit: i.unit,
                    ingredientId: i.ingredientId || undefined,
                  })),
                }
              : undefined,
          },
        })
      })
    )

    for (const dish of createdDishes) {
      if ((dish as any).dishType === 'RECIPE') {
        await recalculateDishCost(dish.id)
      }
    }

    revalidatePath('/dishes')
    return { success: true, data: createdDishes.map(serializeDish) }
  } catch (error) {
    console.error('Failed to bulk upload dishes:', error)
    return { success: false, error: 'Failed to bulk upload dishes' }
  }
}
