'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft, CalendarDays, Clock, MapPin, Users, Phone,
  Edit, CheckCircle, Utensils, Receipt,
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { getEventById } from '@/lib/actions/events';
import InvoiceDownloadButton from '@/components/InvoiceDownloadButton';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const statusStyles: Record<string, string> = {
  UPCOMING: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-purple-50 text-purple-700 border-purple-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

const eventTypeStyles: Record<string, string> = {
  MAIN_EVENT: 'bg-purple-100 text-purple-700',
  LOCAL_ORDER: 'bg-blue-100 text-blue-700',
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'dishes' | 'financials'>('overview');

  useEffect(() => {
    async function load() {
      const result = await getEventById(id);
      if (result.success && result.data) {
        setEvent(result.data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <PageLayout currentPath="/events">
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-zinc-500">Loading event...</p>
        </div>
      </PageLayout>
    );
  }

  if (!event) {
    return (
      <PageLayout currentPath="/events">
        <div className="flex min-h-[50vh] items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-zinc-900">Event Not Found</h1>
            <Link href="/events" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-900 hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to Events
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const balance = event.totalAmount - event.paidAmount;

  return (
    <PageLayout currentPath="/events">
      <div className="p-4 lg:p-8">

        {/* Back */}
        <Link href="/events" className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" /> Back to Events
        </Link>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${eventTypeStyles[event.eventType] || 'bg-zinc-100 text-zinc-700'}`}>
                {event.eventType === 'LOCAL_ORDER' ? 'Local Order' : 'Main Event'}
              </span>
              <span className={`border px-2 py-0.5 text-xs font-medium rounded ${statusStyles[event.status] || ''}`}>
                {event.status}
              </span>
            </div>
            <h1 className="mt-2 text-xl font-semibold text-zinc-900 lg:text-2xl">{event.name}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Created on {new Date(event.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push(`/events/${event.id}/edit`)}
              className="flex items-center gap-2 border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 rounded-lg"
            >
              <Edit className="h-4 w-4" /> Edit
            </button>
            <InvoiceDownloadButton
              eventId={event.id}
              eventName={event.name}
              className="flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 rounded-lg"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-zinc-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {(['overview', 'dishes', 'financials'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                }`}
              >
                {tab === 'dishes' ? 'Menu & Dishes' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">

            {/* OVERVIEW */}
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
                        <p className="text-base text-zinc-900">
                          {new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="mt-1 h-5 w-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-500">Time</p>
                        <p className="text-base text-zinc-900">{event.eventTime}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="mt-1 h-5 w-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-500">Guests</p>
                        <p className="text-base text-zinc-900">{event.guestCount} people</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-1 h-5 w-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-500">Venue</p>
                        <p className="text-base text-zinc-900">{event.location}</p>
                      </div>
                    </div>
                    {event.notes && (
                      <div className="sm:col-span-2">
                        <p className="text-sm font-medium text-zinc-500 mb-1">Notes</p>
                        <p className="text-sm text-zinc-700 bg-zinc-50 rounded-lg p-3">{event.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
                    <h2 className="font-semibold text-zinc-900">Client Information</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {event.clientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-zinc-900">{event.clientName}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-zinc-600">
                          <Phone className="h-3.5 w-3.5" />
                          <a href={`tel:${event.clientContact}`} className="hover:underline">{event.clientContact}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* DISHES */}
            {activeTab === 'dishes' && (
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                  <h2 className="font-semibold text-zinc-900 flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-zinc-500" /> Dishes
                  </h2>
                  <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2 py-1 rounded-full">
                    {event.dishes?.length || 0} items
                  </span>
                </div>
                {event.dishes && event.dishes.length > 0 ? (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                      <tr>
                        <th className="px-6 py-3">Dish</th>
                        <th className="px-6 py-3 text-right">Qty</th>
                        <th className="px-6 py-3 text-right">Price/Plate</th>
                        <th className="px-6 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {event.dishes.map((d: any) => (
                        <tr key={d.id} className="hover:bg-zinc-50">
                          <td className="px-6 py-3 font-medium text-zinc-900">{d.dish?.name || '—'}</td>
                          <td className="px-6 py-3 text-right text-zinc-600">{d.quantity}</td>
                          <td className="px-6 py-3 text-right text-zinc-600">₹{d.pricePerPlate}</td>
                          <td className="px-6 py-3 text-right font-medium text-zinc-900">₹{(d.quantity * d.pricePerPlate).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-zinc-400 text-sm">No dishes added to this event.</div>
                )}

                {event.services && event.services.length > 0 && (
                  <>
                    <div className="px-6 py-3 border-t border-b border-zinc-200 bg-zinc-50/50">
                      <h3 className="font-semibold text-zinc-900 text-sm">Services</h3>
                    </div>
                    <table className="w-full text-sm text-left">
                      <tbody className="divide-y divide-zinc-100">
                        {event.services.map((s: any) => (
                          <tr key={s.id} className="hover:bg-zinc-50">
                            <td className="px-6 py-3 font-medium text-zinc-900">{s.serviceName}</td>
                            <td className="px-6 py-3 text-zinc-500">{s.description || '—'}</td>
                            <td className="px-6 py-3 text-right font-medium text-zinc-900">₹{Number(s.price).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}

            {/* FINANCIALS */}
            {activeTab === 'financials' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-zinc-200">
                    <p className="text-sm text-zinc-500 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-zinc-900">₹{event.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-zinc-200">
                    <p className="text-sm text-zinc-500 mb-1">Paid</p>
                    <p className="text-2xl font-bold text-emerald-600">₹{event.paidAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-zinc-200">
                    <p className="text-sm text-zinc-500 mb-1">Balance Due</p>
                    <p className={`text-2xl font-bold ${balance > 0 ? 'text-amber-600' : 'text-zinc-400'}`}>
                      ₹{balance.toLocaleString()}
                    </p>
                  </div>
                </div>

                {event.expenses && event.expenses.length > 0 && (
                  <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
                      <h2 className="font-semibold text-zinc-900">Expenses</h2>
                    </div>
                    <table className="w-full text-sm text-left">
                      <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                        <tr>
                          <th className="px-6 py-3">Description</th>
                          <th className="px-6 py-3">Category</th>
                          <th className="px-6 py-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {event.expenses.map((exp: any) => (
                          <tr key={exp.id} className="hover:bg-zinc-50">
                            <td className="px-6 py-3 font-medium text-zinc-900">{exp.description}</td>
                            <td className="px-6 py-3">
                              <span className="px-2 py-0.5 rounded text-xs bg-zinc-100 text-zinc-600 capitalize">
                                {exp.category.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right font-medium text-red-600">-₹{Number(exp.amount).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {(!event.expenses || event.expenses.length === 0) && (
                  <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center text-zinc-400">
                    <Receipt className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p>No expenses recorded.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
                <h3 className="font-semibold text-zinc-900">Payment Status</h3>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Total</span>
                  <span className="text-lg font-bold text-zinc-900">₹{event.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Paid</span>
                  <span className="text-lg font-bold text-emerald-600">₹{event.paidAmount.toLocaleString()}</span>
                </div>
                <div className="h-px bg-zinc-100" />
                <div className="flex justify-between items-center">
                  <span className="font-medium text-zinc-900">Balance</span>
                  <span className={`text-xl font-bold ${balance > 0 ? 'text-amber-600' : 'text-zinc-400'}`}>
                    ₹{balance.toLocaleString()}
                  </span>
                </div>
                {balance <= 0 && (
                  <div className="mt-2 bg-emerald-50 text-emerald-700 py-2 rounded-lg text-center text-sm font-medium border border-emerald-100 flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Paid in Full
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}
