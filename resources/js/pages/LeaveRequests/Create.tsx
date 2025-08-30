import { LEAVE_TYPE_OPTIONS } from '@/constants';
import { Button, Input, ModalBody, ModalFooter, ModalHeader, Select, SelectItem, Textarea } from '@heroui/react';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

interface CreateLeaveRequestProps {
    onClose: () => void;
}

export default function CreateLeaveRequest({ onClose }: CreateLeaveRequestProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        leave_type: 'annual' as 'annual' | 'sick' | 'maternity' | 'paternity' | 'emergency' | 'unpaid',
        start_date: '',
        end_date: '',
        reason: '',
        attachment: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('leave_type', data.leave_type);
        formData.append('start_date', data.start_date);
        formData.append('end_date', data.end_date);
        formData.append('reason', data.reason);

        if (selectedFile) {
            formData.append('attachment', selectedFile);
        }

        post(route('leave-requests.store'), {
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

    return (
        <>
            <ModalHeader>Ajukan Cuti Baru</ModalHeader>
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
                            <label className="mb-2 block text-sm font-medium text-gray-700">Lampiran (Opsional)</label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {errors.attachment && <p className="mt-1 text-sm text-red-600">{errors.attachment}</p>}
                            <p className="mt-1 text-xs text-gray-500">Format yang didukung: PDF, JPG, JPEG, PNG. Maksimal 5MB.</p>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose} isDisabled={processing}>
                        Batal
                    </Button>
                    <Button type="submit" color="primary" isLoading={processing}>
                        Ajukan Cuti
                    </Button>
                </ModalFooter>
            </form>
        </>
    );
}
