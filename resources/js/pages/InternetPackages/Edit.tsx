import { Button } from '@/components/ui/button';
import { type InternetPackage } from '@/types';
import { useForm } from '@inertiajs/react';

interface PackageFormData {
    [key: string]: string | number;
    name: string;
    speed: string;
    price: number;
    description: string;
}

interface EditPackageProps {
    package: InternetPackage;
    onClose: () => void;
}

export default function EditPackage({ package: pkg, onClose }: EditPackageProps) {
    const { data, setData, put, processing, errors } = useForm<PackageFormData>({
        name: pkg.name,
        speed: pkg.speed,
        price: pkg.price,
        description: pkg.description,
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
        <div className="mx-auto mt-5 h-screen w-full max-w-4xl overflow-y-auto rounded-2xl bg-white text-slate-800">
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
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="speed" className="block text-sm font-medium text-gray-700">
                            Kecepatan
                        </label>
                        <input
                            type="text"
                            id="speed"
                            value={data.speed}
                            onChange={(e) => setData('speed', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
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
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                        />
                        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Deskripsi
                        </label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="cursor-pointer border-none px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="cursor-pointer bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
