import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import Table from '@/components/Table/Table';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Attendance, PageProps, User } from '@/types';
import { type TableColumn } from '@/types/table';
// Impor komponen Select dari @heroui/react
import { Button, Chip, Input, Modal, ModalBody, ModalContent, ModalHeader, Select, SelectItem, useDisclosure } from '@heroui/react';
import { Head, router, usePage } from '@inertiajs/react';
import { Camera, MagnifyingGlass, PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import moment from 'moment';
import { useState } from 'react';
import CreateAttendance from './Create';

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
        users: User[];
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
    const { attendances, users, filters, auth } = usePage<AttendancePageProps>().props;

    console.log(attendances);

    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();
    const { isOpen: isPhotoOpen, onOpen: onPhotoOpen, onOpenChange: onPhotoOpenChange } = useDisclosure();

    const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; type: 'check_in' | 'check_out'; userName: string } | null>(null);
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

    const handleViewPhoto = (photoPath: string, type: 'check_in' | 'check_out', userName: string) => {
        setSelectedPhoto({
            url: `/storage/${photoPath}`,
            type,
            userName,
        });
        onPhotoOpen();
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
                    {attendance.check_in_time ? moment.utc(attendance.check_in_time).format('HH:mm') : 'N/A'}
                </p>
            ),
        },
        {
            header: 'Waktu Pulang',
            value: (attendance: Attendance) => (
                <p className="font-medium text-gray-900 dark:text-gray-100">
                    {attendance.check_out_time ? moment.utc(attendance.check_out_time).format('HH:mm') : 'N/A'}
                </p>
            ),
        },
        {
            header: 'Foto Masuk',
            value: (attendance: Attendance) => (
                <div className="flex flex-col items-start space-y-1">
                    {attendance.photo_check_in ? (
                        <>
                            <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                onPress={() => handleViewPhoto(attendance.photo_check_in!, 'check_in', attendance.user?.name || 'Unknown')}
                                startContent={<Camera className="h-4 w-4" />}
                            >
                                Lihat Foto
                            </Button>
                            <span className="text-xs text-gray-500">
                                {attendance.check_in_time ? moment.utc(attendance.check_in_time).format('HH:mm') : ''}
                            </span>
                        </>
                    ) : (
                        <span className="text-sm text-gray-400">Tidak ada foto</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Foto Pulang',
            value: (attendance: Attendance) => (
                <div className="flex flex-col items-start space-y-1">
                    {attendance.photo_check_out ? (
                        <>
                            <Button
                                size="sm"
                                color="secondary"
                                variant="flat"
                                onPress={() => handleViewPhoto(attendance.photo_check_out!, 'check_out', attendance.user?.name || 'Unknown')}
                                startContent={<Camera className="h-4 w-4" />}
                            >
                                Lihat Foto
                            </Button>
                            <span className="text-xs text-gray-500">
                                {attendance.check_out_time ? moment.utc(attendance.check_out_time).format('HH:mm') : ''}
                            </span>
                        </>
                    ) : (
                        <span className="text-sm text-gray-400">Tidak ada foto</span>
                    )}
                </div>
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
                            placeholder="Cari nama, tanggal, catatan..."
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

                <div className="overflow-x-auto">
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
                </div>

                {auth.user.is_admin === 1 && (
                    <>
                        <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} size="sm">
                            <div className="fixed inset-0 z-50 flex h-screen min-h-screen items-center justify-center overflow-y-auto bg-black/30">
                                <ModalContent className="relative rounded-2xl bg-white p-0 dark:bg-gray-900">
                                    <ModalHeader>
                                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tambah Presensi</h2>
                                    </ModalHeader>
                                    <CreateAttendance onClose={onCreateOpen} users={users} />
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

                {/* Photo Modal */}
                <Modal isOpen={isPhotoOpen} onOpenChange={onPhotoOpenChange} size="3xl">
                    <ModalContent>
                        <ModalHeader>
                            <div className="flex items-center gap-2">
                                <Camera className="h-5 w-5 text-gray-600" />
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Foto {selectedPhoto?.type === 'check_in' ? 'Check In' : 'Check Out'} - {selectedPhoto?.userName}
                                </h2>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            {selectedPhoto && (
                                <div className="flex flex-col items-center p-4">
                                    <div className="relative w-full max-w-md">
                                        <img
                                            src={selectedPhoto.url}
                                            alt={`Foto ${selectedPhoto.type === 'check_in' ? 'Check In' : 'Check Out'}`}
                                            className="h-auto w-full rounded-lg border border-gray-200 shadow-lg dark:border-gray-700"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const errorDiv = target.nextElementSibling as HTMLElement;
                                                if (errorDiv) {
                                                    errorDiv.style.display = 'flex';
                                                }
                                            }}
                                            loading="lazy"
                                        />
                                        <div
                                            className="hidden h-64 w-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
                                            style={{ display: 'none' }}
                                        >
                                            <Camera className="mb-2 h-12 w-12 text-gray-400" />
                                            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                                Foto tidak dapat dimuat
                                                <br />
                                                <span className="text-xs">File mungkin telah dihapus atau rusak</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {selectedPhoto.type === 'check_in' ? 'Foto saat check in' : 'Foto saat check out'}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                            {selectedPhoto.userName} - {moment(selectedAttendance?.date).format('DD MMMM YYYY')}
                                        </p>
                                        {selectedAttendance && (
                                            <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-500">
                                                <p>
                                                    <strong>Waktu:</strong>{' '}
                                                    {selectedPhoto.type === 'check_in'
                                                        ? moment.utc(selectedAttendance.check_in_time).format('HH:mm:ss')
                                                        : selectedAttendance.check_out_time
                                                          ? moment.utc(selectedAttendance.check_out_time).format('HH:mm:ss')
                                                          : 'N/A'}
                                                </p>
                                                {((selectedPhoto.type === 'check_in' && selectedAttendance.location_check_in) ||
                                                    (selectedPhoto.type === 'check_out' && selectedAttendance.location_check_out)) && (
                                                    <p>
                                                        <strong>Lokasi:</strong>{' '}
                                                        {selectedPhoto.type === 'check_in'
                                                            ? selectedAttendance.location_check_in
                                                            : selectedAttendance.location_check_out}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        <div className="mt-3 flex justify-center gap-2">
                                            <Button size="sm" color="primary" variant="flat" onPress={() => window.open(selectedPhoto.url, '_blank')}>
                                                Buka di Tab Baru
                                            </Button>
                                            <Button size="sm" color="secondary" variant="flat" onPress={onPhotoOpenChange}>
                                                Tutup
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
