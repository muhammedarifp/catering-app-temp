'use client';

import PageLayout from '@/components/PageLayout';
import DishForm from '@/components/DishForm';

export default function CreateDishPage() {
    return (
        <PageLayout currentPath="/dishes">
            <div className="bg-white min-h-[calc(100vh-64px)] p-4 lg:p-8">
                <DishForm />
            </div>
        </PageLayout>
    );
}
