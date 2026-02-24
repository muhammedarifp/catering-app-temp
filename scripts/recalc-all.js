// @ts-check
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

// Conversion function
function calculateCost(q, dUnit, p, gUnit) {
    const d = dUnit ? dUnit.toLowerCase() : 'g';
    const g = gUnit ? gUnit.toLowerCase() : 'kg';

    if (d === g) return q * p;

    if (d === 'g' && g === 'kg') return (q / 1000) * p;
    if (d === 'kg' && g === 'g') return (q * 1000) * p;
    if (d === 'ml' && g === 'l') return (q / 1000) * p;
    if (d === 'l' && g === 'ml') return (q * 1000) * p;

    return q * p;
}

async function main() {
    // Read .env file manually just in case
    const envFile = fs.readFileSync('.env', 'utf-8');
    const dbUrlMatch = envFile.match(/DATABASE_URL="([^"]+)"/);
    if (!dbUrlMatch) {
        console.error("No DATABASE_URL found");
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: dbUrlMatch[1],
    });

    try {
        console.log('Fetching all dishes and their ingredients...');

        // Let's get all dishes
        const { rows: dishes } = await pool.query('SELECT id FROM "Dish"');

        for (const dish of dishes) {
            // Get all ingredients for this dish
            const { rows: dishIngredients } = await pool.query(`
                SELECT di.quantity, di.unit as d_unit, i."pricePerUnit", i.unit as g_unit
                FROM "DishIngredient" di
                JOIN "Ingredient" i ON di."ingredientId" = i.id
                WHERE di."dishId" = $1
            `, [dish.id]);

            let totalCost = 0;
            for (const item of dishIngredients) {
                const cost = calculateCost(
                    Number(item.quantity),
                    item.d_unit,
                    Number(item.pricePerUnit),
                    item.g_unit
                );
                totalCost += cost;
            }

            console.log(`Dish ${dish.id}: New Calculated Cost = ${totalCost}`);

            // Save it
            await pool.query(`
                UPDATE "Dish" 
                SET "estimatedCostPerPlate" = $1
                WHERE id = $2
            `, [totalCost, dish.id]);
        }

        console.log('Finished recalculating all dish costs!');
    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

main();
