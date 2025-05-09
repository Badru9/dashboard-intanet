/* eslint-disable @typescript-eslint/no-explicit-any */
import { Cashflow, CashflowCategory, PageProps } from '@/types';
import { Button, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { useForm, usePage } from '@inertiajs/react';

interface EditCashflowProps {
    cashflow: Cashflow | null;
    onClose: () => void;
}

interface CashflowFormData {
    [key: string]: any;
    cashflow_category_id: string;
    amount: string;
    note: string;
}

type CashflowCategoryPageProps = PageProps &
    Record<string, any> & {
        categories: CashflowCategory[];
    };

export default function EditCashflow({ cashflow, onClose }: EditCashflowProps) {
    const { categories } = usePage<CashflowCategoryPageProps>().props;

    const { data, setData, put, processing, errors } = useForm<CashflowFormData>({
        cashflow_category_id: cashflow?.category?.id.toString() || '',
        amount: cashflow?.amount.toString() || '',
        note: cashflow?.note || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('cashflows.update', cashflow?.id), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="mx-auto mt-5 h-fit w-full max-w-4xl overflow-y-auto rounded-2xl bg-white text-slate-800 dark:bg-gray-900 dark:text-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6 px-5 pb-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Select
                        label="Kategori"
                        id="cashflow_category_id"
                        selectedKeys={[data.cashflow_category_id]}
                        onChange={(e) => setData('cashflow_category_id', e.target.value)}
                        isInvalid={!!errors.cashflow_category_id}
                        errorMessage={errors.cashflow_category_id}
                    >
                        {categories.map((category) => (
                            <SelectItem key={category.id} textValue={category.name}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </Select>

                    <Input
                        label="Jumlah"
                        type="number"
                        id="amount"
                        value={data.amount}
                        onChange={(e) => setData('amount', e.target.value)}
                        isInvalid={!!errors.amount}
                        errorMessage={errors.amount}
                    />

                    <Textarea
                        label="Catatan"
                        id="note"
                        value={data.note}
                        onChange={(e) => setData('note', e.target.value)}
                        isInvalid={!!errors.note}
                        errorMessage={errors.note}
                        className="sm:col-span-2"
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
