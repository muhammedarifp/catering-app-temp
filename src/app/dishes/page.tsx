'use client';

import PageLayout from '@/components/PageLayout';
import BulkUploadModal from '@/components/BulkUploadModal';
import { Plus, Search, Edit, Trash2, Upload, ChefHat, ArrowRight, ChevronDown, ChevronRight, PackageOpen, Zap, Package } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SubItemsList from '@/components/SubItemsList';
import { deleteDish, bulkUploadDishes } from '@/lib/actions/dishes';
import { validateDishesData, transformDishesDataForUpload } from '@/lib/excel';
import { useGetDishesQuery } from '@/store/api';
import { calculateIngredientCost } from '@/lib/utils/units';

export default function DishesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const { data: dishes = [], isLoading: loading, refetch } = useGetDishesQuery({});
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'DISHES' | 'SUB_ITEMS'>('DISHES');
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
    const router = useRouter();

    const toggleRow = (dishId: string) => {
        setExpandedRows(prev => ({
            ...prev,
            [dishId]: !prev[dishId]
        }));
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        const result = await deleteDish(id);
        if (result.success) {
            refetch();
        }
    };

    const handleBulkUpload = async (data: any[]) => {
        const transformedData = transformDishesDataForUpload(data);
        const result = await bulkUploadDishes(transformedData);

        if (result.success) {
            refetch();
        }

        return result;
    };

    const filteredDishes = dishes.filter((dish: any) =>
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <PageLayout currentPath="/dishes">
            <div className="p-4 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Dishes & Recipes</h1>
                        <p className="text-sm text-zinc-500">Manage your culinary catalog and costs</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowBulkUploadModal(true)}
                            className="flex items-center justify-center gap-2 bg-white border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                            <Upload className="h-4 w-4" />
                            Bulk Upload
                        </button>
                        <Link
                            href="/dishes/create"
                            className="flex items-center justify-center gap-2 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                        >
                            <Plus className="h-4 w-4" />
                            New Dish
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-200 mb-6">
                    <button
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'DISHES'
                            ? 'border-zinc-900 text-zinc-900'
                            : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                            }`}
                        onClick={() => setActiveTab('DISHES')}
                    >
                        Dishes
                    </button>
                    <button
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'SUB_ITEMS'
                            ? 'border-zinc-900 text-zinc-900'
                            : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                            }`}
                        onClick={() => setActiveTab('SUB_ITEMS')}
                    >
                        Sub Items (Ingredients)
                    </button>
                </div>

                {activeTab === 'SUB_ITEMS' ? (
                    <SubItemsList />
                ) : (
                    <>
                        {/* Filters */}
                        <div className="bg-white border border-zinc-200 p-4 mb-6 rounded-xl">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Search dishes..."
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 focus:ring-zinc-900 rounded-lg"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="bg-white border border-zinc-200 overflow-hidden rounded-xl">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-50 border-b border-zinc-200">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-zinc-500 w-10"></th>
                                        <th className="px-4 py-3 font-medium text-zinc-500">Dish Name</th>
                                        <th className="px-4 py-3 font-medium text-zinc-500">Category</th>
                                        <th className="px-4 py-3 font-medium text-zinc-500">Type</th>
                                        <th className="px-4 py-3 font-medium text-zinc-500">Dish Type</th>
                                        <th className="px-4 py-3 font-medium text-zinc-500 text-right">Cost / Sell Price</th>
                                        <th className="px-4 py-3 font-medium text-zinc-500 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {filteredDishes.map((dish: any) => {
                                        return (
                                            <React.Fragment key={dish.id}>
                                                <tr className="hover:bg-zinc-50 group border-b border-zinc-100 last:border-0">
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => toggleRow(dish.id)}
                                                            className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
                                                        >
                                                            {expandedRows[dish.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-zinc-900">
                                                        <Link href={`/dishes/${dish.id}`} className="flex items-center gap-3 hover:text-blue-600 transition-colors">
                                                            <div className="h-8 w-8 rounded bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                                                <ChefHat className="h-4 w-4" />
                                                            </div>
                                                            {dish.name}
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-3 text-zinc-500 capitalize">{dish.category.replace('_', ' ')}</td>
                                                    <td className="px-4 py-3">
                                                        <div className={`flex items-center gap-1.5 text-xs font-medium ${dish.isVeg ? 'text-emerald-600' : 'text-red-600'}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                            {dish.isVeg ? 'Veg' : 'Non-Veg'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {dish.dishType === 'LIVE' && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                                                                <Zap className="w-3 h-3" /> Live
                                                            </span>
                                                        )}
                                                        {dish.dishType === 'FIXED' && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                                                                <Package className="w-3 h-3" /> Fixed
                                                            </span>
                                                        )}
                                                        {(dish.dishType === 'RECIPE' || !dish.dishType) && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                                                                <ChefHat className="w-3 h-3" /> Recipe
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-zinc-600">
                                                        {dish.dishType === 'LIVE' ? (
                                                            <span className="text-xs text-amber-600 font-medium italic">Per-event price</span>
                                                        ) : (
                                                            <div className="flex flex-col items-end gap-0.5">
                                                                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{dish.priceUnit || 'per plate'}</span>
                                                                <span className="font-medium">
                                                                    {dish.dishType === 'RECIPE'
                                                                        ? `₹${dish.estimatedCostPerPlate > 0 ? dish.estimatedCostPerPlate : dish.pricePerPlate}`
                                                                        : `₹${dish.pricePerPlate}`}
                                                                    {dish.sellingPricePerPlate > 0 && dish.sellingPricePerPlate !== dish.pricePerPlate && (
                                                                        <span className="text-emerald-600 ml-1.5">→ ₹{dish.sellingPricePerPlate}</span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <a href={`/dishes/${dish.id}`} className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="View Details">
                                                                <ArrowRight className="h-4 w-4" />
                                                            </a>
                                                            <button
                                                                onClick={() => router.push(`/dishes/${dish.id}/edit`)}
                                                                className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded"
                                                                title="Edit"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(dish.id, dish.name)}
                                                                className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedRows[dish.id] && (
                                                    <tr key={`${dish.id}-expanded`} className="bg-zinc-50/50 border-b border-zinc-100 last:border-0">
                                                        <td colSpan={7} className="px-4 py-6 text-sm">
                                                            <div className="max-w-3xl ml-10">
                                                                <h4 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                                                    <PackageOpen className="w-4 h-4 text-zinc-400" />
                                                                    {dish.dishType === 'LIVE' ? 'Live Counter Details' : dish.dishType === 'FIXED' ? 'Fixed Price Details' : 'Ingredients & Cost Breakdown'}
                                                                </h4>
                                                                {dish.dishType === 'LIVE' ? (
                                                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
                                                                        Live counter — price is entered per enquiry. No fixed ingredient cost.
                                                                    </div>
                                                                ) : dish.dishType === 'FIXED' ? (
                                                                    <div className="bg-white border border-zinc-200 rounded-lg p-4">
                                                                        <div className="flex justify-between text-sm">
                                                                            <span className="text-zinc-600">Fixed Price ({dish.priceUnit})</span>
                                                                            <span className="font-semibold text-zinc-900">₹{dish.pricePerPlate}</span>
                                                                        </div>
                                                                        {dish.sellingPricePerPlate > 0 && (
                                                                            <div className="flex justify-between text-sm mt-1">
                                                                                <span className="text-zinc-600">Selling Price</span>
                                                                                <span className="font-semibold text-emerald-600">₹{dish.sellingPricePerPlate}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : dish.ingredients && dish.ingredients.length > 0 ? (
                                                                    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
                                                                        <table className="w-full text-left">
                                                                            <thead className="bg-zinc-50 border-b border-zinc-100">
                                                                                <tr>
                                                                                    <th className="px-4 py-2 font-medium text-zinc-500 text-xs uppercase tracking-wider">Item</th>
                                                                                    <th className="px-4 py-2 font-medium text-zinc-500 text-xs uppercase tracking-wider text-right">Quantity</th>
                                                                                    <th className="px-4 py-2 font-medium text-zinc-500 text-xs uppercase tracking-wider text-right">Unit Price</th>
                                                                                    <th className="px-4 py-2 font-medium text-zinc-500 text-xs uppercase tracking-wider text-right">Total</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-zinc-100">
                                                                                {dish.ingredients.map((ing: any, i: number) => {
                                                                                    const isGlobal = !!ing.ingredientId;
                                                                                    const priceSource = isGlobal ? ing.ingredient?.pricePerUnit : 0;
                                                                                    const cost = isGlobal
                                                                                        ? calculateIngredientCost(Number(ing.quantity), ing.unit, Number(priceSource), ing.ingredient?.unit || ing.unit)
                                                                                        : 0;
                                                                                    return (
                                                                                        <tr key={i}>
                                                                                            <td className="px-4 py-2 text-zinc-900">{ing.ingredientName}</td>
                                                                                            <td className="px-4 py-2 text-zinc-600 text-right">{ing.quantity} {ing.unit}</td>
                                                                                            <td className="px-4 py-2 text-zinc-600 text-right">{isGlobal ? `₹${priceSource}` : '-'}</td>
                                                                                            <td className="px-4 py-2 text-zinc-900 font-medium text-right">{cost > 0 ? `₹${cost.toFixed(2)}` : '-'}</td>
                                                                                        </tr>
                                                                                    );
                                                                                })}
                                                                                {dish.labourCost > 0 && (
                                                                                    <tr className="bg-zinc-50/50">
                                                                                        <td colSpan={3} className="px-4 py-2 text-right text-zinc-500 text-xs">Labour Cost:</td>
                                                                                        <td className="px-4 py-2 text-right text-zinc-600">₹{dish.labourCost}</td>
                                                                                    </tr>
                                                                                )}
                                                                                <tr className="bg-zinc-50 font-medium border-t-2 border-zinc-100">
                                                                                    <td colSpan={3} className="px-4 py-3 text-right text-zinc-700">Estimated Cost / Serving:</td>
                                                                                    <td className="px-4 py-3 text-right text-zinc-900 border-l border-zinc-100">₹{dish.estimatedCostPerPlate}</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-zinc-500 bg-white border border-zinc-200 rounded-lg p-4 text-center">
                                                                        No ingredients documented for this dish.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {filteredDishes.length === 0 && (
                                <div className="p-8 text-center text-zinc-500">
                                    No dishes found matching your search.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Bulk Upload Modal */}
            <BulkUploadModal
                isOpen={showBulkUploadModal}
                onClose={() => setShowBulkUploadModal(false)}
                type="dishes"
                onUpload={handleBulkUpload}
                validateData={validateDishesData}
            />
        </PageLayout>
    );
}
