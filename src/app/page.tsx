'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Clock,
  Sparkles,
  ChefHat,
  Package,
  TrendingDown,
  Activity,
  MoreHorizontal,
  FileText
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import UpcomingEvents from '@/components/UpcomingEvents';
import {
  dashboardStats,
  getUpcomingEvents,
  getLowStockItems,
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
  inventory
} from '@/lib/data';
import { loadExpenses, loadIncome, loadInvoices } from '@/lib/accountingStorage';
import { calculateTotalExpenses, calculateTotalIncome } from '@/lib/data';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const upcomingEvents = getUpcomingEvents();
  const lowStockItems = getLowStockItems();
  const nextEvent = upcomingEvents[0];
  const greeting = getGreeting();
  // View State
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [financials, setFinancials] = useState({
    revenue: 0,
    expenses: 0,
    netProfit: 0,
    pendingCollection: 0,
    profitMargin: 0,
  });

  // Calculate some insights
  const pendingPayments = upcomingEvents.filter(e => e.paidAmount < e.amount);

  useEffect(() => {
    // Load financial data
    const expenses = loadExpenses();
    const income = loadIncome();
    const invoices = loadInvoices();

    const totalExpenses = calculateTotalExpenses(expenses);
    const otherIncome = calculateTotalIncome(income);
    const invoiceIncome = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
    // Also include event payments that might not be in invoices yet (from legacy event data)
    // For MVP transparency, let's rely on Invoices + Other Income for Revenue
    // But we also have `dashboardStats.totalRevenue` hardcoded. Let's override it with real data if available, 
    // or mix it.
    // To keep it simple and creating a "Simulation" feel, let's sum up paid amounts from Events directly if no invoices
    const eventRevenue = upcomingEvents.reduce((sum, e) => sum + e.paidAmount, 0) +
      dashboardStats.totalRevenue; // Keeping the base mock data for "historical" context

    const totalRevenue = eventRevenue;
    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Pending Collection
    const pending = invoices.reduce((sum, i) => sum + i.balanceAmount, 0) +
      upcomingEvents.reduce((sum, e) => sum + (e.amount - e.paidAmount), 0);

    setFinancials({
      revenue: totalRevenue,
      expenses: totalExpenses,
      netProfit: netProfit,
      pendingCollection: pending,
      profitMargin: margin,
    });
  }, []);

  return (
    <PageLayout currentPath="/">
      {/* Modern Executive Background - Subtle Slate */}
      <div className="min-h-screen bg-slate-50/50 pb-12">

        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-8">

          {/* Header: Daily Briefing - Clean & Typography Focused */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Daily Briefing</p>
                <div className="bg-slate-100 rounded-lg p-1 flex items-center">
                  <button
                    onClick={() => setViewMode('daily')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${viewMode === 'daily' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setViewMode('weekly')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${viewMode === 'weekly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Week
                  </button>
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                {greeting}, Arif.
              </h1>
              <div className="mt-3 flex items-center gap-2 text-slate-600">
                <div className={`w-2 h-2 rounded-full ${upcomingEvents.length > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                <p>
                  You have <span className="font-semibold text-slate-900">{upcomingEvents.length} events</span> on the radar this {viewMode === 'daily' ? 'today' : 'week'}.
                  {lowStockItems.length > 0 && <span className="text-amber-600"> {lowStockItems.length} inventory alerts.</span>}
                </p>
              </div>
            </div>

            {/* Quick Action Dock */}
            <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
              <a href="/events/create" className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-slate-900/10">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>New Event</span>
              </a>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <a href="/accounting/expenses/create" className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Add Expense">
                <TrendingDown className="w-5 h-5" />
              </a>
              <a href="/inventory" className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors" title="Inventory">
                <Package className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Bento Grid Layout - The Core Executive View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-auto gap-6">

            {/* 1. Main Focus Card (Large, 2x2 on Desktop) */}
            <div className="md:col-span-2 lg:col-span-2 row-span-2 bg-white rounded-3xl p-1 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col group overflow-hidden">
              {nextEvent ? (
                <div className="flex-1 flex flex-col relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-[20px] p-6 lg:p-8 text-white overflow-hidden">
                  {/* Abstract Decor */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2" />

                  <div className="relative z-10 flex justify-between items-start mb-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-indigo-100">
                      <Clock className="w-3.5 h-3.5" /> Next Up
                    </div>
                    <a href={`/events/${nextEvent.id}`} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <ArrowRight className="w-5 h-5 text-slate-300" />
                    </a>
                  </div>

                  <div className="relative z-10 mt-6 lg:mt-8">
                    <h3 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">{nextEvent.name}</h3>
                    <div className="grid grid-cols-2 gap-4 lg:gap-8">
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Schedule</p>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-indigo-400" />
                          <span className="font-medium text-lg">{formatDate(nextEvent.date)}</span>
                        </div>
                        <p className="text-sm text-slate-400 pl-6">{nextEvent.time}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Service</p>
                        <div className="flex items-center gap-2">
                          <ChefHat className="w-4 h-4 text-emerald-400" />
                          <span className="font-medium text-lg">{nextEvent.guests} Guests</span>
                        </div>
                        <p className="text-sm text-slate-400 pl-6 capitalize">{nextEvent.eventType}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-[20px]">
                  <CalendarCheck className="w-12 h-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900">No events scheduled</h3>
                  <p className="text-slate-500 max-w-xs mx-auto mt-2">You're all caught up! Use the quick action dock to schedule a new event.</p>
                </div>
              )}
            </div>

            {/* 2. Financial Pulse (Medium) */}
            <div className="glass-card p-6 flex flex-col justify-between group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${financials.netProfit >= 0 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
                  Net Profit
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Profit Margin: {financials.profitMargin.toFixed(1)}%</p>
                <p className={`text-3xl font-black tracking-tight ${financials.netProfit >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                  {formatCurrencyCompact(financials.netProfit)}
                </p>

                {/* Visual Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>Revenue</span>
                    <span>{formatCurrencyCompact(financials.revenue)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Math.max(0, financials.profitMargin))}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Pending Collections (Medium) */}
            <div className="glass-card p-6 flex flex-col justify-between group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">Action Needed</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">To Collect</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrencyCompact(financials.pendingCollection)}</p>

                {/* Visual Progress Bar - Inverse for debt/collection */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>Outstanding</span>
                    <span>{pendingPayments.length} Events</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-1/4 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Stats Row - Horizontal Scroll on Mobile, Grid on Desktop */}
            <div className="md:col-span-2 lg:col-span-2 bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" /> Performance
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-500 text-xs font-medium mb-1">Events</p>
                  <p className="text-2xl font-bold text-slate-900">{dashboardStats.totalEvents}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-500 text-xs font-medium mb-1">Expenses</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrencyCompact(financials.expenses)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-500 text-xs font-medium mb-1">Upcoming</p>
                  <p className="text-2xl font-bold text-slate-900">{dashboardStats.pendingEvents}</p>
                </div>
              </div>
            </div>

            {/* 5. Inventory Watch (Vertical List) */}
            <div className="md:col-span-2 lg:col-span-2 row-span-2 bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" /> Stock Attention
                </h3>
                <a href="/inventory" className="text-sm font-medium text-slate-500 hover:text-slate-900">View All</a>
              </div>
              <div className="flex-1 overflow-hidden min-h-[200px]">
                {lowStockItems.length > 0 ? (
                  <div className="space-y-3">
                    {lowStockItems.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                            <p className="text-xs text-amber-600 font-medium">Only {item.quantity} {item.unit} left</p>
                          </div>
                        </div>
                        <a href={`/inventory/${item.id}/edit`} className="ml-auto p-2 text-slate-400 hover:text-slate-900">
                          <MoreHorizontal className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Package className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">Stock looks healthy!</p>
                  </div>
                )}
              </div>
            </div>

            {/* 6. Upcoming and Activity */}
            <div className="md:col-span-2 lg:col-span-2 space-y-6">

              {/* Upcoming Events */}
              <div className="bg-white rounded-3xl p-0 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-indigo-500" /> Upcoming
                  </h3>
                  <a href="/events" className="text-sm font-medium text-slate-500 hover:text-slate-900">Calendar</a>
                </div>
                <div className="bg-slate-50/50">
                  <UpcomingEvents events={upcomingEvents.slice(0, 3)} />
                </div>
              </div>

              {/* RECENT ACTIVITY LOG */}
              <div className="bg-white rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-slate-400" /> Recent Activity
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">Automated Feed</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {(() => {
                    const activities = [
                      ...loadExpenses().map(e => ({
                        id: e.id,
                        type: 'expense',
                        title: `Expense: ${e.description}`,
                        date: e.date,
                        amount: -e.amount,
                        icon: TrendingDown,
                        color: 'text-red-600',
                        bg: 'bg-red-50'
                      })),
                      ...loadInvoices().map(i => ({
                        id: i.id,
                        type: 'invoice',
                        title: `Invoice #${i.invoiceNumber} Created`,
                        date: i.createdAt,
                        amount: i.totalAmount,
                        icon: FileText,
                        color: 'text-indigo-600',
                        bg: 'bg-indigo-50'
                      })),
                      ...getUpcomingEvents().map(e => ({
                        id: e.id,
                        type: 'event',
                        title: `Event: ${e.name}`,
                        date: e.createdAt,
                        amount: e.amount,
                        icon: CalendarCheck,
                        color: 'text-emerald-600',
                        bg: 'bg-emerald-50'
                      })),
                      ...inventory.filter(i => i.lastUpdated).map(i => ({
                        id: i.id,
                        type: 'inventory',
                        title: `Stock Update: ${i.name}`,
                        date: i.lastUpdated || '',
                        amount: 0,
                        icon: Package,
                        color: 'text-amber-600',
                        bg: 'bg-amber-50'
                      }))
                    ]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5);

                    if (activities.length === 0) {
                      return (
                        <div className="p-8 text-center text-slate-400 text-sm">
                          No recent activity found.
                        </div>
                      );
                    }

                    return activities.map((activity) => (
                      <div key={`${activity.type}-${activity.id}`} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className={`h-10 w-10 rounded-xl ${activity.bg} ${activity.color} flex items-center justify-center shrink-0`}>
                          <activity.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{activity.title}</p>
                          <p className="text-xs text-slate-500">{formatDate(activity.date)}</p>
                        </div>
                        {activity.amount !== 0 && (
                          <div className={`text-sm font-semibold ${activity.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {activity.amount > 0 ? '+' : ''}{formatCurrency(activity.amount)}
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </PageLayout>
  );
}
