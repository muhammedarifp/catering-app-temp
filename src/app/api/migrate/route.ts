import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        console.log('Starting migration to link existing ingredients to global Sub Items...')

        const unlinkedDishIngredients = await prisma.dishIngredient.findMany({
            where: { ingredientId: null }
        })

        console.log(`Found ${unlinkedDishIngredients.length} unlinked dish ingredients.`)

        for (const di of unlinkedDishIngredients) {
            // Find existing global ingredient by name
            let globalIng = await prisma.ingredient.findFirst({
                where: {
                    name: di.ingredientName.trim()
                }
            })

            if (!globalIng) {
                console.log(`Creating global ingredient: ${di.ingredientName.trim()}`)
                globalIng = await prisma.ingredient.create({
                    data: {
                        name: di.ingredientName.trim(),
                        pricePerUnit: 0,
                        unit: di.unit || 'g'
                    }
                })
            }

            console.log(`Linking dish ingredient ${di.id} to ${globalIng.name}`)
            await prisma.dishIngredient.update({
                where: { id: di.id },
                data: { ingredientId: globalIng.id }
            })
        }

        console.log('Migration completed successfully. All dishes are now using global sub items!')
        return NextResponse.json({ success: true, count: unlinkedDishIngredients.length, message: 'Migration completed successfully. All dishes are now using global sub items!' })

    } catch (error: any) {
        console.error('Migration failed:', error)
        return NextResponse.json({ success: false, error: 'Migration failed', details: error.message || String(error) }, { status: 500 })
    }
}
