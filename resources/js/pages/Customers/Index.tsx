import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

type Customer = {
    id: number;
    name: string;
    status: 'active' | 'inactive' | 'paused';
    package: string;
    address: string;
    phone: string;
    joinDate: string;
};

const customers: Customer[] = [
    {
        id: 1,
        name: 'John Doe',
        status: 'active',
        package: 'Pro Plan',
        address: 'Jl. Sudirman No. 123, Jakarta',
        phone: '081234567890',
        joinDate: '2024-01-15',
    },
    {
        id: 2,
        name: 'Jane Smith',
        status: 'active',
        package: 'Business Plan',
        address: 'Jl. Thamrin No. 45, Jakarta',
        phone: '081234567891',
        joinDate: '2024-02-20',
    },
    {
        id: 3,
        name: 'Robert Johnson',
        status: 'paused',
        package: 'Basic Plan',
        address: 'Jl. Gatot Subroto No. 67, Jakarta',
        phone: '081234567892',
        joinDate: '2024-03-10',
    },
    {
        id: 4,
        name: 'Emily Davis',
        status: 'inactive',
        package: 'Pro Plan',
        address: 'Jl. Kuningan No. 89, Jakarta',
        phone: '081234567893',
        joinDate: '2024-01-05',
    },
];

const statusColors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-red-100 text-red-700',
    paused: 'bg-yellow-100 text-yellow-700',
};

export default function CustomersIndex() {
    return (
        <AuthenticatedLayout>
            <Head title="Customers" />

            <div className="space-y-6">
                {/* Header with Search and Action */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
                        <p className="mt-1 text-sm text-gray-500">Manage your customer accounts</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <i className="feather-search absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search customers..."
                                className="rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm text-slate-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                            />
                        </div>
                        <button className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600">
                            <i className="feather-user-plus h-4 w-4" />
                            Add Customer
                        </button>
                    </div>
                </div>

                {/* Customers Table */}
                <div className="rounded-xl bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Package</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Address</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Phone</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Join Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="border-b border-gray-200 last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-100">
                                                    <img
                                                        src={`https://ui-avatars.com/api/?name=${customer.name}&background=random`}
                                                        alt={customer.name}
                                                        className="h-full w-full rounded-full"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{customer.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[customer.status]}`}
                                            >
                                                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{customer.package}</td>
                                        <td className="px-6 py-4 text-gray-600">{customer.address}</td>
                                        <td className="px-6 py-4 text-gray-600">{customer.phone}</td>
                                        <td className="px-6 py-4 text-gray-600">{customer.joinDate}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                                                    <i className="feather-edit-2 h-4 w-4" />
                                                </button>
                                                <button className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                                                    <i className="feather-trash h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
