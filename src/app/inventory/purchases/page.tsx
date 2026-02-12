'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { loadInventoryTransactions } from '@/lib/inventoryStorage';
import { InventoryTransaction } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/data';
import { ArrowLeft, ShoppingBag, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function PurchaseLogPage() {
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const allTransactions = loadInventoryTransactions();
        const purchases = allTransactions.filter(t => t.type === 'purchase');
        setTransactions(purchases);
        setIsLoading(false);
    }, []);

    const filteredTransactions = transactions.filter(t =>
        t.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <PageLayout currentPath="/inventory">
                <div className="flex h-96 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900"></div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout currentPath="/inventory">
            <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/inventory"
                        className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Inventory
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center bg-emerald-100 rounded-lg">
                                <ShoppingBag className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900">Purchase Log</h1>
                                <p className="text-sm text-zinc-500">History of inventory restocks and purchases</p>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search by item name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 w-full md:w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 border-b border-zinc-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-zinc-700">Date</th>
                                    <th className="px-6 py-4 font-semibold text-zinc-700">Item</th>
                                    <th className="px-6 py-4 font-semibold text-zinc-700 text-right">Quantity</th>
                                    <th className="px-6 py-4 font-semibold text-zinc-700 text-right">Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((txn) => (
                                        <tr key={txn.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4 text-zinc-600 whitespace-nowrap">
                                                {formatDate(txn.date)}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-zinc-900">
                                                {txn.itemName}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    +{txn.quantity} {txn.unit}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-zinc-900">
                                                {txn.cost && txn.cost > 0 ? formatCurrency(txn.cost) : '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                            No purchase records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
