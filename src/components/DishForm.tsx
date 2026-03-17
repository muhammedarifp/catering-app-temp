'use client';

import { useState } from 'react';
import { Save, ArrowLeft, Plus, Trash2, ChefHat, Zap, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createDish, updateDish } from '@/lib/actions/dishes';
import { addIngredient } from '@/lib/actions/ingredients';
import { api, useGetIngredientsQuery } from '@/store/api';
import { useDispatch } from 'react-redux';
import { calculateIngredientCost, getAvailableUnitsForGlobal } from '@/lib/utils/units';

type DishType = 'RECIPE' | 'LIVE' | 'FIXED';

interface Ingredient {
    ingredientName: string;
    quantity: number;
    unit: string;
    ingredientId?: string;
}

interface DishFormProps {
    initialData?: any;
    isEdit?: boolean;
}

const DISH_TYPES: { value: DishType; label: string; desc: string; icon: any; color: string }[] = [
    {
        value: 'RECIPE',
        label: 'Recipe Dish',
        desc: 'Has ingredients with quantities. Cost is auto-calculated from ingredient prices + labour.',
        icon: ChefHat,
        color: 'indigo',
    },
    {
        value: 'LIVE',
        label: 'Live Counter',
        desc: 'Live station (e.g. juice counter). No fixed price — price is entered per enquiry.',
        icon: Zap,
        color: 'amber',
    },
    {
        value: 'FIXED',
        label: 'Fixed Price',
        desc: 'Readymade / packaged item (e.g. water bottle). Has a fixed selling price, no recipe.',
        icon: Package,
        color: 'emerald',
    },
];

export default function DishForm({ initialData, isEdit = false }: DishFormProps) {
    const router = useRouter();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { data: globalIngredients = [] } = useGetIngredientsQuery({ activeOnly: true });

    const [dishType, setDishType] = useState<DishType>(initialData?.dishType ?? 'RECIPE');

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        category: initialData?.category || 'Main Course',
        isVeg: initialData?.isVeg !== undefined ? initialData.isVeg : true,
        imageUrl: initialData?.imageUrl || '',
        pricePerPlate: initialData?.pricePerPlate !== undefined ? String(initialData.pricePerPlate) : '',
        priceUnit: initialData?.priceUnit || 'per plate',
        sellingPricePerPlate: initialData?.sellingPricePerPlate !== undefined ? String(initialData.sellingPricePerPlate) : '',
        labourCost: initialData?.labourCost !== undefined ? String(initialData.labourCost) : '',
    });

    const [ingredients, setIngredients] = useState<Ingredient[]>(
        initialData?.ingredients || []
    );

    const categories = [
        'Welcome Drink',
        'Starters',
        'Herbal Tea',
        'Breads',
        'Main Course',
        'Curry',
        'Fry',
        'Salads',
        'Drinks',
        'Desserts',
        'Veg',
    ];

    const priceUnits = [
        { value: 'per plate', label: 'Per Plate' },
        { value: 'per kg',    label: 'Per Kg' },
        { value: 'per L',     label: 'Per Litre (L)' },
        { value: 'per ml',    label: 'Per ml' },
        { value: 'per item',  label: 'Per Item (MRP)' },
    ];

    const units = ['kg', 'g', 'l', 'ml', 'piece', 'cup', 'tbsp', 'tsp'];

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { ingredientName: '', quantity: 0, unit: 'g' }]);
    };

    const handleRemoveIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
        const updated = [...ingredients];
        const item = { ...updated[index], [field]: value };
        if (field === 'ingredientName') {
            const matched = globalIngredients.find((g: any) => g.name.toLowerCase() === (value as string).toLowerCase());
            if (matched) {
                item.ingredientId = matched.id;
                item.unit = matched.unit;
            } else {
                item.ingredientId = undefined;
            }
        }
        updated[index] = item;
        setIngredients(updated);
    };

    // Live cost preview (RECIPE only)
    const ingredientCost = dishType === 'RECIPE'
        ? ingredients.reduce((sum, ing) => {
            if (ing.ingredientId) {
                const matched = globalIngredients.find((g: any) => g.id === ing.ingredientId);
                if (matched) {
                    return sum + calculateIngredientCost(ing.quantity, ing.unit, Number(matched.pricePerUnit), matched.unit);
                }
            }
            return sum;
        }, 0)
        : 0;
    const labourCostNum = parseFloat(formData.labourCost) || 0;
    const totalEstimatedCost = ingredientCost + labourCostNum;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (dishType === 'RECIPE') {
            const unlinkedIngredients = ingredients.filter(ing => ing.ingredientName && ing.quantity > 0 && !ing.ingredientId);
            if (unlinkedIngredients.length > 0) {
                const confirmMsg = `You have ${unlinkedIngredients.length} ingredient(s) not in the Global Sub Items list:\n\n` +
                    unlinkedIngredients.map(ing => `- ${ing.ingredientName}`).join('\n') +
                    `\n\nAdd them automatically? (Price will be set to 0)`;
                if (window.confirm(confirmMsg)) {
                    setLoading(true);
                    const newMappings: Record<string, string> = {};
                    for (const unlinked of unlinkedIngredients) {
                        try {
                            const res = await addIngredient({ name: unlinked.ingredientName, pricePerUnit: 0, unit: unlinked.unit || 'g' });
                            if (res.success && res.data) newMappings[unlinked.ingredientName] = res.data.id;
                        } catch {}
                    }
                    const updatedIngredients = ingredients.map(ing =>
                        !ing.ingredientId && newMappings[ing.ingredientName]
                            ? { ...ing, ingredientId: newMappings[ing.ingredientName] }
                            : ing
                    );
                    await saveDish(updatedIngredients);
                    return;
                }
            }
        }

        await saveDish(ingredients);
    };

    const saveDish = async (finalIngredients: Ingredient[]) => {
        setLoading(true);
        setError('');
        try {
            const data: any = {
                name: formData.name,
                description: formData.description,
                category: formData.category,
                dishType,
                isVeg: formData.isVeg,
                imageUrl: formData.imageUrl || undefined,
                priceUnit: formData.priceUnit,
                pricePerPlate: formData.pricePerPlate ? parseFloat(formData.pricePerPlate) : 0,
                sellingPricePerPlate: formData.sellingPricePerPlate ? parseFloat(formData.sellingPricePerPlate) : 0,
            };

            if (dishType === 'RECIPE') {
                data.labourCost = labourCostNum;
                data.ingredients = finalIngredients
                    .filter(ing => ing.ingredientName && ing.quantity > 0)
                    .map(ing => ({
                        ingredientName: ing.ingredientName,
                        quantity: ing.quantity,
                        unit: ing.unit,
                        ingredientId: ing.ingredientId || undefined,
                    }));
            } else {
                data.labourCost = 0;
                data.ingredients = [];
            }

            const result = isEdit && initialData?.id
                ? await updateDish(initialData.id, data)
                : await createDish(data);

            if (result.success) {
                dispatch(api.util.invalidateTags(['Dish']));
                router.push('/dishes');
            } else {
                setError(result.error || 'Failed to save dish');
            }
        } catch (err) {
            setError('An error occurred while saving');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                        {isEdit ? 'Edit Dish' : 'Create New Dish'}
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        {isEdit ? 'Update dish details' : 'Add a new dish to your menu'}
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 sm:flex-initial px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 inline mr-2" />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 sm:flex-initial px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                        <Save className="w-4 h-4 inline mr-2" />
                        {loading ? 'Saving...' : 'Save Dish'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Dish Type Selector */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">Dish Type</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {DISH_TYPES.map(({ value, label, desc, icon: Icon, color }) => {
                        const selected = dishType === value;
                        const colorMap: Record<string, string> = {
                            indigo: selected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300',
                            amber: selected ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-amber-300',
                            emerald: selected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300',
                        };
                        const iconColor: Record<string, string> = {
                            indigo: selected ? 'text-indigo-600' : 'text-slate-400',
                            amber: selected ? 'text-amber-600' : 'text-slate-400',
                            emerald: selected ? 'text-emerald-600' : 'text-slate-400',
                        };
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setDishType(value)}
                                className={`p-4 rounded-lg border-2 text-left transition-all ${colorMap[color]}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className={`w-4 h-4 ${iconColor[color]}`} />
                                    <span className="text-sm font-semibold text-slate-900">{label}</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Dish Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            placeholder="e.g., Beef Biriyani"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                        <select
                            required
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Veg / Non-Veg</label>
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={formData.isVeg} onChange={() => setFormData({ ...formData, isVeg: true })} className="text-emerald-600 focus:ring-emerald-600" />
                                <span className="text-sm">🟢 Vegetarian</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={!formData.isVeg} onChange={() => setFormData({ ...formData, isVeg: false })} className="text-red-600 focus:ring-red-600" />
                                <span className="text-sm">🔴 Non-Veg</span>
                            </label>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            rows={2}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
                            placeholder="Brief description"
                        />
                    </div>
                </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">
                    {dishType === 'LIVE' ? 'Price Unit' : 'Pricing'}
                </h2>

                {dishType === 'LIVE' && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                        Live counter pricing is entered per enquiry. No master price needed.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Price Unit</label>
                        <select
                            value={formData.priceUnit}
                            onChange={e => setFormData({ ...formData, priceUnit: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        >
                            {priceUnits.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                        </select>
                    </div>

                    {dishType !== 'LIVE' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {dishType === 'RECIPE' ? 'Base Price' : 'Cost Price'}
                                    <span className="text-slate-400 font-normal ml-1">({formData.priceUnit})</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                                    <input
                                        type="number" step="0.01" min="0"
                                        value={formData.pricePerPlate}
                                        onChange={e => setFormData({ ...formData, pricePerPlate: e.target.value })}
                                        className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Selling Price <span className="text-slate-400 font-normal">({formData.priceUnit})</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                                    <input
                                        type="number" step="0.01" min="0"
                                        value={formData.sellingPricePerPlate}
                                        onChange={e => setFormData({ ...formData, sellingPricePerPlate: e.target.value })}
                                        className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Recipe: Ingredients + Labour Cost */}
            {dishType === 'RECIPE' && (
                <>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold text-slate-900">Ingredients</h2>
                            <button
                                type="button"
                                onClick={handleAddIngredient}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg transition-colors text-sm font-medium"
                            >
                                <Plus className="w-4 h-4 inline mr-1" />
                                Add Ingredient
                            </button>
                        </div>

                        <div className="space-y-3">
                            {ingredients.map((ing, index) => (
                                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 border border-slate-200 rounded-lg">
                                    <div className="sm:col-span-5 relative">
                                        <input
                                            type="text"
                                            list="global-ingredients"
                                            value={ing.ingredientName}
                                            onChange={e => handleIngredientChange(index, 'ingredientName', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                                            placeholder="Ingredient name"
                                        />
                                        <datalist id="global-ingredients">
                                            {globalIngredients.map((g: any) => <option key={g.id} value={g.name} />)}
                                        </datalist>
                                        {ing.ingredientId && (
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-emerald-600">✓</span>
                                        )}
                                    </div>
                                    <div className="sm:col-span-3">
                                        <input
                                            type="number" step="0.01" min="0"
                                            value={ing.quantity}
                                            onChange={e => handleIngredientChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                                            placeholder="Qty"
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        {(() => {
                                            const matchedGlobal = ing.ingredientId
                                                ? globalIngredients.find((g: any) => g.id === ing.ingredientId)
                                                : null;
                                            const availableUnits = matchedGlobal ? getAvailableUnitsForGlobal(matchedGlobal.unit) : units;
                                            return (
                                                <select
                                                    value={ing.unit}
                                                    onChange={e => handleIngredientChange(index, 'unit', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                                                >
                                                    {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
                                                </select>
                                            );
                                        })()}
                                    </div>
                                    <div className="sm:col-span-1 flex items-center justify-center">
                                        <button type="button" onClick={() => handleRemoveIngredient(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {ingredients.length === 0 && (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    No ingredients added yet. Click "Add Ingredient" to get started.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Labour Cost + Cost Preview */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Labour Cost & Cost Preview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Labour Cost <span className="text-slate-400 font-normal">({formData.priceUnit})</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                                    <input
                                        type="number" step="0.01" min="0"
                                        value={formData.labourCost}
                                        onChange={e => setFormData({ ...formData, labourCost: e.target.value })}
                                        className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Chef / cooking labour cost per serving</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>Ingredient Cost</span>
                                    <span>₹{ingredientCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Labour Cost</span>
                                    <span>₹{labourCostNum.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-200 pt-2">
                                    <span>Estimated Cost / Serving</span>
                                    <span>₹{totalEstimatedCost.toFixed(2)}</span>
                                </div>
                                {ingredientCost === 0 && ingredients.some(i => !i.ingredientId) && (
                                    <p className="text-xs text-amber-600 mt-1">Some ingredients aren't linked to the global list — their cost isn't included.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Image URL */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Image (Optional)</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                    <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>
            </div>
        </form>
    );
}
