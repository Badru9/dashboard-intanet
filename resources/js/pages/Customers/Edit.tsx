/* eslint-disable @typescript-eslint/no-explicit-any */
import { BILL_DATE_LENGTH, CUSTOMER_STATUS_OPTIONS } from '@/constants';
import { currencyFormat } from '@/lib/utils';
import { InternetPackage, type Customer, type PageProps } from '@/types';
import { Button, DatePicker, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { useForm, usePage } from '@inertiajs/react';
import { parseDate } from '@internationalized/date';

type EditCustomerPageProps = PageProps & {
    customer: Customer;
    packages: InternetPackage[];
};

// interface CoordinatesErrors {
//     latitude?: string;
//     longitude?: string;
// }

interface CustomerFormData {
    [key: string]: string | number | boolean | File | Blob | null | undefined | Record<string, any>;
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
    join_date?: string;
    bill_date?: string;
    active_date?: string;
    email: string;
}

interface EditCustomerProps {
    customer: Customer;
    onClose: () => void;
}

export default function EditCustomer({ customer, onClose }: EditCustomerProps) {
    const { packages } = usePage<EditCustomerPageProps>().props;

    const form = useForm<CustomerFormData>({
        name: customer.name,
        customer_id: customer.customer_id,
        status: customer.status,
        address: customer.address,
        npwp: customer.npwp,
        package_id: customer.package?.id?.toString() || '',
        coordinates: customer.coordinate
            ? {
                  latitude: customer.coordinate.split(',')[0],
                  longitude: customer.coordinate.split(',')[1],
              }
            : {
                  latitude: '',
                  longitude: '',
              },
        phone: customer.phone,
        join_date: customer?.join_date ? customer.join_date.split('T')[0] : '',
        bill_date: customer?.bill_date?.toString() || '',
        email: customer.email || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        form.clearErrors();

        console.log(form.data);

        if (!form.data.name) {
            form.setError('name', 'Nama customer wajib diisi');
        }
        if (!form.data.address) {
            form.setError('address', 'Alamat wajib diisi');
        }
        if (!form.data.npwp) {
            form.setError('npwp', 'NPWP/NIK wajib diisi');
        }
        if (!form.data.phone) {
            form.setError('phone', 'No. Telepon wajib diisi');
        }
        if (!form.data.package_id) {
            form.setError('package_id', 'Paket wajib dipilih');
        }
        if (!form.data.join_date) {
            form.setError('join_date', 'Tanggal bergabung wajib diisi');
        }
        if (!form.data.bill_date) {
            form.setError('bill_date', 'Tanggal tagihan wajib diisi');
        }

        if (form.data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.data.email)) {
            form.setError('email', 'Format email tidak valid');
        }

        if (!/^[0-9]{10,13}$/.test(form.data.phone)) {
            form.setError('phone', 'Nomor telepon harus 10-13 digit angka');
        }

        if (Object.keys(form.errors).length > 0) {
            return;
        }

        form.put(route('customers.update', customer.id), {
            onSuccess: () => {
                onClose();
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            },
        });
    };

    return (
        <div className="mx-auto mt-5 max-h-[75vh] w-full overflow-y-auto rounded-2xl bg-white text-slate-800 dark:bg-gray-900 dark:text-gray-100">
            <form onSubmit={handleSubmit} className="space-y-8 px-5 pb-5">
                {/* Data Diri Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Data Diri</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Input
                            label="Nama Customer"
                            type="text"
                            id="name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            isInvalid={!!form.errors.name}
                            errorMessage={form.errors.name}
                        />
                        <Input
                            label="ID Pelanggan"
                            type="text"
                            id="customer_id"
                            value={form.data.customer_id}
                            onChange={(e) => form.setData('customer_id', e.target.value)}
                            isInvalid={!!form.errors.customer_id}
                            errorMessage={form.errors.customer_id}
                        />
                        <Input
                            label="Email"
                            type="email"
                            id="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            placeholder="opsional"
                            isInvalid={!!form.errors.email}
                            errorMessage={form.errors.email}
                        />
                        <Input
                            label="No. NPWP / NIK"
                            type="number"
                            id="tax_number"
                            value={form.data.npwp}
                            onChange={(e) => form.setData('npwp', e.target.value)}
                            isInvalid={!!form.errors.npwp}
                            errorMessage={form.errors.npwp}
                        />
                        <Input
                            label="No. Telepon"
                            type="text"
                            id="phone"
                            value={form.data.phone}
                            onChange={(e) => form.setData('phone', e.target.value)}
                            isInvalid={!!form.errors.phone}
                            errorMessage={form.errors.phone}
                        />
                    </div>
                </div>

                {/* Alamat Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Alamat</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        <Textarea
                            label="Alamat"
                            id="address"
                            value={form.data.address}
                            onChange={(e) => form.setData('address', e.target.value)}
                            rows={3}
                            isInvalid={!!form.errors.address}
                            errorMessage={form.errors.address}
                        />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Input
                                label="Latitude"
                                type="text"
                                id="latitude"
                                placeholder="opsional"
                                value={form.data.coordinates.latitude}
                                onChange={(e) =>
                                    form.setData('coordinates', {
                                        ...form.data.coordinates,
                                        latitude: e.target.value,
                                    })
                                }
                                isInvalid={!!(form.errors as any).coordinates?.latitude}
                                errorMessage={(form.errors as any).coordinates?.latitude}
                            />
                            <Input
                                label="Longitude"
                                type="text"
                                id="longitude"
                                placeholder="opsional"
                                value={form.data.coordinates.longitude}
                                onChange={(e) =>
                                    form.setData('coordinates', {
                                        ...form.data.coordinates,
                                        longitude: e.target.value,
                                    })
                                }
                                isInvalid={!!(form.errors as any).coordinates?.longitude}
                                errorMessage={(form.errors as any).coordinates?.longitude}
                            />
                        </div>
                    </div>
                </div>

                {/* Paket Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Langganan</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DatePicker
                                label="Tanggal Berlangganan"
                                id="join_date"
                                value={form.data.join_date ? parseDate(form.data.join_date) : null}
                                onChange={(value) =>
                                    form.setData(
                                        'join_date',
                                        value ? `${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}` : '',
                                    )
                                }
                                isInvalid={!!form.errors.join_date}
                                errorMessage={form.errors.join_date}
                                showMonthAndYearPickers
                                selectorButtonPlacement="start"
                            />
                            <Select
                                label="Tanggal Tagihan"
                                id="bill_date"
                                value={form.data.bill_date}
                                onChange={(e) => form.setData('bill_date', e.target.value)}
                                isInvalid={!!form.errors.bill_date}
                                errorMessage={form.errors.bill_date}
                                placeholder="Pilih Tanggal"
                                selectedKeys={form.data.bill_date ? [form.data.bill_date] : []}
                            >
                                {Array.from({ length: BILL_DATE_LENGTH }, (_, i) => i + 1).map((day) => (
                                    <SelectItem key={day.toString()} textValue={day.toString()}>
                                        {day}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Select
                                label="Paket"
                                id="package_id"
                                value={form.data.package_id}
                                selectedKeys={[form.data.package_id]}
                                onChange={(e) => form.setData('package_id', e.target.value)}
                                isInvalid={!!form.errors.package_id}
                                errorMessage={form.errors.package_id}
                                placeholder="Pilih Paket"
                            >
                                {packages?.map((pkg) => (
                                    <SelectItem key={pkg.id} textValue={`${pkg.name} - ${currencyFormat(pkg.price)}`}>
                                        {pkg.name} - {currencyFormat(pkg.price)}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Select
                                label="Status"
                                id="status"
                                value={form.data.status}
                                selectedKeys={[form.data.status]}
                                onChange={(e) => form.setData('status', e.target.value as Customer['status'])}
                                isInvalid={!!form.errors.status}
                                errorMessage={form.errors.status}
                                isDisabled
                            >
                                {CUSTOMER_STATUS_OPTIONS.map((status) => (
                                    <SelectItem key={status.value} textValue={status.label}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    </div>
                    <p className="ml-2 text-xs text-red-500">* Tanggal tagihan akan diulang setiap bulan</p>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                    <Button onPress={onClose} color="default">
                        Batal
                    </Button>
                    <Button type="submit" disabled={form.processing} color="primary">
                        {form.processing ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
