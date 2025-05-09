/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Input } from '@heroui/react';
import { useForm } from '@inertiajs/react';

interface InternetPackageFormData extends Record<string, any> {
    name: string;
    speed: string;
    price: string;
    description?: string;
}

export default function CreateInternetPackage({ onClose }: { onClose: () => void }) {
    const { data, setData, post, processing, errors } = useForm<InternetPackageFormData>({
        name: '',
        speed: '',
        price: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('internet-packages.store'), {
            onSuccess: onClose,
        });
    };

    return (
        <div className="mx-auto w-full rounded-2xl bg-white text-slate-800 dark:bg-gray-900 dark:text-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6 px-5 pb-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                        label="Nama Paket"
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        isInvalid={!!errors.name}
                        errorMessage={errors.name}
                        color="default"
                    />
                    <Input
                        label="Kecepatan (Mbps)"
                        id="speed"
                        type="number"
                        value={data.speed}
                        onChange={(e) => setData('speed', e.target.value)}
                        isInvalid={!!errors.speed}
                        errorMessage={errors.speed}
                        color="default"
                    />
                    <Input
                        label="Harga"
                        id="price"
                        type="number"
                        value={data.price}
                        onChange={(e) => setData('price', e.target.value)}
                        isInvalid={!!errors.price}
                        errorMessage={errors.price}
                        color="default"
                    />
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
