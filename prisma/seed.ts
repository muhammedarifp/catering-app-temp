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

async function clearAll() {
  console.log('🗑️  Clearing all existing data...')

  await prisma.groceryPurchaseItem.deleteMany()
  await prisma.groceryPurchase.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.otherExpense.deleteMany()
  await prisma.eventDish.deleteMany()
  await prisma.eventService.deleteMany()
  await prisma.event.deleteMany()
  await prisma.enquiryUpdate.deleteMany()
  await prisma.enquiryDish.deleteMany()
  await prisma.enquiryService.deleteMany()
  await prisma.enquiry.deleteMany()
  await prisma.dishIngredient.deleteMany()
  await prisma.dish.deleteMany()
  await prisma.todo.deleteMany()
  await prisma.notificationSetting.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ All data cleared')
}

async function main() {
  await clearAll()

  console.log('\n🌱 Seeding fresh data...\n')

  // ── Users ────────────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  })
  console.log('✅ Created admin:', admin.email)

  // ── Notification Settings ─────────────────────────────────────────────────
  await prisma.notificationSetting.create({
    data: {
      id: 'default',
      invoiceGenerated: true,
      eventCreated: true,
      eventStatusChanged: true,
      enquiryStatusChanged: true,
      paymentReceived: true,
      lowStockAlert: true,
    },
  })

  // ── Dishes ───────────────────────────────────────────────────────────────────
  // Categories match the menu PDF section structure
  const dishes = [
    // Welcome Drink
    {
      name: 'Fresh Fruits Juice Live (5 Types)',
      description: 'Live fresh fruit juice counter with 5 seasonal varieties',
      category: 'Welcome Drink',
      priceUnit: 'per plate', pricePerPlate: 40, estimatedCostPerPlate: 40, sellingPricePerPlate: 85, isVeg: true,
      ingredients: [
        { ingredientName: 'Mixed Seasonal Fruits', quantity: 300, unit: 'g' },
        { ingredientName: 'Sugar', quantity: 20, unit: 'g' },
        { ingredientName: 'Ice', quantity: 100, unit: 'g' },
      ],
    },
    {
      name: 'Tender Coconut Water (Elaneer)',
      description: 'Fresh tender coconut served chilled',
      category: 'Welcome Drink',
      priceUnit: 'per item', pricePerPlate: 40, estimatedCostPerPlate: 40, sellingPricePerPlate: 70, isVeg: true,
      ingredients: [
        { ingredientName: 'Tender Coconut', quantity: 1, unit: 'piece' },
      ],
    },

    // Herbal Tea
    {
      name: 'Ginger Tea',
      description: 'Hot tea brewed with fresh ginger',
      category: 'Herbal Tea',
      priceUnit: 'per plate', pricePerPlate: 10, estimatedCostPerPlate: 10, sellingPricePerPlate: 25, isVeg: true,
      ingredients: [
        { ingredientName: 'Tea Leaves', quantity: 3, unit: 'g' },
        { ingredientName: 'Fresh Ginger', quantity: 5, unit: 'g' },
        { ingredientName: 'Milk', quantity: 80, unit: 'ml' },
        { ingredientName: 'Sugar', quantity: 8, unit: 'g' },
      ],
    },
    {
      name: 'Mint Tea',
      description: 'Refreshing hot tea with fresh mint leaves',
      category: 'Herbal Tea',
      priceUnit: 'per plate', pricePerPlate: 8, estimatedCostPerPlate: 8, sellingPricePerPlate: 25, isVeg: true,
      ingredients: [
        { ingredientName: 'Tea Leaves', quantity: 3, unit: 'g' },
        { ingredientName: 'Fresh Mint Leaves', quantity: 8, unit: 'g' },
        { ingredientName: 'Sugar', quantity: 8, unit: 'g' },
        { ingredientName: 'Water', quantity: 150, unit: 'ml' },
      ],
    },
    {
      name: 'Lime Tea',
      description: 'Hot black tea with fresh lime juice',
      category: 'Herbal Tea',
      priceUnit: 'per plate', pricePerPlate: 8, estimatedCostPerPlate: 8, sellingPricePerPlate: 25, isVeg: true,
      ingredients: [
        { ingredientName: 'Tea Leaves', quantity: 3, unit: 'g' },
        { ingredientName: 'Lime Juice', quantity: 10, unit: 'ml' },
        { ingredientName: 'Sugar', quantity: 8, unit: 'g' },
        { ingredientName: 'Water', quantity: 150, unit: 'ml' },
      ],
    },
    {
      name: 'Green Tea',
      description: 'Healthy green tea served hot',
      category: 'Herbal Tea',
      priceUnit: 'per plate', pricePerPlate: 12, estimatedCostPerPlate: 12, sellingPricePerPlate: 30, isVeg: true,
      ingredients: [
        { ingredientName: 'Green Tea Leaves', quantity: 2, unit: 'g' },
        { ingredientName: 'Water', quantity: 200, unit: 'ml' },
        { ingredientName: 'Honey', quantity: 5, unit: 'g' },
      ],
    },
    {
      name: 'Cinnamon Tea',
      description: 'Fragrant hot tea infused with cinnamon sticks',
      category: 'Herbal Tea',
      priceUnit: 'per plate', pricePerPlate: 10, estimatedCostPerPlate: 10, sellingPricePerPlate: 30, isVeg: true,
      ingredients: [
        { ingredientName: 'Tea Leaves', quantity: 3, unit: 'g' },
        { ingredientName: 'Cinnamon Stick', quantity: 1, unit: 'piece' },
        { ingredientName: 'Sugar', quantity: 8, unit: 'g' },
        { ingredientName: 'Milk', quantity: 60, unit: 'ml' },
      ],
    },
    {
      name: 'Cardamom Tea',
      description: 'Aromatic tea with crushed cardamom pods',
      category: 'Herbal Tea',
      priceUnit: 'per plate', pricePerPlate: 10, estimatedCostPerPlate: 10, sellingPricePerPlate: 25, isVeg: true,
      ingredients: [
        { ingredientName: 'Tea Leaves', quantity: 3, unit: 'g' },
        { ingredientName: 'Cardamom Pods', quantity: 2, unit: 'piece' },
        { ingredientName: 'Milk', quantity: 80, unit: 'ml' },
        { ingredientName: 'Sugar', quantity: 8, unit: 'g' },
      ],
    },

    // Main Course (with Rice)
    {
      name: 'Beef Biriyani',
      description: 'Slow-cooked Kerala style beef biriyani with fragrant Kaima rice',
      category: 'Main Course',
      priceUnit: 'per kg', pricePerPlate: 160, estimatedCostPerPlate: 160, sellingPricePerPlate: 320, isVeg: false,
      ingredients: [
        { ingredientName: 'Kaima Rice', quantity: 200, unit: 'g' },
        { ingredientName: 'Beef', quantity: 200, unit: 'g' },
        { ingredientName: 'Onion', quantity: 100, unit: 'g' },
        { ingredientName: 'Tomato', quantity: 80, unit: 'g' },
        { ingredientName: 'Ginger Garlic Paste', quantity: 2, unit: 'tbsp' },
        { ingredientName: 'Biriyani Masala', quantity: 2, unit: 'tbsp' },
        { ingredientName: 'Ghee', quantity: 3, unit: 'tbsp' },
        { ingredientName: 'Mint Leaves', quantity: 10, unit: 'g' },
        { ingredientName: 'Coriander Leaves', quantity: 10, unit: 'g' },
      ],
    },
    {
      name: 'Chicken Kabiri',
      description: 'Traditional Kerala Kabiri rice with tender chicken pieces and spices',
      category: 'Main Course',
      priceUnit: 'per kg', pricePerPlate: 130, estimatedCostPerPlate: 130, sellingPricePerPlate: 260, isVeg: false,
      ingredients: [
        { ingredientName: 'Kaima Rice', quantity: 180, unit: 'g' },
        { ingredientName: 'Chicken', quantity: 200, unit: 'g' },
        { ingredientName: 'Onion', quantity: 100, unit: 'g' },
        { ingredientName: 'Cashew Nuts', quantity: 20, unit: 'g' },
        { ingredientName: 'Raisins', quantity: 10, unit: 'g' },
        { ingredientName: 'Ghee', quantity: 3, unit: 'tbsp' },
        { ingredientName: 'Garam Masala', quantity: 1, unit: 'tbsp' },
      ],
    },
    {
      name: 'Mutton Biriyani',
      description: 'Rich and aromatic mutton biriyani Kerala style',
      category: 'Main Course',
      priceUnit: 'per kg', pricePerPlate: 220, estimatedCostPerPlate: 220, sellingPricePerPlate: 450, isVeg: false,
      ingredients: [
        { ingredientName: 'Kaima Rice', quantity: 200, unit: 'g' },
        { ingredientName: 'Mutton', quantity: 220, unit: 'g' },
        { ingredientName: 'Onion', quantity: 120, unit: 'g' },
        { ingredientName: 'Tomato', quantity: 80, unit: 'g' },
        { ingredientName: 'Ginger Garlic Paste', quantity: 2, unit: 'tbsp' },
        { ingredientName: 'Ghee', quantity: 4, unit: 'tbsp' },
        { ingredientName: 'Biriyani Masala', quantity: 2, unit: 'tbsp' },
        { ingredientName: 'Saffron', quantity: 0.1, unit: 'g' },
      ],
    },

    // Fry
    {
      name: 'Chicken Fry',
      description: 'Crispy Kerala style deep fried chicken with spiced marinade',
      category: 'Fry',
      priceUnit: 'per kg', pricePerPlate: 250, estimatedCostPerPlate: 250, sellingPricePerPlate: 450, isVeg: false,
      ingredients: [
        { ingredientName: 'Chicken', quantity: 200, unit: 'g' },
        { ingredientName: 'Red Chilli Powder', quantity: 2, unit: 'tsp' },
        { ingredientName: 'Turmeric Powder', quantity: 0.5, unit: 'tsp' },
        { ingredientName: 'Ginger Garlic Paste', quantity: 1, unit: 'tbsp' },
        { ingredientName: 'Curry Leaves', quantity: 5, unit: 'piece' },
        { ingredientName: 'Coconut Oil', quantity: 200, unit: 'ml' },
      ],
    },
    {
      name: 'Beef Varattu',
      description: 'Dry roasted beef cooked with coconut and whole spices',
      category: 'Fry',
      priceUnit: 'per kg', pricePerPlate: 300, estimatedCostPerPlate: 300, sellingPricePerPlate: 550, isVeg: false,
      ingredients: [
        { ingredientName: 'Beef', quantity: 200, unit: 'g' },
        { ingredientName: 'Grated Coconut', quantity: 50, unit: 'g' },
        { ingredientName: 'Shallots', quantity: 60, unit: 'g' },
        { ingredientName: 'Curry Leaves', quantity: 8, unit: 'piece' },
        { ingredientName: 'Red Chilli', quantity: 3, unit: 'piece' },
        { ingredientName: 'Coconut Oil', quantity: 2, unit: 'tbsp' },
      ],
    },
    {
      name: 'Fish Fry',
      description: 'Coastal Kerala style marinated fish deep fried crispy',
      category: 'Fry',
      priceUnit: 'per kg', pricePerPlate: 240, estimatedCostPerPlate: 240, sellingPricePerPlate: 440, isVeg: false,
      ingredients: [
        { ingredientName: 'Fish (Seer/King Fish)', quantity: 200, unit: 'g' },
        { ingredientName: 'Red Chilli Powder', quantity: 2, unit: 'tsp' },
        { ingredientName: 'Turmeric', quantity: 0.5, unit: 'tsp' },
        { ingredientName: 'Lemon Juice', quantity: 1, unit: 'tbsp' },
        { ingredientName: 'Coconut Oil', quantity: 200, unit: 'ml' },
      ],
    },

    // Salads
    {
      name: 'Raita',
      description: 'Creamy yogurt with cucumber, cumin and coriander',
      category: 'Salads',
      priceUnit: 'per kg', pricePerPlate: 60, estimatedCostPerPlate: 60, sellingPricePerPlate: 130, isVeg: true,
      ingredients: [
        { ingredientName: 'Curd (Yogurt)', quantity: 100, unit: 'g' },
        { ingredientName: 'Cucumber', quantity: 40, unit: 'g' },
        { ingredientName: 'Cumin Powder', quantity: 0.5, unit: 'tsp' },
        { ingredientName: 'Salt', quantity: 1, unit: 'pinch' },
        { ingredientName: 'Coriander Leaves', quantity: 3, unit: 'g' },
      ],
    },
    {
      name: 'Pickle (Achar)',
      description: 'Assorted Kerala homestyle pickles',
      category: 'Salads',
      priceUnit: 'per kg', pricePerPlate: 100, estimatedCostPerPlate: 100, sellingPricePerPlate: 220, isVeg: true,
      ingredients: [
        { ingredientName: 'Mango Pickle', quantity: 20, unit: 'g' },
        { ingredientName: 'Lime Pickle', quantity: 10, unit: 'g' },
      ],
    },

    // Veg
    {
      name: 'Sambar',
      description: 'Traditional South Indian lentil stew with vegetables and tamarind',
      category: 'Veg',
      priceUnit: 'per L', pricePerPlate: 55, estimatedCostPerPlate: 55, sellingPricePerPlate: 120, isVeg: true,
      ingredients: [
        { ingredientName: 'Toor Dal', quantity: 80, unit: 'g' },
        { ingredientName: 'Tamarind', quantity: 10, unit: 'g' },
        { ingredientName: 'Mixed Vegetables', quantity: 100, unit: 'g' },
        { ingredientName: 'Sambar Powder', quantity: 2, unit: 'tsp' },
        { ingredientName: 'Mustard Seeds', quantity: 1, unit: 'tsp' },
        { ingredientName: 'Curry Leaves', quantity: 5, unit: 'piece' },
      ],
    },
    {
      name: 'Avial',
      description: 'Kerala mixed vegetable curry with coconut and yogurt',
      category: 'Veg',
      priceUnit: 'per kg', pricePerPlate: 70, estimatedCostPerPlate: 70, sellingPricePerPlate: 150, isVeg: true,
      ingredients: [
        { ingredientName: 'Mixed Vegetables (Drumstick, Yam, Raw Banana)', quantity: 200, unit: 'g' },
        { ingredientName: 'Grated Coconut', quantity: 60, unit: 'g' },
        { ingredientName: 'Curd', quantity: 40, unit: 'g' },
        { ingredientName: 'Coconut Oil', quantity: 2, unit: 'tsp' },
        { ingredientName: 'Curry Leaves', quantity: 5, unit: 'piece' },
      ],
    },
    {
      name: 'Thoran',
      description: 'Kerala stir-fried vegetables with fresh coconut and spices',
      category: 'Veg',
      priceUnit: 'per kg', pricePerPlate: 50, estimatedCostPerPlate: 50, sellingPricePerPlate: 110, isVeg: true,
      ingredients: [
        { ingredientName: 'Cabbage / Beans / Carrot', quantity: 150, unit: 'g' },
        { ingredientName: 'Grated Coconut', quantity: 40, unit: 'g' },
        { ingredientName: 'Mustard Seeds', quantity: 1, unit: 'tsp' },
        { ingredientName: 'Red Chilli', quantity: 2, unit: 'piece' },
        { ingredientName: 'Coconut Oil', quantity: 1, unit: 'tbsp' },
      ],
    },
    {
      name: 'Koottucurry',
      description: 'Black chickpeas and yam cooked with freshly ground coconut masala',
      category: 'Veg',
      priceUnit: 'per kg', pricePerPlate: 65, estimatedCostPerPlate: 65, sellingPricePerPlate: 140, isVeg: true,
      ingredients: [
        { ingredientName: 'Black Chickpeas (Kadala)', quantity: 80, unit: 'g' },
        { ingredientName: 'Elephant Yam', quantity: 100, unit: 'g' },
        { ingredientName: 'Grated Coconut', quantity: 60, unit: 'g' },
        { ingredientName: 'Coconut Oil', quantity: 1, unit: 'tbsp' },
        { ingredientName: 'Curry Leaves', quantity: 5, unit: 'piece' },
      ],
    },
    {
      name: 'Pappadam',
      description: 'Crispy roasted or fried Kerala pappadam',
      category: 'Veg',
      priceUnit: 'per item', pricePerPlate: 3, estimatedCostPerPlate: 3, sellingPricePerPlate: 7, isVeg: true,
      ingredients: [
        { ingredientName: 'Pappadam', quantity: 2, unit: 'piece' },
        { ingredientName: 'Coconut Oil', quantity: 50, unit: 'ml' },
      ],
    },
    {
      name: 'Steamed Rice',
      description: 'Freshly steamed Kerala boiled rice',
      category: 'Veg',
      priceUnit: 'per kg', pricePerPlate: 55, estimatedCostPerPlate: 55, sellingPricePerPlate: 110, isVeg: true,
      ingredients: [
        { ingredientName: 'Kerala Boiled Rice', quantity: 150, unit: 'g' },
        { ingredientName: 'Water', quantity: 400, unit: 'ml' },
        { ingredientName: 'Salt', quantity: 1, unit: 'tsp' },
      ],
    },

    // Drinks
    {
      name: '500 ML Drinking Water',
      description: 'Sealed mineral water bottle 500ml',
      category: 'Drinks',
      priceUnit: 'per item', pricePerPlate: 12, estimatedCostPerPlate: 12, sellingPricePerPlate: 20, isVeg: true,
      ingredients: [
        { ingredientName: 'Mineral Water Bottle 500ml', quantity: 1, unit: 'bottle' },
      ],
    },
    {
      name: 'Buttermilk (Moru)',
      description: 'Chilled spiced buttermilk with ginger and curry leaves',
      category: 'Drinks',
      priceUnit: 'per L', pricePerPlate: 35, estimatedCostPerPlate: 35, sellingPricePerPlate: 70, isVeg: true,
      ingredients: [
        { ingredientName: 'Curd', quantity: 80, unit: 'ml' },
        { ingredientName: 'Water', quantity: 120, unit: 'ml' },
        { ingredientName: 'Ginger', quantity: 3, unit: 'g' },
        { ingredientName: 'Green Chilli', quantity: 1, unit: 'piece' },
        { ingredientName: 'Curry Leaves', quantity: 3, unit: 'piece' },
      ],
    },

    // Desserts
    {
      name: 'Elaneer Payasam',
      description: 'Creamy tender coconut dessert with condensed milk and cardamom',
      category: 'Desserts',
      priceUnit: 'per L', pricePerPlate: 90, estimatedCostPerPlate: 90, sellingPricePerPlate: 180, isVeg: true,
      ingredients: [
        { ingredientName: 'Tender Coconut Pulp', quantity: 80, unit: 'g' },
        { ingredientName: 'Coconut Milk', quantity: 100, unit: 'ml' },
        { ingredientName: 'Condensed Milk', quantity: 40, unit: 'ml' },
        { ingredientName: 'Cardamom Powder', quantity: 0.5, unit: 'tsp' },
        { ingredientName: 'Sugar', quantity: 20, unit: 'g' },
      ],
    },
    {
      name: 'Luqaimat',
      description: 'Arabic sweet dumplings drizzled with date syrup and sesame seeds',
      category: 'Desserts',
      priceUnit: 'per kg', pricePerPlate: 220, estimatedCostPerPlate: 220, sellingPricePerPlate: 450, isVeg: true,
      ingredients: [
        { ingredientName: 'Maida (All Purpose Flour)', quantity: 80, unit: 'g' },
        { ingredientName: 'Yeast', quantity: 2, unit: 'g' },
        { ingredientName: 'Date Syrup', quantity: 2, unit: 'tbsp' },
        { ingredientName: 'Sesame Seeds', quantity: 5, unit: 'g' },
        { ingredientName: 'Oil', quantity: 200, unit: 'ml' },
      ],
    },
    {
      name: 'Pan Cake',
      description: 'Soft fluffy pancakes served with honey or maple syrup',
      category: 'Desserts',
      priceUnit: 'per item', pricePerPlate: 10, estimatedCostPerPlate: 10, sellingPricePerPlate: 25, isVeg: true,
      ingredients: [
        { ingredientName: 'Maida', quantity: 80, unit: 'g' },
        { ingredientName: 'Egg', quantity: 1, unit: 'piece' },
        { ingredientName: 'Milk', quantity: 100, unit: 'ml' },
        { ingredientName: 'Sugar', quantity: 15, unit: 'g' },
        { ingredientName: 'Butter', quantity: 10, unit: 'g' },
        { ingredientName: 'Honey', quantity: 1, unit: 'tbsp' },
      ],
    },
    {
      name: 'Semiya Payasam',
      description: 'Sweet vermicelli kheer with cashews and raisins in rich milk',
      category: 'Desserts',
      priceUnit: 'per L', pricePerPlate: 70, estimatedCostPerPlate: 70, sellingPricePerPlate: 150, isVeg: true,
      ingredients: [
        { ingredientName: 'Semiya (Vermicelli)', quantity: 50, unit: 'g' },
        { ingredientName: 'Milk', quantity: 250, unit: 'ml' },
        { ingredientName: 'Sugar', quantity: 50, unit: 'g' },
        { ingredientName: 'Cashew Nuts', quantity: 10, unit: 'g' },
        { ingredientName: 'Raisins', quantity: 8, unit: 'g' },
        { ingredientName: 'Ghee', quantity: 1, unit: 'tbsp' },
        { ingredientName: 'Cardamom Powder', quantity: 0.5, unit: 'tsp' },
      ],
    },

    // Breads
    {
      name: 'Kerala Porotta',
      description: 'Layered flaky flatbread made with maida — best with curries',
      category: 'Breads',
      priceUnit: 'per item', pricePerPlate: 7, estimatedCostPerPlate: 7, sellingPricePerPlate: 15, isVeg: true,
      ingredients: [
        { ingredientName: 'Maida (All Purpose Flour)', quantity: 100, unit: 'g' },
        { ingredientName: 'Egg', quantity: 1, unit: 'piece' },
        { ingredientName: 'Oil', quantity: 2, unit: 'tbsp' },
        { ingredientName: 'Sugar', quantity: 5, unit: 'g' },
        { ingredientName: 'Salt', quantity: 1, unit: 'tsp' },
      ],
    },
    {
      name: 'Pathiri',
      description: 'Soft Kerala rice flour flatbread — traditional Malabar bread',
      category: 'Breads',
      priceUnit: 'per item', pricePerPlate: 5, estimatedCostPerPlate: 5, sellingPricePerPlate: 12, isVeg: true,
      ingredients: [
        { ingredientName: 'Rice Flour', quantity: 100, unit: 'g' },
        { ingredientName: 'Water', quantity: 150, unit: 'ml' },
        { ingredientName: 'Salt', quantity: 1, unit: 'tsp' },
        { ingredientName: 'Coconut Oil', quantity: 1, unit: 'tsp' },
      ],
    },

    // Curry
    {
      name: 'Malabar Beef Curry',
      description: 'Rich Kerala beef curry with coconut milk and whole spices',
      category: 'Curry',
      priceUnit: 'per kg', pricePerPlate: 200, estimatedCostPerPlate: 200, sellingPricePerPlate: 380, isVeg: false,
      ingredients: [
        { ingredientName: 'Beef', quantity: 180, unit: 'g' },
        { ingredientName: 'Coconut Milk', quantity: 100, unit: 'ml' },
        { ingredientName: 'Onion', quantity: 80, unit: 'g' },
        { ingredientName: 'Tomato', quantity: 60, unit: 'g' },
        { ingredientName: 'Ginger Garlic Paste', quantity: 1, unit: 'tbsp' },
        { ingredientName: 'Curry Leaves', quantity: 6, unit: 'piece' },
        { ingredientName: 'Coconut Oil', quantity: 2, unit: 'tbsp' },
      ],
    },
    {
      name: 'Chicken Roast',
      description: 'Dry roasted Kerala chicken with shallots and fennel seeds',
      category: 'Curry',
      priceUnit: 'per kg', pricePerPlate: 220, estimatedCostPerPlate: 220, sellingPricePerPlate: 400, isVeg: false,
      ingredients: [
        { ingredientName: 'Chicken', quantity: 200, unit: 'g' },
        { ingredientName: 'Shallots', quantity: 80, unit: 'g' },
        { ingredientName: 'Fennel Seeds', quantity: 1, unit: 'tsp' },
        { ingredientName: 'Ginger Garlic Paste', quantity: 1, unit: 'tbsp' },
        { ingredientName: 'Red Chilli Powder', quantity: 1, unit: 'tsp' },
        { ingredientName: 'Coconut Oil', quantity: 2, unit: 'tbsp' },
        { ingredientName: 'Curry Leaves', quantity: 5, unit: 'piece' },
      ],
    },
    {
      name: 'Malabar Fish Curry',
      description: 'Tangy red fish curry with kudampuli (Gamboge) and coconut',
      category: 'Curry',
      priceUnit: 'per kg', pricePerPlate: 180, estimatedCostPerPlate: 180, sellingPricePerPlate: 350, isVeg: false,
      ingredients: [
        { ingredientName: 'Fish (Tilapia / Mackerel)', quantity: 180, unit: 'g' },
        { ingredientName: 'Kudampuli (Gamboge)', quantity: 2, unit: 'piece' },
        { ingredientName: 'Grated Coconut', quantity: 60, unit: 'g' },
        { ingredientName: 'Red Chilli Powder', quantity: 2, unit: 'tsp' },
        { ingredientName: 'Turmeric', quantity: 0.5, unit: 'tsp' },
        { ingredientName: 'Coconut Oil', quantity: 2, unit: 'tbsp' },
      ],
    },

    // Biryani / Rice (premium variants)
    {
      name: 'Prawn Biriyani',
      description: 'Aromatic Kaima rice biriyani cooked with tiger prawns and spices',
      category: 'Main Course',
      priceUnit: 'per kg', pricePerPlate: 200, estimatedCostPerPlate: 200, sellingPricePerPlate: 420, isVeg: false,
      ingredients: [
        { ingredientName: 'Kaima Rice', quantity: 200, unit: 'g' },
        { ingredientName: 'Tiger Prawns', quantity: 180, unit: 'g' },
        { ingredientName: 'Onion', quantity: 100, unit: 'g' },
        { ingredientName: 'Tomato', quantity: 80, unit: 'g' },
        { ingredientName: 'Ghee', quantity: 3, unit: 'tbsp' },
        { ingredientName: 'Biriyani Masala', quantity: 2, unit: 'tbsp' },
        { ingredientName: 'Mint Leaves', quantity: 10, unit: 'g' },
      ],
    },
    {
      name: 'Vegetable Dum Biriyani',
      description: 'Slow-cooked dum biriyani with seasonal vegetables and saffron',
      category: 'Main Course',
      priceUnit: 'per kg', pricePerPlate: 70, estimatedCostPerPlate: 70, sellingPricePerPlate: 160, isVeg: true,
      ingredients: [
        { ingredientName: 'Basmati Rice', quantity: 200, unit: 'g' },
        { ingredientName: 'Mixed Vegetables', quantity: 200, unit: 'g' },
        { ingredientName: 'Saffron', quantity: 0.05, unit: 'g' },
        { ingredientName: 'Ghee', quantity: 3, unit: 'tbsp' },
        { ingredientName: 'Biriyani Masala', quantity: 1, unit: 'tbsp' },
        { ingredientName: 'Coriander Leaves', quantity: 10, unit: 'g' },
      ],
    },

    // Starters
    {
      name: 'Chicken Shawarma',
      description: 'Grilled marinated chicken wrapped in pita with garlic sauce',
      category: 'Starters',
      priceUnit: 'per item', pricePerPlate: 50, estimatedCostPerPlate: 50, sellingPricePerPlate: 100, isVeg: false,
      ingredients: [
        { ingredientName: 'Chicken Breast', quantity: 120, unit: 'g' },
        { ingredientName: 'Pita Bread', quantity: 1, unit: 'piece' },
        { ingredientName: 'Garlic Sauce', quantity: 2, unit: 'tbsp' },
        { ingredientName: 'Onion', quantity: 30, unit: 'g' },
        { ingredientName: 'Tomato', quantity: 20, unit: 'g' },
        { ingredientName: 'Shawarma Masala', quantity: 1, unit: 'tbsp' },
      ],
    },
    {
      name: 'Vegetable Samosa',
      description: 'Crispy pastry filled with spiced potato and peas — 2 pcs',
      category: 'Starters',
      priceUnit: 'per item', pricePerPlate: 10, estimatedCostPerPlate: 10, sellingPricePerPlate: 25, isVeg: true,
      ingredients: [
        { ingredientName: 'Maida', quantity: 60, unit: 'g' },
        { ingredientName: 'Potato', quantity: 80, unit: 'g' },
        { ingredientName: 'Peas', quantity: 20, unit: 'g' },
        { ingredientName: 'Oil', quantity: 200, unit: 'ml' },
        { ingredientName: 'Spices (Cumin, Coriander, Chilli)', quantity: 2, unit: 'tsp' },
      ],
    },
  ]

  const dishIds: Record<string, string> = {}
  for (const dish of dishes) {
    const { ingredients, ...dishData } = dish
    const created = await prisma.dish.create({
      data: {
        ...dishData,
        ingredients: { create: ingredients },
      },
    })
    dishIds[dish.name] = created.id
  }
  console.log(`✅ Created ${dishes.length} dishes`)

  // ── Events ───────────────────────────────────────────────────────────────────
  type EventDishInput = { name: string; qty: number; price: number }

  const eventData: Array<{
    event: Parameters<typeof prisma.event.create>[0]['data']
    dishes: EventDishInput[]
    services: Array<{ serviceName: string; description?: string; price: number }>
  }> = [
      {
        event: {
          name: "Ahmed Khan's Nikkah",
          eventType: 'MAIN_EVENT',
          status: 'UPCOMING',
          clientName: 'Ahmed Khan',
          clientContact: '9946 112 233',
          location: 'Al-Ameen Convention Centre, Manjeri',
          eventDate: new Date('2026-03-15'),
          eventTime: '10:00 AM',
          guestCount: 800,
          totalAmount: 320000,
          paidAmount: 150000,
          balanceAmount: 170000,
          notes: 'Box counter setup. Herbal tea counter required from morning.',
          createdById: admin.id,
        },
        dishes: [
          { name: 'Fresh Fruits Juice Live (5 Types)', qty: 800, price: 80 },
          { name: 'Ginger Tea', qty: 800, price: 25 },
          { name: 'Cardamom Tea', qty: 800, price: 25 },
          { name: 'Beef Biriyani', qty: 800, price: 280 },
          { name: 'Chicken Fry', qty: 800, price: 160 },
          { name: 'Beef Varattu', qty: 800, price: 180 },
          { name: 'Raita', qty: 800, price: 40 },
          { name: 'Pickle (Achar)', qty: 800, price: 20 },
          { name: 'Avial', qty: 800, price: 60 },
          { name: 'Pappadam', qty: 800, price: 15 },
          { name: '500 ML Drinking Water', qty: 800, price: 20 },
          { name: 'Elaneer Payasam', qty: 800, price: 70 },
        ],
        services: [
          { serviceName: 'Welcome Counter', price: 5000 },
          { serviceName: 'Ceramic Plates', price: 8000 },
          { serviceName: 'Box Counter (6)', price: 12000 },
          { serviceName: 'Service Staffs', price: 15000 },
          { serviceName: 'House Keeping', price: 5000 },
        ],
      },
      {
        event: {
          name: "Fathima & Salim Wedding Reception",
          eventType: 'MAIN_EVENT',
          status: 'UPCOMING',
          clientName: 'Salim P.K.',
          clientContact: '9876 543 210',
          location: 'Star Convention Hall, Malappuram',
          eventDate: new Date('2026-04-10'),
          eventTime: '11:00 AM',
          guestCount: 1200,
          totalAmount: 480000,
          paidAmount: 200000,
          balanceAmount: 280000,
          notes: 'Full Malabar spread. Buffet setup.',
          createdById: admin.id,
        },
        dishes: [
          { name: 'Tender Coconut Water (Elaneer)', qty: 1200, price: 60 },
          { name: 'Mint Tea', qty: 1200, price: 25 },
          { name: 'Cinnamon Tea', qty: 1200, price: 30 },
          { name: 'Mutton Biriyani', qty: 1200, price: 320 },
          { name: 'Chicken Kabiri', qty: 600, price: 250 },
          { name: 'Chicken Fry', qty: 1200, price: 160 },
          { name: 'Fish Fry', qty: 600, price: 200 },
          { name: 'Raita', qty: 1200, price: 40 },
          { name: 'Sambar', qty: 1200, price: 50 },
          { name: 'Avial', qty: 1200, price: 60 },
          { name: 'Thoran', qty: 1200, price: 45 },
          { name: 'Pappadam', qty: 1200, price: 15 },
          { name: '500 ML Drinking Water', qty: 1200, price: 20 },
          { name: 'Elaneer Payasam', qty: 1200, price: 70 },
          { name: 'Luqaimat', qty: 1200, price: 60 },
        ],
        services: [
          { serviceName: 'Welcome Counter', price: 8000 },
          { serviceName: 'Ceramic Plates', price: 15000 },
          { serviceName: 'Buffet Setup (Full)', price: 25000 },
          { serviceName: 'Service Staffs (20)', price: 30000 },
          { serviceName: 'Hosting Boys', price: 10000 },
          { serviceName: 'House Keeping', price: 8000 },
        ],
      },
      {
        event: {
          name: "Rahul & Meera Engagement",
          eventType: 'MAIN_EVENT',
          status: 'IN_PROGRESS',
          clientName: 'Rahul Nair',
          clientContact: '9745 001 122',
          location: 'Royal Garden, Tirur',
          eventDate: new Date('2026-02-20'),
          eventTime: '05:00 PM',
          guestCount: 500,
          totalAmount: 180000,
          paidAmount: 90000,
          balanceAmount: 90000,
          notes: 'Evening event. Starters and dessert focused menu.',
          createdById: admin.id,
        },
        dishes: [
          { name: 'Fresh Fruits Juice Live (5 Types)', qty: 500, price: 80 },
          { name: 'Ginger Tea', qty: 500, price: 25 },
          { name: 'Green Tea', qty: 500, price: 30 },
          { name: 'Beef Biriyani', qty: 500, price: 280 },
          { name: 'Chicken Fry', qty: 500, price: 160 },
          { name: 'Raita', qty: 500, price: 40 },
          { name: 'Koottucurry', qty: 500, price: 55 },
          { name: 'Pappadam', qty: 500, price: 15 },
          { name: 'Buttermilk (Moru)', qty: 500, price: 25 },
          { name: 'Semiya Payasam', qty: 500, price: 55 },
          { name: 'Pan Cake', qty: 500, price: 50 },
        ],
        services: [
          { serviceName: 'Welcome Counter', price: 4000 },
          { serviceName: 'Service Staffs (10)', price: 12000 },
          { serviceName: 'All Service Equipment', price: 8000 },
          { serviceName: 'Table Mat & Tissue Papers', price: 3000 },
        ],
      },
      {
        event: {
          name: "Johnson Family Birthday Party",
          eventType: 'MAIN_EVENT',
          status: 'COMPLETED',
          clientName: 'Johnson Thomas',
          clientContact: '9895 667 788',
          location: 'Johnson Residence, Perinthalmanna',
          eventDate: new Date('2026-01-20'),
          eventTime: '06:30 PM',
          guestCount: 300,
          totalAmount: 105000,
          paidAmount: 105000,
          balanceAmount: 0,
          notes: 'Christian family. Mix of veg and non-veg.',
          createdById: admin.id,
        },
        dishes: [
          { name: 'Fresh Fruits Juice Live (5 Types)', qty: 300, price: 80 },
          { name: 'Chicken Kabiri', qty: 300, price: 250 },
          { name: 'Chicken Fry', qty: 300, price: 160 },
          { name: 'Fish Fry', qty: 300, price: 200 },
          { name: 'Raita', qty: 300, price: 40 },
          { name: 'Avial', qty: 300, price: 60 },
          { name: 'Thoran', qty: 300, price: 45 },
          { name: 'Pappadam', qty: 300, price: 15 },
          { name: '500 ML Drinking Water', qty: 300, price: 20 },
          { name: 'Elaneer Payasam', qty: 300, price: 70 },
        ],
        services: [
          { serviceName: 'Ceramic Plates', price: 4000 },
          { serviceName: 'Service Staffs (8)', price: 10000 },
          { serviceName: 'House Keeping', price: 3000 },
        ],
      },
      {
        event: {
          name: "Malabar Hospital Annual Staff Lunch",
          eventType: 'MAIN_EVENT',
          status: 'UPCOMING',
          clientName: 'Dr. Nafeesa (HR Head)',
          clientContact: '9061 445 566',
          location: 'Malabar Medical College, Calicut',
          eventDate: new Date('2026-03-25'),
          eventTime: '01:00 PM',
          guestCount: 400,
          totalAmount: 140000,
          paidAmount: 70000,
          balanceAmount: 70000,
          notes: 'Corporate lunch. Buffet counters needed. No beef.',
          createdById: admin.id,
        },
        dishes: [
          { name: 'Tender Coconut Water (Elaneer)', qty: 400, price: 60 },
          { name: 'Lime Tea', qty: 400, price: 25 },
          { name: 'Chicken Kabiri', qty: 400, price: 250 },
          { name: 'Chicken Fry', qty: 400, price: 160 },
          { name: 'Sambar', qty: 400, price: 50 },
          { name: 'Avial', qty: 400, price: 60 },
          { name: 'Thoran', qty: 400, price: 45 },
          { name: 'Koottucurry', qty: 400, price: 55 },
          { name: 'Pappadam', qty: 400, price: 15 },
          { name: 'Steamed Rice', qty: 400, price: 30 },
          { name: '500 ML Drinking Water', qty: 400, price: 20 },
          { name: 'Semiya Payasam', qty: 400, price: 55 },
        ],
        services: [
          { serviceName: 'Buffet Setup (Full)', price: 12000 },
          { serviceName: 'Service Staffs (12)', price: 15000 },
          { serviceName: 'Table Mat & Tissue Papers', price: 2500 },
          { serviceName: 'House Keeping', price: 4000 },
        ],
      },
      {
        event: {
          name: "Salam Century Nikkah",
          eventType: 'MAIN_EVENT',
          status: 'UPCOMING',
          clientName: 'Mr. Salam',
          clientContact: '85 90 114 309',
          location: 'Century Auditorium, Manjeri',
          eventDate: new Date('2026-03-29'),
          eventTime: '10:00 AM',
          guestCount: 1800,
          totalAmount: 720000,
          paidAmount: 300000,
          balanceAmount: 420000,
          notes: 'Nikkah ceremony. Box counter setup x6. Herbal tea counter from 9am.',
          createdById: admin.id,
        },
        dishes: [
          { name: 'Fresh Fruits Juice Live (5 Types)', qty: 1800, price: 80 },
          { name: 'Ginger Tea', qty: 1800, price: 25 },
          { name: 'Mint Tea', qty: 1800, price: 25 },
          { name: 'Lime Tea', qty: 1800, price: 25 },
          { name: 'Green Tea', qty: 1800, price: 30 },
          { name: 'Cinnamon Tea', qty: 1800, price: 30 },
          { name: 'Cardamom Tea', qty: 1800, price: 25 },
          { name: 'Beef Biriyani', qty: 1800, price: 280 },
          { name: 'Chicken Kabiri', qty: 1800, price: 250 },
          { name: 'Chicken Fry', qty: 1800, price: 160 },
          { name: 'Beef Varattu', qty: 1800, price: 180 },
          { name: 'Raita', qty: 1800, price: 40 },
          { name: 'Pickle (Achar)', qty: 1800, price: 20 },
          { name: 'Steamed Rice', qty: 1800, price: 30 },
          { name: 'Sambar', qty: 1800, price: 50 },
          { name: 'Avial', qty: 1800, price: 60 },
          { name: 'Thoran', qty: 1800, price: 45 },
          { name: 'Koottucurry', qty: 1800, price: 55 },
          { name: 'Pappadam', qty: 1800, price: 15 },
          { name: '500 ML Drinking Water', qty: 1800, price: 20 },
          { name: 'Elaneer Payasam', qty: 1800, price: 70 },
          { name: 'Luqaimat', qty: 1800, price: 60 },
          { name: 'Pan Cake', qty: 1800, price: 50 },
        ],
        services: [
          { serviceName: 'Welcome Counter', price: 10000 },
          { serviceName: 'Ceramic Plates', price: 20000 },
          { serviceName: 'All Service Equipment', price: 15000 },
          { serviceName: 'Box Counter (6)', price: 18000 },
          { serviceName: 'Service Staffs (25)', price: 40000 },
          { serviceName: 'Hosting Boys', price: 15000 },
          { serviceName: 'House Keeping', price: 10000 },
          { serviceName: 'Toothpick & Sweet Saunf', price: 2000 },
          { serviceName: 'Table Mat', price: 5000 },
          { serviceName: 'Waste Cover', price: 3000 },
          { serviceName: 'Hand Wash & Tissue Papers', price: 4000 },
        ],
      },
    ]

  for (const { event, dishes: evDishes, services } of eventData) {
    const validDishes = evDishes
      .filter(d => dishIds[d.name])
      .map(d => ({
        dishId: dishIds[d.name],
        quantity: d.qty,
        pricePerPlate: d.price,
      }))

    await prisma.event.create({
      data: {
        ...(event as any),
        dishes: validDishes.length > 0 ? { create: validDishes } : undefined,
        services: services.length > 0
          ? { create: services.map(s => ({ serviceName: s.serviceName, description: s.description, price: s.price })) }
          : undefined,
      },
    })
    console.log(`✅ Created event: ${(event as any).name}`)
  }

  // ── Enquiries ────────────────────────────────────────────────────────────────
  const enquiries = [
    // PENDING
    {
      quotationNumber: `QT-2026-0001`,
      clientName: 'Abdullah Haji',
      clientContact: '9946 778 899',
      peopleCount: 1500,
      location: 'Noor Convention Centre, Tirur',
      eventDate: new Date('2026-04-25'),
      eventTime: '10:00 AM',
      occasion: 'NIKKAH',
      serviceType: 'BOX COUNTER',
      status: 'PENDING' as const,
      totalAmount: 600000,
      createdById: admin.id,
      dishes: [
        { name: 'Fresh Fruits Juice Live (5 Types)', qty: 1500, price: 80 },
        { name: 'Cardamom Tea', qty: 1500, price: 25 },
        { name: 'Cinnamon Tea', qty: 1500, price: 30 },
        { name: 'Beef Biriyani', qty: 1500, price: 280 },
        { name: 'Chicken Kabiri', qty: 1500, price: 250 },
        { name: 'Kerala Porotta', qty: 1500, price: 35 },
        { name: 'Malabar Beef Curry', qty: 1500, price: 140 },
        { name: 'Chicken Fry', qty: 1500, price: 160 },
        { name: 'Beef Varattu', qty: 1500, price: 180 },
        { name: 'Raita', qty: 1500, price: 40 },
        { name: 'Avial', qty: 1500, price: 60 },
        { name: 'Pappadam', qty: 1500, price: 15 },
        { name: '500 ML Drinking Water', qty: 1500, price: 20 },
        { name: 'Elaneer Payasam', qty: 1500, price: 70 },
        { name: 'Luqaimat', qty: 1500, price: 60 },
      ],
      services: [
        { serviceName: 'Welcome Counter', price: 8000 },
        { serviceName: 'Ceramic Plates', price: 18000 },
        { serviceName: 'Box Counter (8)', price: 20000 },
        { serviceName: 'Service Staffs (20)', price: 35000 },
        { serviceName: 'House Keeping', price: 8000 },
      ],
    },
    // PENDING
    {
      quotationNumber: `QT-2026-0002`,
      clientName: 'Mohideen Kutty',
      clientContact: '9895 334 455',
      peopleCount: 1000,
      location: 'Siraj Convention Hall, Kondotty',
      eventDate: new Date('2026-05-05'),
      eventTime: '11:00 AM',
      occasion: 'WALIMA',
      serviceType: 'BOX COUNTER',
      status: 'PENDING' as const,
      totalAmount: 390000,
      createdById: admin.id,
      dishes: [
        { name: 'Tender Coconut Water (Elaneer)', qty: 1000, price: 60 },
        { name: 'Green Tea', qty: 1000, price: 30 },
        { name: 'Mint Tea', qty: 1000, price: 25 },
        { name: 'Mutton Biriyani', qty: 1000, price: 320 },
        { name: 'Prawn Biriyani', qty: 400, price: 350 },
        { name: 'Pathiri', qty: 1000, price: 30 },
        { name: 'Malabar Fish Curry', qty: 1000, price: 150 },
        { name: 'Chicken Fry', qty: 1000, price: 160 },
        { name: 'Fish Fry', qty: 500, price: 200 },
        { name: 'Raita', qty: 1000, price: 40 },
        { name: 'Pickle (Achar)', qty: 1000, price: 20 },
        { name: 'Sambar', qty: 1000, price: 50 },
        { name: 'Pappadam', qty: 1000, price: 15 },
        { name: '500 ML Drinking Water', qty: 1000, price: 20 },
        { name: 'Semiya Payasam', qty: 1000, price: 55 },
        { name: 'Luqaimat', qty: 1000, price: 60 },
      ],
      services: [
        { serviceName: 'Welcome Counter', price: 5000 },
        { serviceName: 'Ceramic Plates', price: 12000 },
        { serviceName: 'Box Counter (5)', price: 12000 },
        { serviceName: 'Service Staffs (15)', price: 22000 },
        { serviceName: 'Hosting Boys', price: 8000 },
      ],
    },
    // LOST
    {
      quotationNumber: `QT-2026-0003`,
      clientName: 'Ravi Shankar',
      clientContact: '9745 223 344',
      peopleCount: 500,
      location: 'Green Lawns, Palakkad',
      eventDate: new Date('2026-02-28'),
      eventTime: '07:00 PM',
      occasion: 'BIRTHDAY',
      serviceType: 'BUFFET',
      status: 'LOST' as const,
      totalAmount: 195000,
      createdById: admin.id,
      dishes: [
        { name: 'Fresh Fruits Juice Live (5 Types)', qty: 500, price: 80 },
        { name: 'Vegetable Samosa', qty: 500, price: 40 },
        { name: 'Vegetable Dum Biriyani', qty: 500, price: 180 },
        { name: 'Chicken Roast', qty: 500, price: 130 },
        { name: 'Chicken Fry', qty: 500, price: 160 },
        { name: 'Raita', qty: 500, price: 40 },
        { name: 'Avial', qty: 500, price: 60 },
        { name: 'Thoran', qty: 500, price: 45 },
        { name: '500 ML Drinking Water', qty: 500, price: 20 },
        { name: 'Pan Cake', qty: 500, price: 50 },
        { name: 'Elaneer Payasam', qty: 500, price: 70 },
      ],
      services: [
        { serviceName: 'Buffet Setup', price: 10000 },
        { serviceName: 'Service Staffs (10)', price: 12000 },
        { serviceName: 'Table Decoration', price: 5000 },
      ],
    },
    // PENDING
    {
      quotationNumber: `QT-2026-0004`,
      clientName: 'Basheer M.P.',
      clientContact: '9061 556 677',
      peopleCount: 600,
      location: 'Hilal Marriage Hall, Tirur',
      eventDate: new Date('2026-06-01'),
      eventTime: '10:00 AM',
      occasion: 'WEDDING RECEPTION',
      serviceType: 'BOX COUNTER',
      status: 'PENDING' as const,
      totalAmount: 240000,
      createdById: admin.id,
      dishes: [
        { name: 'Fresh Fruits Juice Live (5 Types)', qty: 600, price: 80 },
        { name: 'Ginger Tea', qty: 600, price: 25 },
        { name: 'Lime Tea', qty: 600, price: 25 },
        { name: 'Chicken Shawarma', qty: 600, price: 90 },
        { name: 'Beef Biriyani', qty: 600, price: 280 },
        { name: 'Kerala Porotta', qty: 600, price: 35 },
        { name: 'Chicken Roast', qty: 600, price: 130 },
        { name: 'Beef Varattu', qty: 600, price: 180 },
        { name: 'Raita', qty: 600, price: 40 },
        { name: 'Koottucurry', qty: 600, price: 55 },
        { name: 'Pappadam', qty: 600, price: 15 },
        { name: 'Buttermilk (Moru)', qty: 600, price: 25 },
        { name: 'Elaneer Payasam', qty: 600, price: 70 },
        { name: 'Luqaimat', qty: 600, price: 60 },
      ],
      services: [
        { serviceName: 'Welcome Counter', price: 5000 },
        { serviceName: 'Ceramic Plates', price: 8000 },
        { serviceName: 'Box Counter (4)', price: 10000 },
        { serviceName: 'Service Staffs (12)', price: 18000 },
        { serviceName: 'Hand Wash & Tissue Papers', price: 2000 },
      ],
    },
  ]

  for (const eq of enquiries) {
    const { dishes: eqDishes, services: eqServices, ...eqData } = eq
    const validDishes = eqDishes
      .filter(d => dishIds[d.name])
      .map(d => ({ dishId: dishIds[d.name], quantity: d.qty, pricePerPlate: d.price }))

    await prisma.enquiry.create({
      data: {
        ...eqData,
        occasion: eqData.occasion ? [eqData.occasion] : undefined,
        serviceType: eqData.serviceType ? [eqData.serviceType] : undefined,
        dishes: { create: validDishes },
        services: { create: eqServices.map(s => ({ serviceName: s.serviceName, price: s.price })) },
        updates: {
          create: {
            updateType: 'STATUS_CHANGE',
            description: `Enquiry created with status ${eqData.status}`,
            newValue: eqData.status,
          },
        },
      },
    })
    console.log(`✅ Created enquiry: ${eqData.quotationNumber} — ${eqData.clientName} (${eqData.status})`)
  }

  // ── Todos ────────────────────────────────────────────────────────────────────
  const todos = [
    { title: 'Confirm venue booking for Ahmed Khan Nikkah', priority: 'HIGH', dueDate: new Date('2026-03-01') },
    { title: 'Order 50 boxes of mineral water for Salam event', priority: 'HIGH', dueDate: new Date('2026-03-25') },
    { title: 'Arrange extra service staffs for Fathima Wedding', priority: 'NORMAL', dueDate: new Date('2026-04-05') },
    { title: 'Follow up with Abdullah Haji on menu confirmation', priority: 'NORMAL', dueDate: new Date('2026-02-25') },
    { title: 'Purchase ceramic plates - 2000 pcs', priority: 'HIGH', dueDate: new Date('2026-03-10') },
    { title: 'Renew vehicle insurance for delivery van', priority: 'LOW', dueDate: new Date('2026-03-31') },
    { title: 'Send menu PDF to Mohideen Kutty', priority: 'NORMAL', dueDate: new Date('2026-02-22') },
  ]

  for (const todo of todos) {
    await prisma.todo.create({
      data: { ...todo, createdById: admin.id },
    })
  }
  console.log(`✅ Created ${todos.length} todos`)

  console.log('\n🎉 Seeding completed!\n')
  console.log('─────────────────────────────────────')
  console.log('  Login: admin@example.com')
  console.log('  Password: admin123')
  console.log('─────────────────────────────────────\n')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
