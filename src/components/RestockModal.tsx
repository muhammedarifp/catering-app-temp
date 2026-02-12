'use client';

import { useState, useEffect } from 'react';
import { X, Plus, IndianRupee, Save } from 'lucide-react';
import { InventoryItem } from '@/lib/types';
import { purchaseStock } from '@/lib/inventoryStorage';

interface RestockModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem | null;
    onSuccess: () => void;
}

export default function RestockModal({ isOpen, onClose, item, onSuccess }: RestockModalProps) {
    const [quantity, setQuantity] = useState('');
    const [cost, setCost] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setQuantity('');
            setCost('');
        }
    }, [isOpen]);

    if (!isOpen || !item) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const qty = parseFloat(quantity);
        const totalCost = parseFloat(cost);

        if (isNaN(qty) || qty <= 0) {
            alert('Please enter a valid quantity');
            setIsLoading(false);
            return;
        }

        try {
            purchaseStock(item.id, qty, isNaN(totalCost) ? 0 : totalCost);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Restock failed', error);
            alert('Failed to update stock');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                    <h3 className="font-bold text-zinc-900">Restock {item.name}</h3>
                    <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Quantity to Add ({item.unit})</label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                min="0.01"
                                step="0.01"
                                autoFocus
                                className="w-full pl-4 pr-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Total Cost (Optional)</label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={cost}
                                onChange={e => setCost(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">This will be logged as a "Food Cost" expense.</p>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-lg shadow-lg shadow-zinc-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? 'Updating...' : 'Confirm Restock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
