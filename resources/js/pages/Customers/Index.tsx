import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import Table from '@/components/Table/Table';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { currencyFormat } from '@/lib/utils';
import { type Customer, type PageProps } from '@/types';
import { type TableColumn } from '@/types/table';
import { Button, Modal, ModalContent, useDisclosure } from '@heroui/react';
import { Head, router, usePage } from '@inertiajs/react';
import { MagnifyingGlass, PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import moment from 'moment';
import { useMemo, useState } from 'react';
import CreateCustomer from './Create';
import EditCustomer from './Edit';

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
        filters: Record<string, string>;
    };

export default function CustomersIndex() {
    const { customers, filters } = usePage<CustomerPageProps>().props;
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [search, setSearch] = useState(filters?.search || '');

    const filteredCustomers = useMemo(() => {
        if (!search) return customers.data;
        return customers.data.filter(
            (customer) =>
                customer.name.toLowerCase().includes(search.toLowerCase()) || (customer.email || '').toLowerCase().includes(search.toLowerCase()),
        );
    }, [customers.data, search]);

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        onEditOpen();
    };

    const handleDelete = (customer: Customer) => {
        setSelectedCustomer(customer);
        onDeleteOpen();
    };

    const confirmDelete = () => {
        if (selectedCustomer) {
            router.delete(route('customers.destroy', selectedCustomer.id), {
                onSuccess: () => {
                    onDeleteOpenChange();
                    setSelectedCustomer(null);
                },
            });
        }
    };

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
            header: 'Email',
            value: (customer: Customer) => <span className="text-gray-500">{customer.email || '-'}</span>,
        },
        {
            header: 'Status',
            value: (customer: Customer) => (
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusColors[customer.status]}`}>
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
            header: 'No Faktur Pajak',
            value: (customer: Customer) => <span className="text-gray-500">{customer.tax_invoice_number || '-'}</span>,
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
                    {customer.coordinate?.split(',')[0] || '-'}, {customer.coordinate?.split(',')[1] || '-'}
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
            value: (customer: Customer) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(customer)}
                        className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-yellow-500"
                    >
                        <PencilSimple className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(customer)}
                        className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        router.get(route('customers.index'), { search: e.target.value }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Customers" />

            <div className="p-4 lg:p-8">
                {/* Header with Search and Action */}
                <div className="mb-6 flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
                        <div className="relative w-full rounded-lg bg-white lg:w-auto">
                            <MagnifyingGlass className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search customers..."
                                value={search}
                                onChange={handleSearch}
                                className="w-full rounded-lg border border-gray-100 py-2 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none lg:w-auto"
                            />
                        </div>
                        <Button
                            onPress={onCreateOpen}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none lg:w-auto"
                        >
                            <Plus className="h-5 w-5" />
                            Tambah Customer
                        </Button>
                    </div>
                </div>

                {/* Customers Table */}
                <div className="-mx-4 lg:mx-0">
                    <Table<Customer> data={filteredCustomers} column={columns} pagination={customers} />
                </div>

                <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} scrollBehavior="outside" placement="center">
                    <div className="fixed inset-0 z-50 flex h-screen min-h-screen items-center justify-center overflow-y-auto bg-black/30">
                        <ModalContent className="relative mt-5 w-full max-w-sm rounded-2xl bg-white p-0 lg:max-w-4xl">
                            <CreateCustomer onClose={() => onCreateOpenChange()} />
                        </ModalContent>
                    </div>
                </Modal>

                <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange}>
                    <div className="fixed inset-0 z-50 flex h-screen min-h-screen items-center justify-center overflow-y-auto bg-black/30">
                        <ModalContent className="relative w-full max-w-sm rounded-2xl bg-white p-0 lg:max-w-4xl">
                            {selectedCustomer && <EditCustomer customer={selectedCustomer} onClose={() => onEditOpenChange()} />}
                        </ModalContent>
                    </div>
                </Modal>

                {/* Modal for Delete Confirmation */}
                <DeleteConfirmationDialog
                    isOpen={isDeleteOpen}
                    onClose={onDeleteOpenChange}
                    onConfirm={confirmDelete}
                    title="Hapus Customer"
                    description={`Apakah Anda yakin ingin menghapus customer ${selectedCustomer?.name}?`}
                />
            </div>
        </AuthenticatedLayout>
    );
}
