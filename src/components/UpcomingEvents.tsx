import { CalendarDays, MapPin, Users, Clock } from 'lucide-react';
import { Event } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/data';

interface UpcomingEventsProps {
  events: Event[];
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
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

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 lg:px-6 lg:py-4">
        <h2 className="text-base font-semibold text-zinc-900 lg:text-lg">Upcoming Events</h2>
        <a
          href="/events"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          View all
        </a>
      </div>
      <div className="divide-y divide-zinc-100">
        {events.map((event) => (
          <div key={event.id} className="p-4 hover:bg-zinc-50 transition-colors lg:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-zinc-900 truncate">{event.name}</h3>
                  <span
                    className={`border px-2 py-0.5 text-xs font-medium capitalize ${getStatusStyles(
                      event.status
                    )}`}
                  >
                    {event.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-600">{event.client}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 lg:mt-3 lg:text-sm">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    {event.guests} guests
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500 lg:text-sm">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 lg:h-4 lg:w-4" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
                <p className="text-base font-semibold text-zinc-900 lg:text-lg">
                  {formatCurrency(event.amount)}
                </p>
                {event.paidAmount < event.amount && (
                  <p className="text-xs text-amber-600 lg:mt-1 lg:text-sm">
                    Due: {formatCurrency(event.amount - event.paidAmount)}
                  </p>
                )}
                {event.paidAmount === event.amount && (
                  <p className="text-xs text-emerald-600 lg:mt-1 lg:text-sm">Fully Paid</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
