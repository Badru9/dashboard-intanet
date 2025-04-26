import Table from '@/components/Table/Table';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { InternetPackage } from '@/types';
import { TableColumn } from '@/types/table';
import { Head } from '@inertiajs/react';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

export default function InternetPackagesIndex() {
    const [packages, setPackages] = useState<InternetPackage[]>([]);

    useEffect(() => {
        // Fetch data from backend
        fetch('/api/internet-packages')
            .then((res) => res.json())
            .then((data) => setPackages(data));
    }, []);

    const columns: TableColumn<InternetPackage>[] = [
        {
            header: 'Name',
            value: 'name',
        },
        {
            header: 'Speed',
            value: 'speed',
        },
        {
            header: 'Price',
            value: (data) => `Rp ${data.price.toLocaleString()}`,
        },
        {
            header: 'Description',
            value: 'description',
        },
        {
            header: 'Actions',
            value: (data) => (
                <div className="flex gap-2">
                    <button className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(data.id)}>
                        <PencilSimple size={20} />
                    </button>
                    <button className="rounded-lg p-2 text-red-600 hover:bg-red-50" onClick={() => handleDelete(data.id)}>
                        <Trash size={20} />
                    </button>
                </div>
            ),
        },
    ];

    const handleEdit = (id: number) => {
        // Handle edit action
        console.log('Edit package:', id);
    };

    const handleDelete = (id: number) => {
        // Handle delete action
        console.log('Delete package:', id);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Internet Packages" />
            <div className="p-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">Internet Packages</h1>
                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Add Package</button>
                </div>
                <div className="rounded-lg bg-white shadow">
                    <Table<InternetPackage> data={packages} column={columns} className="w-full" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
