import { CASHFLOW_CATEGORY_OPTIONS } from '@/constants';
import { CashflowCategory } from '@/types';
import { Button, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { useForm } from '@inertiajs/react';

// interface EditCashflowCategoryPageProps extends PageProps {
//     category: CashflowCategory;
// }

interface EditCashflowCategoryProps {
    category: CashflowCategory;
    onClose: () => void;
}

interface CashflowCategoryFormData {
    [key: string]: string | undefined;
    name: string;
    is_out: '0' | '1';
    note?: string;
}

export default function EditCashflowCategory({ category, onClose }: EditCashflowCategoryProps) {
    const { data, setData, put, processing, errors } = useForm<CashflowCategoryFormData>({
        name: category.name,
        is_out: category.is_out.toString() as '0' | '1',
        note: category.note,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('cashflow-categories.update', category.id), {
            onSuccess: () => {
                console.log('success');
                onClose();
            },
        });
    };

    return (
        <div className="mx-auto w-full max-w-4xl rounded-2xl bg-white text-slate-800 dark:bg-gray-900 dark:text-gray-100">
            <h2 className="px-5 pt-5 text-lg font-medium text-gray-900 dark:text-gray-100">Edit Kategori Cashflow</h2>
            <form onSubmit={handleSubmit} className="h-fit space-y-6 p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                        label="Nama Kategori"
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        isInvalid={!!errors.name}
                        errorMessage={errors.name}
                        color="default"
                    />
                    <Select
                        label="Tipe"
                        id="is_out"
                        value={data.is_out}
                        onChange={(e) => setData('is_out', e.target.value as '0' | '1')}
                        isInvalid={!!errors.is_out}
                        errorMessage={errors.is_out}
                        color="default"
                        selectedKeys={[data.is_out]}
                    >
                        {CASHFLOW_CATEGORY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} textValue={option.label}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </Select>
                    <Textarea
                        label="Catatan"
                        id="note"
                        value={data.note}
                        onChange={(e) => setData('note', e.target.value)}
                        rows={3}
                        isInvalid={!!errors.note}
                        errorMessage={errors.note}
                        color="default"
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
