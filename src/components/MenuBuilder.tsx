'use client';

import { useState, useMemo } from 'react';
import { Dish, MenuTemplate } from '@/lib/types';
import { dishes, menuTemplates, dishCategories } from '@/lib/data';
import { Plus, Minus, Search, Trash2, ChevronDown, ChevronUp, Sparkles, ChefHat } from 'lucide-react';

interface MenuBuilderProps {
    initialMenu?: { dishId: string; quantity: number }[];
    onSave?: (menu: { dishId: string; quantity: number }[]) => void;
    guestCount?: number;
}

export default function MenuBuilder({ initialMenu = [], onSave, guestCount = 100 }: MenuBuilderProps) {
    const [selectedDishes, setSelectedDishes] = useState<Record<string, number>>(
        initialMenu.reduce((acc, item) => ({ ...acc, [item.dishId]: item.quantity }), {})
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        'starters': true,
        'main_course': true,
    });

    const availableDishes = useMemo(() => {
        return dishes.filter(dish =>
            (activeCategory === 'all' || dish.category === activeCategory) &&
            (dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                dish.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery, activeCategory]);

    const selectedDishObjects = useMemo(() => {
        return Object.keys(selectedDishes).map(id => {
            const dish = dishes.find(d => d.id === id);
            return dish ? { ...dish, quantity: selectedDishes[id] } : null;
        }).filter(Boolean) as (Dish & { quantity: number })[];
    }, [selectedDishes]);

    const totalCost = selectedDishObjects.reduce((sum, dish) => sum + (dish.estimatedCostPerPlate * dish.quantity), 0);
    const totalSellingPrice = selectedDishObjects.reduce((sum, dish) => sum + (dish.sellingPricePerPlate * dish.quantity), 0);

    const toggleDish = (dishId: string) => {
        setSelectedDishes(prev => {
            const newDishes = { ...prev };
            if (newDishes[dishId]) {
                delete newDishes[dishId];
            } else {
                newDishes[dishId] = guestCount;
            }
            return newDishes;
        });
    };

    const updateQuantity = (dishId: string, delta: number) => {
        setSelectedDishes(prev => {
            const currentQty = prev[dishId] || 0;
            const newQty = Math.max(0, currentQty + delta);
            if (newQty === 0) {
                const { [dishId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [dishId]: newQty };
        });
    };

    const applyTemplate = (template: MenuTemplate) => {
        const newSelection: Record<string, number> = {};
        template.dishIds.forEach(id => {
            newSelection[id] = guestCount;
        });
        setSelectedDishes(newSelection);
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
            {/* Left Panel: Dish Selection */}
            <div className="flex-1 flex flex-col min-h-0 bg-white border border-zinc-200">
                {/* Search and Filter */}
                <div className="p-4 border-b border-zinc-200 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search dishes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 focus:outline-none focus:border-zinc-900"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === 'all'
                                ? 'bg-zinc-900 text-white'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                }`}
                        >
                            All Items
                        </button>
                        {dishCategories.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setActiveCategory(cat.value)}
                                className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === cat.value
                                    ? 'bg-zinc-900 text-white'
                                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dish List */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        {availableDishes.map(dish => {
                            const isSelected = !!selectedDishes[dish.id];
                            return (
                                <div
                                    key={dish.id}
                                    className={`relative flex items-start gap-3 p-3 border transition-all cursor-pointer hover:border-zinc-300 ${isSelected ? 'bg-zinc-50 border-zinc-900 ring-1 ring-zinc-900' : 'bg-white border-zinc-200'
                                        }`}
                                    onClick={() => toggleDish(dish.id)}
                                >
                                    <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${dish.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-sm font-semibold text-zinc-900 truncate">{dish.name}</h3>
                                            <span className="text-xs font-medium text-zinc-500">₹{dish.sellingPricePerPlate}</span>
                                        </div>
                                        <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">{dish.description}</p>
                                        {isSelected && (
                                            <div className="mt-3 flex items-center gap-3" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center border border-zinc-300 bg-white">
                                                    <button
                                                        className="p-1 hover:bg-zinc-100 text-zinc-600"
                                                        onClick={() => updateQuantity(dish.id, -10)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-12 text-center text-xs font-medium">{selectedDishes[dish.id]}</span>
                                                    <button
                                                        className="p-1 hover:bg-zinc-100 text-zinc-600"
                                                        onClick={() => updateQuantity(dish.id, 10)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <span className="text-xs text-zinc-400">plates</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right Panel: Selected Menu & Templates */}
            <div className="w-full lg:w-96 flex flex-col gap-6">
                {/* Templates */}
                <div className="bg-white border border-zinc-200 p-4">
                    <h3 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        Quick Templates
                    </h3>
                    <div className="space-y-2">
                        {menuTemplates.slice(0, 3).map(template => (
                            <button
                                key={template.id}
                                onClick={() => applyTemplate(template)}
                                className="w-full text-left p-2.5 text-xs hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-zinc-700 group-hover:text-zinc-900">{template.name}</span>
                                    <span className="text-zinc-400 group-hover:text-zinc-600">Apply</span>
                                </div>
                                <p className="text-zinc-400 truncate mt-0.5">{template.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Selected Menu Summary */}
                <div className="flex-1 bg-white border border-zinc-200 flex flex-col min-h-0">
                    <div className="p-4 border-b border-zinc-200 bg-zinc-50">
                        <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                            <ChefHat className="h-4 w-4" />
                            Current Menu
                            <span className="ml-auto bg-zinc-900 text-white text-xs px-2 py-0.5 rounded-full">
                                {selectedDishObjects.length} items
                            </span>
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {selectedDishObjects.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500">
                                <p className="text-sm">No dishes selected</p>
                                <p className="text-xs mt-1">Select dishes from the left to build your menu</p>
                            </div>
                        ) : (
                            Object.keys(expandedCategories).map(catKey => {
                                const catDishes = selectedDishObjects.filter(d => d.category === catKey);
                                if (catDishes.length === 0) return null;

                                const catLabel = dishCategories.find(c => c.value === catKey)?.label || catKey;

                                return (
                                    <div key={catKey} className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 bg-zinc-50 px-2 py-1">
                                            <span>{catLabel}</span>
                                            <span>{catDishes.length}</span>
                                        </div>
                                        {catDishes.map(dish => (
                                            <div key={dish.id} className="flex items-center justify-between text-sm pl-2">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dish.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                    <span className="truncate text-zinc-700">{dish.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-xs text-zinc-400">x{dish.quantity}</span>
                                                    <button onClick={() => toggleDish(dish.id)} className="text-zinc-400 hover:text-red-500">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })
                        )}
                        {/* Catch-all for other categories not expanded explicitly in my mocked initial state, 
                ideally I'd dynamically generate this based on selected items. 
                For now, let's keep it simple and just list them all flat if I don't group perfectly.
                Actually, let's group dynamically.
            */}
                        {dishCategories.filter(c => !expandedCategories[c.value]).map(cat => {
                            const catDishes = selectedDishObjects.filter(d => d.category === cat.value);
                            if (catDishes.length === 0) return null;
                            return (
                                <div key={cat.value} className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 bg-zinc-50 px-2 py-1">
                                        <span>{cat.label}</span>
                                        <span>{catDishes.length}</span>
                                    </div>
                                    {catDishes.map(dish => (
                                        <div key={dish.id} className="flex items-center justify-between text-sm pl-2">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dish.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                <span className="truncate text-zinc-700">{dish.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-xs text-zinc-400">x{dish.quantity}</span>
                                                <button onClick={() => toggleDish(dish.id)} className="text-zinc-400 hover:text-red-500">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-4 border-t border-zinc-200 bg-zinc-50 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Estimated Cost</span>
                            <span className="font-medium text-zinc-900">₹{totalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Selling Price</span>
                            <span className="font-medium text-emerald-600">₹{totalSellingPrice.toLocaleString()}</span>
                        </div>
                        <div className="pt-2">
                            <div className="flex justify-between text-xs text-zinc-400 mb-2">
                                <span>Profit Margin</span>
                                <span>{totalSellingPrice > 0 ? Math.round(((totalSellingPrice - totalCost) / totalSellingPrice) * 100) : 0}%</span>
                            </div>
                            <button
                                onClick={() => onSave?.(Object.entries(selectedDishes).map(([dishId, quantity]) => ({ dishId, quantity })))}
                                className="w-full bg-zinc-900 text-white py-2.5 font-medium hover:bg-zinc-800"
                            >
                                Save Menu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
