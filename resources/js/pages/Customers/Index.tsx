import Table from '@/components/Table/Table';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { currencyFormat } from '@/lib/utils';
import { type Customer, type PageProps } from '@/types';
import { type TableColumn } from '@/types/table';
import { Button, Modal, ModalBody, ModalContent, useDisclosure } from '@heroui/react';
import { Head, usePage } from '@inertiajs/react';
import { MagnifyingGlass, Plus } from '@phosphor-icons/react';
import moment from 'moment';
import CreateCustomer from './Create';

const statusColors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-red-100 text-red-700',
    paused: 'bg-yellow-100 text-yellow-700',
};

type CustomerPageProps = PageProps &
    Record<string, unknown> & {
        customers: {
            data: Customer[];
            current_page: number;
            from: number;
            last_page: number;
            per_page: number;
            to: number;
            total: number;
            prev_page_url: string | null;
            next_page_url: string | null;
            links: Array<{
                url: string | null;
                label: string;
                active: boolean;
            }>;
        };
    };

export default function CustomersIndex() {
    const { customers } = usePage<CustomerPageProps>().props;
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    console.log(customers);

    const columns: TableColumn<Customer>[] = [
        {
            header: 'Nama',
            value: (customer: Customer) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                        <img
                            src={`https://ui-avatars.com/api/?name=${customer.name}&background=random`}
                            alt={customer.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Status',
            value: (customer: Customer) => (
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[customer.status]}`}>
                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                </span>
            ),
        },
        {
            header: 'Alamat',
            value: (customer: Customer) => <span className="text-gray-500">{customer.address}</span>,
        },
        {
            header: 'NPWP',
            value: (customer: Customer) => <span className="text-gray-500">{customer.npwp || '-'}</span>,
        },
        {
            header: 'No. NPWP',
            value: (customer: Customer) => <span className="text-gray-500">{customer.tax_number || '-'}</span>,
        },
        {
            header: 'Paket',
            value: (customer: Customer) => <span className="font-medium text-gray-900">{customer.package?.name || '-'}</span>,
        },
        {
            header: 'Harga Paket',
            value: (customer: Customer) => <span className="font-medium text-gray-900">{currencyFormat(customer.package?.price || 0)}</span>,
        },

        {
            header: 'Koordinat',
            value: (customer: Customer) => (
                <span className="text-gray-500">
                    {customer.coordinates?.latitude || '-'}, {customer.coordinates?.longitude || '-'}
                </span>
            ),
        },
        {
            header: 'Phone',
            value: (customer: Customer) => <span className="font-medium text-gray-900">{customer.phone}</span>,
        },
        {
            header: 'Tanggal Bergabung',
            value: (customer: Customer) => <span className="text-gray-500">{moment(customer.join_date).format('DD MMMM YYYY')}</span>,
        },
        {
            header: 'Aksi',
            value: () => (
                <div className="flex items-center gap-2">
                    <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                        <i className="feather-edit-2 h-4 w-4" />
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
            <Head title="Customers" />

            <div className="p-8">
                {/* Header with Search and Action */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
                        <p className="mt-1 text-sm text-gray-500">Manage your customer accounts</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <MagnifyingGlass className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search customers..."
                                className="rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                            />
                        </div>
                        <Button
                            onPress={onOpen}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
                        >
                            <Plus className="h-5 w-5" />
                            Tambah Customer
                        </Button>
                    </div>
                </div>

                {/* Customers Table */}
                <Table<Customer> data={customers.data} column={columns} pagination={customers} />

                {/* Modal for Create Customer */}
                <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
                    <ModalContent className="bg-black/20">
                        {(onClose) => (
                            <ModalBody>
                                <CreateCustomer onClose={onClose} />
                            </ModalBody>
                        )}
                    </ModalContent>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
