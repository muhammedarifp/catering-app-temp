'use client';

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
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import StatsCard from '@/components/StatsCard';
import UpcomingEvents from '@/components/UpcomingEvents';
import InventorySection from '@/components/InventorySection';
import {
  dashboardStats,
  getUpcomingEvents,
  getLowStockItems,
  inventory,
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
} from '@/lib/data';

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

  // Calculate some insights
  const pendingPayments = upcomingEvents.filter(e => e.paidAmount < e.amount);
  const totalPendingAmount = pendingPayments.reduce((sum, e) => sum + (e.amount - e.paidAmount), 0);

  return (
    <PageLayout currentPath="/">
      {/* Softer background color to reduce eye strain */}
      <div className="min-h-screen bg-slate-50">

        {/* Hero Section - Slate theme instead of harsh black */}
        <div className="bg-slate-900 pt-8 pb-32 px-4 lg:px-8 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">Owner Dashboard</span>
                  <span className="text-slate-400 text-xs">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  {greeting}, Arif
                </h1>
                <p className="text-slate-400 mt-2 max-w-xl text-lg">
                  You have <span className="text-white font-semibold">{upcomingEvents.length} events</span> scheduled this week.
                  {lowStockItems.length > 0 && <span className="text-amber-400"> {lowStockItems.length} items need attention.</span>}
                </p>
              </div>
              <div>
                <a
                  href="/events/create"
                  className="flex items-center gap-2 bg-white text-slate-900 px-5 py-3 rounded-full text-sm font-bold hover:bg-slate-100 transition-colours shadow-xl shadow-slate-900/20"
                >
                  <span className="bg-slate-900 text-white p-1 rounded-full"><Sparkles className="w-3 h-3" /></span>
                  Create New Event
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 -mt-24 space-y-8 pb-12">

          {/* Stats Grid - Using updated slate styling */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6 mb-8">
            <StatsCard
              title="Total Events"
              value={dashboardStats.totalEvents.toString()}
              subtitle="All time"
              icon={CalendarDays}
              trend={{ value: '12%', positive: true }}
            />
            <StatsCard
              title="Completed"
              value={dashboardStats.completedEvents.toString()}
              subtitle="Delivered"
              icon={CalendarCheck}
            />
            <StatsCard
              title="Pending"
              value={dashboardStats.pendingEvents.toString()}
              subtitle="Upcoming"
              icon={CalendarClock}
              variant="highlight"
            />
            <StatsCard
              title="Revenue"
              value={formatCurrencyCompact(dashboardStats.totalRevenue)}
              subtitle="All time"
              icon={TrendingUp}
              trend={{ value: '8%', positive: true }}
            />
            <StatsCard
              title="To Collect"
              value={formatCurrencyCompact(totalPendingAmount)}
              subtitle="Pending"
              icon={IndianRupee}
              variant="warning"
            />
            <StatsCard
              title="Low Stock"
              value={lowStockItems.length.toString()}
              subtitle="Items"
              icon={AlertCircle}
              variant={lowStockItems.length > 0 ? 'warning' : 'default'}
            />
          </div>

          {/* Masonry Layout - Robust Responsiveness */}
          {/* min-w-0 prevents flex children from causing overflow issues in Chrome */}
          <div className="grid lg:grid-cols-3 gap-8 items-start">

            {/* Left Column: Events (2/3 width on large screens) */}
            {/* Using lg:col-span-2 ensures it takes up space correctly on laptop screens, not just XL */}
            <div className="lg:col-span-2 space-y-8 min-w-0">

              {/* Next Event Hero */}
              {nextEvent && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-blue-600 font-semibold mb-2">
                        <Clock className="w-4 h-4" /> Next Up
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2 truncate">{nextEvent.name}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-6">
                        <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4 text-slate-400" /> {formatDate(nextEvent.date)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400" /> {nextEvent.time}</span>
                        <span className="flex items-center gap-1"><IndianRupee className="w-4 h-4 text-slate-400" /> {formatCurrency(nextEvent.amount)}</span>
                      </div>
                      <a href={`/events/${nextEvent.id}`} className="inline-flex items-center text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                        View Details <ArrowRight className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 min-w-[200px] w-full md:w-auto">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Service Details</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Guests</span>
                          <span className="font-medium text-slate-900">{nextEvent.guests}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Type</span>
                          <span className="font-medium text-slate-900 capitalize">{nextEvent.eventType}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2">
                          <span className="text-slate-500">Status</span>
                          <span className="font-medium text-emerald-600">{nextEvent.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-slate-400" /> Upcoming Schedule
                  </h3>
                  <a href="/events" className="text-sm font-medium text-slate-500 hover:text-slate-900">View All</a>
                </div>
                <UpcomingEvents events={upcomingEvents.slice(0, 5)} />
              </div>

            </div>

            {/* Right Column: Inventory & Tools (1/3 width) */}
            {/* min-w-0 limits the flex item from overflowing its track */}
            <div className="space-y-8 min-w-0">

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <a href="/tools/estimator" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-100">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-slate-900 text-sm">Cost Estimator</p>
                  <p className="text-xs text-slate-500 mt-1">Calculate dish pricing</p>
                </a>
                <a href="/inventory/create" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-emerald-100">
                    <Package className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-slate-900 text-sm">Add Stock</p>
                  <p className="text-xs text-slate-500 mt-1">Update inventory</p>
                </a>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-slate-400" /> Stock Attention
                  </h3>
                  <a href="/inventory" className="text-sm font-medium text-slate-500 hover:text-slate-900">Full Inventory</a>
                </div>
                {/* This overflow-x-auto container ensures the table inside InventorySection scrolls horizontally on small screens instead of breaking layout */}
                <div className="overflow-x-auto">
                  <InventorySection items={inventory} lowStockItems={lowStockItems} />
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </PageLayout>
  );
}
