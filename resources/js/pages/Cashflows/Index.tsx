/* eslint-disable @typescript-eslint/no-explicit-any */
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import Table from '@/components/Table/Table';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { currencyFormat } from '@/lib/utils';
import { Cashflow, CashflowCategory, PageProps } from '@/types';
import { TableColumn } from '@/types/table';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    DateRangePicker,
    DateValue,
    Modal,
    ModalContent,
    Select,
    SelectItem,
    useDisclosure,
} from '@heroui/react';
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
    const { cashflows, categories, auth } = usePage<CashflowPageProps>().props;

    console.log('cashflows with date range', cashflows);

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
        const today = new CalendarDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

        if (!value) {
            setSelectedDateRange({
                start: today,
                end: today,
            });

            const params: {
                category?: string;
                date_range: {
                    startDate: string;
                    endDate: string;
                };
            } = {
                date_range: {
                    startDate: new Date(today.toString()).toISOString(),
                    endDate: new Date(today.toString()).toISOString(),
                },
            };

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

    // const handleResetFilters = () => {
    //     setSelectedCategory('all');
    //     setSelectedDateRange({
    //         start: new CalendarDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
    //         end: new CalendarDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
    //     });

    //     router.get(route('cashflows.index'), {}, { preserveState: true });
    // };

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
    ];

    // Hitung total income dan outcome
    const totals = cashflows.data.reduce(
        (acc, curr) => {
            if (curr.category?.is_out === 1) {
                acc.outcome += Number(curr.amount);
            } else {
                acc.income += Number(curr.amount);
            }
            return acc;
        },
        { income: 0, outcome: 0 },
    );

    const totalBalance = totals.income - totals.outcome;

    const adminColumns: TableColumn<Cashflow>[] = [
        ...columns,
        {
            header: 'Aksi',
            value: (cashflow: Cashflow) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(cashflow)}
                        className="cursor-pointer rounded-lg p-2 text-yellow-400 transition-colors hover:bg-yellow-400 hover:text-white"
                    >
                        <PencilSimple className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(cashflow)}
                        className="cursor-pointer rounded-lg p-2 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
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
                                color="default"
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
                                showMonthAndYearPickers
                                label="Filter Tanggal"
                                color="default"
                                visibleMonths={2}
                                selectorButtonPlacement="start"
                                value={selectedDateRange}
                                onChange={(value) => handleDateRangeChange(value as { start: DateValue; end: DateValue } | null)}
                                CalendarBottomContent={
                                    <div className="flex items-center justify-end px-3 py-2">
                                        <Button onPress={() => handleDateRangeChange(null)} color="danger" radius="full" variant="flat" size="sm">
                                            Clear
                                        </Button>
                                    </div>
                                }
                            />
                        </div>
                        {/* <Button onPress={handleResetFilters} color="danger" variant="flat">
                            Reset Filter
                        </Button> */}
                    </div>
                    {auth.user.is_admin === 1 && (
                        <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
                            <Button onPress={onCreateOpen} color="primary">
                                <Plus className="h-5 w-5" />
                                Tambah Data
                            </Button>
                        </div>
                    )}
                </div>
                <Table<Cashflow>
                    column={auth.user.is_admin === 1 ? adminColumns : columns}
                    data={cashflows.data}
                    pagination={{
                        ...cashflows,
                        last_page: cashflows.last_page,
                        current_page: cashflows.current_page,
                        onChange: handlePageChange,
                    }}
                />
                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="bg-green-50 dark:bg-green-900/20">
                        <CardHeader className="pb-0">
                            <h3 className="text-sm font-medium text-green-800 dark:text-green-400">Total Pemasukan</h3>
                        </CardHeader>
                        <CardBody>
                            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{currencyFormat(totals.income)}</p>
                        </CardBody>
                    </Card>
                    <Card className="bg-red-50 dark:bg-red-900/20">
                        <CardHeader className="pb-0">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Total Pengeluaran</h3>
                        </CardHeader>
                        <CardBody>
                            <p className="text-2xl font-semibold text-red-600 dark:text-red-400">{currencyFormat(totals.outcome)}</p>
                        </CardBody>
                    </Card>
                    <Card className={totalBalance >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}>
                        <CardHeader className="pb-0">
                            <h3
                                className={`text-sm font-medium ${totalBalance >= 0 ? 'text-blue-800 dark:text-blue-400' : 'text-orange-800 dark:text-orange-400'}`}
                            >
                                Total Saldo
                            </h3>
                        </CardHeader>
                        <CardBody>
                            <p
                                className={`text-2xl font-semibold ${totalBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}
                            >
                                {currencyFormat(totalBalance)}
                            </p>
                        </CardBody>
                    </Card>
                </div>
            </div>

            <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} size="sm">
                <div className="fixed inset-0 z-50 flex h-screen min-h-screen items-center justify-center overflow-y-auto bg-black/30 dark:bg-black/30">
                    <ModalContent className="relative rounded-2xl bg-white p-0 dark:bg-gray-900">
                        <CreateCashflow onClose={() => onCreateOpenChange()} />
                    </ModalContent>
                </div>
            </Modal>
            <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} size="sm">
                <div className="fixed inset-0 z-50 flex h-screen min-h-screen items-center justify-center overflow-y-auto bg-black/30 dark:bg-black/30">
                    <ModalContent className="relative w-full max-w-sm rounded-2xl bg-white p-0 lg:max-w-4xl dark:bg-gray-900">
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
