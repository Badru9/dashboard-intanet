import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';

interface CreateCashflowCategoryProps {
    onClose: () => void;
}

interface CashflowCategoryFormData {
    [key: string]: string | undefined;
    name: string;
    is_out: '0' | '1';
    note?: string;
}

export default function CreateCashflowCategory({ onClose }: CreateCashflowCategoryProps) {
    const { data, setData, post, processing, errors } = useForm<CashflowCategoryFormData>({
        name: '',
        is_out: '0',
        note: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('cashflow-categories.store'), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="mx-auto w-full max-w-4xl rounded-2xl bg-white text-slate-800">
            <h2 className="px-5 pt-5 text-lg font-medium text-gray-900">Tambah Kategori Cashflow</h2>
            <form onSubmit={handleSubmit} className="h-fit space-y-6 p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Nama Kategori
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="is_out" className="block text-sm font-medium text-gray-700">
                            Tipe
                        </label>
                        <select
                            id="is_out"
                            value={data.is_out}
                            onChange={(e) => setData('is_out', e.target.value as '0' | '1')}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                        >
                            <option value="0">Pemasukan</option>
                            <option value="1">Pengeluaran</option>
                        </select>
                        {errors.is_out && <p className="mt-1 text-sm text-red-600">{errors.is_out}</p>}
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                            Catatan
                        </label>
                        <textarea
                            id="note"
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                        />
                        {errors.note && <p className="mt-1 text-sm text-red-600">{errors.note}</p>}
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="cursor-pointer border-none px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="cursor-pointer bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
