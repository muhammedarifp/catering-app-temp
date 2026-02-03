'use client';

import { useState } from 'react';
import { dishCategories, inventory, units } from '@/lib/data';
import { Dish, DishIngredient } from '@/lib/types';
import { Plus, Trash2, Save, ArrowLeft, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DishFormProps {
    initialData?: Dish;
    isEdit?: boolean;
}

export default function DishForm({ initialData, isEdit = false }: DishFormProps) {
    const router = useRouter();

    const [formData, setFormData] = useState<Partial<Dish>>(
        initialData || {
            name: '',
            category: 'starters',
            isVeg: true,
            description: '',
            ingredients: [],
            estimatedCostPerPlate: 0,
            sellingPricePerPlate: 0,
            preparationTime: 30,
            servingsPerBatch: 10,
            isActive: true,
        }
    );

    const [searchIngredient, setSearchIngredient] = useState('');

    const handleIngredientAdd = (inventoryItemId: string) => {
        const item = inventory.find(i => i.id === inventoryItemId);
        if (!item) return;

        const newIngredient: DishIngredient = {
            inventoryItemId: item.id,
            inventoryItemName: item.name,
            quantity: 1, // Default
            unit: item.unit, // Default to item's unit
        };

        setFormData(prev => ({
            ...prev,
            ingredients: [...(prev.ingredients || []), newIngredient]
        }));
    };

    const removeIngredient = (index: number) => {
        setFormData(prev => ({
            ...prev,
            ingredients: prev.ingredients?.filter((_, i) => i !== index)
        }));
    };

    const updateIngredient = (index: number, field: keyof DishIngredient, value: any) => {
        setFormData(prev => {
            const newIngredients = [...(prev.ingredients || [])];
            newIngredients[index] = { ...newIngredients[index], [field]: value };
            return { ...prev, ingredients: newIngredients };
        });
    };

    const calculateBatchCost = () => {
        let cost = 0;
        formData.ingredients?.forEach(ing => {
            const item = inventory.find(i => i.id === ing.inventoryItemId);
            if (item) {
                // Simplified conversion logic
                let multiplier = ing.quantity;
                if (ing.unit === 'g' || ing.unit === 'ml') multiplier = ing.quantity / 1000;
                // Assuming other units (pieces, etc.) match directly or are handled elsewhere

                cost += multiplier * item.pricePerUnit;
            }
        });
        // Add 10% overhead for wastage/gas etc
        return Math.ceil(cost * 1.1);
    };

    const calculateCostPerPlate = () => {
        const batchCost = calculateBatchCost();
        const servings = formData.servingsPerBatch || 1;
        return batchCost / servings;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalCost = calculateCostPerPlate();
        const dataToSave = { ...formData, estimatedCostPerPlate: finalCost };
        console.log('Saving Dish:', dataToSave);
        alert('Dish saved successfully! (Mock)');
        router.back();
    };

    // Filter inventory for dropdown
    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchIngredient.toLowerCase())
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-zinc-900">{isEdit ? 'Edit Dish' : 'Create New Dish'}</h2>
                <div className="flex gap-2">
                    <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm border border-zinc-200 hover:bg-zinc-50 font-medium text-zinc-700">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm bg-zinc-900 hover:bg-zinc-800 text-white font-medium flex items-center gap-2">
                        <Save className="h-4 w-4" /> Save Dish
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Basic Info */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-4 border border-zinc-200">
                        <h3 className="font-medium text-zinc-900 mb-4">Basic Details</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Dish Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full text-sm border-zinc-200 focus:ring-zinc-900"
                                    placeholder="e.g. Paneer Butter Masala"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                    className="w-full text-sm border-zinc-200 focus:ring-zinc-900"
                                >
                                    {dishCategories.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Type</label>
                                <div className="flex gap-4 mt-1.5">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={formData.isVeg}
                                            onChange={() => setFormData({ ...formData, isVeg: true })}
                                            className="text-emerald-600 focus:ring-emerald-600"
                                        />
                                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Veg</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={!formData.isVeg}
                                            onChange={() => setFormData({ ...formData, isVeg: false })}
                                            className="text-red-600 focus:ring-red-600"
                                        />
                                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Non-Veg</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-500 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full text-sm border-zinc-200 focus:ring-zinc-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 mb-1">Prep Time (mins)</label>
                                    <input
                                        type="number"
                                        value={formData.preparationTime}
                                        onChange={e => setFormData({ ...formData, preparationTime: parseInt(e.target.value) || 0 })}
                                        className="w-full text-sm border-zinc-200 focus:ring-zinc-900"
                                    />
                                </div>
                                <div>
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-100">
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-500 mb-1">Batch Size</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={formData.batchSize || 1}
                                                    onChange={e => setFormData({ ...formData, batchSize: parseFloat(e.target.value) || 1 })}
                                                    className="w-full text-sm border-zinc-200 focus:ring-zinc-900 font-medium"
                                                    min="0.1"
                                                    step="0.1"
                                                />
                                                <select
                                                    value={formData.batchUnit || 'kg'}
                                                    onChange={e => setFormData({ ...formData, batchUnit: e.target.value as any })}
                                                    className="w-24 text-sm border-zinc-200 focus:ring-zinc-900 bg-zinc-50"
                                                >
                                                    {units.map(u => (
                                                        <option key={u.value} value={u.value}>{u.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-500 mb-1">Plates from Batch</label>
                                            <input
                                                type="number"
                                                value={formData.servingsPerBatch}
                                                onChange={e => setFormData({ ...formData, servingsPerBatch: parseInt(e.target.value) || 1 })}
                                                className="w-full text-sm border-zinc-200 focus:ring-zinc-900 font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-zinc-100">
                                        <label className="block text-xs font-medium text-zinc-500 mb-1">Selling Price (Per Plate)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
                                            <input
                                                type="number"
                                                value={formData.sellingPricePerPlate || 0}
                                                onChange={e => setFormData({ ...formData, sellingPricePerPlate: parseInt(e.target.value) || 0 })}
                                                className="w-full pl-7 text-sm border-zinc-200 focus:ring-zinc-900 font-semibold"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1 mt-2 text-xs">
                                            <div className="flex justify-between text-zinc-500">
                                                <span>Batch Cost:</span>
                                                <span className="font-medium text-zinc-700">₹{calculateBatchCost().toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-zinc-500">
                                                <span>Cost/Plate:</span>
                                                <span className="font-medium text-zinc-700">₹{calculateCostPerPlate().toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between mt-1 pt-1 border-t border-zinc-100">
                                                <span>Margin:</span>
                                                <span className={`${(formData.sellingPricePerPlate || 0) > calculateCostPerPlate() ? 'text-emerald-600' : 'text-red-600'} font-medium`}>
                                                    {(formData.sellingPricePerPlate || 0) > 0
                                                        ? Math.round((((formData.sellingPricePerPlate || 0) - calculateCostPerPlate()) / (formData.sellingPricePerPlate || 1)) * 100)
                                                        : 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Recipe/Ingredients */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white p-4 border border-zinc-200 min-h-[500px]">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-medium text-zinc-900">Recipe & Ingredients</h3>
                                        <p className="text-xs text-zinc-500">Map ingredients to calculate theoretical food cost</p>
                                    </div>

                                    {/* Ingredient Selector */}
                                    <div className="relative w-64">
                                        <input
                                            type="text"
                                            placeholder="Add ingredient..."
                                            className="w-full text-sm border-zinc-200 focus:ring-zinc-900 pr-8"
                                            value={searchIngredient}
                                            onChange={e => setSearchIngredient(e.target.value)}
                                        />
                                        <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />

                                        {searchIngredient && (
                                            <div className="absolute top-full left-0 right-0 bg-white border border-zinc-200 shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                                                {filteredInventory.map(item => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => {
                                                            handleIngredientAdd(item.id);
                                                            setSearchIngredient('');
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 flex justify-between items-center"
                                                    >
                                                        <span>{item.name}</span>
                                                        <span className="text-xs text-zinc-400">{item.unit}</span>
                                                    </button>
                                                ))}
                                                {filteredInventory.length === 0 && (
                                                    <div className="px-3 py-2 text-xs text-zinc-400 text-center">No items found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Ingridients Table */}
                                <div className="border rounded-sm overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase">
                                            <tr>
                                                <th className="px-3 py-2">Ingredient</th>
                                                <th className="px-3 py-2 w-32">Quantity</th>
                                                <th className="px-3 py-2 w-32">Unit</th>
                                                <th className="px-3 py-2 w-24 text-right">Cost (Est)</th>
                                                <th className="px-3 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100">
                                            {formData.ingredients?.map((ing, index) => {
                                                const item = inventory.find(i => i.id === ing.inventoryItemId);
                                                let cost = 0;
                                                if (item) {
                                                    let multiplier = ing.quantity;
                                                    if (ing.unit === 'g' || ing.unit === 'ml') multiplier = ing.quantity / 1000;
                                                    cost = multiplier * item.pricePerUnit;
                                                }

                                                return (
                                                    <tr key={index} className="group">
                                                        <td className="px-3 py-2">
                                                            <p className="font-medium text-zinc-900">{ing.inventoryItemName}</p>
                                                            <p className="text-xs text-zinc-400">Current Price: ₹{item?.pricePerUnit}/{item?.unit}</p>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={ing.quantity}
                                                                onChange={e => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                                className="w-full p-1 text-sm border-zinc-200 focus:border-zinc-900 h-8"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <select
                                                                value={ing.unit}
                                                                onChange={e => updateIngredient(index, 'unit', e.target.value)}
                                                                className="w-full p-1 text-sm border-zinc-200 focus:border-zinc-900 h-8"
                                                            >
                                                                {units.map(u => (
                                                                    <option key={u.value} value={u.value}>{u.value}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-medium text-zinc-700">
                                                            ₹{cost.toFixed(2)}
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeIngredient(index)}
                                                                className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {(!formData.ingredients || formData.ingredients.length === 0) && (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-400 text-sm">
                                                        No ingredients added yet. Search and add ingredients above.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="bg-zinc-50 font-semibold text-zinc-700">
                                            <tr>
                                                <td colSpan={3} className="px-3 py-2 text-right text-xs uppercase tracking-wide">Total Ingredient Cost</td>
                                                <td className="px-3 py-2 text-right">₹{formData.ingredients?.reduce((sum, ing) => {
                                                    const item = inventory.find(i => i.id === ing.inventoryItemId);
                                                    if (!item) return sum;
                                                    let multiplier = ing.quantity;
                                                    if (ing.unit === 'g' || ing.unit === 'ml') multiplier = ing.quantity / 1000;
                                                    return sum + (multiplier * item.pricePerUnit);
                                                }, 0).toFixed(2)}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
