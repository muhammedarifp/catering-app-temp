'use client';

import { use, useMemo, useState, useEffect } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Phone,
  Mail,
  IndianRupee,
  FileText,
  Edit,
  CheckCircle,
  XCircle,
  Leaf,
  Package,
  TrendingUp,
  AlertTriangle,
  ChefHat,
  Store,
  UserPlus,
  Trash2,
  Receipt,
  PieChart,
  ArrowDownCircle,
  ArrowUpCircle,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import {
  getEventById,
  formatCurrency,
  formatDate,
  eventTypeLabels,
  menuItems,
  recipes,
  calculateRecipeIngredients,
  calculateEstimatedCost,
  serviceTypeLabels,
} from '@/lib/data';
import { EventStatus, EventType, EventStaffAssignment, StaffRole, Expense } from '@/lib/types';
import AutoAssignStaffModal from '@/components/AutoAssignStaffModal';
import { autoAssignStaff, getStaffByRole } from '@/lib/staffUtils';
import { loadExpenses } from '@/lib/accountingStorage';
import { updateStock, deductStockForEvent } from '@/lib/inventoryStorage';
import { getAssignmentsByEvent, saveEventAssignments, processPayrollForEvent } from '@/lib/staffStorage';
import Link from 'next/link';

const statusStyles: Record<EventStatus, string> = {
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const eventTypeStyles: Record<EventType, string> = {
  wedding: 'bg-pink-100 text-pink-700',
  corporate: 'bg-blue-100 text-blue-700',
  birthday: 'bg-purple-100 text-purple-700',
  engagement: 'bg-rose-100 text-rose-700',
  anniversary: 'bg-orange-100 text-orange-700',
  other: 'bg-zinc-100 text-zinc-700',
};

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const event = getEventById(id);

  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'menu_inventory' | 'financials' | 'staff'>('overview');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignments, setAssignments] = useState<EventStaffAssignment[]>([]);
  const [realExpenses, setRealExpenses] = useState<Expense[]>([]);
  const [stockDeducted, setStockDeducted] = useState(false);

  // Load initial data
  useEffect(() => {
    if (event) {
      setAssignments(getAssignmentsByEvent(event.id));
      const allExpenses = loadExpenses();
      setRealExpenses(allExpenses.filter(e => e.eventId === event.id));
    }
  }, [event]);

  const handleAutoAssign = (requirements: Partial<Record<StaffRole, number>>) => {
    if (!event) return;
    const newAssignments = autoAssignStaff(event.id, requirements);
    saveEventAssignments(newAssignments);
    setAssignments((prev) => [...prev, ...newAssignments]);
  };

  const getStaffName = (staffId: string) => {
    const role = assignments.find((a) => a.staffId === staffId)?.role;
    if (!role) return 'Unknown Staff';
    const staffMember = getStaffByRole(role).find((s) => s.id === staffId);
    return staffMember ? staffMember.name : 'Unknown Staff';
  };

  const ingredientRequirements = useMemo(() => {
    if (event?.serviceType === 'self_cooking' && event.recipes.length > 0) {
      return calculateRecipeIngredients(event.recipes, event.guests);
    }
    return [];
  }, [event]);

  const estimatedCost = useMemo(() => {
    if (event?.serviceType === 'self_cooking') {
      return calculateEstimatedCost(event.recipes, event.guests);
    }
    return 0;
  }, [event]);


  const handleDeductStock = () => {
    if (!event) return;
    if (!confirm('Are you sure you want to deduct inventory for this event? This action cannot be undone easily.')) return;

    // Assume each recipe is prepared for the total guest count
    const dishQuantities = event.recipes.reduce((acc, recipeId) => {
      acc[recipeId] = event.guests;
      return acc;
    }, {} as Record<string, number>);

    deductStockForEvent(event.id, event.name, dishQuantities);
    setStockDeducted(true);
    alert('Stock deducted successfully and usage logged.');
  };

  const handleProcessPayroll = () => {
    if (!event) return;
    if (!confirm('Are you sure you want to process payroll? This will create expenses for all pending staff payments.')) return;

    const count = processPayrollForEvent(event.id, event.name);

    if (count > 0) {
      // Refresh data
      setAssignments(getAssignmentsByEvent(event.id));
      const allExpenses = loadExpenses();
      setRealExpenses(allExpenses.filter(e => e.eventId === event.id));
      alert(`Payroll processed for ${count} staff members.`);
    } else {
      alert('No pending payments to process.');
    }
  };

  if (!event) {
    return (
      <PageLayout currentPath="/events">
        <div className="flex min-h-[50vh] items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-zinc-900">Event Not Found</h1>
            <p className="mt-2 text-zinc-500">
              The event you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link
              href="/events"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-900 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>
          </div>
        </div>

      </PageLayout>
    );
  }

  const selectedMenuItems = menuItems.filter((m) =>
    event.menuItems.includes(m.id)
  );

  const selectedRecipes = recipes.filter((r) =>
    event.recipes.includes(r.id)
  );

  const menuCategories = [
    { key: 'starters', label: 'Starters' },
    { key: 'main_course', label: 'Main Course' },
    { key: 'desserts', label: 'Desserts' },
    { key: 'beverages', label: 'Beverages' },
    { key: 'snacks', label: 'Snacks' },
  ] as const;

  const shortages = ingredientRequirements.filter((ing) => ing.shortage > 0);

  // Financial Calcs
  const totalRealExpenses = realExpenses.reduce((sum, e) => sum + e.amount, 0);
  // If self cooking, use Estimated Cost as a baseline if no real expenses logged yet? 
  // Or purely rely on real expenses for "Actuals"?
  // Let's show both: Estimated vs Actual.

  const actualProfit = event.amount - totalRealExpenses;
  const actualMargin = event.amount > 0 ? (actualProfit / event.amount) * 100 : 0;

  return (
    <PageLayout currentPath="/events">
      <div className="p-4 lg:p-8">
        {/* Back Button */}
        <Link
          href="/events"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2 py-0.5 text-xs font-medium ${eventTypeStyles[event.eventType]}`}
              >
                {eventTypeLabels[event.eventType]}
              </span>
              <span
                className={`border px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[event.status]}`}
              >
                {event.status}
              </span>
              <span className="inline-flex items-center gap-1 border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-600">
                {event.serviceType === 'per_plate' ? (
                  <><Store className="h-3 w-3" /> Per Plate</>
                ) : (
                  <><ChefHat className="h-3 w-3" /> Self Cooking</>
                )}
              </span>
            </div>
            <h1 className="mt-2 text-xl font-semibold text-zinc-900 lg:text-2xl">
              {event.name}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">Created on {formatDate(event.createdAt)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {event.status === 'pending' && (
              <button className="flex items-center gap-2 bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Confirm</span>
              </button>
            )}
            <Link href={`/accounting/invoices/create?eventId=${event.id}`} className="flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 rounded-lg">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Invoice</span>
            </Link>
            <button className="flex items-center gap-2 border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 rounded-lg">
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          </div>
        </div>

        {/* Custom Tab Navigation */}
        <div className="mb-6 border-b border-zinc-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('menu_inventory')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'menu_inventory'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                }`}
            >
              Menu & Inventory
            </button>
            <button
              onClick={() => setActiveTab('financials')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'financials'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                }`}
            >
              Financials
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'staff'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                }`}
            >
              Staff
            </button>
          </nav>
        </div>

        {/* CONTENT SKELETON */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* LEFT COLUMN (2/3) */}
          <div className="space-y-6 lg:col-span-2">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
                    <h2 className="font-semibold text-zinc-900">Event Details</h2>
                  </div>
                  <div className="p-6 grid gap-6 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-1 h-5 w-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-500">Date</p>
                        <p className="text-base text-zinc-900">{formatDate(event.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="mt-1 h-5 w-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-500">Time</p>
                        <p className="text-base text-zinc-900">{event.time} - {event.endTime}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="mt-1 h-5 w-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-500">Guests</p>
                        <p className="text-base text-zinc-900">{event.guests} People</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-1 h-5 w-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-500">Venue</p>
                        <p className="text-base text-zinc-900">{event.location}</p>
                        <p className="text-sm text-zinc-500">{event.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
                    <h2 className="font-semibold text-zinc-900">Client Information</h2>
                  </div>
                  <div className="p-6 grid gap-6 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {event.client.charAt(0)}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-zinc-900">{event.client}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-zinc-600">
                          <Phone className="h-3.5 w-3.5" />
                          <a href={`tel:${event.clientPhone}`} className="hover:underline">{event.clientPhone}</a>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-zinc-600">
                          <Mail className="h-3.5 w-3.5" />
                          <a href={`mailto:${event.clientEmail}`} className="hover:underline">{event.clientEmail}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* MENU & INVENTORY TAB */}
            {activeTab === 'menu_inventory' && (
              <>
                {/* Menu Display */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                    <h2 className="font-semibold text-zinc-900">
                      {event.serviceType === 'per_plate' ? 'Menu Items' : 'Selected Recipes'}
                    </h2>
                    <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2 py-1 rounded-full">
                      {(event.serviceType === 'per_plate' ? selectedMenuItems : selectedRecipes).length} Items
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {menuCategories.map((category) => {
                        const items = event.serviceType === 'per_plate'
                          ? selectedMenuItems.filter(m => m.category === category.key)
                          : selectedRecipes.filter(r => r.category === category.key);

                        if (items.length === 0) return null;

                        return (
                          <div key={category.key}>
                            <h3 className="mb-3 text-sm font-medium text-zinc-500 uppercase tracking-wider">{category.label}</h3>
                            <div className="flex flex-wrap gap-2">
                              {items.map((item) => (
                                <span key={item.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm">
                                  {item.isVeg ? <Leaf className="h-3.5 w-3.5 text-emerald-600" /> : <div className="h-3.5 w-3.5 rounded-full bg-red-600"></div>}
                                  <span className="font-medium text-zinc-700">{item.name}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Inventory Requirements (Self Cooking Only) */}
                {event.serviceType === 'self_cooking' && ingredientRequirements.length > 0 && (
                  <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-indigo-600" />
                        <h2 className="font-semibold text-zinc-900">Inventory Requirements</h2>
                      </div>
                      {shortages.length > 0 && (
                        <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold border border-amber-100">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {shortages.length} Low Stock
                        </span>
                      )}
                    </div>

                    {/* Shortage Alerts */}
                    {shortages.length > 0 && (
                      <div className="bg-amber-50/50 border-b border-amber-100 p-4">
                        <h4 className="text-sm font-semibold text-amber-800 mb-2">Restock Needed</h4>
                        <div className="flex flex-wrap gap-2">
                          {shortages.map(ing => (
                            <span key={ing.item.id} className="text-xs bg-white border border-amber-200 text-amber-900 px-2 py-1 rounded-md shadow-sm">
                              {ing.item.name}: +{ing.shortage} {ing.item.unit}
                            </span>
                          ))}
                        </div>
                        <div className="mt-3">
                          <Link href="/inventory" className="text-xs font-medium text-amber-700 hover:text-amber-900 underline">
                            Go to Inventory Manager &rarr;
                          </Link>
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={handleDeductStock}
                          disabled={stockDeducted}
                          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${stockDeducted ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
                          <Package className="h-4 w-4" />
                          {stockDeducted ? 'Stock Deducted' : 'Deduct from Inventory'}
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {ingredientRequirements.map((ing) => (
                          <div key={ing.item.id} className="flex justify-between items-center p-3 rounded-lg border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                            <div>
                              <p className="font-medium text-zinc-900">{ing.item.name}</p>
                              <p className="text-xs text-zinc-500">Available: {ing.available} {ing.item.unit}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-zinc-900">{ing.required} {ing.item.unit}</p>
                              <p className="text-xs text-zinc-500">Required</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* FINANCIALS TAB */}
            {activeTab === 'financials' && (
              <div className="space-y-6">
                {/* Financial Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                    <p className="text-sm text-zinc-500 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(event.amount)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                    <p className="text-sm text-zinc-500 mb-1">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(totalRealExpenses)}</p>
                    {event.serviceType === 'self_cooking' && (
                      <p className="text-xs text-zinc-400 mt-1">Est. Cost: {formatCurrency(estimatedCost)}</p>
                    )}
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                    <p className="text-sm text-zinc-500 mb-1">Net Profit</p>
                    <div className="flex items-end gap-2">
                      <p className={`text-2xl font-bold ${actualProfit >= 0 ? 'text-zinc-900' : 'text-red-500'}`}>
                        {formatCurrency(actualProfit)}
                      </p>
                      <span className={`text-sm mb-1 font-medium ${actualMargin >= 20 ? 'text-emerald-600' : actualMargin > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                        ({actualMargin.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transactions / Expenses List */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                    <h2 className="font-semibold text-zinc-900">Expense Log</h2>
                    <Link href={`/accounting/expenses/create?eventId=${event.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                      + Add Expense
                    </Link>
                  </div>
                  <div className="p-0">
                    {realExpenses.length > 0 ? (
                      <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-200">
                          <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {realExpenses.map(exp => (
                            <tr key={exp.id} className="hover:bg-zinc-50">
                              <td className="px-6 py-3 text-zinc-600">{formatDate(exp.date)}</td>
                              <td className="px-6 py-3 font-medium text-zinc-900">{exp.description}</td>
                              <td className="px-6 py-3">
                                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 capitalize">
                                  {exp.category.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-right font-medium text-red-600">
                                -{formatCurrency(exp.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-zinc-500">
                        <Receipt className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p>No expenses recorded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STAFF TAB */}
            {activeTab === 'staff' && (
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                  <h2 className="font-semibold text-zinc-900">Staff Assignments</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleProcessPayroll}
                      className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-700"
                    >
                      <IndianRupee className="h-3.5 w-3.5" />
                      Process Payroll
                    </button>
                    <button
                      onClick={() => setIsAssignModalOpen(true)}
                      className="flex items-center gap-2 bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-zinc-800"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Assign Info
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {assignments.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between border border-zinc-200 bg-zinc-50 p-3 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-zinc-900">{getStaffName(assignment.staffId)}</p>
                            <p className="text-xs text-zinc-500 capitalize">{assignment.role.replace('_', ' ')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-zinc-900">{formatCurrency(assignment.estimatedPay)}</p>
                            <p className="text-xs text-zinc-500">Est. Pay</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-zinc-500">
                      <Users className="h-8 w-8 mx-auto mb-3 opacity-20" />
                      <p>No staff assigned to this event.</p>
                      <button onClick={() => setIsAssignModalOpen(true)} className="mt-2 text-indigo-600 font-medium hover:underline">Auto-assign Staff</button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN (Sidebar) */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
                <h3 className="font-semibold text-zinc-900">Payment Status</h3>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Total</span>
                    <span className="text-lg font-bold text-zinc-900">{formatCurrency(event.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Paid</span>
                    <span className="text-lg font-bold text-emerald-600">{formatCurrency(event.paidAmount)}</span>
                  </div>
                  <div className="h-px bg-zinc-100"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-900 font-medium">Balance</span>
                    <span className={`text-xl font-bold ${event.amount - event.paidAmount > 0 ? 'text-amber-600' : 'text-zinc-400'}`}>
                      {formatCurrency(event.amount - event.paidAmount)}
                    </span>
                  </div>

                  {event.amount - event.paidAmount > 0 ? (
                    <div className="space-y-2 mt-2">
                      <button className="w-full py-2 bg-zinc-900 text-white rounded-lg font-medium text-sm hover:bg-zinc-800 transition-colors">
                        Record Payment
                      </button>
                      <Link href={`/accounting/invoices/create?eventId=${event.id}`} className="block w-full py-2 text-center border border-zinc-200 text-zinc-700 rounded-lg font-medium text-sm hover:bg-zinc-50 transition-colors">
                        Create Invoice
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-2 bg-emerald-50 text-emerald-700 py-2 rounded-lg text-center text-sm font-medium border border-emerald-100 flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Paid in Full
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats or Actions */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
              <h3 className="font-semibold text-zinc-900 text-sm uppercase tracking-wider">Quick Actions</h3>
              <button className="w-full flex items-center gap-3 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 p-2 rounded-lg transition-colors text-sm font-medium">
                <Mail className="h-4 w-4" /> Send Email Quote
              </button>
              <button className="w-full flex items-center gap-3 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 p-2 rounded-lg transition-colors text-sm font-medium">
                <Phone className="h-4 w-4" /> Call Client
              </button>
            </div>

          </div>

        </div>

        <AutoAssignStaffModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onAssign={handleAutoAssign}
        />
      </div>
    </PageLayout>
  );
}
