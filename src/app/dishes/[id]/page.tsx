'use client';

import PageLayout from '@/components/PageLayout';
import { dishes, inventory, formatCurrency } from '@/lib/data';
import { ArrowLeft, ChefHat, Clock, DollarSign, Edit, Package, TrendingUp, Utensils } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

export default function DishDetailsPage() {
    const params = useParams();
    const dishId = params.id as string;

    const dish = dishes.find(d => d.id === dishId);

    const dishStats = useMemo(() => {
        if (!dish) return null;

        // Calculate dynamic cost based on current inventory prices
        const realCost = dish.ingredients.reduce((total, ing) => {
            const invItem = inventory.find(i => i.id === ing.inventoryItemId);
            // Simple unit conversion logic would go here in a real app
            // For now assuming units match or are simple scalars
            const price = invItem ? invItem.pricePerUnit : 0;
            // This is a rough estimation since units usually differ (kg vs g)
            // In a real app we need a robust unit converter
            // For this mock, we'll assume the 'pricePerUnit' in inventory handles the base unit
            // and we do a simplified calculation for display if needed. 
            // However, the dish.estimatedCostPerPlate is usually pre-calculated.
            // Let's use the pre-calculated one for consistency or try to recalculate if we want "live" data.
            // Given the complexity of unit conversion (g to kg, ml to l), let's stick to the stored estimatedCostPerPlate 
            // but we can list the ingredients with their *current* inventory stock status.
            return total;
        }, 0);

        const margin = dish.sellingPricePerPlate - dish.estimatedCostPerPlate;
        const marginPercent = Math.round((margin / dish.sellingPricePerPlate) * 100);

        return {
            margin,
            marginPercent
        };
    }, [dish]);

    if (!dish) {
        return (
            <PageLayout currentPath="/dishes">
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-500">
                    <p>Dish not found</p>
                    <Link href="/dishes" className="text-blue-600 hover:underline mt-2">
                        Back to Dishes
                    </Link>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout currentPath="/dishes">
            <div className="max-w-5xl mx-auto px-4 py-8 lg:px-8 space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dishes" className="p-2 -ml-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-zinc-900">{dish.name}</h1>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${dish.isVeg
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                    {dish.isVeg ? 'Vegetarian' : 'Non-Veg'}
                                </span>
                            </div>
                            <p className="text-zinc-500 capitalize">{dish.category.replace('_', ' ')} • Added on {new Date(dish.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <Link href={`/dishes/${dish.id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 font-medium rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all">
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit Dish</span>
                    </Link>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Left Column: Ingredients (2/3) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Description */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-2">About this Dish</h2>
                            <p className="text-zinc-600 leading-relaxed">
                                {dish.description || "No description provided."}
                            </p>
                        </div>

                        {/* Ingredients Table */}
                        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                                <h2 className="font-semibold text-zinc-900 flex items-center gap-2">
                                    <Utensils className="w-4 h-4 text-zinc-500" />
                                    Ingredients Breakdown
                                </h2>
                                <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                                    Per {dish.servingsPerBatch} Plates (Batch)
                                </span>
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="text-zinc-500 font-medium border-b border-zinc-100 bg-zinc-50">
                                    <tr>
                                        <th className="px-4 py-3">Ingredient Item</th>
                                        <th className="px-4 py-3">Quantity</th>
                                        <th className="px-4 py-3 text-right">Est. Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {dish.ingredients.map((ing, idx) => {
                                        const inventoryItem = inventory.find(i => i.id === ing.inventoryItemId);
                                        // Rudimentary cost calculation for display (mock logic)
                                        // In real app, perform unit conversion here
                                        const unitPrice = inventoryItem?.pricePerUnit || 0;
                                        const estimatedItemCost = (unitPrice * ing.quantity) / (ing.unit === 'kg' || ing.unit === 'liters' ? 1 : 1000) * (ing.unit === 'kg' || ing.unit === 'liters' ? 1 : 1);
                                        // Note: The above formula is just a placeholder. Real unit conversion is complex.
                                        // We will just show the unit price from inventory for reference.

                                        return (
                                            <tr key={idx} className="hover:bg-zinc-50">
                                                <td className="px-4 py-3 font-medium text-zinc-900">
                                                    {ing.inventoryItemName || 'Unknown Item'}
                                                    {inventoryItem && inventoryItem.quantity < inventoryItem.minQuantity && (
                                                        <span className="ml-2 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Low Stock</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-zinc-600">
                                                    {ing.quantity} {ing.unit}
                                                </td>
                                                <td className="px-4 py-3 text-right text-zinc-500">
                                                    {inventoryItem ? formatCurrency(inventoryItem.pricePerUnit) + '/' + inventoryItem.unit : 'N/A'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div className="p-3 bg-zinc-50 border-t border-zinc-200 text-xs text-center text-zinc-500">
                                * Costs shown are base inventory rates. Actual recipe cost involves complex unit conversions.
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Economics & Stats (1/3) */}
                    <div className="space-y-6">

                        {/* Economics Card */}
                        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 bg-zinc-900 text-white">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" /> Economics
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Selling Price</p>
                                    <div className="text-3xl font-bold text-zinc-900">{formatCurrency(dish.sellingPricePerPlate)}</div>
                                    <p className="text-xs text-zinc-400">per plate</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Cost</p>
                                        <p className="font-semibold text-zinc-900">{formatCurrency(dish.estimatedCostPerPlate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Margin</p>
                                        <p className={`font-bold ${dishStats?.marginPercent && dishStats.marginPercent > 30 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {dishStats?.marginPercent}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-200">
                                <Link href="/tools/estimator" className="flex items-center justify-center gap-2 text-sm text-blue-600 font-medium hover:underline">
                                    <TrendingUp className="w-4 h-4" />
                                    Analyze in Calculator
                                </Link>
                            </div>
                        </div>

                        {/* Production Info */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
                            <h3 className="font-semibold text-zinc-900 flex items-center gap-2 pb-3 border-b border-zinc-100">
                                <ChefHat className="w-4 h-4 text-zinc-500" /> Kitchen Info
                            </h3>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-900">Prep Time</p>
                                    <p className="text-sm text-zinc-500">{dish.preparationTime} mins</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <Package className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-900">Batch Size</p>
                                    <p className="text-sm text-zinc-500">{dish.batchSize} {dish.batchUnit}</p>
                                    <p className="text-xs text-zinc-400">Serves {dish.servingsPerBatch} people</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </PageLayout>
    );
}
