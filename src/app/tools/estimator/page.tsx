'use client';

import PageLayout from '@/components/PageLayout';
import { ArrowLeft, Plus, Trash2, RotateCcw, Save, Download, ChefHat } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { formatCurrency, units, recipes, inventory } from '@/lib/data';
import { Unit } from '@/lib/types';

interface EstimateItem {
    id: string;
    name: string;
    quantity: number;
    unit: Unit;
    pricePerUnit: number;
}

export default function CostEstimatorPage() {
    const [selectedDishId, setSelectedDishId] = useState('');
    const [items, setItems] = useState<EstimateItem[]>([
        { id: '1', name: 'Chicken', quantity: 1, unit: 'kg', pricePerUnit: 280 }
    ]);
    const [plates, setPlates] = useState(1);
    const [targetMargin, setTargetMargin] = useState(30); // 30%

    // Load dish ingredients
    useEffect(() => {
        if (!selectedDishId) return;

        const dish = recipes.find(r => r.id === selectedDishId);
        if (dish) {
            const newItems = dish.ingredients.map(ing => {
                const invItem = inventory.find(i => i.id === ing.inventoryItemId);
                return {
                    id: Math.random().toString(), // unique id for list
                    name: ing.inventoryItemName || 'Unknown Item',
                    quantity: ing.quantity, // This is usually per batch or per plate, assuming per batch for calculator base
                    unit: ing.unit,
                    pricePerUnit: invItem ? invItem.pricePerUnit : 0
                };
            });
            // Scale quantity if needed or keep as base batch
            setItems(newItems);
            setPlates(dish.servingsPerBatch || 1);
        }
    }, [selectedDishId]);

    // Calculations
    const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);
    const costPerPlate = totalCost / plates;
    const suggestedPrice = costPerPlate / (1 - (targetMargin / 100));
    const profitPerPlate = suggestedPrice - costPerPlate;

    const addItem = () => {
        setItems([
            ...items,
            { id: Math.random().toString(), name: '', quantity: 0, unit: 'kg', pricePerUnit: 0 }
        ]);
    };

    const updateItem = (id: string, field: keyof EstimateItem, value: any) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleDownload = () => {
        // Mock download
        alert("Downloading detailed cost report...");
    };

    return (
        <PageLayout currentPath="/tools">
            <div className="max-w-4xl mx-auto px-4 py-8 lg:px-8 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/tools" className="p-2 -ml-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-zinc-900">Advanced Dish Calculator</h1>
                            <p className="text-xs text-zinc-500">Analyze prices and export data</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-medium rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export Data
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Ingredients List */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Dish Selector */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600">
                                <ChefHat className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Load from Menu</label>
                                <select
                                    className="w-full bg-transparent font-medium text-zinc-900 outline-none cursor-pointer"
                                    value={selectedDishId}
                                    onChange={e => setSelectedDishId(e.target.value)}
                                >
                                    <option value="">Select a dish to load ingredients...</option>
                                    {recipes.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
                                <h2 className="font-semibold text-zinc-900">Ingredients Breakdown</h2>
                                <button onClick={addItem} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                                    <Plus className="w-4 h-4" /> Add Custom Item
                                </button>
                            </div>
                            <div className="p-4 space-y-3">
                                {items.map((item, index) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center group border-b border-zinc-50 pb-2 last:border-0 last:pb-0">
                                        <div className="flex-1 w-full sm:w-auto">
                                            <input
                                                placeholder="Item Name"
                                                className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded text-sm focus:ring-2 focus:ring-zinc-900 outline-none font-medium"
                                                value={item.name}
                                                onChange={e => updateItem(item.id, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <div className="w-20">
                                                <input
                                                    type="number"
                                                    className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                                                    value={item.quantity || ''}
                                                    onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                                                    placeholder="Qty"
                                                />
                                            </div>
                                            <div className="w-24">
                                                <select
                                                    className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                                                    value={item.unit}
                                                    onChange={e => updateItem(item.id, 'unit', e.target.value)}
                                                >
                                                    {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                                                </select>
                                            </div>
                                            <div className="w-24 relative">
                                                <span className="absolute left-2 top-1.5 text-zinc-400 text-xs">₹</span>
                                                <input
                                                    type="number"
                                                    className="w-full pl-5 pr-2 py-1.5 bg-white border border-blue-200 text-blue-700 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                                    value={item.pricePerUnit || ''}
                                                    onChange={e => updateItem(item.id, 'pricePerUnit', parseFloat(e.target.value))}
                                                    placeholder="Price"
                                                    title="Editable Unit Price"
                                                />
                                            </div>
                                            <div className="w-8 pt-1.5 text-center">
                                                <button onClick={() => removeItem(item.id)} className="text-zinc-300 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-zinc-50 border-t border-zinc-200 text-right">
                                <p className="text-sm text-zinc-500">Total Ingredient Cost: <span className="font-bold text-zinc-900">{formatCurrency(totalCost)}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="space-y-4">
                        <div className="bg-zinc-900 text-white rounded-xl p-6 shadow-xl sticky top-24">
                            <h3 className="text-sm font-medium text-zinc-400 uppercase mb-6 tracking-wider">Profit Analysis</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs text-zinc-500 block mb-1">Batch Servings</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 text-sm focus:ring-1 focus:ring-white outline-none font-mono"
                                            value={plates}
                                            onChange={e => setPlates(Math.max(1, parseInt(e.target.value) || 1))}
                                        />
                                        <span className="text-xs text-zinc-500">plates</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-xs text-zinc-500">Target Margin</label>
                                        <span className="text-xs font-bold text-white">{targetMargin}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="100"
                                        className="w-full accent-white cursor-pointer"
                                        value={targetMargin}
                                        onChange={e => setTargetMargin(parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="pt-6 border-t border-zinc-800 space-y-3">
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-zinc-400">Cost per Plate</span>
                                        <span className="font-mono">{formatCurrency(costPerPlate)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-zinc-400">Profit</span>
                                        <span className="text-emerald-400 font-mono">+{formatCurrency(profitPerPlate)}</span>
                                    </div>
                                    <div className="p-4 bg-zinc-800 rounded-lg mt-2">
                                        <p className="text-xs text-zinc-500 mb-1">Suggested Selling Price</p>
                                        <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(suggestedPrice)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </PageLayout>
    );
}
