/* eslint-disable @typescript-eslint/no-explicit-any */
import { CUSTOMER_STATUS_OPTIONS } from '@/constants';
import { currencyFormat } from '@/lib/utils';
import { Coordinate, InternetPackage, type Customer, type PageProps } from '@/types';
import { Button, DatePicker, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { useForm, usePage } from '@inertiajs/react';
import { parseDate } from '@internationalized/date';

type EditCustomerPageProps = PageProps &
    Record<string, any> & {
        customer: Customer;
        packages: InternetPackage[];
    };

interface CustomerFormData extends Record<string, any> {
    // [key: string]: string | number | Coordinate | DateValue | null | undefined;
    name: string;
    status: Customer['status'];
    address: string;
    npwp: string;
    package_id: string;
    package?: InternetPackage;
    coordinates?: Coordinate;
    phone: string;
    join_date?: string | null;
    email?: string;
}

interface EditCustomerProps {
    customer: Customer;
    onClose: () => void;
}

export default function EditCustomer({ customer, onClose }: EditCustomerProps) {
    const { packages } = usePage<EditCustomerPageProps>().props;

    // const initialJoinDate = customer.join_date ? parseDate(customer.join_date.split('T')[0]) : null;

    const { data, setData, put, processing, errors } = useForm<CustomerFormData>({
        name: customer.name,
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
        join_date: customer.join_date ? customer.join_date.split('T')[0] : '',
        email: customer.email || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log('check');
        // const payload = {
        //     ...data,
        //     join_date: data.join_date
        //         ? `${data.join_date.year}-${String(data.join_date.month).padStart(2, '0')}-${String(data.join_date.day).padStart(2, '0')}`
        //         : null,
        // };

        // console.log('payload', payload);

        put(route('customers.update', customer.id), {
            ...data,
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="mx-auto mt-5 h-fit w-full max-w-4xl overflow-y-auto rounded-2xl bg-white text-slate-800">
            <h2 className="px-5 pt-5 text-lg font-medium text-gray-900">Edit Customer</h2>
            <form onSubmit={handleSubmit} className="space-y-6 p-5">
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
                    <Select
                        label="Status"
                        id="status"
                        value={data.status}
                        selectedKeys={[data.status]}
                        onChange={(e) => setData('status', e.target.value as Customer['status'])}
                        isInvalid={!!errors.status}
                        errorMessage={errors.status}
                    >
                        {CUSTOMER_STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} textValue={status.label}>
                                {status.label}
                            </SelectItem>
                        ))}
                    </Select>
                    <Textarea
                        label="Alamat"
                        id="address"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        rows={3}
                        isInvalid={!!errors.address}
                        errorMessage={errors.address}
                        className="sm:col-span-2"
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
                        label="NPWP"
                        type="text"
                        id="npwp"
                        value={data.npwp}
                        onChange={(e) => setData('npwp', e.target.value)}
                        isInvalid={!!errors.npwp}
                        errorMessage={errors.npwp}
                    />
                    <Select
                        label="Paket"
                        id="package_id"
                        value={data.package_id}
                        selectedKeys={[data.package_id]}
                        onChange={(e) => setData('package_id', e.target.value)}
                        isInvalid={!!errors.package_id}
                        errorMessage={errors.package_id}
                        placeholder="Pilih Paket"
                    >
                        {packages?.map((pkg) => (
                            <SelectItem key={pkg.id} textValue={`${pkg.name} - ${currencyFormat(pkg.price)}`}>
                                {pkg.name} - {currencyFormat(pkg.price)}
                            </SelectItem>
                        ))}
                    </Select>
                    <Input
                        label="No. Telepon"
                        type="text"
                        id="phone"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        isInvalid={!!errors.phone}
                        errorMessage={errors.phone}
                    />
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
                    <DatePicker
                        label="Tanggal Bergabung"
                        id="join_date"
                        value={data.join_date ? parseDate(data.join_date) : null}
                        onChange={(value) =>
                            setData(
                                'join_date',
                                value ? `${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}` : '',
                            )
                        }
                        isInvalid={!!errors.join_date}
                        errorMessage={errors.join_date}
                        selectorButtonPlacement="start"
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
