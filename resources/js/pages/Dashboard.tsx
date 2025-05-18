import InterpolationChart from '@/components/Chart/InterpolationChart';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"> */}
            <div className="flex w-full flex-col gap-4 p-10">
                <InterpolationChart />
            </div>
        </AuthenticatedLayout>
    );
}
