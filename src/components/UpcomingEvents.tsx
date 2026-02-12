import { useState } from 'react';
import { CalendarDays, MapPin, Users, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Event } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/data';

interface UpcomingEventsProps {
  events: Event[];
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'today'>('all');

  const getStatusStyles = (status: Event['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'pending') return event.paidAmount < event.amount;
    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return event.date === today;
    }
    return true;
  });

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
        <div className="flex bg-zinc-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${filter === 'all' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${filter === 'pending' ? 'bg-white shadow-sm text-amber-600' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${filter === 'today' ? 'bg-white shadow-sm text-emerald-600' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Today
          </button>
        </div>
        <a
          href="/events"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          View Calendar
        </a>
      </div>
      <div className="divide-y divide-zinc-50">
        {filteredEvents.length > 0 ? filteredEvents.map((event) => (
          <div key={event.id} className="p-6 hover:bg-zinc-50/50 transition-colors group">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-zinc-900 truncate text-lg">{event.name}</h3>
                  <span
                    className={`border px-2 py-0.5 text-[10px] items-center rounded-full font-bold uppercase tracking-wide px-2 py-0.5 ${getStatusStyles(
                      event.status
                    )}`}
                  >
                    {event.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500 mb-3">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-indigo-400" />
                    <span className="font-medium text-zinc-700">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-zinc-400" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-zinc-400" />
                    {event.guests} guests
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <p className="text-xl font-bold text-zinc-900 tracking-tight">
                    {formatCurrency(event.amount)}
                  </p>
                  {event.paidAmount < event.amount ? (
                    <p className="text-xs font-semibold text-amber-600 flex items-center justify-end gap-1">
                      <AlertCircle className="w-3 h-3" /> Due: {formatCurrency(event.amount - event.paidAmount)}
                    </p>
                  ) : (
                    <p className="text-xs font-semibold text-emerald-600 flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Paid
                    </p>
                  )}
                </div>

                {/* Mini Step Tracker */}
                <div className="flex items-center gap-1 mt-2">
                  <div className={`h-1.5 w-8 rounded-full ${event.status !== 'cancelled' ? 'bg-emerald-500' : 'bg-zinc-200'}`} title="Booked"></div>
                  <div className={`h-1.5 w-8 rounded-full ${['confirmed', 'completed'].includes(event.status) ? 'bg-emerald-500' : 'bg-zinc-200'}`} title="Confirmed"></div>
                  <div className={`h-1.5 w-8 rounded-full ${event.status === 'completed' ? 'bg-emerald-500' : 'bg-zinc-200'}`} title="Completed"></div>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="p-8 text-center text-zinc-500">
            <p>No events found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
