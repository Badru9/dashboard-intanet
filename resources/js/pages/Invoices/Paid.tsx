import { Invoices } from '@/types';
import { addToast, Button, Input, Textarea } from '@heroui/react';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface PaidProps {
    invoice: Invoices;
    onClose: () => void;
}

const Paid = ({ invoice, onClose }: PaidProps) => {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const { data, setData, processing, errors } = useForm({
        payment_proof: null as File | null,
        note: '',
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('payment_proof', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        if (data.payment_proof) {
            formData.append('payment_proof', data.payment_proof);
        }
        formData.append('note', data.note || '');

        router.post(route('invoices.mark-as-paid', invoice.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                onClose();
                setPreviewImage(null);
                setData({ payment_proof: null, note: '' });
                addToast({
                    title: 'Berhasil',
                    description: 'Invoice berhasil dikonfirmasi',
                    color: 'success',
                });
            },
            onError: (error) => {
                console.log(error);
                addToast({
                    title: 'Gagal',
                    description: 'Invoice gagal dikonfirmasi',
                    color: 'danger',
                });
            },
        });
    };

    return (
        <div className="mx-auto mt-5 h-fit w-full overflow-y-auto rounded-2xl bg-white text-slate-800 dark:bg-gray-900 dark:text-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6 px-5 pb-5">
                <div className="space-y-2">
                    <label className="block text-sm font-medium">Bukti Pembayaran</label>
                    <div className="flex flex-col items-center gap-4">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full"
                            color={errors.payment_proof ? 'danger' : 'default'}
                            errorMessage={errors.payment_proof}
                        />
                        {previewImage && (
                            <div className="relative h-48 w-full overflow-hidden rounded-lg">
                                <img src={previewImage} alt="Preview bukti pembayaran" className="h-full w-full object-contain" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium">Catatan</label>
                    <Textarea
                        value={data.note}
                        onChange={(e) => setData('note', e.target.value)}
                        placeholder="Tambahkan catatan jika diperlukan"
                        className="w-full"
                        color={errors.note ? 'danger' : 'default'}
                        errorMessage={errors.note}
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" color="danger" variant="flat" onPress={onClose}>
                        Batal
                    </Button>
                    <Button type="submit" color="primary" isLoading={processing}>
                        Konfirmasi
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Paid;
