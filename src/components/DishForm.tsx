'use client';

import { useState } from 'react';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createDish, updateDish } from '@/lib/actions/dishes';
import { addIngredient } from '@/lib/actions/ingredients';
import { api, useGetIngredientsQuery } from '@/store/api';
import { useDispatch } from 'react-redux';
import { calculateIngredientCost, getAvailableUnitsForGlobal } from '@/lib/utils/units';

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

export default function DishForm({ initialData, isEdit = false }: DishFormProps) {
    const router = useRouter();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { data: globalIngredients = [] } = useGetIngredientsQuery({ activeOnly: true });

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        category: initialData?.category || 'Main Course',
        isVeg: initialData?.isVeg !== undefined ? initialData.isVeg : true,
        imageUrl: initialData?.imageUrl || '',
    });

    const [ingredients, setIngredients] = useState<Ingredient[]>(
        initialData?.ingredients || []
    );

    const categories = [
        'Starter',
        'Main Course',
        'Dessert',
        'Bread',
        'Rice',
        'Salad',
        'Beverage',
        'Snack',
    ];

    const units = ['kg', 'g', 'l', 'ml', 'piece', 'cup', 'tbsp', 'tsp'];

    const handleAddIngredient = () => {
        setIngredients([
            ...ingredients,
            { ingredientName: '', quantity: 0, unit: 'g' },
        ]);
    };

    const handleRemoveIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const handleIngredientChange = (
        index: number,
        field: keyof Ingredient,
        value: string | number
    ) => {
        const updated = [...ingredients];
        const item = { ...updated[index], [field]: value };

        // If name changes, try to link to global ingredient
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

    // Auto-calculate estimated cost based on linked ingredients
    const calculatedCost = ingredients.reduce((sum, ing) => {
        if (ing.ingredientId) {
            const matched = globalIngredients.find((g: any) => g.id === ing.ingredientId);
            if (matched) {
                return sum + calculateIngredientCost(ing.quantity, ing.unit, Number(matched.pricePerUnit), matched.unit);
            }
        }
        return sum;
    }, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Find ingredients that are not linked to global sub-items
        const unlinkedIngredients = ingredients.filter(ing => ing.ingredientName && ing.quantity > 0 && !ing.ingredientId);

        if (unlinkedIngredients.length > 0) {
            const confirmMsg = `You have ${unlinkedIngredients.length} ingredient(s) that are not in the Global Sub Items list:\n\n` +
                unlinkedIngredients.map(ing => `- ${ing.ingredientName}`).join('\n') +
                `\n\nDo you want to automatically add them to Global Sub Items? (They will be added with a price of 0)`;

            if (window.confirm(confirmMsg)) {
                setLoading(true);
                // 1. Create missing global ingredients
                let allAddedSuccessfully = true;
                const newIngredientMappings: Record<string, string> = {};

                for (const unlinked of unlinkedIngredients) {
                    try {
                        const res = await addIngredient({
                            name: unlinked.ingredientName,
                            pricePerUnit: 0,
                            unit: unlinked.unit || 'g'
                        });

                        if (res.success && res.data) {
                            newIngredientMappings[unlinked.ingredientName] = res.data.id;
                        } else {
                            allAddedSuccessfully = false;
                            console.error('Failed to add global ingredient:', unlinked.ingredientName, res.error);
                        }
                    } catch (error) {
                        allAddedSuccessfully = false;
                        console.error('Failed to add global ingredient:', unlinked.ingredientName, error);
                    }
                }

                if (!allAddedSuccessfully) {
                    setError('Failed to auto-add some ingredients to Global Sub Items. Please review or add them manually later.');
                }

                // 2. Update the local state with new IDs before saving dish
                const updatedIngredients = ingredients.map(ing => {
                    if (!ing.ingredientId && newIngredientMappings[ing.ingredientName]) {
                        return { ...ing, ingredientId: newIngredientMappings[ing.ingredientName] };
                    }
                    return ing;
                });

                await saveDish(updatedIngredients);
                return;
            }
        }

        // Proceed without auto-adding if there are no unlinked items or user declined
        await saveDish(ingredients);
    };

    const saveDish = async (finalIngredients: Ingredient[]) => {
        setLoading(true);
        setError('');

        try {
            const data = {
                name: formData.name,
                description: formData.description,
                category: formData.category,
                isVeg: formData.isVeg,
                imageUrl: formData.imageUrl || undefined,
                ingredients: finalIngredients.filter(ing => ing.ingredientName && ing.quantity > 0).map(ing => ({
                    ingredientName: ing.ingredientName,
                    quantity: ing.quantity,
                    unit: ing.unit,
                    ingredientId: ing.ingredientId || undefined
                })),
            };

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

            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Dish Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            placeholder="e.g., Butter Chicken"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Category *
                        </label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) =>
                                setFormData({ ...formData, category: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Type
                        </label>
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={formData.isVeg}
                                    onChange={() => setFormData({ ...formData, isVeg: true })}
                                    className="text-emerald-600 focus:ring-emerald-600"
                                />
                                <span className="text-sm">🟢 Vegetarian</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={!formData.isVeg}
                                    onChange={() => setFormData({ ...formData, isVeg: false })}
                                    className="text-red-600 focus:ring-red-600"
                                />
                                <span className="text-sm">🔴 Non-Veg</span>
                            </label>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
                            placeholder="Brief description of the dish"
                        />
                    </div>
                </div>
            </div>


            {/* Ingredients */}
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
                        <div
                            key={index}
                            className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 border border-slate-200 rounded-lg"
                        >
                            <div className="sm:col-span-5 relative">
                                <input
                                    type="text"
                                    list="global-ingredients"
                                    value={ing.ingredientName}
                                    onChange={(e) =>
                                        handleIngredientChange(
                                            index,
                                            'ingredientName',
                                            e.target.value
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                                    placeholder="Ingredient name"
                                />
                                <datalist id="global-ingredients">
                                    {globalIngredients.map((g: any) => (
                                        <option key={g.id} value={g.name} />
                                    ))}
                                </datalist>
                            </div>
                            <div className="sm:col-span-3">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={ing.quantity}
                                    onChange={(e) =>
                                        handleIngredientChange(
                                            index,
                                            'quantity',
                                            parseFloat(e.target.value) || 0
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                                    placeholder="Qty"
                                />
                            </div>
                            <div className="sm:col-span-3">
                                {(() => {
                                    const matchedGlobal = ing.ingredientId
                                        ? globalIngredients.find((g: any) => g.id === ing.ingredientId)
                                        : null;

                                    const availableUnits = matchedGlobal
                                        ? getAvailableUnitsForGlobal(matchedGlobal.unit)
                                        : units;

                                    return (
                                        <select
                                            value={ing.unit}
                                            onChange={(e) =>
                                                handleIngredientChange(index, 'unit', e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                                        >
                                            {availableUnits.map((u) => (
                                                <option key={u} value={u}>
                                                    {u}
                                                </option>
                                            ))}
                                        </select>
                                    );
                                })()}
                            </div>
                            <div className="sm:col-span-1 flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveIngredient(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
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

            {/* Image URL (Optional) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Image (Optional)</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Image URL
                    </label>
                    <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) =>
                            setFormData({ ...formData, imageUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>
            </div>
        </form>
    );
}
