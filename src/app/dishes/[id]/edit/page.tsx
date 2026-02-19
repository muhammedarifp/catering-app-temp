import PageLayout from '@/components/PageLayout';
import DishForm from '@/components/DishForm';
import { getDishById } from '@/lib/actions/dishes';
import { notFound } from 'next/navigation';

export default async function EditDishPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getDishById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    return (
        <PageLayout currentPath="/dishes">
            <div className="p-4 lg:p-8">
                <DishForm initialData={result.data} isEdit={true} />
            </div>
        </PageLayout>
    );
}
