'use client';

import { use, useMemo } from 'react';
import {
    ArrowLeft,
    Mail,
    Phone,
    CalendarDays,
    MapPin,
    Clock,
    ExternalLink,
    IndianRupee,
    TrendingUp,
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { events, formatCurrency, formatDate } from '@/lib/data';
import Link from 'next/link';

export default function ClientProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const decodeId = decodeURIComponent(id);

    // Group events for this client
    const clientEvents = useMemo(() => {
        return events.filter(
            (e) => e.clientPhone === decodeId || e.client === decodeId
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [decodeId]);

    if (clientEvents.length === 0) {
        return (
            <PageLayout currentPath="/clients">
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-zinc-900">Client Not Found</h2>
                        <p className="mt-2 text-zinc-500">No records found for this client ID.</p>
                        <Link href="/clients" className="mt-4 inline-flex items-center text-indigo-600 hover:underline">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
                        </Link>
                    </div>
                </div>
            </PageLayout>
        );
    }

    // Derive client details from their most recent event
    const clientDetails = clientEvents[0];
    const totalSpent = clientEvents.reduce((sum, e) => sum + e.amount, 0);
    const completedEvents = clientEvents.filter(e => e.status === 'completed').length;
    const upcomingEvents = clientEvents.filter(e => e.status === 'confirmed' || e.status === 'pending').length;

    return (
        <PageLayout currentPath="/clients">
            <div className="p-4 lg:p-8">
                {/* Back Nav */}
                <Link
                    href="/clients"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Client List
                </Link>

                {/* Header Profile Card */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden mb-8">
                    <div className="bg-linear-to-r from-zinc-900 to-zinc-800 px-6 py-8 text-white">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center text-3xl font-bold backdrop-blur-sm border border-white/20">
                                {clientDetails.client.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{clientDetails.client}</h1>
                                <div className="flex flex-wrap gap-4 mt-3 text-zinc-300 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        <a href={`tel:${clientDetails.clientPhone}`} className="hover:text-white transition-colors">{clientDetails.clientPhone}</a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        <a href={`mailto:${clientDetails.clientEmail}`} className="hover:text-white transition-colors">{clientDetails.clientEmail}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
                        <div className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                                <IndianRupee className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Total Spent</p>
                                <p className="text-2xl font-bold text-zinc-900">{formatCurrency(totalSpent)}</p>
                            </div>
                        </div>
                        <div className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <CalendarDays className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Events Booked</p>
                                <p className="text-2xl font-bold text-zinc-900">{clientEvents.length}</p>
                            </div>
                        </div>
                        <div className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Avg. Event Value</p>
                                <p className="text-2xl font-bold text-zinc-900">{formatCurrency(totalSpent / clientEvents.length)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Event History */}
                <div>
                    <h2 className="text-lg font-semibold text-zinc-900 mb-4">Event History</h2>
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">

                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-200">
                                    <tr>
                                        <th className="px-6 py-4">Event Name</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Guests</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {clientEvents.map((event) => (
                                        <tr key={event.id} className="hover:bg-zinc-50 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-zinc-900">{event.name}</td>
                                            <td className="px-6 py-4 text-zinc-500">{formatDate(event.date)}</td>
                                            <td className="px-6 py-4 text-zinc-600">{event.guests}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize 
                           ${event.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                                        event.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                            'bg-zinc-100 text-zinc-800'}`}>
                                                    {event.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-zinc-900">{formatCurrency(event.amount)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/events/${event.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium text-xs inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    View <ExternalLink className="h-3 w-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-zinc-100">
                            {clientEvents.map((event) => (
                                <Link href={`/events/${event.id}`} key={event.id} className="block p-4 hover:bg-zinc-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-zinc-900">{event.name}</h3>
                                            <p className="text-xs text-zinc-500">{formatDate(event.date)}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${event.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-800'}`}>
                                            {event.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-600">{event.guests} Guests</span>
                                        <span className="font-semibold text-zinc-900">{formatCurrency(event.amount)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                    </div>
                </div>

            </div>
        </PageLayout>
    );
}
