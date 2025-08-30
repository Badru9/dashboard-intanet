import { LEAVE_TYPE_OPTIONS } from '@/constants';
import type { LeaveRequest } from '@/types';
import { Button, Input, ModalBody, ModalFooter, ModalHeader, Select, SelectItem, Textarea } from '@heroui/react';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

interface EditLeaveRequestProps {
    leaveRequest: LeaveRequest;
    onClose: () => void;
}

export default function EditLeaveRequest({ leaveRequest, onClose }: EditLeaveRequestProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        leave_type: leaveRequest.leave_type || 'annual',
        start_date: leaveRequest.start_date || '',
        end_date: leaveRequest.end_date || '',
        reason: leaveRequest.reason || '',
        attachment: null as File | null,
        _method: 'PUT',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('leave_type', data.leave_type);
        formData.append('start_date', data.start_date);
        formData.append('end_date', data.end_date);
        formData.append('reason', data.reason);
        formData.append('_method', 'PUT');

        if (selectedFile) {
            formData.append('attachment', selectedFile);
        }

        post(route('leave-requests.update', leaveRequest.id), {
            forceFormData: true,
            onSuccess: () => {
                onClose();
                reset();
                setSelectedFile(null);
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedFile(file);
        setData('attachment', file);
    };

    const getLeaveTypeLabel = (type: string) => {
        const option = LEAVE_TYPE_OPTIONS.find((opt) => opt.value === type);
        return option ? option.label : type;
    };

    return (
        <>
            <ModalHeader>
                <div>
                    <h3 className="text-lg font-semibold">Edit Pengajuan Cuti</h3>
                    <p className="text-sm text-gray-500">
                        {leaveRequest.user.name} - {getLeaveTypeLabel(leaveRequest.leave_type)}
                    </p>
                </div>
            </ModalHeader>
            <form onSubmit={handleSubmit}>
                <ModalBody>
                    <div className="space-y-4">
                        <Select
                            label="Jenis Cuti"
                            placeholder="Pilih jenis cuti"
                            selectedKeys={[data.leave_type]}
                            onSelectionChange={(keys) => {
                                const selected = Array.from(keys)[0] as string;
                                setData('leave_type', selected as 'annual' | 'sick' | 'maternity' | 'paternity' | 'emergency' | 'unpaid');
                            }}
                            isInvalid={!!errors.leave_type}
                            errorMessage={errors.leave_type}
                            isRequired
                        >
                            {LEAVE_TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option.value}>{option.label}</SelectItem>
                            ))}
                        </Select>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="date"
                                label="Tanggal Mulai"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                isInvalid={!!errors.start_date}
                                errorMessage={errors.start_date}
                                isRequired
                            />
                            <Input
                                type="date"
                                label="Tanggal Selesai"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                                isInvalid={!!errors.end_date}
                                errorMessage={errors.end_date}
                                isRequired
                            />
                        </div>

                        <Textarea
                            label="Alasan Cuti"
                            placeholder="Jelaskan alasan pengajuan cuti..."
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            isInvalid={!!errors.reason}
                            errorMessage={errors.reason}
                            maxLength={1000}
                            isRequired
                        />

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Lampiran</label>
                            {leaveRequest.attachment && (
                                <div className="mb-2 rounded-lg bg-gray-50 p-2">
                                    <p className="text-sm text-gray-600">
                                        Lampiran saat ini:
                                        <a
                                            href={`/storage/${leaveRequest.attachment}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            Lihat file
                                        </a>
                                    </p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {errors.attachment && <p className="mt-1 text-sm text-red-600">{errors.attachment}</p>}
                            <p className="mt-1 text-xs text-gray-500">
                                {leaveRequest.attachment
                                    ? 'Pilih file baru untuk mengganti lampiran yang ada. Kosongkan jika tidak ingin mengubah.'
                                    : 'Format yang didukung: PDF, JPG, JPEG, PNG. Maksimal 5MB.'}
                            </p>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose} isDisabled={processing}>
                        Batal
                    </Button>
                    <Button type="submit" color="primary" isLoading={processing}>
                        Perbarui Pengajuan
                    </Button>
                </ModalFooter>
            </form>
        </>
    );
}
