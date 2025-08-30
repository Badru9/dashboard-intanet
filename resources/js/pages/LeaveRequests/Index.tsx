import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import Table from '@/components/Table/Table';
import { LEAVE_STATUS_OPTIONS, LEAVE_TYPE_OPTIONS } from '@/constants';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { type LeaveRequest, type PageProps } from '@/types';
import { type TableColumn } from '@/types/table';
import { Button, Chip, Input, Modal, ModalContent, ModalHeader, Select, SelectItem, Textarea, useDisclosure } from '@heroui/react';
import { Head, router, usePage } from '@inertiajs/react';
import { Check, Clock, File, MagnifyingGlass, PencilSimple, Trash, X } from '@phosphor-icons/react';
import moment from 'moment';
import { useMemo, useState } from 'react';
import EditLeaveRequest from './Edit';

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

const leaveTypeColors = {
    annual: 'bg-blue-100 text-blue-700',
    sick: 'bg-orange-100 text-orange-700',
    maternity: 'bg-pink-100 text-pink-700',
    paternity: 'bg-purple-100 text-purple-700',
    emergency: 'bg-red-100 text-red-700',
    unpaid: 'bg-gray-100 text-gray-700',
};

type LeaveRequestPageProps = PageProps &
    Record<string, unknown> & {
        leaveRequests: {
            data: LeaveRequest[];
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
                id: number;
            };
        };
    };

export default function LeaveRequestsIndex() {
    const { leaveRequests, filters, auth } = usePage<LeaveRequestPageProps>().props;

    // const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();
    const { isOpen: isApproveOpen, onOpen: onApproveOpen, onOpenChange: onApproveOpenChange } = useDisclosure();
    const { isOpen: isRejectOpen, onOpen: onRejectOpen, onOpenChange: onRejectOpenChange } = useDisclosure();

    const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState<string>(filters?.status || 'all');
    const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>(filters?.leave_type || 'all');
    const [rejectionReason, setRejectionReason] = useState('');

    const filteredLeaveRequests = useMemo(() => {
        if (!search && statusFilter === 'all' && leaveTypeFilter === 'all') return leaveRequests.data;

        let filtered = leaveRequests.data;

        if (search) {
            filtered = filtered.filter(
                (leaveRequest) =>
                    leaveRequest.user?.name.toLowerCase().includes(search.toLowerCase()) ||
                    leaveRequest.reason.toLowerCase().includes(search.toLowerCase()) ||
                    leaveRequest.leave_type.toLowerCase().includes(search.toLowerCase()),
            );
        }

        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter((leaveRequest) => leaveRequest.status === statusFilter);
        }

        if (leaveTypeFilter && leaveTypeFilter !== 'all') {
            filtered = filtered.filter((leaveRequest) => leaveRequest.leave_type === leaveTypeFilter);
        }

        return filtered;
    }, [leaveRequests.data, search, statusFilter, leaveTypeFilter]);

    const handleEdit = (leaveRequest: LeaveRequest) => {
        setSelectedLeaveRequest(leaveRequest);
        onEditOpen();
    };

    const handleDelete = (leaveRequest: LeaveRequest) => {
        setSelectedLeaveRequest(leaveRequest);
        onDeleteOpen();
    };

    const handleApprove = (leaveRequest: LeaveRequest) => {
        setSelectedLeaveRequest(leaveRequest);
        onApproveOpen();
    };

    const handleReject = (leaveRequest: LeaveRequest) => {
        setSelectedLeaveRequest(leaveRequest);
        onRejectOpen();
    };

    const confirmDelete = () => {
        if (selectedLeaveRequest) {
            router.delete(route('leave-requests.destroy', selectedLeaveRequest.id), {
                onSuccess: () => {
                    onDeleteOpenChange();
                    setSelectedLeaveRequest(null);
                },
            });
        }
    };

    const confirmApprove = () => {
        if (selectedLeaveRequest) {
            router.post(
                route('leave-requests.approve', selectedLeaveRequest.id),
                {},
                {
                    onSuccess: () => {
                        onApproveOpenChange();
                        setSelectedLeaveRequest(null);
                    },
                },
            );
        }
    };

    const confirmReject = () => {
        if (selectedLeaveRequest) {
            router.post(
                route('leave-requests.reject', selectedLeaveRequest.id),
                {
                    rejection_reason: rejectionReason,
                },
                {
                    onSuccess: () => {
                        onRejectOpenChange();
                        setSelectedLeaveRequest(null);
                        setRejectionReason('');
                    },
                },
            );
        }
    };

    const getLeaveTypeLabel = (type: string) => {
        const option = LEAVE_TYPE_OPTIONS.find((opt) => opt.value === type);
        return option ? option.label : type;
    };

    const getStatusLabel = (status: string) => {
        const option = LEAVE_STATUS_OPTIONS.find((opt) => opt.value === status);
        return option ? option.label : status;
    };

    const renderActions = (leaveRequest: LeaveRequest) => {
        const canEdit = leaveRequest.status === 'pending' && (auth.user.is_admin === 1 || leaveRequest.user_id === auth.user.id);
        const canDelete = leaveRequest.status === 'pending' && (auth.user.is_admin === 1 || leaveRequest.user_id === auth.user.id);
        const canApproveReject = auth.user.is_admin === 1 && leaveRequest.status === 'pending';

        return (
            <div className="flex items-center justify-end gap-2">
                {canApproveReject && (
                    <>
                        <Button
                            size="sm"
                            color="success"
                            variant="flat"
                            onPress={() => handleApprove(leaveRequest)}
                            startContent={<Check className="h-4 w-4" />}
                        >
                            Setujui
                        </Button>
                        <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => handleReject(leaveRequest)}
                            startContent={<X className="h-4 w-4" />}
                        >
                            Tolak
                        </Button>
                    </>
                )}
                {canEdit && (
                    <button
                        onClick={() => handleEdit(leaveRequest)}
                        className="cursor-pointer rounded-lg p-2 text-yellow-400 transition-colors hover:bg-yellow-400 hover:text-white"
                    >
                        <PencilSimple className="h-4 w-4" />
                    </button>
                )}
                {canDelete && (
                    <button
                        onClick={() => handleDelete(leaveRequest)}
                        className="cursor-pointer rounded-lg p-2 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                    >
                        <Trash className="h-4 w-4" />
                    </button>
                )}
            </div>
        );
    };

    const baseColumns: TableColumn<LeaveRequest>[] = [
        {
            header: 'Pemohon',
            sticky: true,
            value: (leaveRequest: LeaveRequest) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                        <img
                            src={`https://ui-avatars.com/api/?name=${leaveRequest.user?.name}&background=random`}
                            alt={leaveRequest.user?.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{leaveRequest.user?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {leaveRequest.id}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Jenis Cuti',
            value: (leaveRequest: LeaveRequest) => (
                <Chip size="sm" variant="flat" className={leaveTypeColors[leaveRequest.leave_type] || 'bg-gray-100 text-gray-700'}>
                    {getLeaveTypeLabel(leaveRequest.leave_type)}
                </Chip>
            ),
        },
        {
            header: 'Tanggal Mulai',
            value: (leaveRequest: LeaveRequest) => (
                <span className="text-gray-700 dark:text-gray-300">{moment(leaveRequest.start_date).format('DD MMM YYYY')}</span>
            ),
        },
        {
            header: 'Tanggal Selesai',
            value: (leaveRequest: LeaveRequest) => (
                <span className="text-gray-700 dark:text-gray-300">{moment(leaveRequest.end_date).format('DD MMM YYYY')}</span>
            ),
        },
        {
            header: 'Total Hari',
            value: (leaveRequest: LeaveRequest) => (
                <span className="font-medium text-gray-900 dark:text-gray-100">{leaveRequest.total_days} hari</span>
            ),
        },
        {
            header: 'Alasan',
            value: (leaveRequest: LeaveRequest) => (
                <div className="max-w-xs truncate text-gray-700 dark:text-gray-300" title={leaveRequest.reason}>
                    {leaveRequest.reason}
                </div>
            ),
        },
        {
            header: 'Lampiran',
            value: (leaveRequest: LeaveRequest) =>
                leaveRequest.attachment ? (
                    <a
                        href={`/storage/${leaveRequest.attachment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                        <File className="h-4 w-4" />
                        <span className="text-sm">Lihat</span>
                    </a>
                ) : (
                    <span className="text-gray-400">-</span>
                ),
        },
        {
            header: 'Status',
            value: (leaveRequest: LeaveRequest) => (
                <Chip
                    size="sm"
                    variant="flat"
                    className={statusColors[leaveRequest.status]}
                    startContent={
                        leaveRequest.status === 'pending' ? (
                            <Clock className="h-3 w-3" />
                        ) : leaveRequest.status === 'approved' ? (
                            <Check className="h-3 w-3" />
                        ) : (
                            <X className="h-3 w-3" />
                        )
                    }
                >
                    {getStatusLabel(leaveRequest.status)}
                </Chip>
            ),
        },
        {
            header: 'Disetujui Oleh',
            value: (leaveRequest: LeaveRequest) => <span className="text-gray-700 dark:text-gray-300">{leaveRequest.approver?.name || '-'}</span>,
        },
        {
            header: 'Tanggal Konfirmasi',
            value: (leaveRequest: LeaveRequest) => (
                <span className="text-gray-700 dark:text-gray-300">
                    {leaveRequest.approved_at ? moment(leaveRequest.approved_at).format('DD MMM YYYY HH:mm') : '-'}
                </span>
            ),
        },
        {
            header: 'Tanggal Pengajuan',
            value: (leaveRequest: LeaveRequest) => (
                <span className="text-gray-700 dark:text-gray-300">{moment(leaveRequest.created_at).format('DD MMM YYYY HH:mm')}</span>
            ),
        },
    ];

    const adminColumns: TableColumn<LeaveRequest>[] = [
        ...baseColumns,
        {
            header: 'Aksi',
            value: renderActions,
        },
    ];

    const regularUserColumns: TableColumn<LeaveRequest>[] = [
        ...baseColumns.filter((col) => col.header !== 'Disetujui Oleh'), // Remove approver column for regular users
        {
            header: 'Aksi',
            value: renderActions,
        },
    ];

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        router.get(
            route('leave-requests.index'),
            {
                search: e.target.value,
                status: statusFilter,
                leave_type: leaveTypeFilter,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        router.get(
            route('leave-requests.index'),
            {
                search,
                status: value,
                leave_type: leaveTypeFilter,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleLeaveTypeFilter = (value: string) => {
        setLeaveTypeFilter(value);
        router.get(
            route('leave-requests.index'),
            {
                search,
                status: statusFilter,
                leave_type: value,
            },
            { preserveState: true, replace: true },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            route('leave-requests.index'),
            {
                page,
                search,
                status: statusFilter,
                leave_type: leaveTypeFilter,
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pengajuan Cuti" />

            <div className="p-4 lg:p-8">
                <h2 className="mb-5 text-2xl font-bold text-gray-900 dark:text-gray-100">Pengajuan Cuti</h2>

                {/* Header with Search and Filters */}
                <div className="mb-6 flex w-full flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex w-full flex-col items-center justify-center gap-4 lg:w-1/2 lg:flex-row">
                        <Input
                            startContent={<MagnifyingGlass className="h-4 w-4 text-gray-500" />}
                            type="text"
                            placeholder="Cari nama pemohon / alasan..."
                            value={search}
                            onChange={handleSearch}
                            color="default"
                            variant="bordered"
                            radius="md"
                        />
                        <Select
                            placeholder="Pilih Status"
                            variant="bordered"
                            radius="md"
                            color="default"
                            value={statusFilter}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                        >
                            {[{ value: 'all', label: 'Semua Status' }, ...LEAVE_STATUS_OPTIONS].map((status) => (
                                <SelectItem key={status.value} textValue={status.label}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </Select>

                        <Select
                            placeholder="Pilih Jenis Cuti"
                            variant="bordered"
                            radius="md"
                            color="default"
                            value={leaveTypeFilter}
                            onChange={(e) => handleLeaveTypeFilter(e.target.value)}
                        >
                            {[{ value: 'all', label: 'Semua Jenis' }, ...LEAVE_TYPE_OPTIONS].map((type) => (
                                <SelectItem key={type.value} textValue={type.label}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>

                    {/* <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
                        <Button onPress={onCreateOpen} color="primary" variant="solid">
                            <Plus className="h-5 w-5" />
                            Ajukan Cuti
                        </Button>
                    </div> */}
                </div>

                {/* Leave Requests Table */}
                <div className="-mx-4 lg:mx-0">
                    <Table<LeaveRequest>
                        data={filteredLeaveRequests}
                        column={auth.user.is_admin === 1 ? adminColumns : regularUserColumns}
                        pagination={{
                            ...leaveRequests,
                            last_page: leaveRequests.last_page,
                            current_page: leaveRequests.current_page,
                            onChange: handlePageChange,
                        }}
                        rowClassName={(leaveRequest) => {
                            if (leaveRequest.status === 'approved') return 'bg-green-50 dark:bg-green-900/20';
                            if (leaveRequest.status === 'rejected') return 'bg-red-50 dark:bg-red-900/20';
                            if (leaveRequest.status === 'pending') return 'bg-yellow-50 dark:bg-yellow-900/20';
                            return 'bg-white dark:bg-gray-800';
                        }}
                    />
                </div>

                {/* Create Modal */}
                {/* <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} size="2xl">
                    <div className="fixed inset-0 z-50 h-screen bg-black/30 dark:bg-black/30">
                        <ModalContent className="relative rounded-2xl bg-white p-0 dark:bg-gray-900">
                            <ModalHeader>
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Ajukan Cuti</h2>
                            </ModalHeader>
                            <CreateLeaveRequest onClose={() => onCreateOpenChange()} />
                        </ModalContent>
                    </div>
                </Modal> */}

                {/* Edit Modal */}
                <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} size="2xl">
                    <div className="fixed inset-0 z-50 h-screen bg-black/30 dark:bg-black/30">
                        <ModalContent className="relative rounded-2xl bg-white p-0 dark:bg-gray-900">
                            <ModalHeader>
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Edit Pengajuan Cuti</h2>
                            </ModalHeader>
                            {selectedLeaveRequest && <EditLeaveRequest leaveRequest={selectedLeaveRequest} onClose={() => onEditOpenChange()} />}
                        </ModalContent>
                    </div>
                </Modal>

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationDialog
                    isOpen={isDeleteOpen}
                    onClose={onDeleteOpenChange}
                    onConfirm={confirmDelete}
                    title="Hapus Pengajuan Cuti"
                    description={`Apakah Anda yakin ingin menghapus pengajuan cuti ${selectedLeaveRequest?.user?.name}?`}
                />

                {/* Approve Confirmation Modal */}
                <Modal isOpen={isApproveOpen} onOpenChange={onApproveOpenChange}>
                    <ModalContent>
                        <ModalHeader>
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Setujui Pengajuan Cuti</h2>
                        </ModalHeader>
                        <div className="p-6">
                            <p className="mb-4 text-gray-600 dark:text-gray-400">
                                Apakah Anda yakin ingin menyetujui pengajuan cuti dari <strong>{selectedLeaveRequest?.user?.name}</strong>?
                            </p>
                            <div className="flex justify-end gap-3">
                                <Button variant="light" onPress={() => onApproveOpenChange()}>
                                    Batal
                                </Button>
                                <Button color="success" onPress={confirmApprove}>
                                    Ya, Setujui
                                </Button>
                            </div>
                        </div>
                    </ModalContent>
                </Modal>

                {/* Reject Confirmation Modal */}
                <Modal isOpen={isRejectOpen} onOpenChange={onRejectOpenChange}>
                    <ModalContent>
                        <ModalHeader>
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tolak Pengajuan Cuti</h2>
                        </ModalHeader>
                        <div className="p-6">
                            <p className="mb-4 text-gray-600 dark:text-gray-400">
                                Tolak pengajuan cuti dari <strong>{selectedLeaveRequest?.user?.name}</strong>
                            </p>
                            <Textarea
                                label="Alasan Penolakan"
                                placeholder="Jelaskan alasan penolakan..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                maxLength={500}
                                isRequired
                            />
                            <div className="mt-4 flex justify-end gap-3">
                                <Button
                                    variant="light"
                                    onPress={() => {
                                        onRejectOpenChange();
                                        setRejectionReason('');
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button color="danger" onPress={confirmReject} isDisabled={!rejectionReason.trim()}>
                                    Tolak
                                </Button>
                            </div>
                        </div>
                    </ModalContent>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
