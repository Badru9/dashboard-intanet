import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import Table from '@/components/Table/Table';
import { DEFAULT_CASHFLOW } from '@/constants';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { CashflowCategory, PageProps } from '@/types';
import { TableColumn } from '@/types/table';
import { Button, Modal, ModalContent, ModalHeader, useDisclosure } from '@heroui/react';
import { Head, router, usePage } from '@inertiajs/react';
import { PencilSimple } from '@phosphor-icons/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import CreateCashflowCategory from './Create';
import EditCashflowCategory from './Edit';

type CashflowCategoryPageProps = PageProps & {
    categories: {
        data: CashflowCategory[];
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
    auth: {
        user: {
            is_admin: number;
        };
    };
};

export default function CashflowsCategoriesIndex() {
    const { categories, auth } = usePage<CashflowCategoryPageProps>().props;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CashflowCategory | null>(null);
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

    const baseColumns: TableColumn<CashflowCategory>[] = [
        {
            header: 'Nama',
            value: (value: CashflowCategory) => <span className="text-gray-900 dark:text-gray-100">{value.name}</span>,
        },
        {
            header: 'Tipe',
            value: (value: CashflowCategory) =>
                value.is_out == 1 ? (
                    <span className="text-red-500 dark:text-red-400">Pengeluaran</span>
                ) : (
                    <span className="text-green-500 dark:text-green-400">Pemasukan</span>
                ),
        },
        // {
        //     header: 'Tanggal',
        //     value: (value: CashflowCategory) => (
        //         <span className="text-gray-900 dark:text-gray-100">{moment(value.created_at).format('DD MMMM YYYY')}</span>
        //     ),
        // },
        {
            header: 'Catatan',
            value: (value: CashflowCategory) => <span className="text-gray-900 dark:text-gray-100">{value.note}</span>,
        },
    ];

    const adminColumns: TableColumn<CashflowCategory>[] = [
        ...baseColumns,
        {
            header: 'Aksi',
            value: (value: CashflowCategory) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => {
                            setSelectedCategory(value);
                            setIsEditModalOpen(true);
                        }}
                        className="cursor-pointer rounded-lg p-2 text-yellow-400 transition-colors hover:bg-yellow-400 hover:text-white"
                    >
                        <PencilSimple className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => {
                            handleDelete(value);
                        }}
                        className="cursor-pointer rounded-lg p-2 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    const handleDelete = (category: CashflowCategory) => {
        setSelectedCategory(category);
        onDeleteOpen();
    };

    const confirmDelete = () => {
        if (selectedCategory) {
            router.delete(`/cashflow-categories/${selectedCategory.id}`, {
                onSuccess: () => {
                    onDeleteOpenChange();
                    setSelectedCategory(null);
                    console.log('Kategori berhasil dihapus');
                },
            });
        }
    };

    const handlePageChange = (page: number) => {
        router.get(route('cashflow-categories.index'), { page }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Cashflows Categories" />
            <div className="p-4 lg:p-8">
                {auth.user.is_admin === 1 && (
                    <div className="mb-6 flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
                            <Button onPress={() => setIsCreateModalOpen(true)} color="primary">
                                <Plus className="h-5 w-5" />
                                Tambah Kategori
                            </Button>
                        </div>
                    </div>
                )}
                <Table
                    column={auth.user.is_admin === 1 ? adminColumns : baseColumns}
                    data={[DEFAULT_CASHFLOW[0], ...categories.data]}
                    pagination={{
                        ...categories,
                        last_page: categories.last_page,
                        current_page: categories.current_page,
                        onChange: handlePageChange,
                    }}
                />
                <Modal isOpen={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} size="sm">
                    <div className="fixed inset-0 z-50 flex h-screen min-h-screen items-center justify-center overflow-y-auto bg-black/30">
                        <ModalContent className="relative rounded-2xl bg-white p-0 dark:bg-gray-900">
                            <ModalHeader>
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tambah Kategori</h2>
                            </ModalHeader>
                            <CreateCashflowCategory onClose={() => setIsCreateModalOpen(false)} />
                        </ModalContent>
                    </div>
                </Modal>
                <Modal isOpen={isEditModalOpen} onOpenChange={setIsEditModalOpen} size="sm">
                    <div className="fixed inset-0 z-50 flex h-screen min-h-screen items-center justify-center overflow-y-auto bg-black/30">
                        <ModalContent className="relative rounded-2xl bg-white p-0 dark:bg-gray-900">
                            <ModalHeader>
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Edit Kategori</h2>
                            </ModalHeader>
                            {selectedCategory && <EditCashflowCategory category={selectedCategory} onClose={() => setIsEditModalOpen(false)} />}
                        </ModalContent>
                    </div>
                </Modal>
                <DeleteConfirmationDialog
                    isOpen={isDeleteOpen}
                    onClose={onDeleteOpenChange}
                    onConfirm={confirmDelete}
                    title="Hapus Kategori"
                    description={`Apakah Anda yakin ingin menghapus kategori ${selectedCategory?.name}?`}
                />
            </div>
        </AuthenticatedLayout>
    );
}
