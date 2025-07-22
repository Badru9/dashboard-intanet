import { User } from '@/types'; // Pastikan User type diimpor
import { Button, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { router, useForm } from '@inertiajs/react';
import React from 'react';

interface CreateAttendanceProps {
    onClose: () => void; // Fungsi untuk menutup modal
    users: User[]; // Pastikan users diterima sebagai prop
}

// Define the AttendanceType enum (if not already in '@/types')
// It's better to have this in a shared types file (e.g., '@/types/index.d.ts')
enum AttendanceType {
    PRESENT = 'PRESENT',
    LEAVE = 'LEAVE',
    SICK = 'SICK',
    ABSENT = 'ABSENT',
    HALF_DAY = 'HALF_DAY',
    LATE = 'LATE',
}

export default function CreateAttendance({ onClose, users }: CreateAttendanceProps) {
    // `users` sekarang diterima langsung sebagai prop, tidak perlu lagi dari usePage().props
    // const { users } = usePage<{ users: User[] }>().props;
    // const props = usePage().props;
    // console.log('create attendance', props); // Log ini sekarang tidak perlu lagi props, cukup users

    console.log('create attendance users prop:', users); // Log untuk memastikan users terbaca dari prop

    const { data, setData, processing, errors, reset } = useForm({
        user_id: '' as string | number, // Akan diisi dari select user
        date: '',
        check_in_time: '',
        check_out_time: '',
        break_start_time: '',
        break_end_time: '',
        status: '' as AttendanceType | '', // Akan diisi dari select status
        notes: '',
        location_check_in: '',
        location_check_out: '',
        photo_check_in: null as File | null,
        photo_check_out: null as File | null,
    });

    // Opsi status untuk dropdown
    const statusOptions = [
        { key: AttendanceType.PRESENT, label: 'Hadir' },
        { key: AttendanceType.ABSENT, label: 'Tidak Hadir' },
        { key: AttendanceType.LEAVE, label: 'Cuti' },
        { key: AttendanceType.SICK, label: 'Sakit' },
        { key: AttendanceType.HALF_DAY, label: 'Setengah Hari' },
        { key: AttendanceType.LATE, label: 'Terlambat' },
    ];

    // Opsi user untuk dropdown
    const userOptions = users.map((user) => ({
        key: String(user.id), // Key harus string untuk SelectItem
        label: user.name,
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formatDateTime = (date: string, time: string) => {
            if (!date || !time) return '';
            // `time` sudah dalam format HH:mm dari input type="time"
            // Menggabungkan YYYY-MM-DD dari date dengan HH:mm dari time, lalu menambahkan :00 untuk detik
            return `${date} ${time}:00`;
        };

        const payload = {
            ...data,
            // PERBAIKAN DI SINI: Panggil formatDateTime langsung dengan data.check_in_time (HH:mm)
            check_in_time: formatDateTime(data.date, data.check_in_time),
            check_out_time: data.check_out_time ? formatDateTime(data.date, data.check_out_time) : null,
            break_start_time: data.break_start_time ? formatDateTime(data.date, data.break_start_time) : null,
            break_end_time: data.break_end_time ? formatDateTime(data.date, data.break_end_time) : null,
        };

        console.log('Payload yang akan dikirim:', payload);

        router.post(route('attendances.store'), payload, {
            onSuccess: () => {
                reset();
                onClose();
            },
            onError: (formErrors) => {
                console.error('Form Errors:', formErrors);
                // Inertia secara otomatis akan mengisi `errors` state
            },
            forceFormData: true,
        });
    };

    return (
        <div className="mx-auto mt-5 max-h-[75vh] w-full overflow-y-auto rounded-2xl bg-white text-slate-800 dark:bg-gray-900 dark:text-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6 px-5 pb-5">
                {/* User Select */}
                <div>
                    <Select
                        label="Pilih Pengguna"
                        selectedKeys={data.user_id ? [String(data.user_id)] : []}
                        onSelectionChange={(keys) => setData('user_id', Array.from(keys)[0] as string)}
                        placeholder="Pilih pengguna"
                        color={errors.user_id ? 'danger' : 'default'}
                        variant="bordered"
                        radius="md"
                        isRequired
                    >
                        {userOptions.map((user) => (
                            <SelectItem key={user.key} textValue={user.label}>
                                {user.label}
                            </SelectItem>
                        ))}
                    </Select>
                    {errors.user_id && <p className="mt-1 text-sm text-red-500">{errors.user_id}</p>}
                </div>

                {/* Date Input */}
                <div>
                    <Input
                        type="date"
                        label="Tanggal Presensi"
                        value={data.date}
                        onChange={(e) => setData('date', e.target.value)}
                        color={errors.date ? 'danger' : 'default'}
                        variant="bordered"
                        radius="md"
                        isRequired
                    />
                    {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
                </div>

                {/* Check-in Time */}
                <div>
                    <Input
                        type="time"
                        label="Waktu Masuk"
                        value={data.check_in_time}
                        onChange={(e) => setData('check_in_time', e.target.value)}
                        color={errors.check_in_time ? 'danger' : 'default'}
                        variant="bordered"
                        radius="md"
                        isRequired
                    />
                    {errors.check_in_time && <p className="mt-1 text-sm text-red-500">{errors.check_in_time}</p>}
                </div>

                {/* Check-out Time */}
                <div>
                    <Input
                        type="time"
                        label="Waktu Pulang (Opsional)"
                        value={data.check_out_time || ''}
                        onChange={(e) => setData('check_out_time', e.target.value)}
                        color={errors.check_out_time ? 'danger' : 'default'}
                        variant="bordered"
                        radius="md"
                    />
                    {errors.check_out_time && <p className="mt-1 text-sm text-red-500">{errors.check_out_time}</p>}
                </div>

                {/* Break Start Time */}
                <div>
                    <Input
                        type="time"
                        label="Mulai Istirahat (Opsional)"
                        value={data.break_start_time || ''}
                        onChange={(e) => setData('break_start_time', e.target.value)}
                        color={errors.break_start_time ? 'danger' : 'default'}
                        variant="bordered"
                        radius="md"
                    />
                    {errors.break_start_time && <p className="mt-1 text-sm text-red-500">{errors.break_start_time}</p>}
                </div>

                {/* Break End Time */}
                <div>
                    <Input
                        type="time"
                        label="Selesai Istirahat (Opsional)"
                        value={data.break_end_time || ''}
                        onChange={(e) => setData('break_end_time', e.target.value)}
                        color={errors.break_end_time ? 'danger' : 'default'}
                        variant="bordered"
                        radius="md"
                    />
                    {errors.break_end_time && <p className="mt-1 text-sm text-red-500">{errors.break_end_time}</p>}
                </div>

                {/* Status Select */}
                <div>
                    <Select
                        label="Status Presensi"
                        selectedKeys={data.status ? [data.status] : []}
                        onSelectionChange={(keys) => setData('status', Array.from(keys)[0] as AttendanceType)}
                        placeholder="Pilih status"
                        color={errors.status ? 'danger' : 'default'}
                        variant="bordered"
                        radius="md"
                        isRequired
                    >
                        {statusOptions.map((option) => (
                            <SelectItem key={option.key} textValue={option.label}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </Select>
                    {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
                </div>

                {/* Notes Textarea */}
                <div>
                    <Textarea
                        label="Catatan (Opsional)"
                        value={data.notes || ''}
                        onChange={(e) => setData('notes', e.target.value)}
                        color={errors.notes ? 'danger' : 'default'}
                        variant="bordered"
                        radius="md"
                    />
                    {errors.notes && <p className="mt-1 text-sm text-red-500">{errors.notes}</p>}
                </div>

                {/* Location Check-in */}
                <div>
                    <Input
                        type="text"
                        label="Lokasi Masuk (Opsional)"
                        value={data.location_check_in || ''}
                        onChange={(e) => setData('location_check_in', e.target.value)}
                        color={errors.location_check_in ? 'danger' : 'default'}
                        variant="bordered"
                        radius="md"
                    />
                    {errors.location_check_in && <p className="mt-1 text-sm text-red-500">{errors.location_check_in}</p>}
                </div>

                {/* Location Check-out */}
                <div>
                    <Input
                        type="text"
                        label="Lokasi Pulang (Opsional)"
                        value={data.location_check_out || ''}
                        onChange={(e) => setData('location_check_out', e.target.value)}
                        color={errors.location_check_out ? 'danger' : 'default'}
                        variant="bordered"
                        radius="md"
                    />
                    {errors.location_check_out && <p className="mt-1 text-sm text-red-500">{errors.location_check_out}</p>}
                </div>

                {/* Photo Check-in */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Foto Masuk (Opsional)</label>
                    <input
                        type="file"
                        onChange={(e) => setData('photo_check_in', e.target.files ? e.target.files[0] : null)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200 dark:hover:file:bg-gray-600"
                    />
                    {errors.photo_check_in && <p className="mt-1 text-sm text-red-500">{errors.photo_check_in}</p>}
                </div>

                {/* Photo Check-out */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Foto Pulang (Opsional)</label>
                    <input
                        type="file"
                        onChange={(e) => setData('photo_check_out', e.target.files ? e.target.files[0] : null)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200 dark:hover:file:bg-gray-600"
                    />
                    {errors.photo_check_out && <p className="mt-1 text-sm text-red-500">{errors.photo_check_out}</p>}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="flat" onPress={onClose}>
                        Batal
                    </Button>
                    <Button type="submit" color="primary" isLoading={processing}>
                        Simpan Presensi
                    </Button>
                </div>
            </form>
        </div>
    );
}
