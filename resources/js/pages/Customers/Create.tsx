import { Button } from '@/components/ui/button';
import { CUSTOMER_STATUS_OPTIONS } from '@/constants';
import { currencyFormat } from '@/lib/utils';
import { Coordinate, InternetPackage, type Customer, type PageProps } from '@/types';
import { DatePicker, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { useForm, usePage } from '@inertiajs/react';
import { parseDate } from '@internationalized/date';

interface CreateCustomerPageProps extends PageProps {
    packages: InternetPackage[];
}

interface CustomerFormData {
    // [key: string]: string | number | Coordinate | undefined;
    name: string;
    status: Customer['status'];
    address: string;
    npwp: string;
    package_id: string;
    coordinates?: Coordinate;
    phone: string;
    join_date?: string | null;
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
        join_date: null,
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
                        <Input
                            label="Nama Customer"
                            type="text"
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            isInvalid={!!errors.name}
                            errorMessage={errors.name}
                        />
                    </div>

                    <div>
                        <Select
                            label="Status"
                            id="status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value as Customer['status'])}
                            isInvalid={!!errors.status}
                            errorMessage={errors.status}
                        >
                            {CUSTOMER_STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status.value}>{status.label}</SelectItem>
                            ))}
                        </Select>
                    </div>

                    <div className="sm:col-span-2">
                        <Textarea
                            label="Alamat"
                            id="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            rows={3}
                            isInvalid={!!errors.address}
                            errorMessage={errors.address}
                        />
                    </div>
                    <div>
                        <Input
                            label="Email"
                            type="email"
                            id="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="opsional"
                            isInvalid={!!errors.email}
                            errorMessage={errors.email}
                        />
                    </div>

                    <div>
                        <Input
                            label="No. NPWP / NIK"
                            type="number"
                            id="tax_number"
                            value={data.npwp}
                            onChange={(e) => setData('npwp', e.target.value)}
                            isInvalid={!!errors.npwp}
                            errorMessage={errors.npwp}
                        />
                    </div>

                    <div>
                        <Select
                            label="Paket"
                            id="package_id"
                            value={data.package_id}
                            onChange={(e) => setData('package_id', e.target.value)}
                            isInvalid={!!errors.package_id}
                            errorMessage={errors.package_id}
                            placeholder="Pilih Paket"
                        >
                            {packages?.map((pkg) => (
                                <SelectItem key={pkg.id} value={pkg.id.toString()}>
                                    {pkg.name} - {currencyFormat(pkg.price)}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <Input
                            label="No. Telepon"
                            type="text"
                            id="phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            isInvalid={!!errors.phone}
                            errorMessage={errors.phone}
                        />
                    </div>

                    <div>
                        <Input
                            label="Latitude"
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
                            isInvalid={!!errors['coordinates.latitude']}
                            errorMessage={errors['coordinates.latitude']}
                        />
                    </div>

                    <div>
                        <Input
                            label="Longitude"
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
                            isInvalid={!!errors['coordinates.longitude']}
                            errorMessage={errors['coordinates.longitude']}
                        />
                    </div>

                    <div>
                        <DatePicker
                            label="Tanggal Bergabung"
                            type="date"
                            id="join_date"
                            value={data.join_date ? parseDate(data.join_date) : undefined}
                            // onChange={(value) => setData('join_date', value)}
                            isInvalid={!!errors.join_date}
                            errorMessage={errors.join_date}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                    <Button onClick={onClose} variant={'default'}>
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
