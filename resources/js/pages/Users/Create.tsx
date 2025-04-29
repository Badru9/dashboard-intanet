/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Input, Select, SelectItem } from '@heroui/react';
import { Head, router, useForm } from '@inertiajs/react';

interface UserFormData {
    [key: string]: any;
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    is_admin: number;
}

export default function CreateUser({ onClose }: { onClose: () => void }) {
    const { data, setData, processing, errors } = useForm<UserFormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        is_admin: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log('data', data);

        router.post(route('users.store'), data, {
            onSuccess: () => {
                onClose();
            },
            onError: (error) => {
                console.log('error', error);
            },
        });
    };

    return (
        <div className="mx-auto mt-5 h-fit w-full max-w-4xl overflow-y-auto rounded-2xl bg-white text-slate-800">
            <Head title="Tambah User" />
            <h2 className="px-5 text-lg font-medium text-gray-900">Tambah User Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-6 p-5">
                <div className="grid grid-cols-1 gap-3">
                    <div>
                        <Input
                            type="text"
                            label="Nama"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            isInvalid={!!errors.name}
                            errorMessage={errors.name}
                            required
                        />
                    </div>

                    <div>
                        <Input
                            type="email"
                            label="Email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            isInvalid={!!errors.email}
                            errorMessage={errors.email}
                            required
                        />
                    </div>

                    <div>
                        <Input
                            type="password"
                            label="Password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            isInvalid={!!errors.password}
                            errorMessage={errors.password}
                            required
                        />
                    </div>

                    <div>
                        <Input
                            type="password"
                            label="Konfirmasi Password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            isInvalid={!!errors.password_confirmation}
                            errorMessage={errors.password_confirmation}
                            required
                        />
                    </div>

                    <div>
                        <Select
                            label="Role"
                            value={data.is_admin.toString()}
                            onChange={(e) => setData('is_admin', parseInt(e.target.value))}
                            isInvalid={!!errors.is_admin}
                            errorMessage={errors.is_admin}
                            required
                        >
                            <SelectItem key="0" textValue="Bukan Admin">
                                Bukan Admin
                            </SelectItem>
                            <SelectItem key="1" textValue="Admin">
                                Admin
                            </SelectItem>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                    <Button onPress={onClose} color="default">
                        Batal
                    </Button>
                    <Button type="submit" disabled={processing} color="primary">
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
