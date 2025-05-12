/* eslint-disable @typescript-eslint/no-explicit-any */
import { Customer, InternetPackage, PageProps } from '@/types';
import { addToast, Button, Select, SelectItem } from '@heroui/react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import moment from 'moment';

interface Props extends PageProps, Record<string, any> {
    customers: Customer[];
    packages: InternetPackage[];
}

interface InvoicesFormData extends Record<string, any> {
    period_month: string;
    period_year: string;
}

const yearOptions = Array.from({ length: 10 }, (_, i) => String(moment().year() + i));
const monthOptions = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
];

export default function CreateInvoice({ onClose }: { onClose: () => void }) {
    const { auth } = usePage<Props>().props;

    const { data, setData, processing, errors } = useForm<InvoicesFormData>({
        creator: auth.user.id,
        period_month: moment().format('M'),
        period_year: moment().format('YYYY'),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('invoices.store'), data, {
            onSuccess: () => {
                onClose();
                addToast({
                    title: 'Generate Invoice Berhasil',
                    description: 'Invoice berhasil dibuat',
                    color: 'success',
                });
            },
            onError: (error) => {
                console.log('error', error);
                addToast({
                    title: 'Generate Invoice Gagal',
                    description: error.message,
                    color: 'danger',
                });
            },
        });
    };

    return (
        <div className="mx-auto mt-5 h-fit w-full overflow-y-auto rounded-2xl bg-white text-slate-800 dark:bg-gray-900 dark:text-gray-100">
            <Head title="Generate Invoices" />
            <form onSubmit={handleSubmit} className="space-y-6 px-5 pb-5">
                <div className="flex w-full gap-4">
                    <Select
                        label="Bulan"
                        value={data.period_month}
                        onChange={(e) => setData('period_month', e.target.value)}
                        isInvalid={!!errors.period_month}
                        errorMessage={errors.period_month}
                    >
                        {monthOptions.map((month) => (
                            <SelectItem key={month.value} textValue={month.label}>
                                {month.label}
                            </SelectItem>
                        ))}
                    </Select>
                    <Select
                        label="Tahun"
                        value={data.period_year}
                        onChange={(e) => setData('period_year', e.target.value)}
                        isInvalid={!!errors.period_year}
                        errorMessage={errors.period_year}
                    >
                        {yearOptions.map((year) => (
                            <SelectItem key={year} textValue={year}>
                                {year}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                    Sistem akan membuat invoice untuk semua customer yang aktif pada bulan dan tahun yang dipilih.
                </p>
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
