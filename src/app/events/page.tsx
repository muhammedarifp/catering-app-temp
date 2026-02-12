'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  CalendarDays,
  MapPin,
  Users,
  Clock,
  ChevronRight,
  ChefHat,
  Store,
  MoreHorizontal
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { events, formatCurrency, formatDate, eventTypeLabels } from '@/lib/data';
import { Event, EventStatus, EventType } from '@/lib/types';
import Link from 'next/link';

const statusStyles: Record<EventStatus, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10',
  pending: 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10',
  completed: 'bg-slate-50 text-slate-700 border-slate-100 ring-slate-500/10',
  cancelled: 'bg-red-50 text-red-700 border-red-100 ring-red-500/10',
};

const eventTypeStyles: Record<EventType, string> = {
  wedding: 'text-pink-600 bg-pink-50 border-pink-100',
  corporate: 'text-blue-600 bg-blue-50 border-blue-100',
  birthday: 'text-purple-600 bg-purple-50 border-purple-100',
  engagement: 'text-rose-600 bg-rose-50 border-rose-100',
  anniversary: 'text-orange-600 bg-orange-50 border-orange-100',
  other: 'text-slate-600 bg-slate-50 border-slate-100',
};

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesType = typeFilter === 'all' || event.eventType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <PageLayout currentPath="/events">
      <div className="min-h-screen bg-slate-50/50 pb-20">

        {/* Header Section */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Events Registry</h1>
                <p className="text-sm text-slate-500 mt-1">Manage catering schedules and client orders</p>
              </div>
              <Link
                href="/events/create"
                className="flex items-center justify-center gap-2 bg-slate-900 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>New Event</span>
              </Link>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by client, location, or event name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                />
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as EventStatus | 'all')}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer min-w-[140px]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as EventType | 'all')}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer min-w-[140px]"
                >
                  <option value="all">All Types</option>
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate</option>
                  <option value="birthday">Birthday</option>
                  <option value="engagement">Engagement</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-500">
              Showing {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-4">
            {sortedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}

            {sortedEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-slate-900 font-medium">No events found</h3>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </PageLayout>
  );
}

function EventCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group block bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden"
    >
      <div className="p-5 lg:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">

          {/* Date Block (Left) - Premium look */}
          <div className="flex-shrink-0 flex md:flex-col items-center gap-3 md:gap-1 md:w-20 md:border-r md:border-slate-100 md:pr-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
            <span className="text-2xl md:text-3xl font-bold text-slate-900">{new Date(event.date).getDate()}</span>
            <span className="text-xs font-medium text-slate-400">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${statusStyles[event.status]} ring-1 ring-inset`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${eventTypeStyles[event.eventType]}`}>
                {eventTypeLabels[event.eventType]}
              </span>
              {/* Service Type Icon */}
              {event.serviceType === 'per_plate' ? (
                <span className="ml-auto md:ml-0 inline-flex items-center gap-1 text-xs text-slate-400" title="Per Plate Service">
                  <Store className="h-3 w-3" /> Plate
                </span>
              ) : (
                <span className="ml-auto md:ml-0 inline-flex items-center gap-1 text-xs text-slate-400" title="Buffet Service">
                  <ChefHat className="h-3 w-3" /> Buffet
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
              {event.name}
            </h3>
            <p className="text-sm text-slate-500 mb-3">{event.client}</p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{event.guests} Guests</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="truncate max-w-[200px]">{event.location}</span>
              </div>
            </div>
          </div>

          {/* Financials & Action (Right) */}
          <div className="flex items-center justify-between md:flex-col md:items-end md:gap-1 pt-4 border-t border-slate-100 md:pt-0 md:border-t-0 pl-1">
            <div className="text-right">
              <p className="text-lg font-semibold text-slate-900">{formatCurrency(event.amount)}</p>
              {event.paidAmount < event.amount ? (
                <p className="text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded inline-block mt-1">
                  Due: {formatCurrency(event.amount - event.paidAmount)}
                </p>
              ) : (
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 ml-auto w-fit">
                  <span>Paid</span>
                </div>
              )}
            </div>
            <div className="md:mt-4 p-2 text-slate-300 md:bg-slate-50 rounded-full md:group-hover:bg-blue-50 md:group-hover:text-blue-600 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}
