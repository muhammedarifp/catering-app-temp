'use client';

import { use, useMemo } from 'react';
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
import { EventStatus, EventType } from '@/lib/types';

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

  if (!event) {
    return (
      <PageLayout currentPath="/events">
        <div className="flex min-h-[50vh] items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-zinc-900">Event Not Found</h1>
            <p className="mt-2 text-zinc-500">
              The event you&apos;re looking for doesn&apos;t exist.
            </p>
            <a
              href="/events"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-900 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </a>
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
  const estimatedProfit = event.amount - estimatedCost;
  const profitMargin = event.amount > 0 ? (estimatedProfit / event.amount) * 100 : 0;

  return (
    <PageLayout currentPath="/events">
      <div className="p-4 lg:p-8">
        {/* Back Button */}
        <a
          href="/events"
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </a>

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
              <button className="flex items-center gap-2 bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Confirm</span>
              </button>
            )}
            <button className="flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            {event.status !== 'completed' && (
              <button className="flex items-center gap-2 border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                <XCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Event Details */}
            <div className="border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-4 py-3 lg:px-6 lg:py-4">
                <h2 className="text-base font-semibold text-zinc-900 lg:text-lg">
                  Event Details
                </h2>
              </div>
              <div className="p-4 lg:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-5 w-5 text-zinc-400" />
                    <div>
                      <p className="text-xs text-zinc-500">Date</p>
                      <p className="font-medium text-zinc-900">
                        {formatDate(event.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 text-zinc-400" />
                    <div>
                      <p className="text-xs text-zinc-500">Time</p>
                      <p className="font-medium text-zinc-900">
                        {event.time} - {event.endTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 h-5 w-5 text-zinc-400" />
                    <div>
                      <p className="text-xs text-zinc-500">Guests</p>
                      <p className="font-medium text-zinc-900">{event.guests} people</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-400" />
                    <div>
                      <p className="text-xs text-zinc-500">Venue</p>
                      <p className="font-medium text-zinc-900">{event.location}</p>
                      <p className="text-sm text-zinc-500">{event.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div className="border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-4 py-3 lg:px-6 lg:py-4">
                <h2 className="text-base font-semibold text-zinc-900 lg:text-lg">
                  Client Details
                </h2>
              </div>
              <div className="p-4 lg:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-zinc-500">Name</p>
                    <p className="font-medium text-zinc-900">{event.client}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 text-zinc-400" />
                    <div>
                      <p className="text-xs text-zinc-500">Phone</p>
                      <a
                        href={`tel:${event.clientPhone}`}
                        className="font-medium text-zinc-900 hover:underline"
                      >
                        {event.clientPhone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 text-zinc-400" />
                    <div>
                      <p className="text-xs text-zinc-500">Email</p>
                      <a
                        href={`mailto:${event.clientEmail}`}
                        className="font-medium text-zinc-900 hover:underline"
                      >
                        {event.clientEmail}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items (Per Plate) */}
            {event.serviceType === 'per_plate' && selectedMenuItems.length > 0 && (
              <div className="border border-zinc-200 bg-white">
                <div className="border-b border-zinc-200 px-4 py-3 lg:px-6 lg:py-4">
                  <h2 className="text-base font-semibold text-zinc-900 lg:text-lg">
                    Menu Items ({selectedMenuItems.length})
                  </h2>
                </div>
                <div className="p-4 lg:p-6">
                  <div className="space-y-4">
                    {menuCategories.map((category) => {
                      const items = selectedMenuItems.filter(
                        (m) => m.category === category.key
                      );
                      if (items.length === 0) return null;

                      return (
                        <div key={category.key}>
                          <h3 className="mb-2 text-sm font-medium text-zinc-500">
                            {category.label}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {items.map((item) => (
                              <span
                                key={item.id}
                                className="inline-flex items-center gap-1.5 border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm"
                              >
                                {item.isVeg && (
                                  <Leaf className="h-3.5 w-3.5 text-emerald-600" />
                                )}
                                {item.name}
                                <span className="text-zinc-400">
                                  {formatCurrency(item.pricePerPlate)}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {event.specialRequirements && (
                    <div className="mt-6 border-t border-zinc-200 pt-4">
                      <div className="flex items-start gap-3">
                        <FileText className="mt-0.5 h-5 w-5 text-zinc-400" />
                        <div>
                          <p className="text-xs text-zinc-500">Special Requirements</p>
                          <p className="text-sm text-zinc-700">{event.specialRequirements}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recipes (Self Cooking) */}
            {event.serviceType === 'self_cooking' && selectedRecipes.length > 0 && (
              <div className="border border-zinc-200 bg-white">
                <div className="border-b border-zinc-200 px-4 py-3 lg:px-6 lg:py-4">
                  <h2 className="text-base font-semibold text-zinc-900 lg:text-lg">
                    Recipes ({selectedRecipes.length})
                  </h2>
                </div>
                <div className="p-4 lg:p-6">
                  <div className="space-y-4">
                    {menuCategories.map((category) => {
                      const items = selectedRecipes.filter(
                        (r) => r.category === category.key
                      );
                      if (items.length === 0) return null;

                      return (
                        <div key={category.key}>
                          <h3 className="mb-2 text-sm font-medium text-zinc-500">
                            {category.label}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {items.map((recipe) => (
                              <span
                                key={recipe.id}
                                className="inline-flex items-center gap-1.5 border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm"
                              >
                                {recipe.isVeg && (
                                  <Leaf className="h-3.5 w-3.5 text-emerald-600" />
                                )}
                                {recipe.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {event.specialRequirements && (
                    <div className="mt-6 border-t border-zinc-200 pt-4">
                      <div className="flex items-start gap-3">
                        <FileText className="mt-0.5 h-5 w-5 text-zinc-400" />
                        <div>
                          <p className="text-xs text-zinc-500">Special Requirements</p>
                          <p className="text-sm text-zinc-700">{event.specialRequirements}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Inventory Requirements (Self Cooking Only) */}
            {event.serviceType === 'self_cooking' && ingredientRequirements.length > 0 && (
              <div className="border border-zinc-200 bg-white">
                <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 lg:px-6 lg:py-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-zinc-600" />
                    <h2 className="text-base font-semibold text-zinc-900 lg:text-lg">
                      Inventory Requirements
                    </h2>
                  </div>
                  {shortages.length > 0 && (
                    <span className="flex items-center gap-1 border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                      <AlertTriangle className="h-3 w-3" />
                      {shortages.length} shortage{shortages.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="p-4 lg:p-6">
                  {shortages.length > 0 && (
                    <div className="mb-4 border border-amber-200 bg-amber-50 p-3">
                      <p className="text-sm font-medium text-amber-800">Items to Restock</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {shortages.map((ing) => (
                          <span key={ing.item.id} className="border border-amber-300 bg-white px-2 py-1 text-xs font-medium text-amber-800">
                            {ing.item.name}: +{ing.shortage.toFixed(2)} {ing.item.unit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2 sm:grid-cols-2">
                    {ingredientRequirements.map((ing) => (
                      <div
                        key={ing.item.id}
                        className={`flex items-center justify-between border p-3 ${
                          ing.shortage > 0
                            ? 'border-red-200 bg-red-50'
                            : 'border-zinc-200 bg-zinc-50'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-zinc-900">{ing.item.name}</p>
                          <p className="text-xs text-zinc-500">{ing.item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            ing.shortage > 0 ? 'text-red-600' : 'text-zinc-900'
                          }`}>
                            {ing.required.toFixed(2)} {ing.item.unit}
                          </p>
                          <p className="text-xs text-zinc-500">
                            Available: {ing.available} {ing.item.unit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Revenue & Profit (Self Cooking) */}
            {event.serviceType === 'self_cooking' && (
              <div className="border border-zinc-200 bg-white">
                <div className="border-b border-zinc-200 px-4 py-3 lg:px-6 lg:py-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-zinc-600" />
                    <h2 className="text-base font-semibold text-zinc-900 lg:text-lg">
                      Revenue Estimation
                    </h2>
                  </div>
                </div>
                <div className="p-4 lg:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Charged Amount</span>
                      <span className="text-lg font-semibold text-zinc-900">
                        {formatCurrency(event.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Est. Ingredient Cost</span>
                      <span className="font-medium text-zinc-600">
                        -{formatCurrency(estimatedCost)}
                      </span>
                    </div>
                    <div className="border-t border-zinc-200 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-700">Est. Profit</span>
                        <span className={`text-xl font-bold ${
                          estimatedProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(estimatedProfit)}
                        </span>
                      </div>
                      <p className="mt-1 text-right text-sm text-zinc-500">
                        {profitMargin.toFixed(0)}% margin
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-zinc-400">
                    * Ingredient costs are estimated. Actual costs may vary based on market prices.
                  </p>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-4 py-3 lg:px-6 lg:py-4">
                <h2 className="text-base font-semibold text-zinc-900 lg:text-lg">
                  Payment Summary
                </h2>
              </div>
              <div className="p-4 lg:p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Total Amount</span>
                    <span className="text-lg font-semibold text-zinc-900">
                      {formatCurrency(event.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Paid</span>
                    <span className="font-medium text-emerald-600">
                      {formatCurrency(event.paidAmount)}
                    </span>
                  </div>
                  <div className="border-t border-zinc-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-700">Balance Due</span>
                      <span
                        className={`text-lg font-semibold ${
                          event.amount - event.paidAmount > 0
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {formatCurrency(event.amount - event.paidAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {event.amount - event.paidAmount > 0 && (
                  <button className="mt-4 flex w-full items-center justify-center gap-2 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800">
                    <IndianRupee className="h-4 w-4" />
                    Record Payment
                  </button>
                )}

                {event.amount === event.paidAmount && (
                  <div className="mt-4 flex items-center justify-center gap-2 bg-emerald-50 py-2 text-sm font-medium text-emerald-700">
                    <CheckCircle className="h-4 w-4" />
                    Fully Paid
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-4 py-3 lg:px-6 lg:py-4">
                <h2 className="text-base font-semibold text-zinc-900 lg:text-lg">
                  Quick Actions
                </h2>
              </div>
              <div className="p-4 lg:p-6">
                <div className="space-y-2">
                  <button className="flex w-full items-center gap-3 border border-zinc-200 p-3 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                    <FileText className="h-5 w-5 text-zinc-400" />
                    Generate Invoice
                  </button>
                  <button className="flex w-full items-center gap-3 border border-zinc-200 p-3 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                    <Mail className="h-5 w-5 text-zinc-400" />
                    Send Reminder
                  </button>
                  <button className="flex w-full items-center gap-3 border border-zinc-200 p-3 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                    <Phone className="h-5 w-5 text-zinc-400" />
                    Call Client
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
