/* eslint-disable @typescript-eslint/no-explicit-any */
import { BILL_DATE_LENGTH, CUSTOMER_STATUS_OPTIONS } from '@/constants';
import { currencyFormat } from '@/lib/utils';
import { InternetPackage, type Customer, type PageProps } from '@/types';
import { addToast, Button, DatePicker, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { router, useForm, usePage } from '@inertiajs/react';
import { CalendarDate } from '@internationalized/date';

interface CreateCustomerPageProps extends PageProps, Record<string, any> {
    packages: InternetPackage[];
}

interface CustomerFormData {
    [key: string]: any;
    name: string;
    customer_id: string;
    status: Customer['status'];
    address: string;
    npwp: string;
    package_id: string;
    coordinates: {
        latitude: string;
        longitude: string;
    };
    phone: string;
    join_date: CalendarDate | null;
    bill_date: string;
    email: string;
}

export default function CreateCustomer({ onClose }: { onClose: () => void }) {
    const { packages } = usePage<CreateCustomerPageProps>().props;

    const { data, setData, processing, errors, setError, clearErrors } = useForm<CustomerFormData>({
        name: '',
        customer_id: '',
        status: 'online',
        address: '',
        npwp: '',
        package_id: '',
        coordinates: {
            latitude: '',
            longitude: '',
        },
        phone: '',
        join_date: null,
        bill_date: '',
        email: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        if (!data.name) {
            setError('name', 'Nama harus diisi');
        }

        if (!data.phone) {
            setError('phone', 'No. Telepon harus diisi');
        }
        if (!data.package_id) {
            setError('package_id', 'Paket harus dipilih');
        }
        if (!data.address) {
            setError('address', 'Alamat harus diisi');
        }
        if (!data.status) {
            setError('status', 'Status harus dipilih');
        }
        if (!data.join_date) {
            setError('join_date', 'Tanggal bergabung harus diisi');
        }
        if (!data.bill_date) {
            setError('bill_date', 'Tanggal tagihan harus diisi');
        }

        const payload = {
            ...data,
            join_date: data.join_date
                ? `${data.join_date.year}-${String(data.join_date.month).padStart(2, '0')}-${String(data.join_date.day).padStart(2, '0')}`
                : null,
        };
        console.log(payload);

        router.post(route('customers.store'), payload, {
            onSuccess: () => {
                onClose();
                addToast({
                    title: 'Success',
                    description: 'Customer berhasil ditambahkan',
                    color: 'success',
                });
                console.log('success');
            },
            onError: (error) => {
                addToast({
                    title: 'Error',
                    description: 'Customer gagal ditambahkan',
                    color: 'danger',
                });
                console.log('error', error);
            },
        });
    };

    return (
        <div className="mx-auto mt-5 max-h-[75vh] w-full overflow-y-auto rounded-2xl bg-white text-slate-800 dark:bg-gray-900 dark:text-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6 px-5 pb-5">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Data Diri</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Input
                            label="Nama Customer"
                            type="text"
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            isInvalid={!!errors.name}
                            errorMessage={errors.name}
                        />

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

                        <Input
                            label="ID Pelanggan"
                            type="text"
                            id="customer_id"
                            value={data.customer_id}
                            onChange={(e) => setData('customer_id', e.target.value)}
                            isInvalid={!!errors.customer_id}
                            errorMessage={errors.customer_id}
                        />

                        <Input
                            label="No. NPWP / NIK"
                            type="number"
                            id="tax_number"
                            value={data.npwp}
                            onChange={(e) => setData('npwp', e.target.value)}
                            isInvalid={!!errors.npwp}
                            errorMessage={errors.npwp}
                        />

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

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Alamat</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <Textarea
                                label="Alamat"
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                rows={3}
                                isInvalid={!!errors.address}
                                errorMessage={errors.address}
                            />
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Langganan</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <DatePicker
                                    label="Tanggal Berlangganan"
                                    id="join_date"
                                    value={data.join_date}
                                    onChange={(value) => setData('join_date', value)}
                                    isInvalid={!!errors.join_date}
                                    errorMessage={errors.join_date}
                                    selectorButtonPlacement="start"
                                />

                                <Select
                                    label="Tanggal Tagihan"
                                    id="bill_date"
                                    value={data.bill_date}
                                    onChange={(e) => setData('bill_date', e.target.value)}
                                    isInvalid={!!errors.bill_date}
                                    errorMessage={errors.bill_date}
                                    placeholder="Pilih Tanggal"
                                    selectedKeys={data.bill_date ? [data.bill_date] : []}
                                >
                                    {Array.from({ length: BILL_DATE_LENGTH }, (_, i) => i + 1).map((day) => (
                                        <SelectItem key={day.toString()} textValue={day.toString()}>
                                            {day}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <p className="ml-2 mt-2 text-xs text-red-500">* Setiap bulan</p>
                            </div>

                            <div className="space-y-2">
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
                                <Select
                                    label="Status"
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value as Customer['status'])}
                                    isInvalid={!!errors.status}
                                    errorMessage={errors.status}
                                    selectedKeys={[data.status]}
                                >
                                    {CUSTOMER_STATUS_OPTIONS.map((status) => (
                                        <SelectItem key={status.value}>{status.label}</SelectItem>
                                    ))}
                                </Select>
                            </div>
                        </div>
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
