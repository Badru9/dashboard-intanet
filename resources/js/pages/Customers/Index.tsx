import ActivateCustomerDialog from '@/components/ActivateCustomerDialog';
import DeactivateCustomerDialog from '@/components/DeactivateCustomerDialog';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import Table from '@/components/Table/Table';
import { CUSTOMER_STATUS_OPTIONS } from '@/constants';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { currencyFormat } from '@/lib/utils';
import { type Customer, type PageProps } from '@/types';
import { type TableColumn } from '@/types/table';
import { Button, Input, Modal, ModalContent, ModalHeader, Select, SelectItem, useDisclosure } from '@heroui/react';
import { Head, router, usePage } from '@inertiajs/react';
import { FileXls, MagnifyingGlass, PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import moment from 'moment';
import { useMemo, useState } from 'react';
import CreateCustomer from './Create';
import EditCustomer from './Edit';
import ImportCustomer from './Import';

const statusColors = {
    online: 'bg-green-100 text-green-700',
    inactive: 'bg-red-100 text-red-700',
    offline: 'bg-yellow-100 text-yellow-700',
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
type CustomerStatus = 'online' | 'inactive' | 'offline';

export default function CustomersIndex() {
    const { customers, filters, auth } = usePage<CustomerPageProps>().props;

    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();
    const { isOpen: isActivateOpen, onOpen: onActivateOpen, onOpenChange: onActivateOpenChange } = useDisclosure();
    const { isOpen: isStatusChangeOpen, onOpen: onStatusChangeOpen, onOpenChange: onStatusChangeOpenChange } = useDisclosure();
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState<string>(filters?.status || '');
    const [statusChangeType, setStatusChangeType] = useState<'inactive' | 'offline'>('inactive');
    const { isOpen: isImportOpen, onOpen: onImportOpen, onOpenChange: onImportOpenChange } = useDisclosure();
    const filteredCustomers = useMemo(() => {
        if (!search && !statusFilter) return customers.data;
        if (search) {
            return customers.data.filter(
                (customer) =>
                    customer.name.toLowerCase().includes(search.toLowerCase()) || (customer.email || '').toLowerCase().includes(search.toLowerCase()),
            );
        }
        if (statusFilter) {
            return customers.data.filter((customer) => customer.status === statusFilter);
        }
        return customers.data;
    }, [customers.data, search, statusFilter]);

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
        if (newStatus === 'online') {
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

    const handleActivateConfirm = (billDate: number) => {
        if (!selectedCustomer) return;

        router.put(
            route('customers.update-status', selectedCustomer.id),
            {
                status: 'online',
                bill_date: billDate,
            },
            {
                onSuccess: () => {
                    onActivateOpenChange();
                    setSelectedCustomer(null);
                },
                onError: (error) => {
                    console.log('error', error);
                },
            },
        );
    };

    const renderStatusActions = (customer: Customer) => {
        if (customer.status === 'online') {
            return (
                <>
                    <Button color="warning" className="text-white" size="sm" onPress={() => handleStatusChange(customer, 'offline')}>
                        Jeda
                    </Button>
                    <Button color="danger" className="text-white" size="sm" onPress={() => handleStatusChange(customer, 'inactive')}>
                        Non-aktifkan
                    </Button>
                </>
            );
        }

        if (customer.status === 'offline' || customer.status === 'inactive') {
            return (
                <Button color="success" className="text-white" size="sm" onPress={() => handleStatusChange(customer, 'online')}>
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
            header: 'ID Pelanggan',
            value: (customer: Customer) => <span className="text-gray-500 dark:text-gray-300">{customer.customer_id || '-'}</span>,
        },
        {
            header: 'Email',
            value: (customer: Customer) => <span className="text-gray-500 dark:text-gray-300">{customer.email || '-'}</span>,
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
            header: 'No. HP',
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
                <span className="text-gray-500 dark:text-gray-300">{customer.bill_date === null ? '-' : customer.bill_date}</span>
            ),
        },
        {
            header: 'Status',
            value: (customer: Customer) => (
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusColors[customer.status]}`}>
                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
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
        router.get(
            route('customers.index'),
            {
                search: e.target.value,
                status: statusFilter, // Selalu kirim status yang aktif
            },
            { preserveState: true, replace: true },
        );
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        router.get(
            route('customers.index'),
            {
                search,
                status: value, // Selalu kirim status, termasuk 'all'
            },
            { preserveState: true, replace: true },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            route('customers.index'),
            {
                page,
                search,
                status: statusFilter, // Selalu kirim status yang aktif
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Customers" />

            <div className="p-4 lg:p-8">
                <h2 className="mb-5 text-2xl font-bold text-gray-900 dark:text-gray-100">Pelanggan</h2>
                {/* Header with Search and Action */}
                <div className="mb-6 flex w-full flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex w-full flex-col items-center justify-center gap-4 lg:flex-row">
                        <Select
                            placeholder="Pilih Status"
                            variant="bordered"
                            radius="md"
                            color="default"
                            value={statusFilter}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                        >
                            {CUSTOMER_STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status.value} textValue={status.label}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </Select>
                        <Input
                            startContent={<MagnifyingGlass className="h-4 w-4 text-gray-500" />}
                            type="text"
                            placeholder="Cari nama / email pelanggan..."
                            value={search}
                            onChange={handleSearch}
                            color="default"
                            variant="bordered"
                            radius="md"
                        />
                    </div>

                    {auth.user.is_admin === 1 && (
                        <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
                            <Button onPress={onCreateOpen} color="primary" variant="flat">
                                <Plus className="h-5 w-5" />
                                Tambah Customer
                            </Button>
                            <Button onPress={onImportOpen} color="primary">
                                <FileXls className="h-5 w-5" />
                                Import Customer
                            </Button>
                        </div>
                    )}
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
                            if (customer.status === 'online') return 'bg-white dark:bg-gray-800';
                            if (customer.status === 'offline') return 'bg-yellow-50 dark:bg-yellow-900';
                            if (customer.status === 'inactive') return 'bg-red-50 dark:bg-red-900';
                            return 'bg-white dark:bg-gray-800';
                        }}
                    />
                </div>

                <Modal isOpen={isImportOpen} onOpenChange={onImportOpenChange}>
                    <ModalContent>
                        <ModalHeader>
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Import Customer</h2>
                        </ModalHeader>
                        <ImportCustomer onClose={() => onImportOpenChange()} />
                    </ModalContent>
                </Modal>

                <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} size="2xl">
                    <div className="fixed inset-0 z-50 h-screen bg-black/30 dark:bg-black/30">
                        <ModalContent className="relative rounded-2xl bg-white p-0 dark:bg-gray-900">
                            <ModalHeader>
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tambah Customer</h2>
                            </ModalHeader>
                            <CreateCustomer onClose={() => onCreateOpenChange()} />
                        </ModalContent>
                    </div>
                </Modal>

                <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} size="2xl">
                    <div className="fixed inset-0 z-50 h-screen bg-black/30 dark:bg-black/30">
                        <ModalContent className="relative rounded-2xl bg-white p-0 dark:bg-gray-900">
                            <ModalHeader>
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Edit Customer</h2>
                            </ModalHeader>
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
