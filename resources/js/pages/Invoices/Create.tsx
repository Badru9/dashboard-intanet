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
    period: string;
}

export default function CreateInvoice({ onClose }: { onClose: () => void }) {
    const { auth } = usePage<Props>().props;

    const { data, setData, processing, errors } = useForm<InvoicesFormData>({
        creator: auth.user.id,
        period: moment().format('YYYY-MM'),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...data,
            period: data.period ? moment(data.period).format('YYYY-MM') : null,
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
            <Head title="Generate Invoices" />
            <form onSubmit={handleSubmit} className="space-y-6 px-5 pb-5">
                <div className="w-full">
                    <Input
                        type="month"
                        label="Periode"
                        value={data.period}
                        onChange={(e) => setData('period', e.target.value)}
                        isInvalid={!!errors.period}
                        errorMessage={errors.period}
                    />
                    <p className="mt-2 text-sm text-gray-500">
                        Sistem akan membuat invoice untuk semua customer yang aktif pada periode yang dipilih.
                    </p>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                    <Button onPress={onClose} color="default">
                        Batal
                    </Button>
                    <Button type="submit" disabled={processing} color="primary">
                        {processing ? 'Menggenerate...' : 'Generate Invoices'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
