/**
 * Updates all existing dishes with Kerala-accurate pricing and proper price units.
 * Run: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/update-pricing.ts
 *   or: npx tsx prisma/update-pricing.ts
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password123@localhost:5433/catering_app',
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ---------------------------------------------------------------------------
// Kerala 2024-25 Catering Pricing Reference
//
// priceUnit options: 'per plate' | 'per kg' | 'per L' | 'per ml' | 'per item'
//   per plate  → served per person (tea, juice, individual servings)
//   per kg     → biriyani, fry, curry, veg dishes, rice (by weight)
//   per L      → sambar, payasam, buttermilk, liquid dishes
//   per item   → bottled water, bread (porotta/pathiri), snacks (shawarma, samosa, pappadam)
//
// pricePerPlate  → your cost price (raw materials, labour)
// sellingPricePerPlate → what you charge the client per unit
// ---------------------------------------------------------------------------
const dishPricing: Array<{
  name: string
  priceUnit: string
  costPrice: number     // ₹ — approximate Kerala market cost
  sellingPrice: number  // ₹ — typical catering selling price
}> = [
  // ── Welcome Drink ────────────────────────────────────────────────────────
  // Fresh juice (5 varieties) served per glass per person
  { name: 'Fresh Fruits Juice Live (5 Types)', priceUnit: 'per plate', costPrice: 40,  sellingPrice: 85  },
  // Tender coconut: whole nut — ₹35-45 wholesale, sell ~₹70
  { name: 'Tender Coconut Water (Elaneer)',    priceUnit: 'per item',  costPrice: 40,  sellingPrice: 70  },

  // ── Herbal Tea (per cup / per plate) ─────────────────────────────────────
  { name: 'Ginger Tea',    priceUnit: 'per plate', costPrice: 10, sellingPrice: 25 },
  { name: 'Mint Tea',      priceUnit: 'per plate', costPrice: 8,  sellingPrice: 25 },
  { name: 'Lime Tea',      priceUnit: 'per plate', costPrice: 8,  sellingPrice: 25 },
  { name: 'Green Tea',     priceUnit: 'per plate', costPrice: 12, sellingPrice: 30 },
  { name: 'Cinnamon Tea',  priceUnit: 'per plate', costPrice: 10, sellingPrice: 30 },
  { name: 'Cardamom Tea',  priceUnit: 'per plate', costPrice: 10, sellingPrice: 25 },

  // ── Main Course — Biriyani (per kg finished biriyani) ────────────────────
  // Beef ~₹360/kg raw; finished biriyani ~55% yield → cost ~₹160/kg
  { name: 'Beef Biriyani',           priceUnit: 'per kg', costPrice: 160, sellingPrice: 320 },
  // Chicken Kabiri: chicken ~₹240/kg raw; finished ~₹130/kg
  { name: 'Chicken Kabiri',          priceUnit: 'per kg', costPrice: 130, sellingPrice: 260 },
  // Mutton ~₹800/kg raw; finished ~₹220/kg
  { name: 'Mutton Biriyani',         priceUnit: 'per kg', costPrice: 220, sellingPrice: 450 },
  // Prawns ~₹500/kg raw; finished ~₹200/kg
  { name: 'Prawn Biriyani',          priceUnit: 'per kg', costPrice: 200, sellingPrice: 420 },
  // Veg dum biriyani — rice + veg cost ~₹70/kg
  { name: 'Vegetable Dum Biriyani',  priceUnit: 'per kg', costPrice: 70,  sellingPrice: 160 },

  // ── Fry (per kg cooked) ──────────────────────────────────────────────────
  // Chicken fry: 1 kg raw chicken (+masala+oil) → ~700g cooked; cost ~₹250/kg cooked
  { name: 'Chicken Fry',  priceUnit: 'per kg', costPrice: 250, sellingPrice: 450 },
  // Beef Varattu: slow roasted beef with coconut — cost ~₹300/kg
  { name: 'Beef Varattu', priceUnit: 'per kg', costPrice: 300, sellingPrice: 550 },
  // Fish fry (Seer/Kingfish): ~₹280/kg raw, ~₹240/kg cooked
  { name: 'Fish Fry',     priceUnit: 'per kg', costPrice: 240, sellingPrice: 440 },

  // ── Salads / Condiments (per kg) ─────────────────────────────────────────
  { name: 'Raita',          priceUnit: 'per kg', costPrice: 60,  sellingPrice: 130 },
  { name: 'Pickle (Achar)', priceUnit: 'per kg', costPrice: 100, sellingPrice: 220 },

  // ── Veg Dishes ───────────────────────────────────────────────────────────
  // Sambar — liquid; sold per litre; 1L sambar costs ~₹55 to make
  { name: 'Sambar',      priceUnit: 'per L',  costPrice: 55, sellingPrice: 120 },
  // Avial — mixed veg+coconut; per kg
  { name: 'Avial',       priceUnit: 'per kg', costPrice: 70, sellingPrice: 150 },
  // Thoran — shredded veg+coconut; per kg
  { name: 'Thoran',      priceUnit: 'per kg', costPrice: 50, sellingPrice: 110 },
  // Koottucurry — yam+raw banana+coconut; per kg
  { name: 'Koottucurry', priceUnit: 'per kg', costPrice: 65, sellingPrice: 140 },
  // Pappadam — sold per piece in catering (~₹3 cost, sell ₹6-8)
  { name: 'Pappadam',    priceUnit: 'per item', costPrice: 3, sellingPrice: 7   },
  // Steamed rice — per kg (raw rice ~₹60/kg, cooked yield ~2.5x)
  { name: 'Steamed Rice', priceUnit: 'per kg', costPrice: 55, sellingPrice: 110 },

  // ── Drinks ───────────────────────────────────────────────────────────────
  // Packaged 500ml water bottle — per item
  { name: '500 ML Drinking Water', priceUnit: 'per item', costPrice: 12, sellingPrice: 20 },
  // Buttermilk (Moru) — per litre; curd+water+ginger+curry leaves
  { name: 'Buttermilk (Moru)',     priceUnit: 'per L',    costPrice: 35, sellingPrice: 70 },

  // ── Desserts ─────────────────────────────────────────────────────────────
  // Elaneer Payasam — liquid dessert, per litre
  { name: 'Elaneer Payasam', priceUnit: 'per L',  costPrice: 90,  sellingPrice: 180 },
  // Luqaimat — deep-fried dough balls; per kg
  { name: 'Luqaimat',        priceUnit: 'per kg', costPrice: 220, sellingPrice: 450 },
  // Pan Cake — per piece/item
  { name: 'Pan Cake',        priceUnit: 'per item', costPrice: 10, sellingPrice: 25 },
  // Semiya Payasam — vermicelli kheer; per litre
  { name: 'Semiya Payasam',  priceUnit: 'per L',  costPrice: 70,  sellingPrice: 150 },

  // ── Breads (per piece) ───────────────────────────────────────────────────
  // Kerala Porotta — per piece; maida+oil; cost ~₹6-8, sell ₹14-18
  { name: 'Kerala Porotta', priceUnit: 'per item', costPrice: 7,  sellingPrice: 15 },
  // Pathiri — rice flour flatbread; per piece
  { name: 'Pathiri',        priceUnit: 'per item', costPrice: 5,  sellingPrice: 12 },

  // ── Curry (per kg) ───────────────────────────────────────────────────────
  // Malabar Beef Curry — beef+coconut gravy; per kg
  { name: 'Malabar Beef Curry', priceUnit: 'per kg', costPrice: 200, sellingPrice: 380 },
  // Chicken Roast — dry roast with spices; per kg
  { name: 'Chicken Roast',     priceUnit: 'per kg', costPrice: 220, sellingPrice: 400 },
  // Malabar Fish Curry — Kottayam-style with kudampuli; per kg
  { name: 'Malabar Fish Curry', priceUnit: 'per kg', costPrice: 180, sellingPrice: 350 },

  // ── Starters (per piece) ─────────────────────────────────────────────────
  // Chicken Shawarma — per roll
  { name: 'Chicken Shawarma',  priceUnit: 'per item', costPrice: 50, sellingPrice: 100 },
  // Vegetable Samosa — per piece
  { name: 'Vegetable Samosa',  priceUnit: 'per item', costPrice: 10, sellingPrice: 25  },
]

async function main() {
  console.log('\n🍽️  Updating dish pricing with Kerala market rates...\n')

  let updated = 0
  let notFound = 0

  for (const dish of dishPricing) {
    const existing = await prisma.dish.findFirst({ where: { name: dish.name } })
    if (!existing) {
      console.warn(`  ⚠️  Dish not found: "${dish.name}"`)
      notFound++
      continue
    }

    await prisma.dish.update({
      where: { id: existing.id },
      data: {
        priceUnit: dish.priceUnit,
        pricePerPlate: dish.costPrice,
        sellingPricePerPlate: dish.sellingPrice,
        estimatedCostPerPlate: dish.costPrice,
      },
    })

    console.log(
      `  ✅  ${dish.name.padEnd(40)} | ${dish.priceUnit.padEnd(10)} | cost ₹${String(dish.costPrice).padStart(4)} → sell ₹${dish.sellingPrice}`
    )
    updated++
  }

  console.log(`\n✨ Done. Updated: ${updated} | Not found: ${notFound}\n`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
