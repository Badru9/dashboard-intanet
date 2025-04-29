/* eslint-disable @typescript-eslint/no-explicit-any */
import { type InternetPackage } from '@/types';
import { Button } from '@heroui/react';
import { useForm } from '@inertiajs/react';

interface PackageFormData extends Record<string, any> {
    // [key: string]: string | number;
    name: string;
    speed: number;
    price: number;
}

interface EditPackageProps {
    package: InternetPackage;
    onClose: () => void;
}

export default function EditPackage({ package: pkg, onClose }: EditPackageProps) {
    const { data, setData, put, processing, errors } = useForm<PackageFormData>({
        name: pkg.name,
        speed: Number(pkg.speed),
        price: pkg.price,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('internet-packages.update', pkg.id), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="mx-auto mt-5 h-fit w-full rounded-2xl bg-white text-slate-800">
            <h2 className="px-5 pt-5 text-lg font-medium text-gray-900">Edit Paket Internet</h2>
            <form onSubmit={handleSubmit} className="space-y-6 p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Nama Paket
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="speed" className="block text-sm font-medium text-gray-700">
                            Kecepatan (Mbps)
                        </label>
                        <input
                            type="number"
                            id="speed"
                            value={data.speed}
                            onChange={(e) => setData('speed', Number(e.target.value))}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                            placeholder="Contoh: 10 Mbps"
                        />
                        {errors.speed && <p className="mt-1 text-sm text-red-600">{errors.speed}</p>}
                    </div>

                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                            Harga
                        </label>
                        <input
                            type="number"
                            id="price"
                            value={data.price}
                            onChange={(e) => setData('price', Number(e.target.value))}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
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
