'use client';

import PageLayout from '@/components/PageLayout';
import { inventory, units, dishCategories } from '@/lib/data';
import { Plus, Search, Filter, AlertTriangle, Package, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { formatCurrency } from '@/lib/data';

export default function InventoryPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Filter Logic
    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase();

        return matchesSearch && matchesCategory;
    });

    const lowStockItems = filteredInventory.filter(item => item.quantity <= item.minQuantity);
    const categories = [...new Set(inventory.map(i => i.category))];

    return (
        <PageLayout currentPath="/inventory">
            <div className="p-4 lg:p-8 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Godown Inventory</h1>
                        <p className="text-sm text-zinc-500">Track raw materials and stock levels</p>
                    </div>
                    <Link
                        href="/inventory/create"
                        className="flex items-center justify-center gap-2 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add Item
                    </Link>
                </div>

                {/* Low Stock Banner */}
                {lowStockItems.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4">
                        <div className="p-2 bg-red-100 rounded-full text-red-600 flex-shrink-0">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-red-900">Low Stock Alert</h3>
                            <p className="text-xs text-red-700 mt-1">
                                The following {lowStockItems.length} items are running low and need restocking immediately.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {lowStockItems.slice(0, 5).map(item => (
                                    <span key={item.id} className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-red-200 rounded text-xs font-medium text-red-700">
                                        {item.name}
                                        <span className="text-red-500">({item.quantity} {item.unit})</span>
                                    </span>
                                ))}
                                {lowStockItems.length > 5 && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs text-red-600">
                                        +{lowStockItems.length - 5} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search inventory..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* Filter */}
                    <div className="sm:w-48">
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 appearance-none cursor-pointer"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Grid View */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredInventory.map(item => {
                        const isLow = item.quantity <= item.minQuantity;

                        return (
                            <div key={item.id} className={`bg-white border rounded-xl p-4 transition-all hover:shadow-sm ${isLow ? 'border-red-200' : 'border-zinc-200'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLow ? 'bg-red-50 text-red-600' : 'bg-zinc-100 text-zinc-600'}`}>
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-zinc-900">{item.name}</h3>
                                            <p className="text-xs text-zinc-500">{item.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-dashed border-zinc-200">
                                    <div>
                                        <span className="text-xs text-zinc-500 block mb-1">Available</span>
                                        <span className={`text-lg font-bold ${isLow ? 'text-red-600' : 'text-zinc-900'}`}>
                                            {item.quantity} <span className="text-sm font-normal text-zinc-500">{item.unit}</span>
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-zinc-500 block mb-1">Min Level</span>
                                        <span className="text-lg font-medium text-zinc-700">
                                            {item.minQuantity} <span className="text-sm font-normal text-zinc-500">{item.unit}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between text-xs">
                                    <span className="text-zinc-500">
                                        Price: <span className="font-medium text-zinc-900">{formatCurrency(item.pricePerUnit)}</span> / {item.unit}
                                    </span>
                                    <span className="text-zinc-400">
                                        Updated {new Date(item.lastUpdated).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredInventory.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-zinc-200">
                        <Package className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-zinc-900">No items found</h3>
                        <p className="text-zinc-500 text-sm">Try adjusting your search or filters</p>
                    </div>
                )}

            </div>
        </PageLayout>
    );
}
