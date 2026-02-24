'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CalendarDays,
  IndianRupee,
  Plus,
  CheckCircle2,
  FileText,
  ListTodo,
  Clock,
  User,
  Users,
  CalendarPlus
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import AddEnquiryModal from '@/components/AddEnquiryModal';
import EnquiriesList from '@/components/EnquiriesList';
import TodoList from '@/components/TodoList';
import { useGetEnquiriesQuery, useGetEventsQuery, useGetDishesQuery } from '@/store/api';
import { useAuth } from '@/contexts/AuthContext';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const greeting = getGreeting();
  const { user } = useAuth();

  // Filter State
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'custom'>('all');
  const [customDateStr, setCustomDateStr] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [appliedCustomDate, setAppliedCustomDate] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const router = useRouter();

  const getDateRangeParams = () => {
    if (dateFilter === 'all') return undefined;

    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    let start = new Date(now);
    start.setHours(0, 0, 0, 0);

    if (dateFilter === 'week') {
      start.setDate(now.getDate() - 7);
    } else if (dateFilter === 'month') {
      start.setDate(now.getDate() - 30);
    } else if (dateFilter === 'custom') {
      const customStart = new Date(appliedCustomDate.start);
      if (!isNaN(customStart.getTime())) customStart.setHours(0, 0, 0, 0);

      const customEnd = new Date(appliedCustomDate.end);
      if (!isNaN(customEnd.getTime())) customEnd.setHours(23, 59, 59, 999);

      return {
        start: !isNaN(customStart.getTime()) ? customStart : start,
        end: !isNaN(customEnd.getTime()) ? customEnd : end
      };
    }
    return { start, end };
  };

  const dateRangeParams = getDateRangeParams();

  // RTK Queries
  const { data: enquiries = [], isLoading: isLoadingEnquiries } = useGetEnquiriesQuery({ dateRange: dateRangeParams });
  const { data: events = [], isLoading: isLoadingEvents } = useGetEventsQuery({ dateRange: dateRangeParams });
  const { data: dishes = [] } = useGetDishesQuery({ activeOnly: true });

  const loading = isLoadingEnquiries || isLoadingEvents;

  // Calculate stats dynamically based on RTK Query results
  const stats = {
    totalOrders: events.length,
    cashIncome: events.reduce((sum: number, e: any) => sum + Number(e.paidAmount), 0),
    totalEnquiries: enquiries.length,
  };

  const upcomingEvents = events
    .filter((e: any) => e.status === 'UPCOMING')
    .sort((a: any, b: any) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 5);

  const handleViewEnquiryDetails = (id: string) => {
    // TODO: Implement enquiry details view
    window.location.href = `/enquiries/${id}`;
  };

  return (
    <PageLayout currentPath="/">
      <div className="min-h-screen bg-slate-50/40 pb-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-5 border-b border-slate-200/80">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Overview</p>
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                {greeting}, Admin
              </h1>
              <div className="mt-1.5 text-sm text-slate-600 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  {upcomingEvents.length > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${upcomingEvents.length > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                </span>
                <p>
                  <span className="font-semibold text-slate-900">{upcomingEvents.length} events</span> and{' '}
                  <span className="font-semibold text-slate-900">{stats.totalEnquiries} enquiries</span> to review.
                </p>
              </div>
            </div>

            {/* Quick Actions & Filters */}
            <div className="flex flex-col xl:flex-row xl:items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
              {/* Filter Tabs & Custom Date Box */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200/60 w-full sm:w-auto overflow-x-auto shrink-0">
                  {(['all', 'week', 'month', 'custom'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setDateFilter(filter)}
                      className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all whitespace-nowrap ${dateFilter === filter
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {dateFilter === 'custom' && (
                  <div className="flex items-center p-1 bg-white border border-slate-200 rounded-lg shadow-sm shrink-0 animate-in fade-in zoom-in-95 duration-200 overflow-x-auto">
                    <input
                      type="date"
                      className="px-2 py-1.5 text-xs font-medium text-slate-700 rounded outline-none cursor-pointer hover:bg-slate-50 focus:bg-slate-50 transition-colors w-[115px]"
                      value={customDateStr.start}
                      onChange={e => setCustomDateStr(prev => ({ ...prev, start: e.target.value }))}
                    />
                    <div className="w-px h-4 bg-slate-200 mx-1 shrink-0"></div>
                    <input
                      type="date"
                      className="px-2 py-1.5 text-xs font-medium text-slate-700 rounded outline-none cursor-pointer hover:bg-slate-50 focus:bg-slate-50 transition-colors w-[115px]"
                      value={customDateStr.end}
                      onChange={e => setCustomDateStr(prev => ({ ...prev, end: e.target.value }))}
                    />
                    <div className="w-px h-4 bg-slate-200 mx-1 shrink-0"></div>
                    <button
                      onClick={() => setAppliedCustomDate({ ...customDateStr })}
                      className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-md transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push('/enquiries/new')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 w-full sm:w-auto shrink-0"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>New Enquiry</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Total Orders */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/80 hover:border-slate-300 transition-colors flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Total Orders</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalOrders}</p>
                </div>
              </div>
              <div className="p-3 bg-blue-50/50 text-blue-600 rounded-xl border border-blue-100/50">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Cash Income */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/80 hover:border-slate-300 transition-colors flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Cash Income</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">₹{stats.cashIncome.toLocaleString()}</p>
                </div>
              </div>
              <div className="p-3 bg-emerald-50/50 text-emerald-600 rounded-xl border border-emerald-100/50">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>

            {/* Active Enquiries */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/80 hover:border-slate-300 transition-colors flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Active Enquiries</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalEnquiries}</p>
                </div>
              </div>
              <div className="p-3 bg-amber-50/50 text-amber-600 rounded-xl border border-amber-100/50">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Main Content Layout: Premium 2/3 + 1/3 SaaS Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 pt-4">

            {/* Left Main Content (2/3 width) */}
            <div className="xl:col-span-2 flex flex-col gap-6 lg:gap-8">
              {/* Task List Component */}
              <TodoList />

              {/* Recent Quotations Component */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <FileText className="w-4 h-4" />
                    </div>
                    Recent Quotations
                  </h3>
                  <a href="/enquiries" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                    View all Enquiries
                  </a>
                </div>
                <div className="flex-1 p-4 sm:p-6 bg-slate-50/30">
                  <EnquiriesList
                    enquiries={enquiries.slice(0, 8)}
                    onViewDetails={handleViewEnquiryDetails}
                  />
                </div>
              </div>
            </div>

            {/* Right Sidebar (1/3 width) */}
            <div className="xl:col-span-1 flex flex-col gap-6 lg:gap-8">
              {/* Upcoming Events Component */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    Upcoming Events
                  </h3>
                  <a href="/events" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                    View Calendar
                  </a>
                </div>
                <div className="flex-1 p-3 sm:p-4 space-y-3 bg-slate-50/30">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event: any, i: number) => {
                      const gcalBaseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
                      const eventName = encodeURIComponent(event.name);
                      const details = encodeURIComponent(`Guests: ${event.guestCount}\nTime: ${event.eventTime}`);
                      const gcalUrl = `${gcalBaseUrl}&text=${eventName}&details=${details}`;

                      return (
                        <div key={event.id} className="group p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/60 hover:border-blue-200 hover:shadow-md transition-all relative flex flex-wrap sm:flex-nowrap gap-4 items-center cursor-default">
                          {/* Calendar Date Block */}
                          <div className={`flex flex-col items-center justify-center w-14 h-16 rounded-xl shrink-0 ${event.eventType === 'LOCAL_ORDER' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5">
                              {new Date(event.eventDate).toLocaleDateString(undefined, { month: 'short' })}
                            </span>
                            <span className="text-2xl font-black leading-none tracking-tighter">
                              {new Date(event.eventDate).toLocaleDateString(undefined, { day: 'numeric' })}
                            </span>
                          </div>

                          {/* Event Details */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">{event.name}</h4>
                              <span className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${event.eventType === 'LOCAL_ORDER' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200/50' : 'bg-amber-100 text-amber-700 border border-amber-200/50'}`}>
                                {event.eventType === 'LOCAL_ORDER' ? 'Local' : 'Main'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-0.5">
                              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 opacity-70" />
                                {event.eventTime}
                              </span>
                              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 opacity-70" />
                                {event.guestCount} guests
                              </span>
                            </div>
                          </div>

                          {/* Add to Cal button */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2 right-4 sm:relative sm:top-auto sm:translate-y-0 sm:right-auto">
                            <a
                              href={gcalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 border border-blue-100/50 hover:bg-blue-600 hover:text-white rounded-lg transition-colors shadow-sm"
                              title="Add to Google Calendar"
                            >
                              <CalendarPlus className="w-4 h-4 shrink-0" />
                            </a>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-4 py-12">
                      <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <CalendarDays className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-base font-medium text-center text-slate-500">No scheduled events ahead.</p>
                      <p className="text-sm text-slate-400 text-center px-4">Your upcoming catering events will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PageLayout>
  );
}
