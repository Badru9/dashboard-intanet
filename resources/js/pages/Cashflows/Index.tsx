/* eslint-disable @typescript-eslint/no-explicit-any */
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import Table from '@/components/Table/Table';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { currencyFormat } from '@/lib/utils';
import { Cashflow, CashflowCategory, PageProps } from '@/types';
import { TableColumn } from '@/types/table';
import { Button, DateRangePicker, DateValue, Modal, ModalContent, Select, SelectItem, useDisclosure } from '@heroui/react';
import { Head, router, usePage } from '@inertiajs/react';
import { CalendarDate } from '@internationalized/date';
import { PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import moment from 'moment';
import { useState } from 'react';
import CreateCashflow from './Create';
import EditCashflow from './Edit';

type CashflowPageProps = PageProps & {
    cashflows: {
        data: Cashflow[];
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
    categories: CashflowCategory[];
};

export default function CashflowsIndex() {
    // Ambil data cashflows dari props
    const { cashflows, categories } = usePage<CashflowPageProps>().props;

    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

    const [selectedCashflow, setSelectedCashflow] = useState<Cashflow | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedDateRange, setSelectedDateRange] = useState<{ start: DateValue; end: DateValue }>({
        start: new CalendarDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
        end: new CalendarDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
    });

    // console.log(cashflows);
    // console.log('categories', categories);

    const handleEdit = (cashflow: Cashflow) => {
        console.log(cashflow);
        setSelectedCashflow(cashflow);
        onEditOpen();
    };

    const handleDelete = (cashflow: Cashflow) => {
        setSelectedCashflow(cashflow);
        onDeleteOpen();
    };

    const confirmDelete = () => {
        if (selectedCashflow) {
            router.delete(route('cashflows.destroy', selectedCashflow.id), {
                onSuccess: () => {
                    onDeleteOpenChange();
                    setSelectedCashflow(null);
                },
            });
        }
    };

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategory(categoryId);
        const params: {
            category?: string;
            date_range?: {
                startDate: string;
                endDate: string;
            };
        } = {};

        if (categoryId !== 'all') {
            params.category = categoryId;
        }

        if (
            selectedDateRange.start.toString() !== new CalendarDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toString()
        ) {
            params.date_range = {
                startDate: selectedDateRange.start.toString(),
                endDate: selectedDateRange.end.toString(),
            };
        }

        router.get(route('cashflows.index'), params, { preserveState: true });
    };

    const handleDateRangeChange = (value: { start: DateValue; end: DateValue } | null) => {
        if (!value) {
            setSelectedDateRange({
                start: new CalendarDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
                end: new CalendarDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
            });

            const params: { category?: string } = {};
            if (selectedCategory !== 'all') {
                params.category = selectedCategory;
            }

            router.get(route('cashflows.index'), params, { preserveState: true });
            return;
        }

        setSelectedDateRange({
            start: value.start,
            end: value.end,
        });

        const params: {
            category?: string;
            date_range: {
                startDate: string;
                endDate: string;
            };
        } = {
            date_range: {
                startDate: new Date(value.start.toString()).toISOString(),
                endDate: new Date(value.end.toString()).toISOString(),
            },
        };

        if (selectedCategory !== 'all') {
            params.category = selectedCategory;
        }

        router.get(route('cashflows.index'), params, { preserveState: true });
    };

    const handleResetFilters = () => {
        setSelectedCategory('all');
        setSelectedDateRange({
            start: new CalendarDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
            end: new CalendarDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
        });

        router.get(route('cashflows.index'), {}, { preserveState: true });
    };

    const columns: TableColumn<Cashflow>[] = [
        {
            header: 'Kategori',
            value: (row: Cashflow) => row.category?.name,
        },
        {
            header: 'Amount',
            value: (row: Cashflow) => currencyFormat(row.amount),
        },
        {
            header: 'Tipe',
            value: (row: Cashflow) => (row.category?.is_out ? 'Outcome' : 'Income'),
        },
        {
            header: 'Catatan',
            value: (row: Cashflow) => row.note || '-',
        },
        {
            header: 'Tanggal',
            value: (row: Cashflow) => moment(row.created_at).format('DD MMMM YYYY'),
        },
        {
            header: 'Aksi',
            value: (cashflow: Cashflow) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(cashflow)}
                        className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-yellow-500"
                    >
                        <PencilSimple className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(cashflow)}
                        className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    const handlePageChange = (page: number) => {
        router.get(route('cashflows.index'), { page }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Cashflows" />
            <div className="p-4 lg:p-8">
                <div className="mb-6 flex flex-col items-center gap-4 lg:flex-row lg:items-center">
                    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center">
                        <div className="relative w-full lg:w-64">
                            <Select
                                label="Filter Kategori"
                                placeholder="Pilih Kategori"
                                className="w-full"
                                color="primary"
                                items={[{ id: 'all', name: 'Semua' }, ...categories]}
                                selectedKeys={[selectedCategory]}
                                onSelectionChange={(keys) => handleCategoryChange(Array.from(keys)[0] as string)}
                            >
                                {(item) => (
                                    <SelectItem key={item.id} textValue={item.name}>
                                        {item.name}
                                    </SelectItem>
                                )}
                            </Select>
                        </div>
                        <div className="relative w-full lg:w-64">
                            <DateRangePicker
                                label="Filter Tanggal"
                                color="primary"
                                selectorButtonPlacement="start"
                                value={selectedDateRange}
                                onChange={(value) => handleDateRangeChange(value as { start: DateValue; end: DateValue } | null)}
                            />
                        </div>
                        <Button onPress={handleResetFilters} color="danger" variant="flat">
                            Reset Filter
                        </Button>
                    </div>
                    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
                        <Button onPress={onCreateOpen} color="primary">
                            <Plus className="h-5 w-5" />
                            Tambah Data
                        </Button>
                    </div>
                </div>
                <Table<Cashflow>
                    column={columns}
                    data={cashflows.data}
                    pagination={{
                        ...cashflows,
                        last_page: cashflows.last_page,
                        current_page: cashflows.current_page,
                        onChange: handlePageChange,
                    }}
                />
            </div>

            <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange}>
                <div className="fixed inset-0 z-50 flex h-screen min-h-screen items-center justify-center overflow-y-auto bg-black/30">
                    <ModalContent className="relative w-full max-w-sm rounded-2xl bg-white p-0 lg:max-w-4xl">
                        <CreateCashflow onClose={() => onCreateOpenChange()} />
                    </ModalContent>
                </div>
            </Modal>
            <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange}>
                <div className="fixed inset-0 z-50 flex h-screen min-h-screen items-center justify-center overflow-y-auto bg-black/30">
                    <ModalContent className="relative w-full max-w-sm rounded-2xl bg-white p-0 lg:max-w-4xl">
                        <EditCashflow cashflow={selectedCashflow} onClose={() => onEditOpenChange()} />
                    </ModalContent>
                </div>
            </Modal>

            <DeleteConfirmationDialog
                isOpen={isDeleteOpen}
                onClose={onDeleteOpenChange}
                onConfirm={confirmDelete}
                title="Hapus Data"
                description="Apakah anda yakin ingin menghapus data ini?"
            />
        </AuthenticatedLayout>
    );
}
