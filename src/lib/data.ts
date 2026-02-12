import {
  Event,
  InventoryItem,
  DashboardStats,
  Dish,
  MenuTemplate,
  Unit,
  Expense,
  Income,
  Invoice,
  Vendor,
  Transaction,
  ExpenseCategory,
  IncomeType,
  PaymentMethod,
  InvoiceStatus,
  RecurrencePattern,
  Staff,
} from './types';

// Units for dropdown
export const units: { value: Unit; label: string }[] = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'liters', label: 'Liters (L)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'cups', label: 'Cups' },
  { value: 'tbsp', label: 'Tablespoons' },
  { value: 'tsp', label: 'Teaspoons' },
];

// Dish categories
export const dishCategories = [
  { value: 'starters', label: 'Starters' },
  { value: 'main_course', label: 'Main Course' },
  { value: 'breads', label: 'Breads' },
  { value: 'rice', label: 'Rice & Biryani' },
  { value: 'sides', label: 'Sides & Accompaniments' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'snacks', label: 'Snacks' },
];

// Inventory items with proper units
export const inventory: InventoryItem[] = [
  { id: 'inv-1', name: 'Basmati Rice', category: 'Grains', quantity: 25, unit: 'kg', minQuantity: 50, pricePerUnit: 80, trackingType: 'stocked', lastUpdated: '2026-02-01' },
  { id: 'inv-2', name: 'Cooking Oil', category: 'Oils', quantity: 15, unit: 'liters', minQuantity: 20, pricePerUnit: 150, trackingType: 'stocked', lastUpdated: '2026-02-01' },
  { id: 'inv-3', name: 'Onions', category: 'Vegetables', quantity: 8, unit: 'kg', minQuantity: 30, pricePerUnit: 40, trackingType: 'on_demand', lastUpdated: '2026-02-02' },
  { id: 'inv-4', name: 'Tomatoes', category: 'Vegetables', quantity: 5, unit: 'kg', minQuantity: 25, pricePerUnit: 50, trackingType: 'on_demand', lastUpdated: '2026-02-02' },
  { id: 'inv-5', name: 'Chicken', category: 'Meat', quantity: 40, unit: 'kg', minQuantity: 30, pricePerUnit: 280, trackingType: 'on_demand', lastUpdated: '2026-02-01' },
  { id: 'inv-6', name: 'Paneer', category: 'Dairy', quantity: 12, unit: 'kg', minQuantity: 15, pricePerUnit: 350, trackingType: 'on_demand', lastUpdated: '2026-02-01' },
  { id: 'inv-7', name: 'Ghee', category: 'Dairy', quantity: 8, unit: 'kg', minQuantity: 10, pricePerUnit: 550, trackingType: 'stocked', lastUpdated: '2026-01-30' },
  { id: 'inv-8', name: 'Sugar', category: 'Sweeteners', quantity: 45, unit: 'kg', minQuantity: 25, pricePerUnit: 45, trackingType: 'stocked', lastUpdated: '2026-01-28' },
  { id: 'inv-9', name: 'Wheat Flour', category: 'Grains', quantity: 60, unit: 'kg', minQuantity: 40, pricePerUnit: 35, trackingType: 'stocked', lastUpdated: '2026-01-29' },
  { id: 'inv-10', name: 'Curd', category: 'Dairy', quantity: 3, unit: 'kg', minQuantity: 10, pricePerUnit: 60, trackingType: 'on_demand', lastUpdated: '2026-02-02' },
  { id: 'inv-11', name: 'Green Chillies', category: 'Vegetables', quantity: 2, unit: 'kg', minQuantity: 5, pricePerUnit: 80, trackingType: 'on_demand', lastUpdated: '2026-02-02' },
  { id: 'inv-12', name: 'Ginger', category: 'Spices', quantity: 3, unit: 'kg', minQuantity: 5, pricePerUnit: 120, trackingType: 'stocked', lastUpdated: '2026-02-01' },
  { id: 'inv-13', name: 'Garlic', category: 'Spices', quantity: 4, unit: 'kg', minQuantity: 5, pricePerUnit: 100, trackingType: 'stocked', lastUpdated: '2026-02-01' },
  { id: 'inv-14', name: 'Cream', category: 'Dairy', quantity: 5, unit: 'liters', minQuantity: 8, pricePerUnit: 200, trackingType: 'on_demand', lastUpdated: '2026-02-01' },
  { id: 'inv-15', name: 'Butter', category: 'Dairy', quantity: 6, unit: 'kg', minQuantity: 8, pricePerUnit: 450, trackingType: 'stocked', lastUpdated: '2026-02-01' },
  { id: 'inv-16', name: 'Milk', category: 'Dairy', quantity: 20, unit: 'liters', minQuantity: 30, pricePerUnit: 55, trackingType: 'on_demand', lastUpdated: '2026-02-02' },
  { id: 'inv-17', name: 'Cashews', category: 'Dry Fruits', quantity: 2, unit: 'kg', minQuantity: 3, pricePerUnit: 900, trackingType: 'stocked', lastUpdated: '2026-02-01' },
  { id: 'inv-18', name: 'Almonds', category: 'Dry Fruits', quantity: 1.5, unit: 'kg', minQuantity: 2, pricePerUnit: 800, trackingType: 'stocked', lastUpdated: '2026-02-01' },
];

// Dishes/Recipes with ingredient mapping
export const dishes: Dish[] = [
  {
    id: 'dish-1',
    name: 'Paneer Tikka',
    category: 'starters',
    isVeg: true,
    description: 'Marinated paneer cubes grilled to perfection with spices',
    ingredients: [
      { inventoryItemId: 'inv-6', inventoryItemName: 'Paneer', quantity: 80, unit: 'g' },
      { inventoryItemId: 'inv-10', inventoryItemName: 'Curd', quantity: 30, unit: 'g' },
      { inventoryItemId: 'inv-3', inventoryItemName: 'Onions', quantity: 20, unit: 'g' },
      { inventoryItemId: 'inv-11', inventoryItemName: 'Green Chillies', quantity: 5, unit: 'g' },
      { inventoryItemId: 'inv-2', inventoryItemName: 'Cooking Oil', quantity: 10, unit: 'ml' },
    ],
    estimatedCostPerPlate: 35,
    sellingPricePerPlate: 80,
    preparationTime: 30,
    servingsPerBatch: 10,
    batchSize: 1,
    batchUnit: 'kg',
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
  {
    id: 'dish-2',
    name: 'Chicken Tikka',
    category: 'starters',
    isVeg: false,
    description: 'Tender chicken pieces marinated in yogurt and spices, grilled',
    ingredients: [
      { inventoryItemId: 'inv-5', inventoryItemName: 'Chicken', quantity: 100, unit: 'g' },
      { inventoryItemId: 'inv-10', inventoryItemName: 'Curd', quantity: 30, unit: 'g' },
      { inventoryItemId: 'inv-12', inventoryItemName: 'Ginger', quantity: 5, unit: 'g' },
      { inventoryItemId: 'inv-13', inventoryItemName: 'Garlic', quantity: 5, unit: 'g' },
      { inventoryItemId: 'inv-2', inventoryItemName: 'Cooking Oil', quantity: 10, unit: 'ml' },
    ],
    estimatedCostPerPlate: 45,
    sellingPricePerPlate: 100,
    preparationTime: 35,
    servingsPerBatch: 10,
    batchSize: 1,
    batchUnit: 'kg',
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
  {
    id: 'dish-3',
    name: 'Veg Biryani',
    category: 'rice',
    isVeg: true,
    description: 'Fragrant basmati rice cooked with mixed vegetables and spices',
    ingredients: [
      { inventoryItemId: 'inv-1', inventoryItemName: 'Basmati Rice', quantity: 100, unit: 'g' },
      { inventoryItemId: 'inv-3', inventoryItemName: 'Onions', quantity: 50, unit: 'g' },
      { inventoryItemId: 'inv-4', inventoryItemName: 'Tomatoes', quantity: 30, unit: 'g' },
      { inventoryItemId: 'inv-7', inventoryItemName: 'Ghee', quantity: 15, unit: 'g' },
      { inventoryItemId: 'inv-10', inventoryItemName: 'Curd', quantity: 20, unit: 'g' },
    ],
    estimatedCostPerPlate: 40,
    sellingPricePerPlate: 100,
    preparationTime: 60,
    servingsPerBatch: 15,
    batchSize: 1,
    batchUnit: 'kg',
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
  {
    id: 'dish-4',
    name: 'Chicken Biryani',
    category: 'rice',
    isVeg: false,
    description: 'Aromatic basmati rice layered with spiced chicken',
    ingredients: [
      { inventoryItemId: 'inv-1', inventoryItemName: 'Basmati Rice', quantity: 100, unit: 'g' },
      { inventoryItemId: 'inv-5', inventoryItemName: 'Chicken', quantity: 150, unit: 'g' },
      { inventoryItemId: 'inv-3', inventoryItemName: 'Onions', quantity: 50, unit: 'g' },
      { inventoryItemId: 'inv-7', inventoryItemName: 'Ghee', quantity: 20, unit: 'g' },
      { inventoryItemId: 'inv-10', inventoryItemName: 'Curd', quantity: 30, unit: 'g' },
    ],
    estimatedCostPerPlate: 65,
    sellingPricePerPlate: 140,
    preparationTime: 75,
    servingsPerBatch: 15,
    batchSize: 1,
    batchUnit: 'kg',
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
  {
    id: 'dish-5',
    name: 'Paneer Butter Masala',
    category: 'main_course',
    isVeg: true,
    description: 'Soft paneer cubes in rich tomato and butter gravy',
    ingredients: [
      { inventoryItemId: 'inv-6', inventoryItemName: 'Paneer', quantity: 80, unit: 'g' },
      { inventoryItemId: 'inv-4', inventoryItemName: 'Tomatoes', quantity: 60, unit: 'g' },
      { inventoryItemId: 'inv-15', inventoryItemName: 'Butter', quantity: 20, unit: 'g' },
      { inventoryItemId: 'inv-14', inventoryItemName: 'Cream', quantity: 30, unit: 'ml' },
      { inventoryItemId: 'inv-17', inventoryItemName: 'Cashews', quantity: 10, unit: 'g' },
    ],
    estimatedCostPerPlate: 50,
    sellingPricePerPlate: 120,
    preparationTime: 40,
    servingsPerBatch: 10,
    batchSize: 1,
    batchUnit: 'kg',
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
  {
    id: 'dish-6',
    name: 'Butter Chicken',
    category: 'main_course',
    isVeg: false,
    description: 'Tender chicken in creamy tomato-based curry',
    ingredients: [
      { inventoryItemId: 'inv-5', inventoryItemName: 'Chicken', quantity: 120, unit: 'g' },
      { inventoryItemId: 'inv-4', inventoryItemName: 'Tomatoes', quantity: 60, unit: 'g' },
      { inventoryItemId: 'inv-15', inventoryItemName: 'Butter', quantity: 25, unit: 'g' },
      { inventoryItemId: 'inv-14', inventoryItemName: 'Cream', quantity: 40, unit: 'ml' },
      { inventoryItemId: 'inv-17', inventoryItemName: 'Cashews', quantity: 10, unit: 'g' },
    ],
    estimatedCostPerPlate: 60,
    sellingPricePerPlate: 150,
    preparationTime: 45,
    servingsPerBatch: 10,
    batchSize: 1,
    batchUnit: 'kg',
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
  {
    id: 'dish-7',
    name: 'Dal Makhani',
    category: 'main_course',
    isVeg: true,
    description: 'Creamy black lentils slow-cooked with butter and cream',
    ingredients: [
      { inventoryItemId: 'inv-15', inventoryItemName: 'Butter', quantity: 15, unit: 'g' },
      { inventoryItemId: 'inv-14', inventoryItemName: 'Cream', quantity: 25, unit: 'ml' },
      { inventoryItemId: 'inv-4', inventoryItemName: 'Tomatoes', quantity: 30, unit: 'g' },
      { inventoryItemId: 'inv-3', inventoryItemName: 'Onions', quantity: 20, unit: 'g' },
      { inventoryItemId: 'inv-12', inventoryItemName: 'Ginger', quantity: 5, unit: 'g' },
    ],
    estimatedCostPerPlate: 25,
    sellingPricePerPlate: 80,
    preparationTime: 120,
    servingsPerBatch: 20,
    batchSize: 2,
    batchUnit: 'kg',
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
  {
    id: 'dish-8',
    name: 'Naan',
    category: 'breads',
    isVeg: true,
    description: 'Soft leavened bread baked in tandoor',
    ingredients: [
      { inventoryItemId: 'inv-9', inventoryItemName: 'Wheat Flour', quantity: 50, unit: 'g' },
      { inventoryItemId: 'inv-10', inventoryItemName: 'Curd', quantity: 15, unit: 'g' },
      { inventoryItemId: 'inv-15', inventoryItemName: 'Butter', quantity: 10, unit: 'g' },
    ],
    estimatedCostPerPlate: 8,
    sellingPricePerPlate: 30,
    preparationTime: 15,
    servingsPerBatch: 20,
    batchSize: 20,
    batchUnit: 'pieces',
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
  {
    id: 'dish-9',
    name: 'Jeera Rice',
    category: 'rice',
    isVeg: true,
    description: 'Fragrant basmati rice tempered with cumin seeds',
    ingredients: [
      { inventoryItemId: 'inv-1', inventoryItemName: 'Basmati Rice', quantity: 80, unit: 'g' },
      { inventoryItemId: 'inv-7', inventoryItemName: 'Ghee', quantity: 10, unit: 'g' },
    ],
    estimatedCostPerPlate: 15,
    sellingPricePerPlate: 60,
    preparationTime: 25,
    servingsPerBatch: 20,
    batchSize: 1,
    batchUnit: 'kg',
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
  {
    id: 'dish-10',
    name: 'Gulab Jamun',
    category: 'desserts',
    isVeg: true,
    description: 'Soft milk dumplings soaked in rose-flavored sugar syrup',
    ingredients: [
      { inventoryItemId: 'inv-8', inventoryItemName: 'Sugar', quantity: 40, unit: 'g' },
      { inventoryItemId: 'inv-7', inventoryItemName: 'Ghee', quantity: 15, unit: 'g' },
      { inventoryItemId: 'inv-16', inventoryItemName: 'Milk', quantity: 20, unit: 'ml' },
    ],
    estimatedCostPerPlate: 12,
    sellingPricePerPlate: 50,
    preparationTime: 45,
    servingsPerBatch: 25,
    batchSize: 25,
    batchUnit: 'pieces',
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
  {
    id: 'dish-11',
    name: 'Kheer',
    category: 'desserts',
    isVeg: true,
    description: 'Creamy rice pudding with cardamom and dry fruits',
    ingredients: [
      { inventoryItemId: 'inv-1', inventoryItemName: 'Basmati Rice', quantity: 25, unit: 'g' },
      { inventoryItemId: 'inv-16', inventoryItemName: 'Milk', quantity: 150, unit: 'ml' },
      { inventoryItemId: 'inv-8', inventoryItemName: 'Sugar', quantity: 30, unit: 'g' },
      { inventoryItemId: 'inv-17', inventoryItemName: 'Cashews', quantity: 5, unit: 'g' },
      { inventoryItemId: 'inv-18', inventoryItemName: 'Almonds', quantity: 5, unit: 'g' },
    ],
    estimatedCostPerPlate: 18,
    sellingPricePerPlate: 45,
    preparationTime: 40,
    servingsPerBatch: 20,
    batchSize: 1,
    batchUnit: 'kg',
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
  {
    id: 'dish-12',
    name: 'Masala Chai',
    category: 'beverages',
    isVeg: true,
    description: 'Traditional Indian spiced tea',
    ingredients: [
      { inventoryItemId: 'inv-16', inventoryItemName: 'Milk', quantity: 100, unit: 'ml' },
      { inventoryItemId: 'inv-8', inventoryItemName: 'Sugar', quantity: 15, unit: 'g' },
      { inventoryItemId: 'inv-12', inventoryItemName: 'Ginger', quantity: 3, unit: 'g' },
    ],
    estimatedCostPerPlate: 8,
    sellingPricePerPlate: 20,
    preparationTime: 10,
    servingsPerBatch: 30,
    batchSize: 1,
    batchUnit: 'liters',
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-15',
  },
];

// Menu Templates
export const menuTemplates: MenuTemplate[] = [
  {
    id: 'template-1',
    name: 'Classic Wedding Veg',
    description: 'Traditional vegetarian menu perfect for wedding functions',
    category: 'wedding',
    dishIds: ['dish-1', 'dish-3', 'dish-5', 'dish-7', 'dish-8', 'dish-9', 'dish-10', 'dish-11', 'dish-12'],
    isVegOnly: true,
    estimatedCostPerPerson: 180,
    suggestedPricePerPerson: 450,
  },
  {
    id: 'template-2',
    name: 'Premium Wedding Non-Veg',
    description: 'Luxurious non-vegetarian spread for grand celebrations',
    category: 'wedding',
    dishIds: ['dish-1', 'dish-2', 'dish-4', 'dish-5', 'dish-6', 'dish-8', 'dish-9', 'dish-10', 'dish-11', 'dish-12'],
    isVegOnly: false,
    estimatedCostPerPerson: 280,
    suggestedPricePerPerson: 650,
  },
  {
    id: 'template-3',
    name: 'Corporate Lunch Veg',
    description: 'Professional vegetarian menu for office events',
    category: 'corporate',
    dishIds: ['dish-1', 'dish-3', 'dish-5', 'dish-7', 'dish-8', 'dish-12'],
    isVegOnly: true,
    estimatedCostPerPerson: 120,
    suggestedPricePerPerson: 350,
  },
  {
    id: 'template-4',
    name: 'Birthday Party Special',
    description: 'Fun and tasty menu for birthday celebrations',
    category: 'birthday',
    dishIds: ['dish-1', 'dish-3', 'dish-5', 'dish-8', 'dish-10', 'dish-12'],
    isVegOnly: true,
    estimatedCostPerPerson: 100,
    suggestedPricePerPerson: 300,
  },
  {
    id: 'template-5',
    name: 'Casual Get-together',
    description: 'Simple and delicious menu for small gatherings',
    category: 'casual',
    dishIds: ['dish-1', 'dish-7', 'dish-8', 'dish-9', 'dish-12'],
    isVegOnly: true,
    estimatedCostPerPerson: 70,
    suggestedPricePerPerson: 200,
  },
];

export const events: Event[] = [
  {
    id: '1',
    name: 'Sharma Wedding Reception',
    client: 'Rajesh Sharma',
    clientPhone: '+91 98765 43210',
    clientEmail: 'rajesh.sharma@email.com',
    date: '2026-02-05',
    time: '18:00',
    endTime: '23:00',
    location: 'Grand Palace Banquet Hall',
    address: '123 MG Road, Jubilee Hills, Hyderabad - 500033',
    guests: 350,
    eventType: 'wedding',
    serviceType: 'per_plate',
    status: 'confirmed',
    amount: 175000,
    paidAmount: 100000,
    menuItems: [],
    recipes: [],
    eventMenu: [
      { dishId: 'dish-1', quantity: 350 },
      { dishId: 'dish-2', quantity: 200 },
      { dishId: 'dish-4', quantity: 350 },
      { dishId: 'dish-6', quantity: 200 },
      { dishId: 'dish-8', quantity: 700 },
      { dishId: 'dish-10', quantity: 350 },
    ],
    specialRequirements: 'Jain food for 20 guests. Live counter for chaat.',
    createdAt: '2026-01-15',
  },
  {
    id: '2',
    name: 'Corporate Annual Dinner',
    client: 'TechCorp Solutions',
    clientPhone: '+91 99887 76655',
    clientEmail: 'events@techcorp.com',
    date: '2026-02-08',
    time: '19:30',
    endTime: '22:30',
    location: 'Hotel Marriott, Conference Center',
    address: 'Marriott Hotel, Hitech City, Hyderabad - 500081',
    guests: 200,
    eventType: 'corporate',
    serviceType: 'self_cooking',
    status: 'confirmed',
    amount: 95000,
    paidAmount: 95000,
    menuItems: [],
    recipes: [],
    eventMenu: [
      { dishId: 'dish-1', quantity: 200 },
      { dishId: 'dish-3', quantity: 200 },
      { dishId: 'dish-5', quantity: 200 },
      { dishId: 'dish-7', quantity: 200 },
      { dishId: 'dish-8', quantity: 400 },
      { dishId: 'dish-10', quantity: 200 },
    ],
    specialRequirements: 'All vegetarian menu. Projector setup required.',
    createdAt: '2026-01-20',
    estimatedCost: 35000,
  },
  {
    id: '3',
    name: 'Birthday Celebration',
    client: 'Priya Patel',
    clientPhone: '+91 87654 32109',
    clientEmail: 'priya.patel@gmail.com',
    date: '2026-02-10',
    time: '13:00',
    endTime: '17:00',
    location: 'Residence - Jubilee Hills',
    address: 'Villa 45, Road No 10, Jubilee Hills, Hyderabad - 500034',
    guests: 80,
    eventType: 'birthday',
    serviceType: 'per_plate',
    status: 'pending',
    amount: 45000,
    paidAmount: 20000,
    menuItems: [],
    recipes: [],
    eventMenu: [
      { dishId: 'dish-1', quantity: 80 },
      { dishId: 'dish-3', quantity: 80 },
      { dishId: 'dish-5', quantity: 80 },
      { dishId: 'dish-8', quantity: 160 },
      { dishId: 'dish-10', quantity: 80 },
    ],
    specialRequirements: 'Kids corner with special menu. Birthday cake arrangement.',
    createdAt: '2026-01-25',
  },
  {
    id: '4',
    name: 'Engagement Ceremony',
    client: 'Kumar Family',
    clientPhone: '+91 76543 21098',
    clientEmail: 'kumar.family@email.com',
    date: '2026-02-14',
    time: '11:00',
    endTime: '15:00',
    location: 'Sri Lakshmi Function Hall',
    address: 'Plot 78, Banjara Hills, Hyderabad - 500034',
    guests: 150,
    eventType: 'engagement',
    serviceType: 'self_cooking',
    status: 'pending',
    amount: 72000,
    paidAmount: 30000,
    menuItems: [],
    recipes: [],
    eventMenu: [],
    specialRequirements: 'Traditional South Indian breakfast items also needed.',
    createdAt: '2026-01-28',
    estimatedCost: 28500,
  },
  {
    id: '5',
    name: 'Office Inauguration Lunch',
    client: 'StartupHub Inc',
    clientPhone: '+91 65432 10987',
    clientEmail: 'hello@startuphub.in',
    date: '2026-02-18',
    time: '12:30',
    endTime: '15:30',
    location: 'StartupHub Office, Hitech City',
    address: '4th Floor, Mindspace IT Park, Hitech City, Hyderabad - 500081',
    guests: 100,
    eventType: 'corporate',
    serviceType: 'per_plate',
    status: 'pending',
    amount: 55000,
    paidAmount: 0,
    menuItems: [],
    recipes: [],
    eventMenu: [],
    specialRequirements: 'Need buffet setup. Some vegan options required.',
    createdAt: '2026-01-30',
  },
];

export const dashboardStats: DashboardStats = {
  totalEvents: 45,
  completedEvents: 38,
  pendingEvents: 7,
  totalRevenue: 1850000,
  pendingAmount: 175000,
  thisMonthEvents: 5,
};

// Helper functions
export const getUpcomingEvents = (): Event[] => {
  return events
    .filter((e) => e.status !== 'completed' && e.status !== 'cancelled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getLowStockItems = (): InventoryItem[] => {
  return inventory.filter((item) => item.quantity < item.minQuantity);
};

export const getEventById = (id: string): Event | undefined => {
  return events.find((e) => e.id === id);
};

export const getDishById = (id: string): Dish | undefined => {
  return dishes.find((d) => d.id === id);
};

export const getInventoryItemById = (id: string): InventoryItem | undefined => {
  return inventory.find((i) => i.id === id);
};

export const getMenuTemplateById = (id: string): MenuTemplate | undefined => {
  return menuTemplates.find((t) => t.id === id);
};

export const calculateDishIngredients = (dishIds: string[], quantities: Record<string, number>) => {
  const ingredientTotals: Record<string, { item: InventoryItem; required: number; unit: Unit; available: number; shortage: number }> = {};

  dishIds.forEach((dishId) => {
    const dish = getDishById(dishId);
    if (!dish) return;

    const qty = quantities[dishId] || 0;

    dish.ingredients.forEach((ing) => {
      const item = getInventoryItemById(ing.inventoryItemId);
      if (!item) return;

      // Convert to base unit (grams for solids, ml for liquids)
      let requiredInBaseUnit = ing.quantity * qty;

      if (!ingredientTotals[item.id]) {
        ingredientTotals[item.id] = {
          item,
          required: 0,
          unit: ing.unit,
          available: item.quantity * (ing.unit === 'g' || ing.unit === 'ml' ? 1000 : 1),
          shortage: 0,
        };
      }
      ingredientTotals[item.id].required += requiredInBaseUnit;
    });
  });

  // Calculate shortages
  Object.values(ingredientTotals).forEach((ing) => {
    ing.shortage = Math.max(0, ing.required - ing.available);
  });

  return Object.values(ingredientTotals);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyCompact = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount}`;
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const eventTypeLabels: Record<string, string> = {
  wedding: 'Wedding',
  corporate: 'Corporate',
  birthday: 'Birthday',
  engagement: 'Engagement',
  anniversary: 'Anniversary',
  other: 'Other',
};

export const eventStatusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const serviceTypeLabels: Record<string, string> = {
  per_plate: 'Per Plate Service',
  self_cooking: 'Self Cooking',
};

// Aliases for compatibility
export const menuItems = dishes;
export const recipes = dishes;

export const calculateEstimatedCost = (dishIds: string[], guests: number): number => {
  return dishIds.reduce((total, id) => {
    const dish = getDishById(id);
    return total + (dish ? dish.estimatedCostPerPlate * guests : 0);
  }, 0);
};

export const calculateRecipeIngredients = (dishIds: string[], guests: number) => {
  const quantities = dishIds.reduce((acc, id) => ({ ...acc, [id]: guests }), {} as Record<string, number>);
  return calculateDishIngredients(dishIds, quantities);
};

// =====================================================
// ACCOUNTING DATA & HELPERS
// =====================================================

// Expense Category Labels & Colors
export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  food_costs: 'Food Costs',
  labor: 'Labor',
  transport: 'Transport',
  equipment_rental: 'Equipment Rental',
  venue: 'Venue',
  utilities: 'Utilities',
  marketing: 'Marketing',
  miscellaneous: 'Miscellaneous',
};

export const expenseCategoryColors: Record<ExpenseCategory, string> = {
  food_costs: 'emerald',
  labor: 'blue',
  transport: 'amber',
  equipment_rental: 'purple',
  venue: 'pink',
  utilities: 'cyan',
  marketing: 'orange',
  miscellaneous: 'slate',
};

export const incomeTypeLabels: Record<IncomeType, string> = {
  event_revenue: 'Event Revenue',
  tips: 'Tips',
  equipment_rental: 'Equipment Rental',
  consultancy: 'Consultancy',
  miscellaneous: 'Miscellaneous',
};

export const incomeTypeColors: Record<IncomeType, string> = {
  event_revenue: 'emerald',
  tips: 'amber',
  equipment_rental: 'purple',
  consultancy: 'blue',
  miscellaneous: 'slate',
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  upi: 'UPI',
  card: 'Card',
  cheque: 'Cheque',
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  partial: 'Partial',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

export const invoiceStatusColors: Record<InvoiceStatus, string> = {
  draft: 'slate',
  sent: 'blue',
  paid: 'emerald',
  partial: 'amber',
  overdue: 'red',
  cancelled: 'zinc',
};

export const recurrencePatternLabels: Record<RecurrencePattern, string> = {
  none: 'One-time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

// Sample Expenses Data
export const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    category: 'food_costs',
    description: 'Vegetables and groceries for Sharma Wedding',
    amount: 15000,
    date: '2026-02-01',
    paymentMethod: 'upi',
    vendor: 'Krishna Vegetables',
    vendorContact: '+91 98765 11111',
    receiptNumber: 'REC-001',
    eventId: '1',
    isRecurring: false,
    tags: ['vegetables', 'wedding'],
    createdAt: '2026-02-01',
    updatedAt: '2026-02-01',
  },
  {
    id: 'exp-2',
    category: 'labor',
    description: 'Chef and helper wages - Sharma Wedding',
    amount: 25000,
    date: '2026-02-05',
    paymentMethod: 'cash',
    vendor: 'Daily Wage Workers',
    eventId: '1',
    isRecurring: false,
    createdAt: '2026-02-05',
    updatedAt: '2026-02-05',
  },
  {
    id: 'exp-3',
    category: 'transport',
    description: 'Vehicle rental for equipment transport',
    amount: 5000,
    date: '2026-02-04',
    paymentMethod: 'cash',
    vendor: 'Quick Transport Services',
    eventId: '1',
    isRecurring: false,
    createdAt: '2026-02-04',
    updatedAt: '2026-02-04',
  },
  {
    id: 'exp-4',
    category: 'utilities',
    description: 'Monthly electricity bill - Kitchen',
    amount: 8500,
    date: '2026-02-01',
    paymentMethod: 'bank_transfer',
    vendor: 'TSSPDCL',
    receiptNumber: 'ELEC-FEB-2026',
    isRecurring: true,
    recurrencePattern: 'monthly',
    createdAt: '2026-02-01',
    updatedAt: '2026-02-01',
  },
  {
    id: 'exp-5',
    category: 'equipment_rental',
    description: 'Chafing dishes and serving equipment',
    amount: 12000,
    date: '2026-02-04',
    paymentMethod: 'upi',
    vendor: 'Party Rentals Hyderabad',
    eventId: '1',
    isRecurring: false,
    createdAt: '2026-02-04',
    updatedAt: '2026-02-04',
  },
  {
    id: 'exp-6',
    category: 'food_costs',
    description: 'Chicken and meat for wedding',
    amount: 28000,
    date: '2026-02-04',
    paymentMethod: 'cash',
    vendor: 'Fresh Meat Suppliers',
    vendorContact: '+91 98765 44444',
    eventId: '1',
    isRecurring: false,
    createdAt: '2026-02-04',
    updatedAt: '2026-02-04',
  },
  {
    id: 'exp-7',
    category: 'marketing',
    description: 'Google Ads for catering services',
    amount: 5000,
    date: '2026-01-15',
    paymentMethod: 'card',
    vendor: 'Google Ads',
    isRecurring: true,
    recurrencePattern: 'monthly',
    createdAt: '2026-01-15',
    updatedAt: '2026-01-15',
  },
  {
    id: 'exp-8',
    category: 'utilities',
    description: 'Monthly gas cylinder refill',
    amount: 3200,
    date: '2026-01-28',
    paymentMethod: 'cash',
    vendor: 'HP Gas Agency',
    isRecurring: true,
    recurrencePattern: 'monthly',
    createdAt: '2026-01-28',
    updatedAt: '2026-01-28',
  },
];

// Sample Income Data (Non-Event)
export const initialIncome: Income[] = [
  {
    id: 'inc-1',
    type: 'tips',
    description: 'Client tip - Sharma Wedding',
    amount: 5000,
    date: '2026-02-05',
    paymentMethod: 'cash',
    payer: 'Rajesh Sharma',
    eventId: '1',
    createdAt: '2026-02-05',
    updatedAt: '2026-02-05',
  },
  {
    id: 'inc-2',
    type: 'equipment_rental',
    description: 'Rented serving equipment to external party',
    amount: 3000,
    date: '2026-02-02',
    paymentMethod: 'upi',
    payer: 'Local Caterer',
    createdAt: '2026-02-02',
    updatedAt: '2026-02-02',
  },
  {
    id: 'inc-3',
    type: 'consultancy',
    description: 'Menu planning consultation',
    amount: 2500,
    date: '2026-01-28',
    paymentMethod: 'bank_transfer',
    payer: 'New Client',
    createdAt: '2026-01-28',
    updatedAt: '2026-01-28',
  },
  {
    id: 'inc-4',
    type: 'miscellaneous',
    description: 'Leftover ingredient sale',
    amount: 1500,
    date: '2026-01-20',
    paymentMethod: 'cash',
    payer: 'Local Restaurant',
    createdAt: '2026-01-20',
    updatedAt: '2026-01-20',
  },
];

// Sample Vendors Data
export const initialVendors: Vendor[] = [
  {
    id: 'vendor-1',
    name: 'Krishna Vegetables',
    contactPerson: 'Krishna Reddy',
    phone: '+91 98765 11111',
    address: 'Rythu Bazaar, Mehdipatnam',
    category: 'food_costs',
    totalTransactions: 45,
    totalAmount: 125000,
    createdAt: '2025-01-01',
    updatedAt: '2026-02-01',
  },
  {
    id: 'vendor-2',
    name: 'Party Rentals Hyderabad',
    contactPerson: 'Suresh',
    phone: '+91 98765 22222',
    address: 'Madhapur, Hyderabad',
    category: 'equipment_rental',
    totalTransactions: 12,
    totalAmount: 85000,
    createdAt: '2025-06-01',
    updatedAt: '2026-02-04',
  },
  {
    id: 'vendor-3',
    name: 'Quick Transport Services',
    contactPerson: 'Ramu',
    phone: '+91 98765 33333',
    address: 'Kukatpally, Hyderabad',
    category: 'transport',
    totalTransactions: 20,
    totalAmount: 65000,
    createdAt: '2025-03-01',
    updatedAt: '2026-02-04',
  },
  {
    id: 'vendor-4',
    name: 'Fresh Meat Suppliers',
    contactPerson: 'Mohammed Ali',
    phone: '+91 98765 44444',
    address: 'Tolichowki, Hyderabad',
    category: 'food_costs',
    totalTransactions: 30,
    totalAmount: 280000,
    createdAt: '2025-02-01',
    updatedAt: '2026-02-04',
  },
  {
    id: 'vendor-5',
    name: 'HP Gas Agency',
    contactPerson: 'Ramesh',
    phone: '+91 98765 55555',
    address: 'Jubilee Hills, Hyderabad',
    category: 'utilities',
    totalTransactions: 24,
    totalAmount: 76800,
    createdAt: '2025-01-01',
    updatedAt: '2026-01-28',
  },
];

// Sample Invoices Data
export const initialInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-001',
    eventId: '1',
    clientName: 'Rajesh Sharma',
    clientPhone: '+91 98765 43210',
    clientEmail: 'rajesh.sharma@email.com',
    clientAddress: '123 MG Road, Jubilee Hills, Hyderabad',
    issueDate: '2026-01-20',
    dueDate: '2026-02-04',
    status: 'partial',
    lineItems: [
      {
        id: 'li-1',
        description: 'Catering Service - 350 Guests (Food)',
        quantity: 350,
        unitPrice: 450,
        totalPrice: 157500,
        taxType: 'food',
        taxRate: 5,
        taxAmount: 7875,
      },
      {
        id: 'li-2',
        description: 'Equipment & Setup',
        quantity: 1,
        unitPrice: 10000,
        totalPrice: 10000,
        taxType: 'equipment',
        taxRate: 18,
        taxAmount: 1800,
      },
    ],
    subtotal: 167500,
    totalTaxAmount: 9675,
    discountAmount: 2175,
    totalAmount: 175000,
    paidAmount: 100000,
    balanceAmount: 75000,
    payments: [
      { id: 'pay-1', amount: 50000, date: '2026-01-20', paymentMethod: 'bank_transfer', notes: 'Advance payment' },
      { id: 'pay-2', amount: 50000, date: '2026-01-30', paymentMethod: 'upi', notes: 'Second installment' },
    ],
    notes: 'Wedding reception catering',
    termsAndConditions: 'Payment due within 15 days of invoice date.',
    createdAt: '2026-01-20',
    updatedAt: '2026-01-30',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-002',
    eventId: '2',
    clientName: 'TechCorp Solutions',
    clientPhone: '+91 99887 76655',
    clientEmail: 'events@techcorp.com',
    clientAddress: 'Marriott Hotel, Hitech City, Hyderabad',
    issueDate: '2026-01-25',
    dueDate: '2026-02-08',
    status: 'paid',
    lineItems: [
      {
        id: 'li-3',
        description: 'Corporate Dinner - 200 Guests (Food)',
        quantity: 200,
        unitPrice: 450,
        totalPrice: 90000,
        taxType: 'food',
        taxRate: 5,
        taxAmount: 4500,
      },
    ],
    subtotal: 90000,
    totalTaxAmount: 4500,
    discountAmount: 0,
    totalAmount: 95000,
    paidAmount: 95000,
    balanceAmount: 0,
    payments: [
      { id: 'pay-3', amount: 95000, date: '2026-02-01', paymentMethod: 'bank_transfer', notes: 'Full payment' },
    ],
    notes: 'Annual corporate dinner',
    createdAt: '2026-01-25',
    updatedAt: '2026-02-01',
  },
];

// Helper Functions for Accounting

export const getExpenseById = (expenses: Expense[], id: string): Expense | undefined => {
  return expenses.find((e) => e.id === id);
};

export const getIncomeById = (incomeList: Income[], id: string): Income | undefined => {
  return incomeList.find((i) => i.id === id);
};

export const getInvoiceById = (invoices: Invoice[], id: string): Invoice | undefined => {
  return invoices.find((i) => i.id === id);
};

export const getVendorById = (vendors: Vendor[], id: string): Vendor | undefined => {
  return vendors.find((v) => v.id === id);
};

export const calculateTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
};

export const calculateTotalIncome = (incomeList: Income[]): number => {
  return incomeList.reduce((sum, i) => sum + i.amount, 0);
};

export const calculateExpensesByCategory = (expenses: Expense[]): Record<ExpenseCategory, number> => {
  const categories: ExpenseCategory[] = ['food_costs', 'labor', 'transport', 'equipment_rental', 'venue', 'utilities', 'marketing', 'miscellaneous'];
  const result = {} as Record<ExpenseCategory, number>;
  categories.forEach(cat => {
    result[cat] = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
  });
  return result;
};

export const calculateIncomeByType = (incomeList: Income[]): Record<IncomeType, number> => {
  const types: IncomeType[] = ['event_revenue', 'tips', 'equipment_rental', 'consultancy', 'miscellaneous'];
  const result = {} as Record<IncomeType, number>;
  types.forEach(type => {
    result[type] = incomeList.filter(i => i.type === type).reduce((sum, i) => sum + i.amount, 0);
  });
  return result;
};

export const generateInvoiceNumber = (invoices: Invoice[]): string => {
  const year = new Date().getFullYear();
  const count = invoices.filter(i => i.invoiceNumber.includes(`INV-${year}`)).length + 1;
  return `INV-${year}-${count.toString().padStart(3, '0')}`;
};

export const generateTransactions = (expenses: Expense[], incomeList: Income[], invoices: Invoice[]): Transaction[] => {
  const transactions: Transaction[] = [];

  // Add expenses as transactions
  expenses.forEach(e => {
    transactions.push({
      id: `txn-exp-${e.id}`,
      type: 'expense',
      referenceType: 'expense',
      referenceId: e.id,
      description: e.description,
      amount: e.amount,
      date: e.date,
      paymentMethod: e.paymentMethod,
      createdAt: e.createdAt,
    });
  });

  // Add income as transactions
  incomeList.forEach(i => {
    transactions.push({
      id: `txn-inc-${i.id}`,
      type: 'income',
      referenceType: 'income',
      referenceId: i.id,
      description: i.description,
      amount: i.amount,
      date: i.date,
      paymentMethod: i.paymentMethod,
      createdAt: i.createdAt,
    });
  });

  // Add invoice payments as transactions
  invoices.forEach(inv => {
    inv.payments.forEach(p => {
      transactions.push({
        id: `txn-inv-${inv.id}-${p.id}`,
        type: 'income',
        referenceType: 'invoice_payment',
        referenceId: inv.id,
        description: `Payment for ${inv.invoiceNumber} - ${inv.clientName}`,
        amount: p.amount,
        date: p.date,
        paymentMethod: p.paymentMethod,
        paymentReference: p.paymentReference,
        createdAt: p.date,
      });
    });
  });

  // Sort by date descending
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const calculateAccountingStats = (
  expenses: Expense[],
  incomeList: Income[],
  invoices: Invoice[]
): {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  totalReceivables: number;
  pendingInvoices: number;
  overdueInvoices: number;
} => {
  const totalExpenses = calculateTotalExpenses(expenses);
  const totalOtherIncome = calculateTotalIncome(incomeList);
  const totalInvoiceIncome = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalIncome = totalOtherIncome + totalInvoiceIncome;
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
  const totalReceivables = invoices.reduce((sum, i) => sum + i.balanceAmount, 0);
  const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'partial').length;
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;

  return {
    totalIncome,
    totalExpenses,
    netProfit,
    profitMargin,
    totalReceivables,
    pendingInvoices,
    overdueInvoices,
  };
};

export const getExpensesForDateRange = (expenses: Expense[], startDate: string, endDate: string): Expense[] => {
  return expenses.filter(e => e.date >= startDate && e.date <= endDate);
};

export const getIncomeForDateRange = (incomeList: Income[], startDate: string, endDate: string): Income[] => {
  return incomeList.filter(i => i.date >= startDate && i.date <= endDate);
};

// Tax rates for GST
export const TAX_RATES = {
  food: 5,
  equipment: 18,
  none: 0,
};

// Sample Staff Data
export const staff: Staff[] = [
  {
    id: 'staff-1',
    name: 'Sanjeev Kumar',
    phone: '+91 98765 12345',
    role: 'head_chef',
    employmentType: 'full_time',
    status: 'active',
    skills: ['North Indian', 'Tandoor', 'Menu Planning'],
    experienceYears: 15,
    specializations: ['Biryani', 'Kebabs'],
    hourlyRate: 500,
    rating: 4.8,
    totalEventsWorked: 150,
    reliabilityScore: 98,
    createdAt: '2025-01-01',
    updatedAt: '2026-02-01',
  },
  {
    id: 'staff-2',
    name: 'Rahul Verma',
    phone: '+91 98765 23456',
    role: 'chef',
    employmentType: 'full_time',
    status: 'active',
    skills: ['South Indian', 'Chinese'],
    experienceYears: 8,
    hourlyRate: 350,
    rating: 4.5,
    totalEventsWorked: 120,
    reliabilityScore: 95,
    createdAt: '2025-02-15',
    updatedAt: '2026-02-01',
  },
  {
    id: 'staff-3',
    name: 'Amit Singh',
    phone: '+91 98765 34567',
    role: 'chef',
    employmentType: 'part_time',
    status: 'active',
    skills: ['Tandoor', 'Curries'],
    experienceYears: 5,
    hourlyRate: 300,
    rating: 4.2,
    totalEventsWorked: 45,
    reliabilityScore: 90,
    createdAt: '2025-06-01',
    updatedAt: '2026-02-01',
  },
  {
    id: 'staff-4',
    name: 'Priya Sharma',
    phone: '+91 98765 45678',
    role: 'helper',
    employmentType: 'full_time',
    status: 'active',
    skills: ['Cutting', 'Chopping', 'Cleaning'],
    experienceYears: 3,
    hourlyRate: 150,
    rating: 4.6,
    totalEventsWorked: 200,
    reliabilityScore: 99,
    createdAt: '2025-01-10',
    updatedAt: '2026-02-01',
  },
  {
    id: 'staff-5',
    name: 'Vikram Raju',
    phone: '+91 98765 56789',
    role: 'helper',
    employmentType: 'part_time',
    status: 'active',
    skills: ['Dishwashing', 'Loading'],
    experienceYears: 2,
    hourlyRate: 120,
    rating: 4.0,
    totalEventsWorked: 50,
    reliabilityScore: 85,
    createdAt: '2025-08-01',
    updatedAt: '2026-02-01',
  },
  {
    id: 'staff-6',
    name: 'Raju',
    phone: '+91 98765 67890',
    role: 'waiter',
    employmentType: 'part_time',
    status: 'active',
    skills: ['Serving', 'Buffet Management'],
    experienceYears: 4,
    hourlyRate: 200,
    rating: 4.7,
    totalEventsWorked: 80,
    reliabilityScore: 92,
    createdAt: '2025-05-01',
    updatedAt: '2026-02-01',
  },
  {
    id: 'staff-7',
    name: 'Mohan',
    phone: '+91 98765 78901',
    role: 'waiter',
    employmentType: 'freelance',
    status: 'active',
    skills: ['Serving', 'Cleaning'],
    experienceYears: 2,
    hourlyRate: 180,
    rating: 4.3,
    totalEventsWorked: 30,
    reliabilityScore: 88,
    createdAt: '2025-09-15',
    updatedAt: '2026-02-01',
  },
  {
    id: 'staff-8',
    name: 'Suresh',
    phone: '+91 98765 89012',
    role: 'waiter',
    employmentType: 'freelance',
    status: 'active',
    skills: ['Serving'],
    experienceYears: 1,
    hourlyRate: 180,
    rating: 4.1,
    totalEventsWorked: 15,
    reliabilityScore: 90,
    createdAt: '2025-11-01',
    updatedAt: '2026-02-01',
  },
  {
    id: 'staff-9',
    name: 'Mahesh',
    phone: '+91 98765 90123',
    role: 'waiter',
    employmentType: 'freelance',
    status: 'active',
    skills: ['Serving'],
    experienceYears: 3,
    hourlyRate: 190,
    rating: 4.4,
    totalEventsWorked: 40,
    reliabilityScore: 94,
    createdAt: '2025-10-01',
    updatedAt: '2026-02-01',
  },
  {
    id: 'staff-10',
    name: 'Ganesh',
    phone: '+91 98765 01234',
    role: 'cleaner',
    employmentType: 'part_time',
    status: 'active',
    skills: ['Cleaning', 'Dishwashing'],
    experienceYears: 5,
    hourlyRate: 100,
    rating: 4.5,
    totalEventsWorked: 100,
    reliabilityScore: 96,
    createdAt: '2025-01-20',
    updatedAt: '2026-02-01',
  },
];
