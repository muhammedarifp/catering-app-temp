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
  trackingType: 'stocked' | 'on_demand'; // 'stocked' = Godown (track qty), 'on_demand' = Market (buy fresh)
  lastUpdated: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string; // denormalized for easier display
  type: 'purchase' | 'usage' | 'wastage' | 'adjustment';
  quantity: number;
  unit: Unit;
  date: string;
  cost?: number; // for purchases
  reason?: string; // for adjustments/wastage
  eventId?: string; // if usage is linked to an event
}

export interface DashboardStats {
  totalEvents: number;
  completedEvents: number;
  pendingEvents: number;
  totalRevenue: number;
  pendingAmount: number;
  thisMonthEvents: number;
}

// =====================================================
// ACCOUNTING TYPES
// =====================================================

// Expense Categories for Catering Business
export type ExpenseCategory =
  | 'food_costs'
  | 'labor'
  | 'transport'
  | 'equipment_rental'
  | 'venue'
  | 'utilities'
  | 'marketing'
  | 'miscellaneous';

// Payment Methods
export type PaymentMethod = 'cash' | 'bank_transfer' | 'upi' | 'card' | 'cheque';

// Income Types (beyond event revenue)
export type IncomeType = 'event_revenue' | 'tips' | 'equipment_rental' | 'consultancy' | 'miscellaneous';

// Invoice Status
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';

// Transaction Type
export type TransactionType = 'income' | 'expense';

// Recurrence Pattern for recurring expenses
export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// Tax Type for GST
export type TaxType = 'food' | 'equipment' | 'none';

// Expense Interface
export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  vendor: string;
  vendorContact?: string;
  receiptNumber?: string;
  notes?: string;
  eventId?: string;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceEndDate?: string;
  parentExpenseId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Income Interface (Non-Event Revenue)
export interface Income {
  id: string;
  type: IncomeType;
  description: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  payer: string;
  payerContact?: string;
  eventId?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Transaction Interface (Unified Money Flow)
export interface Transaction {
  id: string;
  type: TransactionType;
  referenceType: 'expense' | 'income' | 'event_payment' | 'invoice_payment';
  referenceId: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  createdAt: string;
}

// Invoice Line Item
export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxType: TaxType;
  taxRate: number;
  taxAmount: number;
  dishId?: string;
}

// Invoice Payment
export interface InvoicePayment {
  id: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  notes?: string;
}

// Invoice Interface
export interface Invoice {
  id: string;
  invoiceNumber: string;
  eventId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientAddress?: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  totalTaxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  payments: InvoicePayment[];
  notes?: string;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
}

// Vendor Interface
export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  category: ExpenseCategory;
  gstNumber?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  notes?: string;
  totalTransactions: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Financial Summary
export interface FinancialSummary {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  incomeBreakdown: Record<IncomeType, number>;
  expenseBreakdown: Record<ExpenseCategory, number>;
  cashFlow: {
    opening: number;
    closing: number;
    netChange: number;
  };
}

// Accounts Receivable
export interface AccountsReceivable {
  eventId: string;
  eventName: string;
  clientName: string;
  clientPhone: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: string;
  daysOverdue: number;
  invoiceId?: string;
}

// Accounts Payable
export interface AccountsPayable {
  vendorId: string;
  vendorName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
}

// Accounting Dashboard Stats
export interface AccountingDashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  totalReceivables: number;
  totalPayables: number;
  currentMonthIncome: number;
  previousMonthIncome: number;
  incomeGrowth: number;
  currentMonthExpenses: number;
  previousMonthExpenses: number;
  expenseGrowth: number;
  pendingInvoices: number;
  overdueInvoices: number;
  pendingCollections: number;
}

// Form Data Interfaces
export interface ExpenseFormData {
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  vendor: string;
  vendorContact?: string;
  receiptNumber?: string;
  notes?: string;
  eventId?: string;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceEndDate?: string;
  tags?: string[];
}

export interface IncomeFormData {
  type: IncomeType;
  description: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  payer: string;
  payerContact?: string;
  eventId?: string;
  receiptNumber?: string;
  notes?: string;
}

export interface InvoiceFormData {
  eventId: string;
  dueDate: string;
  lineItems: Omit<InvoiceLineItem, 'id'>[];
  discountAmount: number;
  notes?: string;
  termsAndConditions?: string;
}

// =====================================================
// STAFF MANAGEMENT TYPES
// =====================================================

// Staff Roles
export type StaffRole =
  | 'head_chef'
  | 'chef'
  | 'helper'
  | 'waiter'
  | 'bartender'
  | 'supervisor'
  | 'driver'
  | 'cleaner';

// Employment Type
export type EmploymentType = 'full_time' | 'part_time' | 'freelance';

// Staff Status
export type StaffStatus = 'active' | 'inactive' | 'on_leave';

// Assignment Status
export type AssignmentStatus = 'pending' | 'confirmed' | 'declined' | 'completed' | 'no_show';

// Staff Member Interface
export interface Staff {
  id: string;
  name: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  address?: string;
  photo?: string;

  // Role & Employment
  role: StaffRole;
  employmentType: EmploymentType;
  status: StaffStatus;

  // Skills & Experience
  skills: string[];
  experienceYears: number;
  specializations?: string[];

  // Pay Information
  hourlyRate: number;
  dailyRate?: number;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    upiId?: string;
  };

  // Documents
  idProof?: string;
  idProofNumber?: string;

  // Emergency Contact
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };

  // Performance
  rating: number; // 1-5
  totalEventsWorked: number;
  reliabilityScore: number; // % of confirmed events attended

  // Notes
  notes?: string;

  // Availability
  availableDays?: string[]; // ['monday', 'tuesday', etc.]
  preferredAreas?: string[]; // Areas they prefer to work in

  createdAt: string;
  updatedAt: string;
}

// Event Staff Assignment
export interface EventStaffAssignment {
  id: string;
  eventId: string;
  staffId: string;
  role: StaffRole;

  // Shift Details
  shiftStart: string;
  shiftEnd: string;

  // Pay
  payRate: number;
  payType: 'hourly' | 'daily' | 'fixed';
  estimatedPay: number;
  actualPay?: number;

  // Status
  status: AssignmentStatus;
  confirmedAt?: string;
  declinedReason?: string;

  // Attendance
  checkInTime?: string;
  checkOutTime?: string;
  hoursWorked?: number;

  // Performance
  performanceRating?: number;
  performanceNotes?: string;

  // Payment
  paymentStatus: 'pending' | 'paid';
  paymentDate?: string;
  paymentMethod?: PaymentMethod;

  // WhatsApp
  whatsappAlertSent: boolean;
  whatsappAlertSentAt?: string;
  reminderSent: boolean;
  reminderSentAt?: string;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Staff Notification/Alert
export interface StaffAlert {
  id: string;
  staffId: string;
  eventId: string;
  assignmentId: string;
  type: 'assignment' | 'reminder' | 'update' | 'cancellation' | 'emergency';
  message: string;
  sentVia: 'whatsapp' | 'sms' | 'email';
  sentAt: string;
  delivered: boolean;
  read: boolean;
  response?: 'confirmed' | 'declined';
  responseAt?: string;
}

// Staff Payment Record
export interface StaffPayment {
  id: string;
  staffId: string;
  eventId?: string;
  assignmentId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  paymentReference?: string;
  description: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

// Staff Dashboard Stats
export interface StaffDashboardStats {
  totalStaff: number;
  activeStaff: number;
  fullTimeStaff: number;
  partTimeStaff: number;
  freelanceStaff: number;
  averageRating: number;
  pendingPayments: number;
  pendingPaymentAmount: number;
  upcomingAssignments: number;
  staffByRole: Record<StaffRole, number>;
}
