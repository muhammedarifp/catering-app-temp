import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcrypt'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password123@localhost:5433/catering_app',
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Create default Super Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  })

  console.log('✅ Created Super Admin:', admin.email)

  // Create default notification settings
  const notificationSettings = await prisma.notificationSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      invoiceGenerated: true,
      eventCreated: true,
      eventStatusChanged: true,
      enquiryStatusChanged: true,
      paymentReceived: true,
      lowStockAlert: true,
    },
  })

  console.log('✅ Created default notification settings')

  // Create sample dishes (optional)
  const sampleDishes = [
    {
      name: 'Butter Chicken',
      description: 'Creamy tomato-based curry with tender chicken',
      category: 'Main Course',
      pricePerPlate: 250,
      estimatedCostPerPlate: 120,
      sellingPricePerPlate: 250,
      isVeg: false,
    },
    {
      name: 'Paneer Tikka Masala',
      description: 'Grilled cottage cheese in rich tomato gravy',
      category: 'Main Course',
      pricePerPlate: 200,
      estimatedCostPerPlate: 90,
      sellingPricePerPlate: 200,
      isVeg: true,
    },
    {
      name: 'Dal Makhani',
      description: 'Black lentils in creamy butter gravy',
      category: 'Main Course',
      pricePerPlate: 150,
      estimatedCostPerPlate: 60,
      sellingPricePerPlate: 150,
      isVeg: true,
    },
    {
      name: 'Biryani',
      description: 'Aromatic basmati rice with spices and vegetables',
      category: 'Rice',
      pricePerPlate: 180,
      estimatedCostPerPlate: 80,
      sellingPricePerPlate: 180,
      isVeg: true,
    },
  ]

  for (const dish of sampleDishes) {
    const existing = await prisma.dish.findFirst({
      where: { name: dish.name },
    })

    if (!existing) {
      await prisma.dish.create({
        data: dish,
      })
      console.log(`✅ Created sample dish: ${dish.name}`)
    } else {
      console.log(`ℹ️  Dish already exists: ${dish.name}`)
    }
  }

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
