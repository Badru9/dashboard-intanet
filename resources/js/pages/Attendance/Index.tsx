import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import Table from '@/components/Table/Table';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Attendance, PageProps } from '@/types';
import { type TableColumn } from '@/types/table';
// Impor komponen Select dari @heroui/react
import { Button, Chip, Input, Modal, ModalContent, ModalHeader, Select, SelectItem, useDisclosure } from '@heroui/react';
import { Head, router, usePage } from '@inertiajs/react';
import { MagnifyingGlass, PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import moment from 'moment';
import { useState } from 'react';

type AttendancePageProps = PageProps &
    Record<string, unknown> & {
        attendances: {
            data: Attendance[];
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
        // Perbarui filters untuk menyertakan 'status'
        filters: {
            search?: string;
            status?: string;
            // tambahkan filter lain jika ada
        };
        auth: {
            user: {
                is_admin: number;
            };
        };
    };

export default function AttendancesIndex() {
    const { attendances, filters, auth } = usePage<AttendancePageProps>().props;

    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();

    const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');

    // const filteredAttendances = useMemo(() => {
    //     if (!search) return attendances.data;
    //     return attendances.data.filter(
    //         (attendance: Attendance) =>
    //             attendance.date.toLowerCase().includes(search.toLowerCase()) ||
    //             attendance.status.toString().toLowerCase().includes(search.toLowerCase()) ||
    //             (attendance.notes && attendance.notes.toLowerCase().includes(search.toLowerCase())) ||
    //             (attendance.user?.name && attendance.user.name.toLowerCase().includes(search.toLowerCase())),
    //     );
    // }, [attendances.data, search]);

    const statusOptions = [
        { key: 'all', label: 'Semua Status' },
        { key: 'PRESENT', label: 'Hadir' },
        { key: 'ABSENT', label: 'Tidak Hadir' },
        { key: 'LEAVE', label: 'Cuti' },
        { key: 'SICK', label: 'Sakit' },
        { key: 'HALF_DAY', label: 'Setengah Hari' },
        { key: 'LATE', label: 'Terlambat' },
    ];

    const handleEdit = (attendance: Attendance) => {
        setSelectedAttendance(attendance);
        onEditOpen();
    };

    const handleDelete = (attendance: Attendance) => {
        setSelectedAttendance(attendance);
        onDeleteOpen();
    };

    const confirmDelete = () => {
        if (selectedAttendance) {
            router.delete(route('attendances.destroy', selectedAttendance.id), {
                onSuccess: () => {
                    onDeleteOpenChange();
                    setSelectedAttendance(null);
                },
            });
        }
    };

    const columns: TableColumn<Attendance>[] = [
        {
            header: 'Nama',
            value: (attendance: Attendance) => <p className="text-gray-600 dark:text-gray-300">{attendance.user?.name || 'N/A'}</p>,
        },
        {
            header: 'No HP',
            value: (attendance: Attendance) => <p className="text-gray-600 dark:text-gray-300">{attendance.user?.phone || 'N/A'}</p>,
        },
        {
            header: 'Email',
            value: (attendance: Attendance) => <p className="text-gray-600 dark:text-gray-300">{attendance.user?.email || 'N/A'}</p>,
        },
        {
            header: 'Tanggal',
            value: (attendance: Attendance) => (
                <p className="text-gray-600 dark:text-gray-300">{moment(attendance.date).format('DD MMMM YYYY') || 'N/A'}</p>
            ),
        },
        {
            header: 'Waktu Masuk',
            value: (attendance: Attendance) => (
                <p className="font-medium text-gray-900 dark:text-gray-100">
                    {attendance.check_in_time ? moment(attendance.check_in_time).format('HH.mm') : 'N/A'}
                </p>
            ),
        },
        {
            header: 'Waktu Pulang',
            value: (attendance: Attendance) => (
                <p className="font-medium text-gray-900 dark:text-gray-100">
                    {attendance.check_out_time ? moment(attendance.check_out_time).format('HH.mm') : 'N/A'}
                </p>
            ),
        },
        {
            header: 'Status',
            value: (attendance: Attendance) => {
                let color: 'success' | 'default' | 'warning' | 'danger' | 'primary' | 'secondary' | undefined;
                let statusText: string;

                switch (attendance.status) {
                    case 'PRESENT':
                        color = 'success';
                        statusText = 'Hadir';
                        break;
                    case 'LEAVE':
                        color = 'warning';
                        statusText = 'Cuti';
                        break;
                    case 'SICK':
                        color = 'secondary';
                        statusText = 'Sakit';
                        break;
                    case 'ABSENT':
                        color = 'danger';
                        statusText = 'Tidak Hadir';
                        break;
                    case 'HALF_DAY':
                        color = 'primary';
                        statusText = 'Setengah Hari';
                        break;
                    case 'LATE':
                        color = 'danger';
                        statusText = 'Terlambat';
                        break;
                    default:
                        color = 'default';
                        statusText = 'Tidak Diketahui';
                }
                return <Chip color={color}>{statusText}</Chip>;
            },
        },
        {
            header: 'Catatan',
            value: (attendance: Attendance) => <p className="text-gray-600 dark:text-gray-300">{attendance.notes || '-'}</p>,
        },
        {
            header: 'Aksi',
            value: (attendance: Attendance) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(attendance)}
                        className="cursor-pointer rounded-lg p-2 text-yellow-400 transition-colors hover:bg-yellow-400 hover:text-white"
                    >
                        <PencilSimple className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(attendance)}
                        className="cursor-pointer rounded-lg p-2 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                    >
                        <Trash className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearch = e.target.value;
        setSearch(newSearch);
        router.get(route('attendances.index'), { ...filters, search: newSearch, status: statusFilter }, { preserveState: true, replace: true });
    };

    const handleStatusChange = (value: string | number) => {
        // Menggunakan 'value' sebagai parameter, bukan event
        const newStatus = String(value); // Pastikan value adalah string
        setStatusFilter(newStatus);
        router.get(route('attendances.index'), { ...filters, search: search, status: newStatus }, { preserveState: true, replace: true });
    };

    const handlePageChange = (page: number) => {
        router.get(
            route('attendances.index'),
            { ...filters, page: page, search: search, status: statusFilter },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Presensi" />
            <div className="p-4 lg:p-8">
                <h2 className="mb-5 text-2xl font-bold text-gray-900 dark:text-gray-100">Data Presensi</h2>
                <div className="mb-6 flex w-full flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex w-full flex-col items-center justify-start gap-4 lg:flex-row">
                        <Input
                            startContent={<MagnifyingGlass className="h-4 w-4 text-gray-500" />}
                            type="text"
                            placeholder="Cari presensi..."
                            value={search}
                            onChange={handleSearch}
                            color="default"
                            variant="bordered"
                            radius="md"
                        />
                        <Select
                            placeholder="Pilih Status"
                            selectedKeys={[statusFilter]} // Mengikat nilai terpilih
                            onSelectionChange={(keys) => handleStatusChange(Array.from(keys)[0])} // Menangani perubahan selection
                            color="default"
                            variant="bordered"
                            radius="md"
                        >
                            {statusOptions.map((option) => (
                                <SelectItem key={option.key} textValue={option.label}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                    {auth.user.is_admin === 1 && (
                        <div className="flex w-full justify-center lg:w-1/2 lg:justify-end">
                            <Button onPress={onCreateOpen} color="primary" className="w-full lg:w-fit" startContent={<Plus className="h-5 w-5" />}>
                                Presensi
                            </Button>
                        </div>
                    )}
                </div>

                <Table<Attendance>
                    data={attendances.data}
                    column={columns}
                    pagination={{
                        ...attendances,
                        last_page: attendances.last_page,
                        current_page: attendances.current_page,
                        onChange: handlePageChange,
                    }}
                />

                {auth.user.is_admin === 1 && (
                    <>
                        <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} size="sm">
                            <div className="fixed inset-0 z-50 flex h-screen min-h-screen items-center justify-center overflow-y-auto bg-black/30">
                                <ModalContent className="relative rounded-2xl bg-white p-0 dark:bg-gray-900">
                                    <ModalHeader>
                                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tambah Presensi</h2>
                                    </ModalHeader>
                                    <div className="p-4">Form Tambah Presensi Akan Ada Di Sini</div>
                                </ModalContent>
                            </div>
                        </Modal>

                        <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} size="sm">
                            <div className="fixed inset-0 z-50 flex h-screen min-h-screen items-center justify-center overflow-y-auto bg-black/30">
                                <ModalContent className="relative rounded-2xl bg-white p-0 dark:bg-gray-900">
                                    <ModalHeader>
                                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Edit Presensi</h2>
                                    </ModalHeader>
                                    {selectedAttendance && (
                                        <div className="p-4">Form Edit Presensi Untuk ID: {selectedAttendance.id} Akan Ada Di Sini</div>
                                    )}
                                </ModalContent>
                            </div>
                        </Modal>

                        <DeleteConfirmationDialog
                            isOpen={isDeleteOpen}
                            onClose={onDeleteOpenChange}
                            onConfirm={confirmDelete}
                            title="Hapus Presensi"
                            description={`Apakah Anda yakin ingin menghapus data presensi tanggal ${selectedAttendance?.date}?`}
                        />
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
