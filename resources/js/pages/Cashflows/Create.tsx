/* eslint-disable @typescript-eslint/no-explicit-any */
import { CashflowCategory, PageProps } from '@/types';
import { Button, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { Head, router, useForm, usePage } from '@inertiajs/react';

interface Props extends PageProps {
    categories: CashflowCategory[];
    [key: string]: any;
}

interface CashflowFormData {
    [key: string]: any;
    cashflow_category_id: string;
    amount: string;
    note: string;
}

export default function CreateCashflow({ onClose }: { onClose: () => void }) {
    const { categories, auth } = usePage<Props>().props;

    const { data, setData, processing, errors } = useForm<CashflowFormData>({
        cashflow_category_id: '',
        amount: '',
        note: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...data,
            created_id: auth.user.id,
        };

        router.post(route('cashflows.store'), payload, {
            onSuccess: () => {
                onClose();
            },
            onError: (error) => {
                console.log('error', error);
            },
        });
    };

    return (
        <div className="mx-auto mt-5 h-fit w-full max-w-4xl overflow-y-auto rounded-2xl bg-white text-slate-800">
            <Head title="Create Cashflow" />
            <h2 className="px-5 text-lg font-medium text-gray-900">Tambah Cashflow Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-6 p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <Select
                            label="Kategori"
                            value={data.cashflow_category_id}
                            onChange={(e) => setData('cashflow_category_id', e.target.value)}
                            isInvalid={!!errors.cashflow_category_id}
                            errorMessage={errors.cashflow_category_id}
                            required
                        >
                            {categories?.map((category) => (
                                <SelectItem key={category.id} textValue={category.name}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <Input
                            type="number"
                            label="Jumlah"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            isInvalid={!!errors.amount}
                            errorMessage={errors.amount}
                            required
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <Textarea
                            label="Catatan"
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
