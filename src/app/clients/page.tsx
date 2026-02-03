'use client';

import PageLayout from '@/components/PageLayout';
import { events } from '@/lib/data';
import { Search, Phone, Mail, CalendarDays, User, ArrowRight } from 'lucide-react';
import { useState, useMemo } from 'react';

// Extract unique clients from events
const getClients = () => {
    const clientsMap = new Map();

    events.forEach(event => {
        // Use phone as unique identifier if possible, fallback to name
        const key = event.clientPhone || event.client;

        if (!clientsMap.has(key)) {
            clientsMap.set(key, {
                id: key,
                name: event.client,
                phone: event.clientPhone,
                email: event.clientEmail,
                totalEvents: 0,
                lastEventDate: event.date,
                totalSpent: 0
            });
        }

        const client = clientsMap.get(key);
        client.totalEvents += 1;
        client.totalSpent += event.amount;
        if (new Date(event.date) > new Date(client.lastEventDate)) {
            client.lastEventDate = event.date;
        }
    });

    return Array.from(clientsMap.values());
};

export default function ClientsPage() {
    const clients = useMemo(() => getClients(), []);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery) ||
        (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <PageLayout currentPath="/clients">
            <div className="p-4 lg:p-8 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Clients</h1>
                        <p className="text-sm text-zinc-500">Manage your customer relationships</p>
                    </div>
                    {/* Add Client Button (Future) */}
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search clients by name, phone or email..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Client List */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredClients.map(client => (
                        <div key={client.id} className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-semibold text-lg">
                                        {client.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-zinc-900">{client.name}</h3>
                                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                                            <CalendarDays className="w-3 h-3" />
                                            Last seen: {new Date(client.lastEventDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-full transition-colors">
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-2 border-t border-zinc-100 pt-4">
                                <div className="flex items-center gap-2 text-sm text-zinc-600">
                                    <Phone className="w-4 h-4 text-zinc-400" />
                                    <span>{client.phone}</span>
                                </div>
                                {client.email && (
                                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                                        <Mail className="w-4 h-4 text-zinc-400" />
                                        <span className="truncate">{client.email}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between text-sm">
                                <span className="text-zinc-500">Events: <span className="font-medium text-zinc-900">{client.totalEvents}</span></span>
                                <span className="text-zinc-500">Spent: <span className="font-medium text-zinc-900">₹{client.totalSpent.toLocaleString()}</span></span>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredClients.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-zinc-200">
                        <User className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-zinc-900">No clients found</h3>
                        <p className="text-zinc-500 text-sm">Your search didn't match any existing clients.</p>
                    </div>
                )}
            </div>
        </PageLayout>
    );
}
