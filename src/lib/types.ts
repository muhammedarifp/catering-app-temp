export type EventStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type EventType = 'wedding' | 'corporate' | 'birthday' | 'engagement' | 'anniversary' | 'other';
export type ServiceType = 'per_plate' | 'self_cooking';
export type DishCategory = 'starters' | 'main_course' | 'desserts' | 'beverages' | 'snacks' | 'breads' | 'rice' | 'sides';
export type Unit = 'kg' | 'g' | 'liters' | 'ml' | 'pieces' | 'cups' | 'tbsp' | 'tsp';

export interface MenuItem {
  id: string;
  name: string;
  category: DishCategory;
  pricePerPlate: number;
  isVeg: boolean;
}

export interface DishIngredient {
  inventoryItemId: string;
  inventoryItemName?: string;
  quantity: number;
  unit: Unit;
}

export interface Dish {
  id: string;
  name: string;
  category: DishCategory;
  isVeg: boolean;
  description: string;
  ingredients: DishIngredient[];
  estimatedCostPerPlate: number;
  sellingPricePerPlate: number;
  preparationTime: number; // in minutes
  servingsPerBatch: number;
  batchSize: number;
  batchUnit: Unit;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Recipe = Dish;

export interface MenuTemplate {
  id: string;
  name: string;
  description: string;
  category: 'wedding' | 'corporate' | 'birthday' | 'casual' | 'premium';
  dishIds: string[];
  isVegOnly: boolean;
  estimatedCostPerPerson: number;
  suggestedPricePerPerson: number;
}

export interface EventMenu {
  dishId: string;
  quantity: number; // number of plates/servings
  customPrice?: number;
}

export interface Event {
  id: string;
  name: string;
  client: string;
  clientPhone: string;
  clientEmail: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  address: string;
  guests: number;
  eventType: EventType;
  serviceType: ServiceType;
  status: EventStatus;
  amount: number;
  paidAmount: number;
  menuItems: string[];
  recipes: string[];
  eventMenu: EventMenu[];
  specialRequirements: string;
  createdAt: string;
  estimatedCost?: number;
}

export interface EventFormData {
  name: string;
  eventType: EventType;
  serviceType: ServiceType;
  date: string;
  time: string;
  endTime: string;
  client: string;
  clientPhone: string;
  clientEmail: string;
  location: string;
  address: string;
  guests: number;
  menuItems: string[];
  recipes: string[];
  eventMenu: EventMenu[];
  specialRequirements: string;
  amount: number;
  advanceAmount: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: Unit;
  minQuantity: number;
  pricePerUnit: number;
  lastUpdated: string;
}

export interface DashboardStats {
  totalEvents: number;
  completedEvents: number;
  pendingEvents: number;
  totalRevenue: number;
  pendingAmount: number;
  thisMonthEvents: number;
}
