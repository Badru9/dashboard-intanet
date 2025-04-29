/* eslint-disable @typescript-eslint/no-explicit-any */
import { CUSTOMER_STATUS_OPTIONS } from '@/constants';
import { currencyFormat } from '@/lib/utils';
import { InternetPackage, type Customer, type PageProps } from '@/types';
import { Button, DatePicker, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { router, useForm, usePage } from '@inertiajs/react';
import { DateValue } from '@internationalized/date';

interface CreateCustomerPageProps extends PageProps, Record<string, any> {
    packages: InternetPackage[];
}

interface CustomerFormData extends Record<string, any> {
    [key: string]: any;
    name: string;
    status: Customer['status'];
    address: string;
    npwp: string;
    package_id: string;
    coordinates?: Record<string, string>;
    phone: string;
    join_date?: DateValue | null;
    email?: string;
}

export default function CreateCustomer({ onClose }: { onClose: () => void }) {
    const { packages } = usePage<CreateCustomerPageProps>().props;

    const { data, setData, processing, errors } = useForm<CustomerFormData>({
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

        // Konversi ke string hanya saat submit
        const payload = {
            ...data,
            join_date: data.join_date
                ? `${data.join_date.year}-${String(data.join_date.month).padStart(2, '0')}-${String(data.join_date.day).padStart(2, '0')}`
                : null,
        };

        router.post(route('customers.store'), payload, {
            onSuccess: () => {
                onClose();
                console.log('success');
            },
            onError: (error) => {
                console.log('error', error);
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
                            selectedKeys={data.package_id}
                        >
                            {packages?.map((pkg) => (
                                <SelectItem key={pkg.id} textValue={pkg.name + ' - ' + currencyFormat(pkg.price)}>
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
                            id="join_date"
                            value={data.join_date ?? null}
                            onChange={(value) => setData('join_date', value)}
                            isInvalid={!!errors.join_date}
                            errorMessage={errors.join_date}
                            selectorButtonPlacement="start"
                        />
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
