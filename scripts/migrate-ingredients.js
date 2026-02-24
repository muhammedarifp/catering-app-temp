import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting migration to link existing ingredients to global Sub Items...')

    const unlinkedDishIngredients = await prisma.dishIngredient.findMany({
        where: { ingredientId: null }
    })

    console.log(`Found ${unlinkedDishIngredients.length} unlinked dish ingredients.`)

    for (const di of unlinkedDishIngredients) {
        // Find existing global ingredient by name
        let globalIng = await prisma.ingredient.findFirst({
            where: {
                name: {
                    equals: di.ingredientName.trim(),
                    mode: 'insensitive'
                }
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
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
