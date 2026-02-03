'use client';

import PageLayout from '@/components/PageLayout';
import { ArrowLeft, ChefHat, Users, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { recipes } from '@/lib/data';

export default function MaterialPlannerPage() {
    const [guestCount, setGuestCount] = useState(100);
    const [selectedDishId, setSelectedDishId] = useState(recipes[0]?.id || '');

    const selectedDish = recipes.find(r => r.id === selectedDishId);

    // Calculate requirements
    // Assuming recipe ingredients are for 'servingsPerBatch'
    // Total Qty = (Guest Count / Servings Per Batch) * Ingredient Qty

    // Fallback if servingsPerBatch is 0 or missing, assume recipe is for 10 people for simplicity in this mock, 
    // or strictly use servingsPerBatch if available.
    const baseServings = selectedDish?.servingsPerBatch || 10;
    const multiplier = guestCount / baseServings;

    return (
        <PageLayout currentPath="/tools">
            <div className="max-w-3xl mx-auto px-4 py-8 lg:px-8 space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/tools" className="p-2 -ml-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900">Raw Material Planner</h1>
                        <p className="text-xs text-zinc-500">Calculate shopping list for large events</p>
                    </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                    <div className="grid sm:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-semibold text-zinc-900 mb-2">
                                <ChefHat className="w-4 h-4 inline mr-2 text-zinc-500" />
                                Select Dish
                            </label>
                            <select
                                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                value={selectedDishId}
                                onChange={e => setSelectedDishId(e.target.value)}
                            >
                                {recipes.map(recipe => (
                                    <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-zinc-900 mb-2">
                                <Users className="w-4 h-4 inline mr-2 text-zinc-500" />
                                Guest Count
                            </label>
                            <input
                                type="number"
                                min="1"
                                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                value={guestCount}
                                onChange={e => setGuestCount(Math.max(1, parseInt(e.target.value) || 0))}
                            />
                        </div>
                    </div>

                    <div className="border-t border-zinc-100 pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-zinc-900">Required Shopping List</h3>
                        </div>

                        {selectedDish ? (
                            <div className="bg-zinc-50 rounded-xl overflow-hidden border border-zinc-200">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-zinc-100 text-zinc-500 font-medium border-b border-zinc-200">
                                        <tr>
                                            <th className="px-4 py-3">Ingredient</th>
                                            <th className="px-4 py-3 text-right">Quantity Required</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200">
                                        {selectedDish.ingredients.map((ing, idx) => (
                                            <tr key={idx} className="bg-white">
                                                <td className="px-4 py-3 font-medium text-zinc-700">{ing.inventoryItemName}</td>
                                                <td className="px-4 py-3 text-right font-bold text-zinc-900">
                                                    {(ing.quantity * multiplier).toLocaleString(undefined, { maximumFractionDigits: 2 })} {ing.unit}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-zinc-500 py-8">Select a dish to calculate requirements.</p>
                        )}

                        {selectedDish && (
                            <p className="text-xs text-zinc-400 mt-4 text-center">
                                Based on a standard batch size of {baseServings} servings.
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </PageLayout>
    );
}
