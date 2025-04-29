/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from '@/types';
import { Button, Input, Select, SelectItem } from '@heroui/react';
import { useForm } from '@inertiajs/react';

interface EditInvoiceProps {
    user: User;
    onClose: () => void;
}

interface UserFormData {
    [key: string]: any;
    name: string;
    email: string;
    // password: string;
    is_admin: number;
}

export default function EditInvoice({ user, onClose }: EditInvoiceProps) {
    console.log('user', user);

    const { data, setData, put, processing, errors } = useForm<UserFormData>({
        name: user.name,
        email: user.email,
        // password: user.password,
        is_admin: parseInt(user.is_admin.toString()),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('users.update', user.id), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="mx-auto mt-5 h-fit w-full max-w-4xl overflow-y-auto rounded-2xl bg-white text-slate-800 dark:bg-gray-900 dark:text-gray-100">
            <h2 className="px-5 pt-5 text-lg font-medium text-gray-900 dark:text-gray-100">Edit User</h2>
            <form onSubmit={handleSubmit} className="space-y-6 p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                        label="Nama"
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        isInvalid={!!errors.name}
                        errorMessage={errors.name}
                    />

                    <Input
                        label="Email"
                        id="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        isInvalid={!!errors.email}
                        errorMessage={errors.email}
                    />

                    {/* <Input
                        label="Password"
                        id="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        isInvalid={!!errors.password}
                        errorMessage={errors.password}
                    /> */}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Select
                        label="Role"
                        value={data.is_admin.toString()}
                        onChange={(e) => setData('is_admin', parseInt(e.target.value))}
                        isInvalid={!!errors.is_admin}
                        errorMessage={errors.is_admin}
                        selectedKeys={[data.is_admin.toString()]}
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
