'use client';

import PageLayout from '@/components/PageLayout';
import { Calculator, Scale, ArrowRight, ChefHat } from 'lucide-react';
import Link from 'next/link';

export default function ToolsPage() {
    return (
        <PageLayout currentPath="/tools">
            <div className="max-w-5xl mx-auto px-4 py-8 lg:px-8 space-y-8">

                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900">Kitchen Tools</h1>
                    <p className="text-sm text-zinc-500">Utilities to help you plan and cost like a pro</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">

                    {/* Cost Estimator Card */}
                    <Link href="/tools/estimator" className="group block">
                        <div className="bg-white rounded-2xl border border-zinc-200 p-6 h-full transition-all hover:border-zinc-300 hover:shadow-md">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-100 transition-colors">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 mb-2">Quick Cost Estimator</h3>
                            <p className="text-sm text-zinc-500 mb-6">
                                Calculate the cost of a new dish idea instantly. Add custom ingredients and see your profit margin in real-time.
                            </p>
                            <div className="flex items-center text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
                                Launch Tool <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </Link>

                    {/* Material Planner Card */}
                    <Link href="/tools/planner" className="group block">
                        <div className="bg-white rounded-2xl border border-zinc-200 p-6 h-full transition-all hover:border-zinc-300 hover:shadow-md">
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                <Scale className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 mb-2">Raw Material Planner</h3>
                            <p className="text-sm text-zinc-500 mb-6">
                                Planning a big event? Enter your guest count and get a rough estimate of how much raw material (Rice, Meat, Oil) you need.
                            </p>
                            <div className="flex items-center text-sm font-medium text-emerald-600 group-hover:gap-2 transition-all">
                                Launch Tool <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </Link>

                </div>

            </div>
        </PageLayout>
    );
}
