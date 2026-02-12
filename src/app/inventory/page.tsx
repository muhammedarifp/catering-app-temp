'use client';

import PageLayout from '@/components/PageLayout';
import { units, dishCategories, getUpcomingEvents } from '@/lib/data';
import { loadInventory } from '@/lib/inventoryStorage';
import { InventoryItem } from '@/lib/types';
import { Plus, Search, Filter, AlertTriangle, Package, Edit, Trash2, ShoppingCart, Store, Eye, MoreHorizontal, ArrowUpRight, History } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/data';
import ShoppingListModal from '@/components/ShoppingListModal';
import RestockModal from '@/components/RestockModal';

export default function InventoryPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
    const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setInventory(loadInventory());
        setLoading(false);
    }, []);

    // Filter Logic
    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    // Only show alerts for "Stocked" items
    const lowStockItems = filteredInventory.filter(item => item.trackingType === 'stocked' && item.quantity <= item.minQuantity);
    const categories = [...new Set(inventory.map(i => i.category))];

    const upcomingEvents = getUpcomingEvents();

    if (loading) {
        return (
            <PageLayout currentPath="/inventory">
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-slate-500">Loading inventory...</p>
                </div>
            </PageLayout>
        )
    }

    return (
        <PageLayout currentPath="/inventory">
            <div className="min-h-screen bg-slate-50/50 pb-20">

                {/* Header */}
                <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Food Godown</h1>
                                <p className="text-sm text-slate-500 mt-1">Manage stock and market lists</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsShoppingListOpen(true)}
                                    className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-all shadow-sm"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    <span>Smart Shopping List</span>
                                </button>
                                <Link
                                    href="/inventory/purchases"
                                    className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    <History className="h-4 w-4" />
                                    <span>Purchase Log</span>
                                </Link>
                                <Link
                                    href="/inventory/create"
                                    className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Add Item</span>
                                </Link>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search ingredients..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                                />
                            </div>
                            <select
                                value={categoryFilter}
                                onChange={e => setCategoryFilter(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer min-w-[160px]"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8">

                    {/* Low Stock Alert Banner */}
                    {lowStockItems.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start gap-4 shadow-sm animate-in slide-in-from-top-2">
                            <div className="p-3 bg-white rounded-xl text-amber-600 shadow-sm border border-amber-100">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Restock Needed</h3>
                                <p className="text-sm text-slate-600 mt-1 mb-3">
                                    You are running low on <span className="font-semibold text-amber-700">{lowStockItems.length} checked-in items</span>. Add them to your shopping list.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {lowStockItems.slice(0, 6).map(item => (
                                        <span key={item.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm">
                                            {item.name}
                                            <span className="text-amber-600">({item.quantity} {item.unit})</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Inventory Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredInventory.map(item => {
                            const isLow = item.trackingType === 'stocked' && item.quantity <= item.minQuantity;
                            const isOnDemand = item.trackingType === 'on_demand';

                            return (
                                <div
                                    key={item.id}
                                    className={`group bg-white rounded-2xl p-5 border transition-all hover:shadow-lg hover:-translate-y-1 duration-200 relative overflow-hidden ${isLow ? 'border-amber-200 ring-1 ring-amber-500/20' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    {/* Background Decor */}
                                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${isOnDemand ? 'bg-emerald-100' : 'bg-indigo-100'}`} />

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOnDemand ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                                    {isOnDemand ? <Store className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{item.name}</h3>
                                                    <p className="text-xs font-medium text-slate-500">{item.category}</p>
                                                </div>
                                            </div>
                                            <button className="text-slate-300 hover:text-slate-600 transition-colors">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-end justify-between mb-4">
                                            <div>
                                                {isOnDemand ? (
                                                    <div>
                                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
                                                            MARKET ITEM
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">In Stock</p>
                                                        <p className={`text-2xl font-bold tracking-tight ${isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                                                            {item.quantity} <span className="text-sm font-medium text-slate-400">{item.unit}</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            {!isOnDemand && (
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-400 mb-0.5">Min Lvl</p>
                                                    <p className="text-sm font-semibold text-slate-600">{item.minQuantity} {item.unit}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                            <div className="flex flex-col">
                                                <span className="text-slate-400">Est. Price</span>
                                                <span className="font-semibold text-slate-700">{formatCurrency(item.pricePerUnit)} / {item.unit}</span>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setRestockItem(item)}
                                                    className="flex items-center gap-1 text-emerald-600 font-semibold hover:underline text-xs"
                                                >
                                                    Restock
                                                </button>
                                                <Link href={`/inventory/${item.id}/edit`} className="flex items-center gap-1 text-indigo-600 font-semibold hover:underline text-xs">
                                                    Edit <ArrowUpRight className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredInventory.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Godown is empty</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mt-2">No items found matching your filters. Add new stock or clear your search.</p>
                        </div>
                    )}
                </div>

                <ShoppingListModal
                    isOpen={isShoppingListOpen}
                    onClose={() => setIsShoppingListOpen(false)}
                    events={upcomingEvents}
                    inventory={inventory}
                />

                <RestockModal
                    isOpen={!!restockItem}
                    onClose={() => setRestockItem(null)}
                    item={restockItem}
                    onSuccess={() => {
                        setInventory(loadInventory()); // Refresh data
                        setRestockItem(null);
                    }}
                />
            </div>
        </PageLayout>
    );
}
