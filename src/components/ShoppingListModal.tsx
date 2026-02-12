'use client';

import { useState } from 'react';
import {
    X,
    ShoppingCart,
    Check,
    Share2,
    FileText,
    CalendarDays,
    Store,
    ChevronRight,
    Package
} from 'lucide-react';
import { Event, InventoryItem } from '@/lib/types';
import { formatCurrency } from '@/lib/data';

interface ShoppingListModalProps {
    isOpen: boolean;
    onClose: () => void;
    events: Event[];
    inventory: InventoryItem[];
}

interface ShoppingItem {
    name: string;
    qtyNeeded: number;
    qtyInStock: number;
    qtyToBuy: number;
    unit: string;
    category: string;
    isPerishable: boolean; // 'on_demand' items
}

export default function ShoppingListModal({ isOpen, onClose, events, inventory }: ShoppingListModalProps) {
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [generatedList, setGeneratedList] = useState<ShoppingItem[] | null>(null);

    if (!isOpen) return null;

    const selectedEvent = events.find(e => e.id === selectedEventId);

    const generateList = () => {
        if (!selectedEvent) return;

        // This is a simplified "Mock" generation logic.
        // In a real app, you would parse the recipes of the event's selected dishes.
        // For this demo, we will simulate a list based on event type and size.

        // Simulating needed items based on mock logic for demonstration
        // "We need 0.5kg of Rice per guest" -> Mock formula

        const mockItems: ShoppingItem[] = [];
        const guests = selectedEvent.guests;

        // 1. Grains (Stocked)
        const riceNeed = (guests * 0.2); // 200g per person
        const riceStock = inventory.find(i => i.name.includes('Rice'));
        if (riceStock) {
            mockItems.push({
                name: riceStock.name,
                qtyNeeded: riceNeed,
                qtyInStock: riceStock.quantity,
                qtyToBuy: Math.max(0, riceNeed - riceStock.quantity),
                unit: riceStock.unit,
                category: 'Grains',
                isPerishable: false
            });
        }

        // 2. Meat (On Demand - Always Buy)
        const chickenNeed = (guests * 0.25); // 250g per person
        const chickenStock = inventory.find(i => i.name.includes('Chicken'));
        if (chickenStock) {
            mockItems.push({
                name: chickenStock.name,
                qtyNeeded: chickenNeed,
                qtyInStock: 0, // Always 0 for on_demand
                qtyToBuy: chickenNeed,
                unit: chickenStock.unit,
                category: 'Meat',
                isPerishable: true
            });
        }

        // 3. Vegetables (On Demand)
        const onionNeed = (guests * 0.1);
        const onionStock = inventory.find(i => i.name.includes('Onion'));
        if (onionStock) {
            mockItems.push({
                name: onionStock.name,
                qtyNeeded: onionNeed,
                qtyInStock: 0,
                qtyToBuy: onionNeed,
                unit: onionStock.unit,
                category: 'Vegetables',
                isPerishable: true
            });
        }

        // 4. Oil (Stocked)
        const oilNeed = (guests * 0.05);
        const oilStock = inventory.find(i => i.name.includes('Oil'));
        if (oilStock) {
            mockItems.push({
                name: oilStock.name,
                qtyNeeded: oilNeed,
                qtyInStock: oilStock.quantity,
                qtyToBuy: Math.max(0, oilNeed - oilStock.quantity),
                unit: oilStock.unit,
                category: 'Oils',
                isPerishable: false
            });
        }

        setGeneratedList(mockItems);
    };

    const shareToWhatsApp = () => {
        if (!generatedList || !selectedEvent) return;

        let message = `*Shopping List for ${selectedEvent.name} (${selectedEvent.guests} Guests)*\n\n`;

        const toBuyList = generatedList.filter(i => i.qtyToBuy > 0);

        if (toBuyList.length > 0) {
            message += `*🛒 MARKET LIST (To Buy):*\n`;
            toBuyList.forEach(item => {
                message += `- ${item.name}: ${item.qtyToBuy.toFixed(1)}${item.unit}\n`;
            });
        }

        const godownList = generatedList.filter(i => !i.isPerishable && i.qtyInStock > 0);
        if (godownList.length > 0) {
            message += `\n*📦 GODOWN CHECKLIST (Take from Stock):*\n`;
            godownList.forEach(item => {
                const take = Math.min(item.qtyNeeded, item.qtyInStock);
                if (take > 0) {
                    message += `- ${item.name}: Take ${take.toFixed(1)}${item.unit} (Stock: ${item.qtyInStock})\n`;
                }
            });
        }

        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Smart Shopping List</h3>
                            <p className="text-sm text-slate-500">Generate market lists based on inventory</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">

                    {!generatedList ? (
                        <div className="space-y-6">
                            <label className="block text-sm font-medium text-slate-700">Select Event to Plan For</label>
                            <div className="grid gap-3">
                                {events.filter(e => e.status !== 'completed' && e.status !== 'cancelled').map(event => (
                                    <button
                                        key={event.id}
                                        onClick={() => setSelectedEventId(event.id)}
                                        className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${selectedEventId === event.id
                                                ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500/20'
                                                : 'bg-white border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-900">{event.name}</p>
                                            <p className="text-sm text-slate-500">{new Date(event.date).toLocaleDateString()} • {event.guests} Guests</p>
                                        </div>
                                        {selectedEventId === event.id && <Check className="w-5 h-5 text-indigo-600" />}
                                    </button>
                                ))}
                            </div>

                            <button
                                disabled={!selectedEventId}
                                onClick={generateList}
                                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                <FileText className="w-5 h-5" /> Generate List
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Market List Section */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
                                    <Store className="w-5 h-5 text-emerald-600" />
                                    <h4 className="font-bold text-emerald-900">Market List (To Buy)</h4>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {generatedList.filter(i => i.qtyToBuy > 0).map((item, idx) => (
                                        <div key={idx} className="p-4 flex justify-between items-center group hover:bg-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                                <span className="font-medium text-slate-900">{item.name}</span>
                                            </div>
                                            <span className="font-bold text-slate-900 bg-emerald-100/50 text-emerald-700 px-3 py-1 rounded-lg">
                                                {item.qtyToBuy.toFixed(1)} {item.unit}
                                            </span>
                                        </div>
                                    ))}
                                    {generatedList.filter(i => i.qtyToBuy > 0).length === 0 && (
                                        <p className="p-6 text-center text-slate-400 text-sm">Nothing to buy! You have everything.</p>
                                    )}
                                </div>
                            </div>

                            {/* Godown List Section */}
                            {generatedList.some(i => !i.isPerishable && i.qtyNeeded > 0) && (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden opacity-90">
                                    <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-amber-600" />
                                        <h4 className="font-bold text-amber-900">Godown Checklist (Take from Stock)</h4>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {generatedList.filter(i => !i.isPerishable && i.qtyNeeded > 0).map((item, idx) => {
                                            const take = Math.min(item.qtyNeeded, item.qtyInStock);
                                            if (take <= 0) return null;
                                            return (
                                                <div key={idx} className="p-4 flex justify-between items-center text-sm">
                                                    <span className="text-slate-700">{item.name}</span>
                                                    <div className="text-right">
                                                        <span className="font-semibold text-amber-700">Take {take.toFixed(1)} {item.unit}</span>
                                                        <p className="text-xs text-slate-400">Stock: {item.qtyInStock}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 rounded-b-2xl">
                    {generatedList ? (
                        <>
                            <button onClick={() => setGeneratedList(null)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">
                                Back
                            </button>
                            <button onClick={shareToWhatsApp} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-lg shadow-emerald-200 flex items-center gap-2">
                                <Share2 className="w-5 h-5" /> Share WhatsApp
                            </button>
                        </>
                    ) : (
                        <button onClick={onClose} className="px-5 py-2.5 text-slate-500 font-medium hover:bg-slate-50 rounded-lg">
                            Cancel
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
