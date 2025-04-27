import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import Table from '@/components/Table/Table';
import { Button } from '@/components/ui/button';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { CashflowCategory, PageProps } from '@/types';
import { TableColumn } from '@/types/table';
import { Modal, ModalContent, useDisclosure } from '@heroui/modal';
import { Head, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import moment from 'moment';
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
};

export default function CashflowsCategoriesIndex() {
    const { categories } = usePage<CashflowCategoryPageProps>().props;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CashflowCategory | null>(null);
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

    const columns: TableColumn<CashflowCategory>[] = [
        {
            header: 'Nama',
            value: 'name',
        },
        {
            header: 'Tipe',
            value: (value: CashflowCategory) => (value.is_out == 0 ? 'Pemasukan' : 'Pengeluaran'),
        },
        {
            header: 'Tanggal',
            value: (value: CashflowCategory) => moment(value.created_at).format('DD MMMM YYYY'),
        },
        {
            header: 'Catatan',
            value: (value: CashflowCategory) => value.note,
        },
        {
            header: 'Aksi',
            value: (value: CashflowCategory) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setSelectedCategory(value);
                            setIsEditModalOpen(true);
                        }}
                        className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-yellow-500"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => {
                            handleDelete(value);
                        }}
                        className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
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
            router.delete(route('cashflow-categories.destroy', selectedCategory.id), {
                onSuccess: () => {
                    onDeleteOpenChange();
                    setSelectedCategory(null);
                    console.log('Kategori berhasil dihapus');
                },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="p-8">
                <Head title="Cashflows Categories" />
                <div className="mb-6 flex items-center justify-end">
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah Kategori
                    </Button>
                </div>

                <Table<CashflowCategory> data={categories.data} column={columns} pagination={categories} />

                <Modal isOpen={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} size="lg">
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                        <ModalContent className="relative w-full max-w-4xl rounded-2xl bg-white p-0">
                            <CreateCashflowCategory onClose={() => setIsCreateModalOpen(false)} />
                        </ModalContent>
                    </div>
                </Modal>

                <Modal isOpen={isEditModalOpen} onOpenChange={setIsEditModalOpen} size="lg">
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                        <ModalContent className="relative w-full max-w-4xl rounded-2xl bg-white p-0">
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
