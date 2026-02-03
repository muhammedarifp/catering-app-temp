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
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { events, formatCurrency, formatDate, eventTypeLabels } from '@/lib/data';
import { Event, EventStatus, EventType } from '@/lib/types';

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
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 lg:text-2xl">Events</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage all your catering events
            </p>
          </div>
          <a
            href="/events/create"
            className="flex items-center justify-center gap-2 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" />
            <span>New Event</span>
          </a>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 border px-4 py-2.5 text-sm font-medium transition-colors ${
                showFilters
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 border border-zinc-200 bg-white p-4">
              <div className="w-full sm:w-auto">
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as EventStatus | 'all')}
                  className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none sm:w-40"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="w-full sm:w-auto">
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  Event Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as EventType | 'all')}
                  className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none sm:w-40"
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
          )}
        </div>

        {/* Results Count */}
        <p className="mb-4 text-sm text-zinc-500">
          Showing {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''}
        </p>

        {/* Events List */}
        <div className="space-y-3">
          {sortedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}

          {sortedEvents.length === 0 && (
            <div className="border border-zinc-200 bg-white p-8 text-center">
              <p className="text-zinc-500">No events found</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

function EventCard({ event }: { event: Event }) {
  return (
    <a
      href={`/events/${event.id}`}
      className="block border border-zinc-200 bg-white transition-colors hover:bg-zinc-50"
    >
      <div className="p-4 lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Left Content */}
          <div className="flex-1 min-w-0">
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
              <span className="inline-flex items-center gap-1 border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-xs text-zinc-500">
                {event.serviceType === 'per_plate' ? (
                  <><Store className="h-3 w-3" /></>
                ) : (
                  <><ChefHat className="h-3 w-3" /></>
                )}
              </span>
            </div>
            <h3 className="mt-2 font-semibold text-zinc-900">{event.name}</h3>
            <p className="mt-1 text-sm text-zinc-600">{event.client}</p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-500 lg:text-sm">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                {formatDate(event.date)}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                {event.time} - {event.endTime}
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                {event.guests} guests
              </div>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-500 lg:text-sm">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 lg:h-4 lg:w-4" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex items-center justify-between sm:flex-col sm:items-end">
            <div className="text-right">
              <p className="text-lg font-semibold text-zinc-900">
                {formatCurrency(event.amount)}
              </p>
              {event.paidAmount < event.amount ? (
                <p className="text-xs text-amber-600 lg:text-sm">
                  Due: {formatCurrency(event.amount - event.paidAmount)}
                </p>
              ) : (
                <p className="text-xs text-emerald-600 lg:text-sm">Fully Paid</p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-400 sm:mt-4" />
          </div>
        </div>
      </div>
    </a>
  );
}
