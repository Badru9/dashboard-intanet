/* eslint-disable @typescript-eslint/no-explicit-any */
import { Customer, InternetPackage, PageProps } from '@/types';
import { Button, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import moment from 'moment';

interface Props extends PageProps, Record<string, any> {
    customers: Customer[];
    packages: InternetPackage[];
}

interface InvoicesFormData extends Record<string, any> {
    customer_id: string;
    package_id: string;
    note: string;
    period: string;
}

export default function CreateInvoice({ onClose }: { onClose: () => void }) {
    const { customers, packages, auth } = usePage<Props>().props;

    console.log('customers', customers);
    console.log('packages', packages);

    const { data, setData, processing, errors } = useForm<InvoicesFormData>({
        customer_id: '',
        package_id: '',
        note: '',
        creator: auth.user.id,
        period: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...data,
            due_date: data.due_date ? moment(data.due_date).format('YYYY-MM-DD') : null,
        };

        router.post(route('invoices.store'), payload, {
            onSuccess: () => {
                onClose();
            },
            onError: (error) => {
                console.log('error', error);
            },
        });
    };

    return (
        <div className="mx-auto mt-5 h-fit w-full max-w-4xl overflow-y-auto rounded-2xl bg-white text-slate-800 dark:bg-gray-900 dark:text-gray-100">
            <Head title="Create Invoice" />
            <h2 className="px-5 text-lg font-medium text-gray-900 dark:text-gray-100">Tambah Invoice Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-6 p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <Select
                            label="Customer"
                            placeholder="Pilih Customer"
                            value={data.customer_id}
                            onChange={(e) => setData('customer_id', e.target.value)}
                            isInvalid={!!errors.customer_id}
                            errorMessage={errors.customer_id}
                            required
                        >
                            {customers.map((customer) => (
                                <SelectItem key={customer.id} textValue={`${customer.name} - ${customer.package?.name}`}>
                                    {customer.name} - {customer.package?.name}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <Input
                            type="month"
                            label="Period"
                            value={data.period}
                            onChange={(e) => setData('period', e.target.value)}
                            isInvalid={!!errors.period}
                            errorMessage={errors.period}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <Textarea
                            label="Note (optional)"
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            isInvalid={!!errors.note}
                            errorMessage={errors.note}
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
