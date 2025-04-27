import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import Table from '@/components/Table/Table';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { currencyFormat } from '@/lib/utils';
import { type InternetPackage, type PageProps } from '@/types';
import { type TableColumn } from '@/types/table';
import { Button, Modal, ModalBody, ModalContent, useDisclosure } from '@heroui/react';
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
    };

export default function InternetPackagesIndex() {
    const { packages, filters } = usePage<PackagePageProps>().props;
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

    const columns: TableColumn<InternetPackage>[] = [
        {
            header: 'Nama Paket',
            value: (pkg: InternetPackage) => <span className="font-medium text-gray-900">{pkg.name}</span>,
        },
        {
            header: 'Kecepatan',
            value: (pkg: InternetPackage) => <span className="text-gray-500">{pkg.speed}</span>,
        },
        {
            header: 'Harga',
            value: (pkg: InternetPackage) => <span className="font-medium text-gray-900">{currencyFormat(pkg.price)}</span>,
        },
        {
            header: 'Deskripsi',
            value: (pkg: InternetPackage) => <span className="text-gray-500">{pkg.description}</span>,
        },
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

    return (
        <AuthenticatedLayout>
            <Head title="Internet Packages" />

            <div className="p-4 lg:p-8">
                {/* Header with Search and Action */}
                <div className="mb-6 flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
                        <div className="relative w-full rounded-lg bg-white lg:w-auto">
                            <MagnifyingGlass className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari paket..."
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
                            Tambah Paket
                        </Button>
                    </div>
                </div>

                {/* Packages Table */}
                <div className="-mx-4 lg:mx-0">
                    <Table<InternetPackage> data={filteredPackages} column={columns} pagination={packages} />
                </div>

                {/* Modal for Create Package */}
                <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} size="lg">
                    <ModalContent className="bg-black/20">
                        {(onClose) => (
                            <ModalBody>
                                <CreatePackage onClose={onClose} />
                            </ModalBody>
                        )}
                    </ModalContent>
                </Modal>

                {/* Modal for Edit Package */}
                <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} size="lg">
                    <ModalContent className="bg-black/20">
                        {(onClose) => <ModalBody>{selectedPackage && <EditPackage package={selectedPackage} onClose={onClose} />}</ModalBody>}
                    </ModalContent>
                </Modal>

                {/* Modal for Delete Confirmation */}
                <DeleteConfirmationDialog
                    isOpen={isDeleteOpen}
                    onClose={onDeleteOpenChange}
                    onConfirm={confirmDelete}
                    title="Hapus Paket"
                    description={`Apakah Anda yakin ingin menghapus paket ${selectedPackage?.name}?`}
                />
            </div>
        </AuthenticatedLayout>
    );
}
