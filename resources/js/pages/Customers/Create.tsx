import { Button } from '@/components/ui/button';
import { CUSTOMER_STATUS_OPTIONS } from '@/constants';
import { currencyFormat } from '@/lib/utils';
import { Coordinate, InternetPackage, type Customer, type PageProps } from '@/types';
import { useForm, usePage } from '@inertiajs/react';

interface CreateCustomerPageProps extends PageProps {
    packages: InternetPackage[];
}

interface CustomerFormData {
    [key: string]: string | number | Coordinate | undefined;
    name: string;
    status: Customer['status'];
    address: string;
    npwp: string;
    package_id: string;
    coordinates?: Coordinate;
    phone: string;
    join_date: string;
    email?: string;
}

export default function CreateCustomer({ onClose }: { onClose: () => void }) {
    const { packages } = usePage<CreateCustomerPageProps>().props;

    const { data, setData, post, processing, errors } = useForm<CustomerFormData>({
        name: '',
        status: 'active',
        address: '',
        npwp: '',
        package_id: '',
        coordinates: {
            latitude: '',
            longitude: '',
        },
        phone: '',
        join_date: new Date().toISOString().split('T')[0],
        email: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('customers.store'), {
            onSuccess: () => {
                onClose();
                console.log('success');
            },
            onError: () => {
                console.log(errors);
            },
        });
    };

    return (
        <div className="mx-auto mt-5 h-fit w-full max-w-4xl overflow-y-auto rounded-2xl bg-white text-slate-800">
            <h2 className="px-5 text-lg font-medium text-gray-900">Tambah Customer Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-6 p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Nama Customer
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
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            id="status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value as Customer['status'])}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                        >
                            {CUSTOMER_STATUS_OPTIONS.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                        {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Alamat
                        </label>
                        <textarea
                            id="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                        />
                        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                            placeholder="opsional"
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="tax_number" className="block text-sm font-medium text-gray-700">
                            No. NPWP / NIK
                        </label>
                        <input
                            type="number"
                            id="tax_number"
                            value={data.npwp}
                            onChange={(e) => setData('npwp', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                        />
                        {errors.npwp && <p className="mt-1 text-sm text-red-600">{errors.npwp}</p>}
                    </div>

                    <div>
                        <label htmlFor="package_id" className="block text-sm font-medium text-gray-700">
                            Paket
                        </label>
                        <select
                            id="package_id"
                            value={data.package_id}
                            onChange={(e) => setData('package_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                        >
                            <option value="">Pilih Paket</option>
                            {packages?.map((pkg) => (
                                <option key={pkg.id} value={pkg.id}>
                                    {pkg.name} - {currencyFormat(pkg.price)}
                                </option>
                            ))}
                        </select>
                        {errors.package_id && <p className="mt-1 text-sm text-red-600">{errors.package_id}</p>}
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            No. Telepon
                        </label>
                        <input
                            type="text"
                            id="phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                        />
                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>

                    <div>
                        <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                            Latitude
                        </label>
                        <input
                            type="text"
                            id="latitude"
                            placeholder="opsional"
                            value={data.coordinates?.latitude}
                            onChange={(e) =>
                                setData('coordinates', {
                                    latitude: e.target.value,
                                    longitude: data.coordinates?.longitude || '',
                                })
                            }
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                        />
                        {errors['coordinates.latitude'] && <p className="mt-1 text-sm text-red-600">{errors['coordinates.latitude']}</p>}
                    </div>

                    <div>
                        <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                            Longitude
                        </label>
                        <input
                            type="text"
                            id="longitude"
                            placeholder="opsional"
                            value={data.coordinates?.longitude}
                            onChange={(e) =>
                                setData('coordinates', {
                                    latitude: data.coordinates?.latitude || '',
                                    longitude: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                        />
                        {errors['coordinates.longitude'] && <p className="mt-1 text-sm text-red-600">{errors['coordinates.longitude']}</p>}
                    </div>

                    <div>
                        <label htmlFor="join_date" className="block text-sm font-medium text-gray-700">
                            Tanggal Bergabung
                        </label>
                        <input
                            type="date"
                            id="join_date"
                            value={data.join_date}
                            onChange={(e) => setData('join_date', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                        />
                        {errors.join_date && <p className="mt-1 text-sm text-red-600">{errors.join_date}</p>}
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
