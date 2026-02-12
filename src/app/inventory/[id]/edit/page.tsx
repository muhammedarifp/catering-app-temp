'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, AlertCircle, Trash2 } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { units, dishCategories } from '@/lib/data';
import { InventoryItem, Unit } from '@/lib/types';
import { getInventoryItem, updateInventoryItem, loadInventory, saveInventory } from '@/lib/inventoryStorage';

export default function EditInventoryPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formData, setFormData] = useState<Partial<InventoryItem>>({
        name: '',
        category: '',
        quantity: 0,
        unit: 'kg',
        minQuantity: 0,
        pricePerUnit: 0,
    });

    useEffect(() => {
        const item = getInventoryItem(id);
        if (item) {
            setFormData(item);
        } else {
            // Handle not found
            // router.push('/inventory'); 
            // In a real app, maybe show 404
        }
    }, [id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            updateInventoryItem(id, formData);
            router.push('/inventory');
        } catch (error) {
            console.error('Failed to update item', error);
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        setIsDeleting(true);

        // Simple delete logic (not in storage utils yet, implementing ad-hoc or should I add it?)
        // Let's implement ad-hoc for MVP speed, accessing storage directly
        try {
            const items = loadInventory();
            const newItems = items.filter(i => i.id !== id);
            saveInventory(newItems);
            router.push('/inventory');
        } catch (e) {
            console.error('Failed to delete', e);
            setIsDeleting(false);
        }
    };

    const categories = [
        'Grains',
        'Vegetables',
        'Spices',
        'Dairy',
        'Meat',
        'Oils',
        'Dry Fruits',
        'Sweeteners',
        'Cleaning',
        'Packaging',
        'Other'
    ];

    if (!formData.name && !isLoading) { // Simple loading check
        // return <div>Loading...</div>; // Or handle empty state
    }

    return (
        <PageLayout currentPath="/inventory">
            <div className="max-w-2xl mx-auto px-4 py-8 lg:px-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full text-zinc-500">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-zinc-900">Edit Item</h1>
                            <p className="text-xs text-zinc-500">Update inventory details</p>
                        </div>
                    </div>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Delete Item"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Basic Details */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Item Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Basmati Rice"
                                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
                            <select
                                required
                                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Quantity & Units */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Current Stock</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Unit</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    value={formData.unit}
                                    onChange={e => setFormData({ ...formData, unit: e.target.value as Unit })}
                                >
                                    {units.map(u => (
                                        <option key={u.value} value={u.value}>{u.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Min Quantity Alert</label>
                            <div className="relative">
                                <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="Notify when stock is below..."
                                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                    value={formData.minQuantity}
                                    onChange={e => setFormData({ ...formData, minQuantity: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Costing */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Price Per Unit (₹)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                value={formData.pricePerUnit}
                                onChange={e => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                            {!isLoading && <Save className="w-4 h-4" />}
                        </button>
                    </div>

                </form>
            </div>
        </PageLayout>
    );
}
