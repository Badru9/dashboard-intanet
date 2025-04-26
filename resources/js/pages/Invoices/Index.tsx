import Table from '@/components/Table/Table';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { type Invoice } from '@/types';
import { type TableColumn } from '@/types/table';
import { Head } from '@inertiajs/react';
import { Plus } from '@phosphor-icons/react';

const invoices: Invoice[] = [
    {
        id: 1,
        invoiceNumber: 'INV-2024-001',
        customer: 'John Doe',
        amount: 499000,
        status: 'paid',
        due_date: '2024-04-15',
        customer_id: 0,
        number: '',
        date: '',
        updated_at: '',
        created_at: '',
    },
    {
        id: 2,
        invoiceNumber: 'INV-2024-002',
        customer: 'Jane Smith',
        amount: 999000,
        status: 'unpaid',
        due_date: '2024-04-20',
        customer_id: 0,
        number: '',
        date: '',
        updated_at: '',
        created_at: '',
    },
    {
        id: 3,
        invoiceNumber: 'INV-2024-003',
        customer: 'Robert Johnson',
        amount: 299000,
        status: 'cancelled',
        due_date: '2024-04-10',
        customer_id: 0,
        number: '',
        date: '',
        updated_at: '',
        created_at: '',
    },
];

const statusColors = {
    paid: 'bg-green-100 text-green-700',
    unpaid: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function InvoicesIndex() {
    const columns: TableColumn<Invoice>[] = [
        {
            header: 'Invoice',
            value: (invoice: Invoice) => <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>,
        },
        {
            header: 'Customer',
            value: (invoice: Invoice) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-100">
                        <img
                            src={`https://ui-avatars.com/api/?name=${invoice.customer}&background=random`}
                            alt={invoice.customer}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <p className="text-gray-600">{invoice.customer}</p>
                </div>
            ),
        },
        {
            header: 'Amount',
            value: (invoice: Invoice) => <p className="font-medium text-gray-900">Rp {invoice.amount.toLocaleString('id-ID')}</p>,
        },
        {
            header: 'Status',
            value: (invoice: Invoice) => (
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[invoice.status]}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
            ),
        },
        {
            header: 'Due Date',
            value: (invoice: Invoice) => <span className="text-gray-600">{invoice.due_date}</span>,
        },
        {
            header: 'Created At',
            value: (invoice: Invoice) => <span className="text-gray-600">{invoice.created_at}</span>,
        },
        {
            header: 'Actions',
            value: () => (
                <div className="flex items-center gap-2">
                    <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                        <i className="feather-eye h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                        <i className="feather-printer h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600">
                        <i className="feather-trash h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Invoices" />

            <div className="p-8">
                {/* Header with Filters and Action */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
                        <p className="mt-1 text-sm text-gray-500">Manage customer invoices and payments</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none">
                            <option value="">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none">
                            <Plus className="h-5 w-5" />
                            Create Invoice
                        </button>
                    </div>
                </div>

                {/* Invoices Table */}
                <Table<Invoice> data={invoices} column={columns} />
            </div>
        </AuthenticatedLayout>
    );
}
