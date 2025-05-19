import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import Table from '@/components/Table/Table';
import { INVOICE_STATUS_OPTIONS } from '@/constants';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { setupMomentLocale } from '@/lib/momentConfig';
import { currencyFormat } from '@/lib/utils';
import { Invoices, PageProps } from '@/types';
import { type TableColumn } from '@/types/table';
import { Button, Input, Modal, ModalContent, ModalHeader, Select, SelectItem, useDisclosure } from '@heroui/react';
import { Head, router, usePage } from '@inertiajs/react';
import { MagnifyingGlass, Plus, Trash } from '@phosphor-icons/react';
import moment from 'moment';
import { useMemo, useState } from 'react';
import CreateInvoice from './Create';
import Paid from './Paid';
// import EditInvoice from './Edit';

setupMomentLocale();

const statusColors = {
    paid: 'bg-green-100 text-green-700',
    unpaid: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
};

type InvoicePageProps = PageProps &
    Record<string, unknown> & {
        invoices: {
            data: Invoices[];
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
        // packages: InternetPackage[];
        // customers: Customer[];
        auth: {
            user: {
                is_admin: number;
            };
        };
    };

export default function InvoicesIndex() {
    const { invoices, filters, auth } = usePage<InvoicePageProps>().props;
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
    // const { isOpen: isEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();
    const { isOpen: isPaidOpen, onOpen: onPaidOpen, onOpenChange: onPaidOpenChange } = useDisclosure();
    const [selectedInvoice, setSelectedInvoice] = useState<Invoices | null>(null);
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState<string>(filters?.status || 'all');
    const filteredInvoices = useMemo(() => {
        return invoices.data.filter((invoice) => {
            const statusMatch = statusFilter === 'all' || invoice.status === statusFilter;

            const searchMatch =
                !search ||
                invoice.invoice_id.toLowerCase().includes(search.toLowerCase()) ||
                invoice.customer?.name.toLowerCase().includes(search.toLowerCase());

            return statusMatch && searchMatch;
        });
    }, [invoices.data, search, statusFilter]);

    // const handleEdit = (invoice: Invoices) => {
    //     setSelectedInvoice(invoice);
    //     onEditOpen();
    // };

    const handleDelete = (invoice: Invoices) => {
        setSelectedInvoice(invoice);
        onDeleteOpen();
    };

    const confirmDelete = () => {
        if (selectedInvoice) {
            router.delete(route('invoices.destroy', selectedInvoice.id), {
                onSuccess: () => {
                    onDeleteOpenChange();
                    setSelectedInvoice(null);
                },
            });
        }
    };

    const handlePaid = (invoice: Invoices) => {
        setSelectedInvoice(invoice);
        onPaidOpen();
    };

    const baseColumns: TableColumn<Invoices>[] = [
        {
            header: 'Invoice ID',
            value: (invoice: Invoices) => <p className="font-medium text-gray-900 dark:text-gray-100">{invoice.invoice_id || '-'}</p>,
        },

        {
            header: 'Pelanggan',
            value: (invoice: Invoices) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                        <img
                            src={`https://ui-avatars.com/api/?name=${invoice.customer?.name || 'Customer'}&background=random`}
                            alt={invoice.customer?.name || 'Customer'}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{invoice.customer?.name || 'N/A'}</p>
                </div>
            ),
        },
        {
            header: 'Paket',
            value: (invoice: Invoices) => <p className="font-medium text-gray-900 dark:text-gray-100">{invoice.package?.name || '-'}</p>,
        },
        {
            header: 'Harga Paket',
            value: (invoice: Invoices) => (
                <p className="font-medium text-gray-900 dark:text-gray-100">{currencyFormat(invoice.package?.price || 0)}</p>
            ),
        },
        {
            header: 'PPN',
            value: (invoice: Invoices) => <p className="font-medium text-gray-900 dark:text-gray-100">{invoice.ppn || '-'}</p>,
        },
        {
            header: 'Total',
            value: (invoice: Invoices) => <p className="font-medium text-gray-900 dark:text-gray-100">{currencyFormat(invoice.total_amount || 0)}</p>,
        },
        {
            header: 'Jatuh Tempo',
            value: (invoice: Invoices) => <span className="text-gray-600 dark:text-gray-300">{moment(invoice.due_date).format('DD MMMM YYYY')}</span>,
        },
        {
            header: 'Catatan',
            value: (invoice: Invoices) => <span className="text-gray-600 dark:text-gray-300">{invoice.note}</span>,
        },
        {
            header: 'Periode',
            value: (invoice: Invoices) => (
                <p className="font-medium text-gray-900 dark:text-gray-100">{moment(invoice.created_at).format('DD MMMM YYYY')}</p>
            ),
        },
        {
            header: 'Dibuat Oleh',
            value: (invoice: Invoices) => <p className="font-medium text-gray-900 dark:text-gray-100">{invoice.creator?.name || 'N/A'}</p>,
        },
        {
            header: 'Dibayar Pada',
            value: (invoice: Invoices) => (
                <p className="font-medium text-gray-900 dark:text-gray-100">
                    {invoice.paid_at ? moment(invoice.paid_at).format('DD MMMM YYYY') : '-'}
                </p>
            ),
        },
        {
            header: 'Status',
            value: (invoice: Invoices) => (
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[invoice.status]}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
            ),
        },
    ];

    const adminColumns: TableColumn<Invoices>[] = [
        ...baseColumns,
        {
            header: 'Aksi',
            value: (invoice: Invoices) => (
                <div className="flex items-center justify-end gap-2">
                    {/* <button
                        onClick={() => handleEdit(invoice)}
                        className="cursor-pointer rounded-lg p-2 text-yellow-400 transition-colors hover:bg-yellow-400 hover:text-white"
                    >
                        <PencilSimple className="h-4 w-4" />
                    </button> */}
                    {invoice.status === 'unpaid' && (
                        <Button size="sm" onPress={() => handlePaid(invoice)} color="success" className="text-white">
                            Bayar
                        </Button>
                    )}
                    <button
                        onClick={() => handleDelete(invoice)}
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
            route('invoices.index'),
            {
                search: e.target.value,
                status: statusFilter,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        router.get(
            route('invoices.index'),
            {
                search,
                status: value,
            },
            { preserveState: true, replace: true },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            route('invoices.index'),
            {
                page,
                search,
                status: statusFilter,
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Invoices" />
            <div className="p-4 lg:p-8">
                <h2 className="mb-5 text-2xl font-bold text-gray-900 dark:text-gray-100">Tagihan</h2>
                <div className="mb-6 flex flex-col items-center justify-between gap-4 lg:flex-row">
                    <div className="flex w-full flex-col items-center justify-center gap-4 lg:w-1/2 lg:flex-row">
                        <Select
                            placeholder="Pilih Status"
                            variant="bordered"
                            radius="md"
                            color="default"
                            value={statusFilter}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                        >
                            {[{ value: 'all', label: 'Semua' }, ...INVOICE_STATUS_OPTIONS].map((status) => (
                                <SelectItem key={status.value} textValue={status.label}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </Select>
                        <Input
                            startContent={<MagnifyingGlass className="h-4 w-4 text-gray-500" />}
                            type="text"
                            placeholder="Cari invoice / nama pelanggan..."
                            value={search}
                            onChange={handleSearch}
                            color="default"
                            variant="bordered"
                            radius="md"
                        />
                    </div>

                    {auth.user.is_admin === 1 && (
                        <Button onPress={onCreateOpen} color="primary" className="w-full lg:w-fit">
                            <Plus className="h-5 w-5" />
                            Buat Tagihan
                        </Button>
                    )}
                </div>

                <Table<Invoices>
                    data={filteredInvoices}
                    column={auth.user.is_admin === 1 ? adminColumns : baseColumns}
                    pagination={{
                        ...invoices,
                        last_page: invoices.last_page,
                        current_page: invoices.current_page,
                        onChange: handlePageChange,
                    }}
                />

                {auth.user.is_admin === 1 && (
                    <>
                        <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} size="sm">
                            <div className="fixed inset-0 z-50 flex h-screen min-h-screen items-center justify-center overflow-y-auto bg-black/30">
                                <ModalContent className="relative rounded-2xl bg-white p-0 dark:bg-gray-900">
                                    <ModalHeader>
                                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tambah Invoice</h2>
                                    </ModalHeader>
                                    <CreateInvoice onClose={() => onCreateOpenChange()} />
                                </ModalContent>
                            </div>
                        </Modal>

                        {/* <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} size="sm">
                            <div className="fixed inset-0 z-50 flex h-screen min-h-screen items-center justify-center overflow-y-auto bg-black/30">
                                <ModalContent className="relative rounded-2xl bg-white p-0 dark:bg-gray-900">
                                    {selectedInvoice && (
                                        <EditInvoice
                                            customers={customers}
                                            packages={packages}
                                            invoice={selectedInvoice}
                                            onClose={() => onEditOpenChange()}
                                        />
                                    )}
                                </ModalContent>
                            </div>
                        </Modal> */}

                        <DeleteConfirmationDialog
                            isOpen={isDeleteOpen}
                            onClose={onDeleteOpenChange}
                            onConfirm={confirmDelete}
                            title="Hapus Invoice"
                            description={`Apakah Anda yakin ingin menghapus invoice ini?`}
                        />

                        <Modal isOpen={isPaidOpen} onOpenChange={onPaidOpenChange} size="sm">
                            <div className="fixed inset-0 z-50 flex h-screen min-h-screen items-center justify-center overflow-y-auto bg-black/30">
                                <ModalContent className="relative rounded-2xl bg-white p-0 dark:bg-gray-900">
                                    <ModalHeader>
                                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Konfirmasi Pembayaran</h2>
                                    </ModalHeader>
                                    {selectedInvoice && <Paid invoice={selectedInvoice} onClose={() => onPaidOpenChange()} />}
                                </ModalContent>
                            </div>
                        </Modal>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
