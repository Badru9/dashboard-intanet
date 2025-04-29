import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import Table from '@/components/Table/Table';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { currencyFormat } from '@/lib/utils';
import { type InternetPackage, type PageProps } from '@/types';
import { type TableColumn } from '@/types/table';
import { Button, Input, Modal, ModalContent, useDisclosure } from '@heroui/react';
import { Head, router, usePage } from '@inertiajs/react';
import { MagnifyingGlass, PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import CreatePackage from './Create';
import EditPackage from './Edit';

type PackagePageProps = PageProps &
    Record<string, unknown> & {
        packages: {
            data: InternetPackage[];
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

export default function InternetPackagesIndex() {
    const { packages, filters, auth } = usePage<PackagePageProps>().props;
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();
    const [selectedPackage, setSelectedPackage] = useState<InternetPackage | null>(null);
    const [search, setSearch] = useState(filters?.search || '');

    const filteredPackages = useMemo(() => {
        if (!search) return packages.data;
        return packages.data.filter((pkg) => pkg.name.toLowerCase().includes(search.toLowerCase()));
    }, [packages.data, search]);

    const handleEdit = (pkg: InternetPackage) => {
        setSelectedPackage(pkg);
        onEditOpen();
    };

    const handleDelete = (pkg: InternetPackage) => {
        setSelectedPackage(pkg);
        onDeleteOpen();
    };

    const confirmDelete = () => {
        if (selectedPackage) {
            router.delete(route('internet-packages.destroy', selectedPackage.id), {
                onSuccess: () => {
                    onDeleteOpenChange();
                    setSelectedPackage(null);
                },
            });
        }
    };

    const baseColumns: TableColumn<InternetPackage>[] = [
        {
            header: 'Nama Paket',
            value: (pkg: InternetPackage) => <span className="font-medium text-gray-900 dark:text-gray-100">{pkg.name}</span>,
        },
        {
            header: 'Kecepatan',
            value: (pkg: InternetPackage) => <span className="text-gray-500 dark:text-gray-300">{pkg.speed} Mbps</span>,
        },
        {
            header: 'Harga',
            value: (pkg: InternetPackage) => <span className="font-medium text-gray-900 dark:text-gray-100">{currencyFormat(pkg.price)}</span>,
        },
    ];

    const adminColumns: TableColumn<InternetPackage>[] = [
        ...baseColumns,
        {
            header: 'Aksi',
            value: (pkg: InternetPackage) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(pkg)}
                        className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-yellow-500"
                    >
                        <PencilSimple className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(pkg)}
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
        router.get(route('internet-packages.index'), { search: e.target.value }, { preserveState: true, replace: true });
    };

    const handlePageChange = (page: number) => {
        router.get(route('internet-packages.index'), { page }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Internet Packages" />

            <div className="p-4 lg:p-8">
                <div className="mb-6 flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
                        <div className="relative w-full lg:w-auto">
                            <Input
                                startContent={<MagnifyingGlass className="h-4 w-4 text-gray-400" />}
                                type="text"
                                placeholder="Cari paket..."
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
                                Tambah Paket
                            </Button>
                        )}
                    </div>
                </div>

                <Table<InternetPackage>
                    data={filteredPackages}
                    column={auth.user.is_admin === 1 ? adminColumns : baseColumns}
                    pagination={{
                        ...packages,
                        last_page: packages.last_page,
                        current_page: packages.current_page,
                        onChange: handlePageChange,
                    }}
                />

                {auth.user.is_admin === 1 && (
                    <>
                        <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} size="sm">
                            <div className="fixed inset-0 z-50 flex h-screen min-h-screen items-center justify-center overflow-y-auto bg-black/30">
                                <ModalContent className="relative rounded-2xl bg-white p-0 dark:bg-gray-900">
                                    <CreatePackage onClose={() => onCreateOpenChange()} />
                                </ModalContent>
                            </div>
                        </Modal>

                        <Modal isOpen={isEditOpen} onOpenChange={onEditOpen} size="sm">
                            <div className="fixed inset-0 z-50 flex h-screen min-h-screen items-center justify-center overflow-y-auto bg-black/30">
                                <ModalContent className="relative rounded-2xl bg-white p-0 dark:bg-gray-900">
                                    {selectedPackage && <EditPackage package={selectedPackage} onClose={() => onEditOpenChange()} />}
                                </ModalContent>
                            </div>
                        </Modal>

                        <DeleteConfirmationDialog
                            isOpen={isDeleteOpen}
                            onClose={onDeleteOpenChange}
                            onConfirm={confirmDelete}
                            title="Hapus Paket"
                            description={`Apakah Anda yakin ingin menghapus paket ${selectedPackage?.name}?`}
                        />
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
