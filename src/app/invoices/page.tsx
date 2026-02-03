'use client';

import PageLayout from '@/components/PageLayout';
import { events, formatCurrency } from '@/lib/data';
import { Search, Download, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        overdue: 'bg-red-100 text-red-700 border-red-200',
        partial: 'bg-blue-100 text-blue-700 border-blue-200'
    };

    const labels = {
        paid: 'Paid',
        pending: 'Pending',
        overdue: 'Overdue',
        partial: 'Partial'
    };

    const type = status as keyof typeof styles;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[type] || styles.pending}`}>
            {type === 'paid' && <CheckCircle2 className="w-3 h-3" />}
            {type === 'pending' && <Clock className="w-3 h-3" />}
            {type === 'overdue' && <AlertCircle className="w-3 h-3" />}
            {labels[type] || status}
        </span>
    );
};

export default function InvoicesPage() {
    const [searchQuery, setSearchQuery] = useState('');

    // Transform events to invoice-like objects
    const invoices = events.map(event => {
        const balance = event.amount - event.paidAmount;
        let status = 'pending';
        if (balance === 0) status = 'paid';
        else if (event.paidAmount > 0) status = 'partial';
        else if (new Date(event.date) < new Date()) status = 'overdue';

        return {
            id: `INV-${event.id.substring(0, 5).toUpperCase()}`,
            eventId: event.id,
            client: event.client,
            date: event.date,
            amount: event.amount,
            paid: event.paidAmount,
            balance: balance,
            status: status
        };
    });

    const filteredInvoices = invoices.filter(inv =>
        inv.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <PageLayout currentPath="/invoices">
            <div className="p-4 lg:p-8 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Invoices</h1>
                        <p className="text-sm text-zinc-500">Track payments and generate bills</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
                        <Download className="w-4 h-4" />
                        Export All
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-zinc-200">
                        <p className="text-xs text-zinc-500 uppercase font-medium">Total Invoiced</p>
                        <p className="text-2xl font-bold text-zinc-900 mt-1">{formatCurrency(invoices.reduce((sum, i) => sum + i.amount, 0))}</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <p className="text-xs text-emerald-600 uppercase font-medium">Collected</p>
                        <p className="text-2xl font-bold text-emerald-900 mt-1">{formatCurrency(invoices.reduce((sum, i) => sum + i.paid, 0))}</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <p className="text-xs text-amber-600 uppercase font-medium">Pending</p>
                        <p className="text-2xl font-bold text-amber-900 mt-1">{formatCurrency(invoices.reduce((sum, i) => sum + i.balance, 0))}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                        <p className="text-xs text-red-600 uppercase font-medium">Overdue</p>
                        <p className="text-2xl font-bold text-red-900 mt-1">
                            {formatCurrency(invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.balance, 0))}
                        </p>
                    </div>
                </div>

                {/* Operations */}
                <div className="bg-white border boundary-zinc-200 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-zinc-200 flex gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search invoice # or client..."
                                className="w-full pl-10 pr-4 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 text-zinc-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Invoice #</th>
                                    <th className="px-4 py-3">Client</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                    <th className="px-4 py-3 text-right">Balance</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filteredInvoices.map(invoice => (
                                    <tr key={invoice.id} className="hover:bg-zinc-50 group">
                                        <td className="px-4 py-3 font-medium text-zinc-900">{invoice.id}</td>
                                        <td className="px-4 py-3">{invoice.client}</td>
                                        <td className="px-4 py-3 text-zinc-500">{new Date(invoice.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(invoice.amount)}</td>
                                        <td className="px-4 py-3 text-right text-zinc-500">{formatCurrency(invoice.balance)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge status={invoice.status} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button className="text-zinc-400 hover:text-zinc-900 p-1.5 hover:bg-zinc-100 rounded">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
