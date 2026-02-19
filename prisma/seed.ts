import 'dotenv/config'
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

  // Create sample dishes with ingredients
  const sampleDishes = [
    // Starters
    {
      name: 'Veg Spring Rolls',
      description: 'Crispy golden rolls stuffed with seasoned vegetables and glass noodles',
      category: 'Starter',
      pricePerPlate: 120,
      estimatedCostPerPlate: 50,
      sellingPricePerPlate: 120,
      isVeg: true,
      ingredients: [
        { ingredientName: 'Spring Roll Sheets', quantity: 6, unit: 'piece' },
        { ingredientName: 'Cabbage', quantity: 100, unit: 'g' },
        { ingredientName: 'Carrot', quantity: 50, unit: 'g' },
        { ingredientName: 'Glass Noodles', quantity: 30, unit: 'g' },
        { ingredientName: 'Soy Sauce', quantity: 1, unit: 'tbsp' },
        { ingredientName: 'Oil', quantity: 200, unit: 'ml' },
      ],
    },
    {
      name: 'Chicken Tikka',
      description: 'Tender chicken marinated in spiced yogurt and grilled in tandoor',
      category: 'Starter',
      pricePerPlate: 180,
      estimatedCostPerPlate: 85,
      sellingPricePerPlate: 180,
      isVeg: false,
      ingredients: [
        { ingredientName: 'Chicken', quantity: 200, unit: 'g' },
        { ingredientName: 'Yogurt', quantity: 50, unit: 'g' },
        { ingredientName: 'Ginger Garlic Paste', quantity: 1, unit: 'tbsp' },
        { ingredientName: 'Red Chilli Powder', quantity: 1, unit: 'tsp' },
        { ingredientName: 'Garam Masala', quantity: 0.5, unit: 'tsp' },
        { ingredientName: 'Lemon Juice', quantity: 1, unit: 'tbsp' },
        { ingredientName: 'Oil', quantity: 2, unit: 'tbsp' },
      ],
    },
    // Main Course
    {
      name: 'Butter Chicken',
      description: 'Creamy tomato-based curry with tender chicken pieces',
      category: 'Main Course',
      pricePerPlate: 250,
      estimatedCostPerPlate: 110,
      sellingPricePerPlate: 250,
      isVeg: false,
      ingredients: [
        { ingredientName: 'Chicken', quantity: 250, unit: 'g' },
        { ingredientName: 'Tomato Puree', quantity: 100, unit: 'ml' },
        { ingredientName: 'Fresh Cream', quantity: 50, unit: 'ml' },
        { ingredientName: 'Butter', quantity: 30, unit: 'g' },
        { ingredientName: 'Ginger Garlic Paste', quantity: 1, unit: 'tbsp' },
        { ingredientName: 'Garam Masala', quantity: 1, unit: 'tsp' },
        { ingredientName: 'Kasuri Methi', quantity: 0.5, unit: 'tsp' },
      ],
    },
    {
      name: 'Paneer Tikka Masala',
      description: 'Grilled cottage cheese cubes in a rich, spiced tomato gravy',
      category: 'Main Course',
      pricePerPlate: 200,
      estimatedCostPerPlate: 85,
      sellingPricePerPlate: 200,
      isVeg: true,
      ingredients: [
        { ingredientName: 'Paneer', quantity: 200, unit: 'g' },
        { ingredientName: 'Tomato', quantity: 150, unit: 'g' },
        { ingredientName: 'Onion', quantity: 100, unit: 'g' },
        { ingredientName: 'Fresh Cream', quantity: 30, unit: 'ml' },
        { ingredientName: 'Ginger Garlic Paste', quantity: 1, unit: 'tbsp' },
        { ingredientName: 'Coriander Powder', quantity: 1, unit: 'tsp' },
        { ingredientName: 'Oil', quantity: 2, unit: 'tbsp' },
      ],
    },
    {
      name: 'Dal Makhani',
      description: 'Slow-cooked black lentils simmered overnight in butter and cream',
      category: 'Main Course',
      pricePerPlate: 150,
      estimatedCostPerPlate: 55,
      sellingPricePerPlate: 150,
      isVeg: true,
      ingredients: [
        { ingredientName: 'Black Lentils (Urad Dal)', quantity: 100, unit: 'g' },
        { ingredientName: 'Rajma (Kidney Beans)', quantity: 20, unit: 'g' },
        { ingredientName: 'Butter', quantity: 40, unit: 'g' },
        { ingredientName: 'Fresh Cream', quantity: 30, unit: 'ml' },
        { ingredientName: 'Tomato Puree', quantity: 50, unit: 'ml' },
        { ingredientName: 'Ginger Garlic Paste', quantity: 1, unit: 'tbsp' },
      ],
    },
    // Rice
    {
      name: 'Veg Biryani',
      description: 'Fragrant basmati rice layered with spiced mixed vegetables and saffron',
      category: 'Rice',
      pricePerPlate: 160,
      estimatedCostPerPlate: 65,
      sellingPricePerPlate: 160,
      isVeg: true,
      ingredients: [
        { ingredientName: 'Basmati Rice', quantity: 150, unit: 'g' },
        { ingredientName: 'Mixed Vegetables', quantity: 100, unit: 'g' },
        { ingredientName: 'Onion', quantity: 80, unit: 'g' },
        { ingredientName: 'Yogurt', quantity: 50, unit: 'g' },
        { ingredientName: 'Biryani Masala', quantity: 1, unit: 'tbsp' },
        { ingredientName: 'Saffron', quantity: 0.1, unit: 'g' },
        { ingredientName: 'Ghee', quantity: 2, unit: 'tbsp' },
      ],
    },
    {
      name: 'Chicken Biryani',
      description: 'Aromatic basmati rice slow-cooked with marinated chicken and whole spices',
      category: 'Rice',
      pricePerPlate: 220,
      estimatedCostPerPlate: 100,
      sellingPricePerPlate: 220,
      isVeg: false,
      ingredients: [
        { ingredientName: 'Basmati Rice', quantity: 150, unit: 'g' },
        { ingredientName: 'Chicken', quantity: 200, unit: 'g' },
        { ingredientName: 'Onion', quantity: 100, unit: 'g' },
        { ingredientName: 'Yogurt', quantity: 60, unit: 'g' },
        { ingredientName: 'Biryani Masala', quantity: 1.5, unit: 'tbsp' },
        { ingredientName: 'Ghee', quantity: 3, unit: 'tbsp' },
        { ingredientName: 'Mint Leaves', quantity: 10, unit: 'g' },
      ],
    },
    // Bread
    {
      name: 'Butter Naan',
      description: 'Soft leavened flatbread baked in tandoor and brushed with butter',
      category: 'Bread',
      pricePerPlate: 40,
      estimatedCostPerPlate: 12,
      sellingPricePerPlate: 40,
      isVeg: true,
      ingredients: [
        { ingredientName: 'Maida (All Purpose Flour)', quantity: 100, unit: 'g' },
        { ingredientName: 'Yogurt', quantity: 30, unit: 'g' },
        { ingredientName: 'Butter', quantity: 15, unit: 'g' },
        { ingredientName: 'Yeast', quantity: 2, unit: 'g' },
        { ingredientName: 'Salt', quantity: 1, unit: 'tsp' },
      ],
    },
    // Dessert
    {
      name: 'Gulab Jamun',
      description: 'Soft milk-solid dumplings soaked in rose-flavoured sugar syrup',
      category: 'Dessert',
      pricePerPlate: 80,
      estimatedCostPerPlate: 28,
      sellingPricePerPlate: 80,
      isVeg: true,
      ingredients: [
        { ingredientName: 'Milk Powder', quantity: 80, unit: 'g' },
        { ingredientName: 'Maida', quantity: 20, unit: 'g' },
        { ingredientName: 'Sugar', quantity: 100, unit: 'g' },
        { ingredientName: 'Ghee', quantity: 1, unit: 'tbsp' },
        { ingredientName: 'Rose Water', quantity: 1, unit: 'tsp' },
        { ingredientName: 'Oil', quantity: 200, unit: 'ml' },
      ],
    },
    // Salad
    {
      name: 'Garden Fresh Salad',
      description: 'Crisp seasonal vegetables tossed with lemon dressing and herbs',
      category: 'Salad',
      pricePerPlate: 60,
      estimatedCostPerPlate: 20,
      sellingPricePerPlate: 60,
      isVeg: true,
      ingredients: [
        { ingredientName: 'Cucumber', quantity: 80, unit: 'g' },
        { ingredientName: 'Tomato', quantity: 80, unit: 'g' },
        { ingredientName: 'Onion', quantity: 40, unit: 'g' },
        { ingredientName: 'Carrot', quantity: 40, unit: 'g' },
        { ingredientName: 'Lemon Juice', quantity: 1, unit: 'tbsp' },
        { ingredientName: 'Salt', quantity: 0.5, unit: 'tsp' },
        { ingredientName: 'Coriander Leaves', quantity: 5, unit: 'g' },
      ],
    },
    // Beverage
    {
      name: 'Masala Chai',
      description: 'Spiced Indian tea brewed with ginger, cardamom and milk',
      category: 'Beverage',
      pricePerPlate: 30,
      estimatedCostPerPlate: 8,
      sellingPricePerPlate: 30,
      isVeg: true,
      ingredients: [
        { ingredientName: 'Tea Leaves', quantity: 5, unit: 'g' },
        { ingredientName: 'Milk', quantity: 100, unit: 'ml' },
        { ingredientName: 'Sugar', quantity: 10, unit: 'g' },
        { ingredientName: 'Ginger', quantity: 5, unit: 'g' },
        { ingredientName: 'Cardamom', quantity: 2, unit: 'piece' },
      ],
    },
    // Snack
    {
      name: 'Samosa (2 pcs)',
      description: 'Crispy pastry filled with spiced potato and peas, served with chutney',
      category: 'Snack',
      pricePerPlate: 50,
      estimatedCostPerPlate: 18,
      sellingPricePerPlate: 50,
      isVeg: true,
      ingredients: [
        { ingredientName: 'Maida', quantity: 60, unit: 'g' },
        { ingredientName: 'Potato', quantity: 100, unit: 'g' },
        { ingredientName: 'Peas', quantity: 30, unit: 'g' },
        { ingredientName: 'Oil', quantity: 200, unit: 'ml' },
        { ingredientName: 'Cumin Seeds', quantity: 1, unit: 'tsp' },
        { ingredientName: 'Coriander Powder', quantity: 1, unit: 'tsp' },
      ],
    },
  ]

  // Track dish IDs for linking to events
  const dishIds: Record<string, string> = {}

  for (const dish of sampleDishes) {
    const existing = await prisma.dish.findFirst({
      where: { name: dish.name },
    })

    if (!existing) {
      const { ingredients, ...dishData } = dish
      const created = await prisma.dish.create({
        data: {
          ...dishData,
          ingredients: {
            create: ingredients,
          },
        },
      })
      dishIds[dish.name] = created.id
      console.log(`✅ Created sample dish: ${dish.name}`)
    } else {
      dishIds[dish.name] = existing.id
      console.log(`ℹ️  Dish already exists: ${dish.name}`)
    }
  }

  // Create sample events
  const sampleEvents = [
    {
      name: 'Sharma Wedding Reception',
      eventType: 'MAIN_EVENT' as const,
      status: 'COMPLETED' as const,
      clientName: 'Rajesh Sharma',
      clientContact: '9876543210',
      location: 'The Grand Banquet Hall, MG Road, Bangalore',
      eventDate: new Date('2025-12-15'),
      eventTime: '07:00 PM',
      guestCount: 350,
      totalAmount: 175000,
      paidAmount: 175000,
      balanceAmount: 0,
      notes: 'Full veg menu. Client preferred no onion/garlic in some dishes.',
    },
    {
      name: 'Mehta Birthday Celebration',
      eventType: 'MAIN_EVENT' as const,
      status: 'COMPLETED' as const,
      clientName: 'Priya Mehta',
      clientContact: '9845001234',
      location: 'Mehta Residence, Koramangala, Bangalore',
      eventDate: new Date('2026-01-10'),
      eventTime: '06:30 PM',
      guestCount: 120,
      totalAmount: 60000,
      paidAmount: 60000,
      balanceAmount: 0,
      notes: 'Mix of veg and non-veg. Birthday cake arranged separately.',
    },
    {
      name: 'Iyer Anniversary Dinner',
      eventType: 'MAIN_EVENT' as const,
      status: 'UPCOMING' as const,
      clientName: 'Suresh Iyer',
      clientContact: '9900112233',
      location: 'Taj Hotel Banquet, Residency Road, Bangalore',
      eventDate: new Date('2026-03-20'),
      eventTime: '08:00 PM',
      guestCount: 200,
      totalAmount: 120000,
      paidAmount: 60000,
      balanceAmount: 60000,
      notes: 'South Indian theme. Live dosa counter required.',
    },
    {
      name: 'Tech Corp Annual Day Lunch',
      eventType: 'MAIN_EVENT' as const,
      status: 'UPCOMING' as const,
      clientName: 'Anita Reddy (Tech Corp HR)',
      clientContact: '9123456780',
      location: 'Tech Corp Campus, Whitefield, Bangalore',
      eventDate: new Date('2026-04-05'),
      eventTime: '01:00 PM',
      guestCount: 500,
      totalAmount: 200000,
      paidAmount: 100000,
      balanceAmount: 100000,
      notes: 'Corporate lunch. Strictly no alcohol. Need 30% vegan options.',
    },
    {
      name: 'Kapoor Engagement',
      eventType: 'MAIN_EVENT' as const,
      status: 'IN_PROGRESS' as const,
      clientName: 'Vikram Kapoor',
      clientContact: '9988776655',
      location: 'Lakeview Gardens, Indiranagar, Bangalore',
      eventDate: new Date('2026-02-20'),
      eventTime: '05:00 PM',
      guestCount: 180,
      totalAmount: 90000,
      paidAmount: 45000,
      balanceAmount: 45000,
      notes: 'Cocktail-style setup. Starters and dessert buffet.',
    },
    {
      name: 'Rice Delivery - Hotel Sunrise',
      eventType: 'LOCAL_ORDER' as const,
      status: 'COMPLETED' as const,
      clientName: 'Hotel Sunrise Kitchen',
      clientContact: '8012345678',
      location: 'Hotel Sunrise, Brigade Road, Bangalore',
      eventDate: new Date('2026-01-25'),
      eventTime: '10:00 AM',
      guestCount: 0,
      totalAmount: 8500,
      paidAmount: 8500,
      balanceAmount: 0,
      notes: '50kg basmati rice + 10kg dal delivery.',
    },
    {
      name: 'Bulk Snack Order - Office Canteen',
      eventType: 'LOCAL_ORDER' as const,
      status: 'UPCOMING' as const,
      clientName: 'Infosys Canteen Manager',
      clientContact: '9071234560',
      location: 'Infosys Campus, Electronic City, Bangalore',
      eventDate: new Date('2026-03-01'),
      eventTime: '09:00 AM',
      guestCount: 0,
      totalAmount: 12000,
      paidAmount: 12000,
      balanceAmount: 0,
      notes: '200 samosas + 100 spring rolls for morning snack break.',
    },
  ]

  // Dish assignments per event
  const eventDishes: Record<string, Array<{ dishName: string; quantity: number; pricePerPlate: number }>> = {
    'Sharma Wedding Reception': [
      { dishName: 'Paneer Tikka Masala', quantity: 350, pricePerPlate: 200 },
      { dishName: 'Dal Makhani',          quantity: 350, pricePerPlate: 150 },
      { dishName: 'Veg Biryani',          quantity: 350, pricePerPlate: 160 },
      { dishName: 'Butter Naan',          quantity: 350, pricePerPlate: 40  },
      { dishName: 'Gulab Jamun',          quantity: 350, pricePerPlate: 80  },
    ],
    'Mehta Birthday Celebration': [
      { dishName: 'Butter Chicken',       quantity: 120, pricePerPlate: 250 },
      { dishName: 'Chicken Biryani',      quantity: 120, pricePerPlate: 220 },
      { dishName: 'Garden Fresh Salad',   quantity: 120, pricePerPlate: 60  },
      { dishName: 'Gulab Jamun',          quantity: 120, pricePerPlate: 80  },
    ],
    'Iyer Anniversary Dinner': [
      { dishName: 'Veg Spring Rolls',     quantity: 200, pricePerPlate: 120 },
      { dishName: 'Dal Makhani',          quantity: 200, pricePerPlate: 150 },
      { dishName: 'Veg Biryani',          quantity: 200, pricePerPlate: 160 },
      { dishName: 'Butter Naan',          quantity: 200, pricePerPlate: 40  },
      { dishName: 'Masala Chai',          quantity: 200, pricePerPlate: 30  },
    ],
    'Tech Corp Annual Day Lunch': [
      { dishName: 'Paneer Tikka Masala',  quantity: 500, pricePerPlate: 200 },
      { dishName: 'Dal Makhani',          quantity: 500, pricePerPlate: 150 },
      { dishName: 'Veg Biryani',          quantity: 500, pricePerPlate: 160 },
      { dishName: 'Garden Fresh Salad',   quantity: 500, pricePerPlate: 60  },
      { dishName: 'Butter Naan',          quantity: 500, pricePerPlate: 40  },
    ],
    'Kapoor Engagement': [
      { dishName: 'Veg Spring Rolls',     quantity: 180, pricePerPlate: 120 },
      { dishName: 'Chicken Tikka',        quantity: 180, pricePerPlate: 180 },
      { dishName: 'Samosa (2 pcs)',        quantity: 180, pricePerPlate: 50  },
      { dishName: 'Gulab Jamun',          quantity: 180, pricePerPlate: 80  },
    ],
    'Rice Delivery - Hotel Sunrise': [
      { dishName: 'Veg Biryani',          quantity: 50, pricePerPlate: 160 },
    ],
    'Bulk Snack Order - Office Canteen': [
      { dishName: 'Samosa (2 pcs)',        quantity: 200, pricePerPlate: 50 },
      { dishName: 'Veg Spring Rolls',     quantity: 100, pricePerPlate: 120 },
    ],
  }

  for (const event of sampleEvents) {
    const existing = await prisma.event.findFirst({
      where: { name: event.name },
    })

    if (!existing) {
      const dishes = (eventDishes[event.name] || [])
        .filter(d => dishIds[d.dishName])
        .map(d => ({
          dishId: dishIds[d.dishName],
          quantity: d.quantity,
          pricePerPlate: d.pricePerPlate,
        }))

      await prisma.event.create({
        data: {
          ...event,
          createdById: admin.id,
          dishes: dishes.length > 0 ? { create: dishes } : undefined,
        },
      })
      console.log(`✅ Created sample event: ${event.name}`)
    } else {
      console.log(`ℹ️  Event already exists: ${event.name}`)
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
