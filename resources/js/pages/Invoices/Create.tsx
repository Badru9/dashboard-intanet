/* eslint-disable @typescript-eslint/no-explicit-any */
import { Customer, InternetPackage, PageProps } from '@/types';
import { Button, Input } from '@heroui/react';
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
            period: data.period ? moment(data.period).format('YYYY-MM-DD') : null,
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
        <div className="mx-auto mt-5 h-fit w-full overflow-y-auto rounded-2xl bg-white text-slate-800 dark:bg-gray-900 dark:text-gray-100">
            <Head title="Create Invoice" />
            <h2 className="px-5 text-lg font-medium text-gray-900 dark:text-gray-100">Tambah Periode Invoice</h2>
            <form onSubmit={handleSubmit} className="space-y-6 p-5">
                <div className="w-full">
                    <Input
                        type="month"
                        label="Period"
                        value={data.period}
                        onChange={(e) => {
                            setData('period', e.target.value);
                            console.log('e', e.target.value);
                        }}
                        isInvalid={!!errors.period}
                        errorMessage={errors.period}
                        classNames={{
                            input: 'text-gray-900 bg-teal-400',
                        }}
                    />
                    {/* <Input
                        type="month"
                        defaultValue={moment().format('YYYY-MM')}
                        label="Period"
                        value={data.period}
                        onChange={(e) => setData('period', e.target.value)}
                        isInvalid={!!errors.period}
                        errorMessage={errors.period}
                    /> */}
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
