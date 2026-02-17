'use client';

import PageLayout from '@/components/PageLayout';
import BulkUploadModal from '@/components/BulkUploadModal';
import { Plus, Search, Edit, Trash2, Upload, ChefHat, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getDishes, bulkUploadDishes } from '@/lib/actions/dishes';
import { validateDishesData, transformDishesDataForUpload } from '@/lib/excel';

export default function DishesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [dishes, setDishes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

    useEffect(() => {
        loadDishes();
    }, []);

    async function loadDishes() {
        setLoading(true);
        try {
            const result = await getDishes();
            if (result.success && result.data) {
                setDishes(result.data);
            }
        } catch (error) {
            console.error('Failed to load dishes:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleBulkUpload = async (data: any[]) => {
        const transformedData = transformDishesDataForUpload(data);
        const result = await bulkUploadDishes(transformedData);

        if (result.success) {
            loadDishes();
        }

        return result;
    };

    const filteredDishes = dishes.filter(dish =>
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

                {/* Filters */}
                <div className="bg-white border border-zinc-200 p-4 mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search dishes..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 focus:ring-zinc-900"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="bg-white border border-zinc-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th className="px-4 py-3 font-medium text-zinc-500">Dish Name</th>
                                <th className="px-4 py-3 font-medium text-zinc-500">Category</th>
                                <th className="px-4 py-3 font-medium text-zinc-500">Type</th>
                                <th className="px-4 py-3 font-medium text-zinc-500 text-right">Cost</th>
                                <th className="px-4 py-3 font-medium text-zinc-500 text-right">Price</th>
                                <th className="px-4 py-3 font-medium text-zinc-500 text-right">Margin</th>
                                <th className="px-4 py-3 font-medium text-zinc-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredDishes.map(dish => {
                                const margin = dish.sellingPricePerPlate - dish.estimatedCostPerPlate;
                                const marginPercent = Math.round((margin / dish.sellingPricePerPlate) * 100);

                                return (
                                    <tr key={dish.id} className="hover:bg-zinc-50 group">
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
                                        <td className="px-4 py-3 text-right text-zinc-600">₹{dish.estimatedCostPerPlate}</td>
                                        <td className="px-4 py-3 text-right font-medium text-zinc-900">₹{dish.sellingPricePerPlate}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`inline-block px-1.5 py-0.5 text-xs font-semibold rounded ${marginPercent >= 50 ? 'bg-emerald-100 text-emerald-700' :
                                                marginPercent >= 30 ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {marginPercent}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a href={`/dishes/${dish.id}`} className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="View Details">
                                                    <ArrowRight className="h-4 w-4" />
                                                </a>
                                                <button className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
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
