import ActivateCustomerDialog from '@/components/ActivateCustomerDialog';
import DeactivateCustomerDialog from '@/components/DeactivateCustomerDialog';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import Table from '@/components/Table/Table';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { currencyFormat } from '@/lib/utils';
import { type Customer, type PageProps } from '@/types';
import { type TableColumn } from '@/types/table';
import { Button, Input, Modal, ModalContent, useDisclosure } from '@heroui/react';
import { Head, router, usePage } from '@inertiajs/react';
import { MagnifyingGlass, PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import moment from 'moment';
import { useMemo, useState } from 'react';
import CreateCustomer from './Create';
import EditCustomer from './Edit';
import ImportCustomer from './Import';

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
        auth: {
            user: {
                is_admin: number;
            };
        };
    };

// Pertama, buat type untuk status yang valid
type CustomerStatus = 'active' | 'inactive' | 'paused';

export default function CustomersIndex() {
    const { customers, filters, auth } = usePage<CustomerPageProps>().props;
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();
    const { isOpen: isActivateOpen, onOpen: onActivateOpen, onOpenChange: onActivateOpenChange } = useDisclosure();
    const { isOpen: isStatusChangeOpen, onOpen: onStatusChangeOpen, onOpenChange: onStatusChangeOpenChange } = useDisclosure();
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [search, setSearch] = useState(filters?.search || '');
    const [statusChangeType, setStatusChangeType] = useState<'inactive' | 'paused'>('inactive');
    const { isOpen: isImportOpen, onOpen: onImportOpen, onOpenChange: onImportOpenChange } = useDisclosure();
    const filteredCustomers = useMemo(() => {
        if (!search) return customers.data;
        return customers.data.filter(
            (customer) =>
                customer.name.toLowerCase().includes(search.toLowerCase()) || (customer.email || '').toLowerCase().includes(search.toLowerCase()),
        );
    }, [customers.data, search]);

    const handleEdit = (customer: Customer) => {
        console.log('data customer', customer);

        setSelectedCustomer(customer);
        onEditOpen();
    };

    const handleDelete = (customer: Customer) => {
        setSelectedCustomer(customer);
        onDeleteOpen();
    };

    const handleStatusChange = (customer: Customer, newStatus: CustomerStatus) => {
        if (newStatus === 'active') {
            setSelectedCustomer(customer);
            onActivateOpen();
            return;
        }

        setSelectedCustomer(customer);
        setStatusChangeType(newStatus);
        onStatusChangeOpen();
    };

    const handleStatusChangeConfirm = () => {
        if (!selectedCustomer) return;

        router.put(
            route('customers.update-status', selectedCustomer.id),
            {
                status: statusChangeType,
            },
            {
                onSuccess: () => {
                    onStatusChangeOpenChange();
                    setSelectedCustomer(null);
                },
            },
        );
    };

    const handleActivateConfirm = (billDate: string) => {
        if (!selectedCustomer) return;

        router.put(
            route('customers.update-status', selectedCustomer.id),
            {
                status: 'active',
                bill_date: billDate,
            },
            {
                onSuccess: () => {
                    onActivateOpenChange();
                    setSelectedCustomer(null);
                },
            },
        );
    };

    const renderStatusActions = (customer: Customer) => {
        if (customer.status === 'active') {
            return (
                <>
                    <Button color="warning" className="text-white" size="sm" onPress={() => handleStatusChange(customer, 'paused')}>
                        Jeda
                    </Button>
                    <Button color="danger" className="text-white" size="sm" onPress={() => handleStatusChange(customer, 'inactive')}>
                        Non-aktifkan
                    </Button>
                </>
            );
        }

        if (customer.status === 'paused' || customer.status === 'inactive') {
            return (
                <Button color="success" className="text-white" size="sm" onPress={() => handleStatusChange(customer, 'active')}>
                    Aktifkan
                </Button>
            );
        }

        return null;
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

    const baseColumns: TableColumn<Customer>[] = [
        {
            header: 'Nama',
            sticky: true,
            value: (customer: Customer) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                        <img
                            src={`https://ui-avatars.com/api/?name=${customer.name}&background=random`}
                            alt={customer.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{customer.name}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Email',
            value: (customer: Customer) => <span className="text-gray-500 dark:text-gray-300">{customer.email || '-'}</span>,
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
            value: (customer: Customer) => <span className="text-gray-500 dark:text-gray-300">{customer.address}</span>,
        },
        {
            header: 'NPWP',
            value: (customer: Customer) => <span className="text-gray-500 dark:text-gray-300">{customer.npwp || '-'}</span>,
        },
        {
            header: 'No Faktur Pajak',
            value: (customer: Customer) => <span className="text-gray-500 dark:text-gray-300">{customer.tax_invoice_number || '-'}</span>,
        },
        {
            header: 'Paket',
            value: (customer: Customer) => <span className="font-medium text-gray-900 dark:text-gray-100">{customer.package?.name || '-'}</span>,
        },
        {
            header: 'Harga Paket',
            value: (customer: Customer) => (
                <span className="font-medium text-gray-900 dark:text-gray-100">{currencyFormat(customer.package?.price || 0)}</span>
            ),
        },

        {
            header: 'Koordinat',
            value: (customer: Customer) => (
                <span className="text-gray-500 dark:text-gray-300">
                    {customer.coordinate?.split(',')[0] || '-'}, {customer.coordinate?.split(',')[1] || '-'}
                </span>
            ),
        },
        {
            header: 'Phone',
            value: (customer: Customer) => <span className="font-medium text-gray-900 dark:text-gray-100">{customer.phone}</span>,
        },
        {
            header: 'Tanggal Bergabung',
            value: (customer: Customer) => (
                <span className="text-gray-500 dark:text-gray-300">{moment(customer.join_date).format('DD MMMM YYYY')}</span>
            ),
        },
        {
            header: 'Tanggal Tagihan',
            value: (customer: Customer) => (
                <span className="text-gray-500 dark:text-gray-300">
                    {customer.bill_date === null ? '-' : moment(customer.bill_date).format('DD MMMM YYYY')}
                </span>
            ),
        },
    ];

    const adminColumns: TableColumn<Customer>[] = [
        ...baseColumns,
        {
            header: 'Aksi',
            value: (customer: Customer) => (
                <div className="flex items-center gap-2">
                    {renderStatusActions(customer)}
                    <button
                        onClick={() => handleEdit(customer)}
                        className="cursor-pointer rounded-lg p-2 text-yellow-400 transition-colors hover:bg-yellow-400 hover:text-white"
                    >
                        <PencilSimple className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(customer)}
                        className="cursor-pointer rounded-lg p-2 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
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

    const handlePageChange = (page: number) => {
        router.get(route('customers.index'), { page, search }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Customers" />

            <div className="p-4 lg:p-8">
                {/* Header with Search and Action */}
                <div className="mb-6 flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="w-full md:w-auto">
                        <Button onPress={onImportOpen} color="primary" fullWidth>
                            <Plus className="h-5 w-5" />
                            Import Customer
                        </Button>
                    </div>

                    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
                        <div className="relative w-full lg:w-auto">
                            <Input
                                startContent={<MagnifyingGlass className="h-4 w-4 text-gray-500" />}
                                type="text"
                                placeholder="Search customers..."
                                value={search}
                                onChange={handleSearch}
                                color="default"
                                variant="bordered"
                                radius="md"
                            />
                        </div>
                        {auth.user.is_admin === 1 && (
                            <Button onPress={onCreateOpen} color="primary">
                                <Plus className="h-5 w-5" />
                                Tambah Customer
                            </Button>
                        )}
                    </div>
                </div>

                {/* Customers Table */}
                <div className="-mx-4 lg:mx-0">
                    <Table<Customer>
                        data={filteredCustomers}
                        column={auth.user.is_admin === 1 ? adminColumns : baseColumns}
                        pagination={{
                            ...customers,
                            last_page: customers.last_page,
                            current_page: customers.current_page,
                            onChange: handlePageChange,
                        }}
                        rowClassName={(customer) => {
                            if (customer.status === 'active') return 'bg-white dark:bg-gray-800';
                            if (customer.status === 'paused') return 'bg-yellow-50 dark:bg-yellow-900';
                            if (customer.status === 'inactive') return 'bg-red-50 dark:bg-red-900';
                            return 'bg-white dark:bg-gray-800';
                        }}
                    />
                </div>

                <Modal isOpen={isImportOpen} onOpenChange={onImportOpenChange}>
                    <ModalContent>
                        <ImportCustomer onClose={() => onImportOpenChange()} />
                    </ModalContent>
                </Modal>

                <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} size="2xl">
                    <div className="fixed inset-0 z-50 flex h-screen items-center justify-center bg-black/30 dark:bg-black/30">
                        <ModalContent className="relative rounded-2xl bg-white p-0 dark:bg-gray-900">
                            <CreateCustomer onClose={() => onCreateOpenChange()} />
                        </ModalContent>
                    </div>
                </Modal>

                <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} size="2xl">
                    <div className="fixed inset-0 z-50 h-screen bg-black/30 dark:bg-black/30">
                        <ModalContent>
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

                <ActivateCustomerDialog
                    isOpen={isActivateOpen}
                    onClose={onActivateOpenChange}
                    onConfirm={handleActivateConfirm}
                    customerName={selectedCustomer?.name || ''}
                />

                {/* Ganti StatusChangeDialog dengan DeactivateCustomerDialog */}
                <DeactivateCustomerDialog
                    isOpen={isStatusChangeOpen}
                    onClose={onStatusChangeOpenChange}
                    onConfirm={handleStatusChangeConfirm}
                    customerName={selectedCustomer?.name || ''}
                    type={statusChangeType}
                />
            </div>
        </AuthenticatedLayout>
    );
}
