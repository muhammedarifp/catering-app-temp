import { useState } from 'react';
import { X, Plus, Minus, UserCog, Users } from 'lucide-react';
import { StaffRole } from '@/lib/types';

interface AutoAssignStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (requirements: Partial<Record<StaffRole, number>>) => void;
}

const ROLES: { id: StaffRole; label: string }[] = [
    { id: 'head_chef', label: 'Head Chef' },
    { id: 'chef', label: 'Chef' },
    { id: 'helper', label: 'Kitchen Helper' },
    { id: 'waiter', label: 'Waiter / Server' },
    { id: 'bartender', label: 'Bartender' },
    { id: 'cleaner', label: 'Cleaner' },
    { id: 'supervisor', label: 'Event Supervisor' },
];

export default function AutoAssignStaffModal({
    isOpen,
    onClose,
    onAssign,
}: AutoAssignStaffModalProps) {
    const [requirements, setRequirements] = useState<Partial<Record<StaffRole, number>>>({});

    const updateCount = (role: StaffRole, delta: number) => {
        setRequirements((prev) => {
            const current = prev[role] || 0;
            const newCount = Math.max(0, current + delta);
            if (newCount === 0) {
                const { [role]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [role]: newCount };
        });
    };

    const handleAssign = () => {
        onAssign(requirements);
        onClose();
    };

    const totalStaff = Object.values(requirements).reduce((sum, count) => sum + count, 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 bg-zinc-50/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <UserCog className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900">Auto Assign Staff</h3>
                            <p className="text-xs text-zinc-500">Select staff requirements</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[60vh] overflow-y-auto p-6">
                    <div className="space-y-4">
                        {ROLES.map((role) => {
                            const count = requirements[role.id] || 0;
                            return (
                                <div key={role.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/50 transition-all">
                                    <span className="font-medium text-zinc-700">{role.label}</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => updateCount(role.id, -1)}
                                            className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-colors ${count > 0
                                                    ? 'border-zinc-200 text-zinc-600 hover:bg-white hover:shadow-sm'
                                                    : 'border-zinc-100 text-zinc-300 cursor-not-allowed'
                                                }`}
                                            disabled={count === 0}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-6 text-center font-semibold text-zinc-900">{count}</span>
                                        <button
                                            onClick={() => updateCount(role.id, 1)}
                                            className="h-8 w-8 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-white hover:shadow-sm transition-colors"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-zinc-100 px-6 py-4 bg-zinc-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-600">
                        <Users className="h-4 w-4" />
                        <span className="text-sm font-medium">Total: {totalStaff} Staff</span>
                    </div>
                    <button
                        onClick={handleAssign}
                        disabled={totalStaff === 0}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all ${totalStaff > 0
                                ? 'bg-zinc-900 hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-900/20'
                                : 'bg-zinc-300 cursor-not-allowed'
                            }`}
                    >
                        Assign Selected
                    </button>
                </div>
            </div>
        </div>
    );
}
