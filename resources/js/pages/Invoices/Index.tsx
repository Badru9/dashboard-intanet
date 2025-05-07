import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import Table from '@/components/Table/Table';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { currencyFormat } from '@/lib/utils';
import { PageProps, type Invoices } from '@/types';
import { type TableColumn } from '@/types/table';
import { Button, Input, Modal, ModalContent, useDisclosure } from '@heroui/react';
import { Head, router, usePage } from '@inertiajs/react';
import { MagnifyingGlass, Plus, Trash } from '@phosphor-icons/react';
import moment from 'moment';
import { useMemo, useState } from 'react';
import CreateInvoice from './Create';
// import EditInvoice from './Edit';

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
    const [selectedInvoice, setSelectedInvoice] = useState<Invoices | null>(null);
    const [search, setSearch] = useState(filters?.search || '');

    const filteredInvoices = useMemo(() => {
        if (!search) return invoices.data;
        return invoices.data.filter(
            (invoice) =>
                invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
                invoice.customer?.name.toLowerCase().includes(search.toLowerCase()),
        );
    }, [invoices.data, search]);

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

    const baseColumns: TableColumn<Invoices>[] = [
        {
            header: 'Customer',
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
            header: 'Dibuat Oleh',
            value: (invoice: Invoices) => <p className="font-medium text-gray-900 dark:text-gray-100">{invoice.creator?.name || 'N/A'}</p>,
        },
        {
            header: 'Amount',
            value: (invoice: Invoices) => <p className="font-medium text-gray-900 dark:text-gray-100">{currencyFormat(invoice.amount)}</p>,
        },
        {
            header: 'Status',
            value: (invoice: Invoices) => (
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[invoice.status]}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
            ),
        },
        {
            header: 'Due Date',
            value: (invoice: Invoices) => <span className="text-gray-600 dark:text-gray-300">{moment(invoice.due_date).format('DD MMMM YYYY')}</span>,
        },
        {
            header: 'Catatan',
            value: (invoice: Invoices) => <span className="text-gray-600 dark:text-gray-300">{invoice.note}</span>,
        },
    ];

    const adminColumns: TableColumn<Invoices>[] = [
        ...baseColumns,
        {
            header: 'Actions',
            value: (invoice: Invoices) => (
                <div className="flex items-center gap-2">
                    {/* <button
                        onClick={() => handleEdit(invoice)}
                        className="cursor-pointer rounded-lg p-2 text-yellow-400 transition-colors hover:bg-yellow-400 hover:text-white"
                    >
                        <PencilSimple className="h-4 w-4" />
                    </button> */}
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
        router.get(route('invoices.index'), { search: e.target.value }, { preserveState: true, replace: true });
    };

    const handlePageChange = (page: number) => {
        router.get(route('invoices.index'), { page }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Invoices" />
            <div className="p-4 lg:p-8">
                <div className="mb-6 flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
                        <div className="relative w-full lg:w-auto">
                            <Input
                                startContent={<MagnifyingGlass className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                                type="text"
                                placeholder="Cari invoice..."
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
                                Tambah Invoice
                            </Button>
                        )}
                    </div>
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
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
