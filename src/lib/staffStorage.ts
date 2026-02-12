'use client';

import {
  Staff,
  EventStaffAssignment,
  StaffPayment,
  StaffRole,
  EmploymentType,
  PaymentMethod,
} from './types';
import { addExpense } from './accountingStorage';

// Storage keys
const STORAGE_KEYS = {
  staff: 'caterpro_staff',
  assignments: 'caterpro_staff_assignments',
  payments: 'caterpro_staff_payments',
  initialized: 'caterpro_staff_initialized',
};

// Check if we're in browser
const isBrowser = typeof window !== 'undefined';

// Sample Staff Data
const initialStaff: Staff[] = [
  {
    id: 'staff-1',
    name: 'Raju Kumar',
    phone: '+91 98765 11111',
    whatsappNumber: '+91 98765 11111',
    role: 'head_chef',
    employmentType: 'full_time',
    status: 'active',
    skills: ['North Indian', 'South Indian', 'Chinese', 'Biryani Specialist'],
    experienceYears: 15,
    specializations: ['Wedding Functions', 'Large Events'],
    hourlyRate: 500,
    dailyRate: 3500,
    rating: 4.8,
    totalEventsWorked: 156,
    reliabilityScore: 98,
    notes: 'Our most experienced chef. Excellent with large events.',
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    createdAt: '2024-01-01',
    updatedAt: '2026-02-01',
  },
  {
    id: 'staff-2',
    name: 'Suresh Reddy',
    phone: '+91 98765 22222',
    whatsappNumber: '+91 98765 22222',
    role: 'chef',
    employmentType: 'full_time',
    status: 'active',
    skills: ['North Indian', 'Tandoor', 'Gravies'],
    experienceYears: 8,
    hourlyRate: 350,
    dailyRate: 2500,
    rating: 4.5,
    totalEventsWorked: 89,
    reliabilityScore: 95,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    createdAt: '2024-03-15',
    updatedAt: '2026-02-01',
  },
  {
    id: 'staff-3',
    name: 'Priya Sharma',
    phone: '+91 98765 33333',
    whatsappNumber: '+91 98765 33333',
    role: 'waiter',
    employmentType: 'part_time',
    status: 'active',
    skills: ['Serving', 'Customer Service', 'English Speaking'],
    experienceYears: 2,
    hourlyRate: 150,
    rating: 4.7,
    totalEventsWorked: 45,
    reliabilityScore: 92,
    notes: 'College student. Available weekends and evenings.',
    availableDays: ['friday', 'saturday', 'sunday'],
    createdAt: '2025-06-01',
    updatedAt: '2026-02-01',
  },
  {
    id: 'staff-4',
    name: 'Mohammed Imran',
    phone: '+91 98765 44444',
    whatsappNumber: '+91 98765 44444',
    role: 'helper',
    employmentType: 'freelance',
    status: 'active',
    skills: ['Prep Work', 'Cleaning', 'Loading'],
    experienceYears: 3,
    hourlyRate: 100,
    dailyRate: 800,
    rating: 4.2,
    totalEventsWorked: 67,
    reliabilityScore: 88,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    createdAt: '2025-01-15',
    updatedAt: '2026-02-01',
  },
  {
    id: 'staff-5',
    name: 'Venkat Rao',
    phone: '+91 98765 55555',
    whatsappNumber: '+91 98765 55555',
    role: 'driver',
    employmentType: 'full_time',
    status: 'active',
    skills: ['Driving', 'Vehicle Maintenance', 'Route Planning'],
    experienceYears: 10,
    hourlyRate: 200,
    dailyRate: 1500,
    rating: 4.6,
    totalEventsWorked: 120,
    reliabilityScore: 97,
    notes: 'Has own tempo. Reliable for equipment transport.',
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    createdAt: '2024-06-01',
    updatedAt: '2026-02-01',
  },
  {
    id: 'staff-6',
    name: 'Lakshmi Devi',
    phone: '+91 98765 66666',
    whatsappNumber: '+91 98765 66666',
    role: 'supervisor',
    employmentType: 'full_time',
    status: 'active',
    skills: ['Team Management', 'Quality Control', 'Client Handling'],
    experienceYears: 12,
    hourlyRate: 400,
    dailyRate: 3000,
    rating: 4.9,
    totalEventsWorked: 134,
    reliabilityScore: 99,
    notes: 'Best supervisor. Handles VIP events.',
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    createdAt: '2024-01-01',
    updatedAt: '2026-02-01',
  },
  {
    id: 'staff-7',
    name: 'Ramesh Babu',
    phone: '+91 98765 77777',
    whatsappNumber: '+91 98765 77777',
    role: 'waiter',
    employmentType: 'freelance',
    status: 'active',
    skills: ['Serving', 'Buffet Setup', 'Bar Service'],
    experienceYears: 5,
    hourlyRate: 180,
    rating: 4.4,
    totalEventsWorked: 78,
    reliabilityScore: 85,
    availableDays: ['thursday', 'friday', 'saturday', 'sunday'],
    createdAt: '2025-03-01',
    updatedAt: '2026-02-01',
  },
  {
    id: 'staff-8',
    name: 'Sana Fatima',
    phone: '+91 98765 88888',
    whatsappNumber: '+91 98765 88888',
    role: 'cleaner',
    employmentType: 'part_time',
    status: 'active',
    skills: ['Cleaning', 'Dish Washing', 'Kitchen Organization'],
    experienceYears: 4,
    hourlyRate: 80,
    dailyRate: 600,
    rating: 4.3,
    totalEventsWorked: 92,
    reliabilityScore: 90,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    createdAt: '2025-02-01',
    updatedAt: '2026-02-01',
  },
];

// Sample Assignments
const initialAssignments: EventStaffAssignment[] = [
  {
    id: 'assign-1',
    eventId: '1',
    staffId: 'staff-1',
    role: 'head_chef',
    shiftStart: '2026-02-05T14:00',
    shiftEnd: '2026-02-05T23:00',
    payRate: 3500,
    payType: 'daily',
    estimatedPay: 3500,
    status: 'confirmed',
    confirmedAt: '2026-01-20',
    paymentStatus: 'pending',
    whatsappAlertSent: true,
    whatsappAlertSentAt: '2026-01-18',
    reminderSent: true,
    reminderSentAt: '2026-02-04',
    createdAt: '2026-01-18',
    updatedAt: '2026-02-04',
  },
  {
    id: 'assign-2',
    eventId: '1',
    staffId: 'staff-2',
    role: 'chef',
    shiftStart: '2026-02-05T14:00',
    shiftEnd: '2026-02-05T23:00',
    payRate: 2500,
    payType: 'daily',
    estimatedPay: 2500,
    status: 'confirmed',
    confirmedAt: '2026-01-20',
    paymentStatus: 'pending',
    whatsappAlertSent: true,
    whatsappAlertSentAt: '2026-01-18',
    reminderSent: true,
    reminderSentAt: '2026-02-04',
    createdAt: '2026-01-18',
    updatedAt: '2026-02-04',
  },
  {
    id: 'assign-3',
    eventId: '1',
    staffId: 'staff-3',
    role: 'waiter',
    shiftStart: '2026-02-05T17:00',
    shiftEnd: '2026-02-05T23:00',
    payRate: 150,
    payType: 'hourly',
    estimatedPay: 900,
    status: 'confirmed',
    confirmedAt: '2026-01-21',
    paymentStatus: 'pending',
    whatsappAlertSent: true,
    whatsappAlertSentAt: '2026-01-18',
    reminderSent: true,
    reminderSentAt: '2026-02-04',
    createdAt: '2026-01-18',
    updatedAt: '2026-02-04',
  },
  {
    id: 'assign-4',
    eventId: '1',
    staffId: 'staff-6',
    role: 'supervisor',
    shiftStart: '2026-02-05T15:00',
    shiftEnd: '2026-02-05T23:30',
    payRate: 3000,
    payType: 'daily',
    estimatedPay: 3000,
    status: 'confirmed',
    confirmedAt: '2026-01-19',
    paymentStatus: 'pending',
    whatsappAlertSent: true,
    whatsappAlertSentAt: '2026-01-18',
    reminderSent: true,
    reminderSentAt: '2026-02-04',
    createdAt: '2026-01-18',
    updatedAt: '2026-02-04',
  },
  {
    id: 'assign-5',
    eventId: '1',
    staffId: 'staff-5',
    role: 'driver',
    shiftStart: '2026-02-05T12:00',
    shiftEnd: '2026-02-05T16:00',
    payRate: 200,
    payType: 'hourly',
    estimatedPay: 800,
    status: 'confirmed',
    confirmedAt: '2026-01-20',
    paymentStatus: 'pending',
    whatsappAlertSent: true,
    whatsappAlertSentAt: '2026-01-18',
    reminderSent: false,
    createdAt: '2026-01-18',
    updatedAt: '2026-01-20',
  },
];

// Initialize storage with sample data
export const initializeStaffStorage = (): void => {
  if (!isBrowser) return;

  const isInitialized = localStorage.getItem(STORAGE_KEYS.initialized);
  if (!isInitialized) {
    localStorage.setItem(STORAGE_KEYS.staff, JSON.stringify(initialStaff));
    localStorage.setItem(STORAGE_KEYS.assignments, JSON.stringify(initialAssignments));
    localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.initialized, 'true');
  }
};

// =====================================================
// STAFF STORAGE
// =====================================================

export const loadStaff = (): Staff[] => {
  if (!isBrowser) return initialStaff;
  initializeStaffStorage();
  const data = localStorage.getItem(STORAGE_KEYS.staff);
  return data ? JSON.parse(data) : initialStaff;
};

export const saveStaff = (staff: Staff[]): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.staff, JSON.stringify(staff));
};

export const addStaff = (staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt' | 'totalEventsWorked' | 'reliabilityScore'>): Staff => {
  const staffList = loadStaff();
  const now = new Date().toISOString().split('T')[0];
  const newStaff: Staff = {
    ...staff,
    id: `staff-${Date.now()}`,
    totalEventsWorked: 0,
    reliabilityScore: 100,
    createdAt: now,
    updatedAt: now,
  };
  staffList.push(newStaff);
  saveStaff(staffList);
  return newStaff;
};

export const updateStaff = (id: string, updates: Partial<Staff>): Staff | null => {
  const staffList = loadStaff();
  const index = staffList.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString().split('T')[0];
  staffList[index] = { ...staffList[index], ...updates, updatedAt: now };
  saveStaff(staffList);
  return staffList[index];
};

export const deleteStaff = (id: string): boolean => {
  const staffList = loadStaff();
  const filtered = staffList.filter((s) => s.id !== id);
  if (filtered.length === staffList.length) return false;
  saveStaff(filtered);
  return true;
};

export const getStaffById = (id: string): Staff | undefined => {
  const staffList = loadStaff();
  return staffList.find((s) => s.id === id);
};

// =====================================================
// ASSIGNMENTS STORAGE
// =====================================================

export const loadAssignments = (): EventStaffAssignment[] => {
  if (!isBrowser) return initialAssignments;
  initializeStaffStorage();
  const data = localStorage.getItem(STORAGE_KEYS.assignments);
  return data ? JSON.parse(data) : initialAssignments;
};

export const saveAssignments = (assignments: EventStaffAssignment[]): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.assignments, JSON.stringify(assignments));
};

export const addAssignment = (assignment: Omit<EventStaffAssignment, 'id' | 'createdAt' | 'updatedAt'>): EventStaffAssignment => {
  const assignments = loadAssignments();
  const now = new Date().toISOString().split('T')[0];
  const newAssignment: EventStaffAssignment = {
    ...assignment,
    id: `assign-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  assignments.push(newAssignment);
  saveAssignments(assignments);
  return newAssignment;
};

export const updateAssignment = (id: string, updates: Partial<EventStaffAssignment>): EventStaffAssignment | null => {
  const assignments = loadAssignments();
  const index = assignments.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString().split('T')[0];
  assignments[index] = { ...assignments[index], ...updates, updatedAt: now };
  saveAssignments(assignments);
  return assignments[index];
};

export const deleteAssignment = (id: string): boolean => {
  const assignments = loadAssignments();
  const filtered = assignments.filter((a) => a.id !== id);
  if (filtered.length === assignments.length) return false;
  saveAssignments(filtered);
  return true;
};

export const getAssignmentsByEvent = (eventId: string): EventStaffAssignment[] => {
  const assignments = loadAssignments();
  return assignments.filter((a) => a.eventId === eventId);
};

export const getAssignmentsByStaff = (staffId: string): EventStaffAssignment[] => {
  const assignments = loadAssignments();
  return assignments.filter((a) => a.staffId === staffId);
};

// =====================================================
// PAYMENTS STORAGE
// =====================================================

export const loadStaffPayments = (): StaffPayment[] => {
  if (!isBrowser) return [];
  initializeStaffStorage();
  const data = localStorage.getItem(STORAGE_KEYS.payments);
  return data ? JSON.parse(data) : [];
};

export const saveStaffPayments = (payments: StaffPayment[]): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments));
};

export const addStaffPayment = (payment: Omit<StaffPayment, 'id' | 'createdAt'>): StaffPayment => {
  const payments = loadStaffPayments();
  const now = new Date().toISOString().split('T')[0];
  const newPayment: StaffPayment = {
    ...payment,
    id: `pay-staff-${Date.now()}`,
    createdAt: now,
  };
  payments.push(newPayment);
  saveStaffPayments(payments);

  // Update assignment payment status if linked
  if (payment.assignmentId) {
    updateAssignment(payment.assignmentId, {
      paymentStatus: 'paid',
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
    });
  }

  return newPayment;
};

export const saveEventAssignments = (newAssignments: EventStaffAssignment[]): void => {
  const all = loadAssignments();
  const others = all.filter(a => !newAssignments.some(na => na.id === a.id));
  // Wait, if we are adding new assignments, we just push them?
  // autoAssignStaff returns NEW assignments with new IDs.
  // But if we want to overwrite/update existing?
  // Let's assume input is a list of assignments to UPSERT.

  // A simpler approach for auto-assign: just add valid new assignments.
  const assignmentsToAdd = newAssignments.filter(na => !all.some(a => a.id === na.id));

  const merged = [...all, ...assignmentsToAdd];
  saveAssignments(merged);
};

export const processPayrollForEvent = (eventId: string, eventName: string): number => {
  const allAssignments = loadAssignments();
  let processedCount = 0;

  const updatedAssignments = allAssignments.map(a => {
    if (a.eventId === eventId && (a.status === 'confirmed' || a.status === 'completed') && a.paymentStatus === 'pending') {
      // Create Expense
      addExpense({
        category: 'labor',
        description: `Salary: ${a.role} for ${eventName}`,
        amount: a.estimatedPay,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash', // Default
        vendor: 'Staff Payroll',
        isRecurring: false,
        tags: ['payroll', eventId, a.staffId],
        eventId: eventId
      });

      processedCount++;
      return { ...a, paymentStatus: 'paid' as const, paymentDate: new Date().toISOString() };
    }
    return a;
  });

  if (processedCount > 0) {
    saveAssignments(updatedAssignments);
  }

  return processedCount;
};

// =====================================================
// WHATSAPP HELPERS
// =====================================================

export const generateWhatsAppMessage = (
  staff: Staff,
  event: { name: string; date: string; time: string; location: string; address: string },
  assignment: EventStaffAssignment
): string => {
  const formattedDate = new Date(event.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `🍽️ *CaterPro Event Assignment*

Hi ${staff.name}! 👋

You have been assigned for an upcoming event:

📅 *Event:* ${event.name}
🗓️ *Date:* ${formattedDate}
⏰ *Your Shift:* ${assignment.shiftStart.split('T')[1]} - ${assignment.shiftEnd.split('T')[1]}
📍 *Location:* ${event.location}
🏠 *Address:* ${event.address}

💼 *Your Role:* ${getRoleLabel(assignment.role)}
💰 *Pay:* ₹${assignment.estimatedPay}

Please confirm your availability by replying:
✅ YES - I will be there
❌ NO - I cannot attend

Thank you! 🙏`;
};

export const generateReminderMessage = (
  staff: Staff,
  event: { name: string; date: string; location: string; address: string },
  assignment: EventStaffAssignment
): string => {
  return `⏰ *Event Reminder - Tomorrow!*

Hi ${staff.name}!

Just a reminder about your assignment tomorrow:

📅 *Event:* ${event.name}
⏰ *Your Shift:* ${assignment.shiftStart.split('T')[1]} - ${assignment.shiftEnd.split('T')[1]}
📍 *Location:* ${event.location}
🏠 *Address:* ${event.address}

Please arrive 15 minutes early.

See you there! 👍`;
};

export const getWhatsAppLink = (phone: string, message: string): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const getRoleLabel = (role: StaffRole): string => {
  const labels: Record<StaffRole, string> = {
    head_chef: 'Head Chef',
    chef: 'Chef',
    helper: 'Kitchen Helper',
    waiter: 'Waiter/Server',
    bartender: 'Bartender',
    supervisor: 'Supervisor',
    driver: 'Driver',
    cleaner: 'Cleaner',
  };
  return labels[role] || role;
};

export const getEmploymentTypeLabel = (type: EmploymentType): string => {
  const labels: Record<EmploymentType, string> = {
    full_time: 'Full Time',
    part_time: 'Part Time',
    freelance: 'Freelance',
  };
  return labels[type] || type;
};

export const getRoleColor = (role: StaffRole): string => {
  const colors: Record<StaffRole, string> = {
    head_chef: 'amber',
    chef: 'orange',
    helper: 'blue',
    waiter: 'purple',
    bartender: 'pink',
    supervisor: 'emerald',
    driver: 'cyan',
    cleaner: 'slate',
  };
  return colors[role] || 'zinc';
};

export const calculateStaffStats = () => {
  const staff = loadStaff();
  const assignments = loadAssignments();

  const activeStaff = staff.filter(s => s.status === 'active');
  const pendingPayments = assignments.filter(a =>
    a.status === 'completed' && a.paymentStatus === 'pending'
  );

  return {
    totalStaff: staff.length,
    activeStaff: activeStaff.length,
    fullTimeStaff: staff.filter(s => s.employmentType === 'full_time').length,
    partTimeStaff: staff.filter(s => s.employmentType === 'part_time').length,
    freelanceStaff: staff.filter(s => s.employmentType === 'freelance').length,
    averageRating: activeStaff.length > 0
      ? activeStaff.reduce((sum, s) => sum + s.rating, 0) / activeStaff.length
      : 0,
    pendingPayments: pendingPayments.length,
    pendingPaymentAmount: pendingPayments.reduce((sum, a) => sum + (a.actualPay || a.estimatedPay), 0),
    upcomingAssignments: assignments.filter(a =>
      a.status === 'confirmed' || a.status === 'pending'
    ).length,
    staffByRole: staff.reduce((acc, s) => {
      acc[s.role] = (acc[s.role] || 0) + 1;
      return acc;
    }, {} as Record<StaffRole, number>),
  };
};
