'use client';

import { useState } from 'react';
import {
    ChefHat,
    Clock,
    CheckCircle2,
    Flame,
    UtensilsCrossed,
    AlertCircle
} from 'lucide-react';
import { getUpcomingEvents, dishes } from '@/lib/data';

export default function KitchenPage() {
    const upcomingEvents = getUpcomingEvents();
    const activeEvent = upcomingEvents[0]; // Logic: Assume first upcoming is "Active"

    // Mock State for cooking status (In a real app, this would sync via WebSocket/DB)
    // Status: 'pending' | 'cooking' | 'ready'
    const [cookingStatus, setCookingStatus] = useState<Record<string, 'pending' | 'cooking' | 'ready'>>({});

    if (!activeEvent) {
        return (
            <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center text-white p-4 text-center">
                <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                    <UtensilsCrossed className="w-12 h-12 text-zinc-500" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Kitchen Offline</h1>
                <p className="text-zinc-400 text-xl">No active events scheduled for today.</p>
            </div>
        );
    }

    // Combine menu items for display
    const allDishIds = [...activeEvent.eventMenu.map(m => m.dishId), ...activeEvent.menuItems];
    const activeDishes = allDishIds.map(id => dishes.find(d => d.id === id)).filter(Boolean);

    const toggleStatus = (dishId: string) => {
        setCookingStatus(prev => {
            const current = prev[dishId] || 'pending';
            let next: 'pending' | 'cooking' | 'ready' = 'cooking';
            if (current === 'pending') next = 'cooking';
            if (current === 'cooking') next = 'ready';
            if (current === 'ready') next = 'pending'; // Reset
            return { ...prev, [dishId]: next };
        });
    };

    return (
        <div className="min-h-screen bg-white">

            {/* High Contrast Header */}
            <div className="bg-black text-white p-6 sticky top-0 z-20 shadow-xl border-b-4 border-yellow-500">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="bg-yellow-500 text-black text-xs font-black px-2 py-1 rounded uppercase tracking-wider">Live Kitchen</span>
                            <span className="text-zinc-400 font-mono text-sm">{new Date().toLocaleTimeString()}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">{activeEvent.name}</h1>
                        <p className="text-xl text-zinc-300 font-medium mt-1">
                            {activeEvent.guests} Guests • {activeEvent.time} Service
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                        <div className="text-center px-4 border-r border-zinc-700">
                            <p className="text-xs text-zinc-500 uppercase">Total Items</p>
                            <p className="text-2xl font-bold">{activeDishes.length}</p>
                        </div>
                        <div className="text-center px-4">
                            <p className="text-xs text-zinc-500 uppercase">Pending</p>
                            <p className="text-2xl font-bold text-yellow-500">
                                {activeDishes.filter(d => !cookingStatus[d!.id] || cookingStatus[d!.id] === 'pending').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* The Kitchen Grid - Accessibility Focused */}
            <div className="max-w-7xl mx-auto p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

                    {activeDishes.map((dish) => {
                        if (!dish) return null;
                        const status = cookingStatus[dish.id] || 'pending';

                        return (
                            <div
                                key={dish.id}
                                onClick={() => toggleStatus(dish.id)}
                                className={`
                            relative overflow-hidden rounded-3xl border-4 p-6 cursor-pointer transition-all active:scale-95 select-none
                            ${status === 'pending' ? 'bg-white border-zinc-200 hover:border-zinc-300' : ''}
                            ${status === 'cooking' ? 'bg-yellow-50 border-yellow-400 shadow-lg ring-4 ring-yellow-100' : ''}
                            ${status === 'ready' ? 'bg-emerald-50 border-emerald-500 opacity-60 grayscale-[0.5]' : ''}
                        `}
                            >
                                {/* Status Label */}
                                <div className="absolute top-0 right-0 p-4">
                                    {status === 'pending' && <span className="bg-zinc-100 text-zinc-500 font-bold px-3 py-1 rounded-full text-sm">PENDING</span>}
                                    {status === 'cooking' && (
                                        <span className="bg-yellow-400 text-black font-bold px-3 py-1 rounded-full text-sm flex items-center gap-2 animate-pulse">
                                            <Flame className="w-4 h-4" /> COOKING
                                        </span>
                                    )}
                                    {status === 'ready' && (
                                        <span className="bg-emerald-500 text-white font-bold px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> READY
                                        </span>
                                    )}
                                </div>

                                <div className="mt-2">
                                    <span className={`text-sm font-bold uppercase tracking-wider mb-2 block ${status === 'cooking' ? 'text-yellow-700' : 'text-zinc-400'}`}>
                                        {dish.category}
                                    </span>
                                    <h3 className={`text-3xl font-black leading-tight mb-4 ${status === 'ready' ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
                                        {dish.name}
                                    </h3>

                                    {/* Quantity (Mock: based on event guests) */}
                                    <div className="flex items-center gap-3">
                                        <div className="bg-black text-white px-4 py-2 rounded-xl">
                                            <span className="text-xs text-zinc-400 block uppercase">Qty</span>
                                            <span className="text-xl font-bold">{(activeEvent.guests * 0.25).toFixed(0)}</span>
                                        </div>
                                        <div className="bg-zinc-100 text-zinc-600 px-4 py-2 rounded-xl border border-zinc-200">
                                            <span className="text-xs text-zinc-400 block uppercase">Prep</span>
                                            <span className="text-xl font-bold">{dish.preparationTime}m</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar (Visual Flair) */}
                                {status === 'cooking' && (
                                    <div className="absolute bottom-0 left-0 w-full h-2 bg-yellow-200">
                                        <div className="h-full bg-yellow-500 animate-progress origin-left"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
