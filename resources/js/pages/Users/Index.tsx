import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import Table from '@/components/Table/Table';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Customer, InternetPackage, PageProps, User } from '@/types';
import { type TableColumn } from '@/types/table';
import { Button, Input, Modal, ModalContent, useDisclosure } from '@heroui/react';
import { Head, router, usePage } from '@inertiajs/react';
import { MagnifyingGlass, PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import CreateInvoice from './Create';
import EditInvoice from './Edit';

type UserPageProps = PageProps &
    Record<string, unknown> & {
        users: {
            data: User[];
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
        packages: InternetPackage[];
        customers: Customer[];
        auth: {
            user: {
                is_admin: number;
            };
        };
    };

export default function UsersIndex() {
    const { users, filters, auth } = usePage<UserPageProps>().props;
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [search, setSearch] = useState(filters?.search || '');

    const filteredInvoices = useMemo(() => {
        if (!search) return users.data;
        return users.data.filter(
            (user) => user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()),
        );
    }, [users.data, search]);

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        onEditOpen();
    };

    const handleDelete = (user: User) => {
        setSelectedUser(user);
        onDeleteOpen();
    };

    const confirmDelete = () => {
        if (selectedUser) {
            router.delete(route('users.destroy', selectedUser.id), {
                onSuccess: () => {
                    onDeleteOpenChange();
                    setSelectedUser(null);
                },
            });
        }
    };

    const columns: TableColumn<User>[] = [
        {
            header: 'Nama',
            value: (user: User) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-100">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`}
                            alt={user.name || 'User'}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <p className="text-gray-600">{user.name || 'N/A'}</p>
                </div>
            ),
        },
        {
            header: 'Jabatan',
            value: (user: User) => <p className="font-medium text-gray-900">{parseInt(user.is_admin.toString()) === 1 ? 'Admin' : 'User'}</p>,
        },
        {
            header: 'Email',
            value: (user: User) => <p className="font-medium text-gray-900">{user.email || 'N/A'}</p>,
        },
        {
            header: 'Aksi',
            value: (user: User) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(user)}
                        className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-yellow-500"
                    >
                        <PencilSimple className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(user)}
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
        router.get(route('users.index'), { search: e.target.value }, { preserveState: true, replace: true });
    };

    const handlePageChange = (page: number) => {
        router.get(route('users.index'), { page }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Users" />
            <div className="p-4 lg:p-8">
                <div className="mb-6 flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
                        <div className="relative w-full lg:w-auto">
                            <Input
                                startContent={<MagnifyingGlass className="h-4 w-4 text-gray-500" />}
                                type="text"
                                placeholder="Cari user..."
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
                                Tambah User
                            </Button>
                        )}
                    </div>
                </div>

                <Table<User>
                    data={filteredInvoices}
                    column={columns}
                    pagination={{
                        ...users,
                        last_page: users.last_page,
                        current_page: users.current_page,
                        onChange: handlePageChange,
                    }}
                />

                {auth.user.is_admin === 1 && (
                    <>
                        <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} scrollBehavior="outside" placement="center">
                            <div className="fixed inset-0 z-50 flex h-screen min-h-screen items-center justify-center overflow-y-auto bg-black/30">
                                <ModalContent className="relative mt-5 w-full max-w-sm rounded-2xl bg-white p-0 lg:max-w-4xl">
                                    <CreateInvoice onClose={() => onCreateOpenChange()} />
                                </ModalContent>
                            </div>
                        </Modal>

                        <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange}>
                            <div className="fixed inset-0 z-50 flex h-screen min-h-screen items-center justify-center overflow-y-auto bg-black/30">
                                <ModalContent className="relative w-full max-w-sm rounded-2xl bg-white p-0 lg:max-w-4xl">
                                    {selectedUser && <EditInvoice user={selectedUser} onClose={() => onEditOpenChange()} />}
                                </ModalContent>
                            </div>
                        </Modal>

                        <DeleteConfirmationDialog
                            isOpen={isDeleteOpen}
                            onClose={onDeleteOpenChange}
                            onConfirm={confirmDelete}
                            title="Hapus User"
                            description={`Apakah Anda yakin ingin menghapus data ${selectedUser?.name}?`}
                        />
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
