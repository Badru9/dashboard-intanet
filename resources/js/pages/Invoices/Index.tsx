import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

type Invoice = {
    id: number;
    invoiceNumber: string;
    customer: string;
    amount: number;
    status: 'paid' | 'unpaid' | 'cancelled';
    dueDate: string;
    createdAt: string;
};

const invoices: Invoice[] = [
    {
        id: 1,
        invoiceNumber: 'INV-2024-001',
        customer: 'John Doe',
        amount: 499000,
        status: 'paid',
        dueDate: '2024-04-15',
        createdAt: '2024-04-01',
    },
    {
        id: 2,
        invoiceNumber: 'INV-2024-002',
        customer: 'Jane Smith',
        amount: 999000,
        status: 'unpaid',
        dueDate: '2024-04-20',
        createdAt: '2024-04-05',
    },
    {
        id: 3,
        invoiceNumber: 'INV-2024-003',
        customer: 'Robert Johnson',
        amount: 299000,
        status: 'cancelled',
        dueDate: '2024-04-10',
        createdAt: '2024-03-25',
    },
];

const statusColors = {
    paid: 'bg-green-100 text-green-700',
    unpaid: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function InvoicesIndex() {
    return (
        <AuthenticatedLayout>
            <Head title="Invoices" />

            <div className="space-y-6">
                {/* Header with Filters and Action */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
                        <p className="mt-1 text-sm text-gray-500">Manage customer invoices and payments</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-slate-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none">
                            <option value="">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600">
                            <i className="feather-plus h-4 w-4" />
                            Create Invoice
                        </button>
                    </div>
                </div>

                {/* Invoices Table */}
                <div className="rounded-xl bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Invoice</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Customer</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Amount</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Due Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Created At</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-b border-gray-200 last:border-0">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gray-100">
                                                    <img
                                                        src={`https://ui-avatars.com/api/?name=${invoice.customer}&background=random`}
                                                        alt={invoice.customer}
                                                        className="h-full w-full rounded-full"
                                                    />
                                                </div>
                                                <p className="text-gray-600">{invoice.customer}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">Rp {invoice.amount.toLocaleString('id-ID')}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[invoice.status]}`}
                                            >
                                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{invoice.dueDate}</td>
                                        <td className="px-6 py-4 text-gray-600">{invoice.createdAt}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                                                    <i className="feather-eye h-4 w-4" />
                                                </button>
                                                <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                                                    <i className="feather-printer h-4 w-4" />
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
