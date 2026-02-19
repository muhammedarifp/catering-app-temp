import PageLayout from '@/components/PageLayout';
import { getDishById } from '@/lib/actions/dishes';
import { ArrowLeft, DollarSign, Edit, TrendingUp, Utensils } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function DishDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getDishById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    const dish = result.data;
    const margin = dish.sellingPricePerPlate - dish.estimatedCostPerPlate;
    const marginPercent = dish.sellingPricePerPlate > 0
        ? Math.round((margin / dish.sellingPricePerPlate) * 100)
        : 0;

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
                            <p className="text-zinc-500 capitalize">
                                {dish.category.replace('_', ' ')} &bull; Added on {new Date(dish.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <Link href={`/dishes/${dish.id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 font-medium rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all">
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit Dish</span>
                    </Link>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Left Column (2/3) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Description */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-2">About this Dish</h2>
                            <p className="text-zinc-600 leading-relaxed">
                                {dish.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Ingredients Table */}
                        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                                <h2 className="font-semibold text-zinc-900 flex items-center gap-2">
                                    <Utensils className="w-4 h-4 text-zinc-500" />
                                    Ingredients
                                </h2>
                                <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                                    {dish.ingredients?.length || 0} items
                                </span>
                            </div>
                            {dish.ingredients && dish.ingredients.length > 0 ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-zinc-500 font-medium border-b border-zinc-100 bg-zinc-50">
                                        <tr>
                                            <th className="px-4 py-3">Ingredient</th>
                                            <th className="px-4 py-3">Quantity</th>
                                            <th className="px-4 py-3">Unit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {dish.ingredients.map((ing: any) => (
                                            <tr key={ing.id} className="hover:bg-zinc-50">
                                                <td className="px-4 py-3 font-medium text-zinc-900">{ing.ingredientName}</td>
                                                <td className="px-4 py-3 text-zinc-600">{ing.quantity}</td>
                                                <td className="px-4 py-3 text-zinc-500">{ing.unit}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-zinc-400 text-sm">No ingredients added.</div>
                            )}
                        </div>

                    </div>

                    {/* Right Column: Economics (1/3) */}
                    <div className="space-y-6">
                        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 bg-zinc-900 text-white">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" /> Economics
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Selling Price</p>
                                    <div className="text-3xl font-bold text-zinc-900">₹{dish.sellingPricePerPlate}</div>
                                    <p className="text-xs text-zinc-400">per plate</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Cost</p>
                                        <p className="font-semibold text-zinc-900">₹{dish.estimatedCostPerPlate}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Margin</p>
                                        <p className={`font-bold ${marginPercent > 30 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {marginPercent}%
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
                    </div>

                </div>
            </div>
        </PageLayout>
    );
}
