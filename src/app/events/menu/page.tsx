'use client';

import PageLayout from '@/components/PageLayout';
import MenuBuilder from '@/components/MenuBuilder';
import { useRouter } from 'next/navigation';

export default function MenuBuilderPage() {
    const router = useRouter();

    const handleSave = (menu: { dishId: string; quantity: number }[]) => {
        // In a real app, this would save to backend
        console.log('Saving menu:', menu);
        alert('Menu saved successfully! (Mock)');
        router.back();
    };

    return (
        <PageLayout currentPath="/events/menu">
            <div className="p-4 lg:p-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
                <div className="mb-6 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Menu Builder</h1>
                        <p className="text-sm text-zinc-500">Design the perfect menu for your event</p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-50"
                    >
                        Cancel
                    </button>
                </div>

                <div className="flex-1 min-h-0">
                    <MenuBuilder onSave={handleSave} />
                </div>
            </div>
        </PageLayout>
    );
}
