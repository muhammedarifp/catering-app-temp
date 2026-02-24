'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { calculateIngredientCost } from '@/lib/utils/units'

function serializeIngredient(ingredient: any): any {
    return {
        ...ingredient,
        pricePerUnit: Number(ingredient.pricePerUnit),
    }
}

export async function getIngredients(isActive?: boolean) {
    try {
        const ingredients = await prisma.ingredient.findMany({
            where: {
                ...(isActive !== undefined && { isActive }),
            },
            orderBy: {
                name: 'asc',
            },
        })
        return { success: true, data: ingredients.map(serializeIngredient) }
    } catch (error) {
        console.error('Failed to fetch ingredients:', error)
        return { success: false, error: 'Failed to fetch ingredients' }
    }
}

export async function addIngredient(data: { name: string; pricePerUnit: number; unit?: string }) {
    try {
        const ingredient = await prisma.ingredient.create({
            data: {
                name: data.name,
                pricePerUnit: data.pricePerUnit,
                unit: data.unit ?? 'kg',
            },
        })
        revalidatePath('/dishes')
        return { success: true, data: serializeIngredient(ingredient) }
    } catch (error: any) {
        console.error('Failed to add ingredient:', error)
        if (error.code === 'P2002') {
            return { success: false, error: 'A sub-item with this name already exists.' }
        }
        return { success: false, error: 'Failed to add ingredient' }
    }
}

export async function updateIngredient(id: string, data: { name?: string; pricePerUnit?: number; unit?: string; isActive?: boolean }) {
    try {
        const ingredient = await prisma.ingredient.update({
            where: { id },
            data,
        })

        // If price changed, trigger cost recalculation for affected dishes
        if (data.pricePerUnit !== undefined) {
            await recalculateDishCostsForIngredient(id)
        }

        revalidatePath('/dishes')
        return { success: true, data: serializeIngredient(ingredient) }
    } catch (error) {
        console.error('Failed to update ingredient:', error)
        return { success: false, error: 'Failed to update ingredient' }
    }
}

export async function deleteIngredient(id: string) {
    try {
        await prisma.ingredient.delete({
            where: { id },
        })
        revalidatePath('/dishes')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete ingredient:', error)
        return { success: false, error: 'Failed to delete ingredient' }
    }
}

/**
 * Recalculates the estimatedCostPerPlate for all dishes that use a specific ingredient.
 */
async function recalculateDishCostsForIngredient(ingredientId: string) {
    try {
        // 1. Find all DishIngredients that use this global ingredient
        const affectedDishIngredients = await prisma.dishIngredient.findMany({
            where: { ingredientId },
            select: {
                dishId: true,
            },
            distinct: ['dishId'], // Get unique dish IDs
        })

        // 2. Recalculate cost for each affected dish
        for (const { dishId } of affectedDishIngredients) {
            await recalculateDishCost(dishId)
        }
    } catch (error) {
        console.error(`Failed to recalculate costs for ingredient ${ingredientId}:`, error)
    }
}

/**
 * Calculates and updates the `estimatedCostPerPlate` for a single dish.
 * It sums up (ingredient quantity * global ingredient pricePerUnit).
 */
export async function recalculateDishCost(dishId: string) {
    try {
        const dish = await prisma.dish.findUnique({
            where: { id: dishId },
            include: {
                ingredients: {
                    include: {
                        ingredient: true,
                    },
                },
            },
        })

        if (!dish) return

        let totalCost = 0
        for (const dishIngredient of dish.ingredients) {
            if (dishIngredient.ingredient) {
                totalCost += calculateIngredientCost(
                    Number(dishIngredient.quantity),
                    dishIngredient.unit,
                    Number(dishIngredient.ingredient.pricePerUnit),
                    dishIngredient.ingredient.unit
                )
            }
        }

        // Update the dish's estimated cost
        await prisma.dish.update({
            where: { id: dishId },
            data: {
                estimatedCostPerPlate: totalCost,
            },
        })

        // We do NOT automatically update sellingPricePerPlate here to give admins control,
        // they can see the margin changes visually.
    } catch (error) {
        console.error(`Failed to recalculate cost for dish ${dishId}:`, error)
    }
}
