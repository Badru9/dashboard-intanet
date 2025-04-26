import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { type Cashflow } from '@/types';
import { Head } from '@inertiajs/react';

const cashflows: Cashflow[] = [
    {
        id: 1,
        description: 'Monthly Internet Subscription',
        type: 'income',
        amount: 4999000,
        category: 'Subscription',
        date: '2024-04-01',
        notes: 'From 5 customers',
    },
    {
        id: 2,
        description: 'Router Purchase',
        type: 'expense',
        amount: 2500000,
        category: 'Equipment',
        date: '2024-04-02',
    },
    {
        id: 3,
        description: 'Network Maintenance',
        type: 'expense',
        amount: 1500000,
        category: 'Maintenance',
        date: '2024-04-03',
    },
    {
        id: 4,
        description: 'Installation Fee',
        type: 'income',
        amount: 1000000,
        category: 'Service',
        date: '2024-04-04',
    },
];

const typeColors = {
    income: 'bg-green-100 text-green-700',
    expense: 'bg-red-100 text-red-700',
};

export default function CashflowsIndex() {
    return (
        <AuthenticatedLayout>
            <Head title="Cashflows" />

            <div className="space-y-6">
                {/* Header with Summary and Action */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-green-100 p-3 text-green-600">
                                <i className="feather-arrow-up-right h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Income</p>
                                <p className="text-2xl font-bold text-gray-900">Rp 5.999.000</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-red-100 p-3 text-red-600">
                                <i className="feather-arrow-down-left h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Expense</p>
                                <p className="text-2xl font-bold text-gray-900">Rp 4.000.000</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                                <i className="feather-dollar-sign h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Net Balance</p>
                                <p className="text-2xl font-bold text-gray-900">Rp 1.999.000</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                                <i className="feather-activity h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Transactions</p>
                                <p className="text-2xl font-bold text-gray-900">24</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <select className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none">
                            <option value="">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                        <select className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none">
                            <option value="">All Categories</option>
                            <option value="subscription">Subscription</option>
                            <option value="equipment">Equipment</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="service">Service</option>
                        </select>
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600">
                        <i className="feather-plus h-4 w-4" />
                        Add Transaction
                    </button>
                </div>

                {/* Cashflows Table */}
                <div className="rounded-xl bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Description</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Amount</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Category</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Notes</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cashflows.map((cashflow) => (
                                    <tr key={cashflow.id} className="border-b border-gray-200 last:border-0">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{cashflow.description}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${typeColors[cashflow.type]}`}>
                                                {cashflow.type.charAt(0).toUpperCase() + cashflow.type.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">Rp {cashflow.amount.toLocaleString('id-ID')}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{cashflow.category}</td>
                                        <td className="px-6 py-4 text-gray-600">{cashflow.date}</td>
                                        <td className="px-6 py-4 text-gray-600">{cashflow.notes || '-'}</td>
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
