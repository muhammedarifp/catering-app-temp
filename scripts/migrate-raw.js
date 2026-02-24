import pg from 'pg'
import crypto from 'crypto'

async function main() {
    const { Pool } = pg
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    })

    console.log('Connecting to database directly using pg pool...')

    try {
        const unlinked = await pool.query(`SELECT DISTINCT "ingredientName", "unit" FROM "DishIngredient" WHERE "ingredientId" IS NULL`)

        console.log(`Found ${unlinked.rowCount} unique unlinked ingredients to process.`)

        for (const row of unlinked.rows) {
            const name = row.ingredientName.trim()
            const unit = row.unit || 'g'
            const id = crypto.randomUUID().replace(/-/g, '').slice(0, 25) // approx cuid length

            // Insert global ingredient if it doesn't exist
            await pool.query(
                `INSERT INTO "Ingredient" (id, name, "pricePerUnit", unit, "isActive", "createdAt", "updatedAt") 
         VALUES ($1, $2, 0, $3, true, NOW(), NOW()) 
         ON CONFLICT (name) DO NOTHING`,
                [id, name, unit]
            )

            console.log(`Ensured global ingredient exists: ${name}`)
        }

        // Now update all DishIngredients to point to the global Ingredient
        console.log('Updating DishIngredient records to link to the new Global Ingredients...')
        const updateResult = await pool.query(
            `UPDATE "DishIngredient" di 
       SET "ingredientId" = i.id 
       FROM "Ingredient" i 
       WHERE di."ingredientName" = i.name AND di."ingredientId" IS NULL`
        )

        console.log(`Successfully linked ${updateResult.rowCount} DishIngredient records!`)
    } catch (error) {
        console.error('Migration failed:', error)
    } finally {
        await pool.end()
    }
}

main()
