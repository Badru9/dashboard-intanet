import { Invoices } from '@/types';
import { Button, Card, CardBody, CardHeader, Input, Textarea } from '@heroui/react';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface PaidProps {
    invoice: Invoices;
    onClose: () => void;
}

const Paid = ({ invoice, onClose }: PaidProps) => {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const { data, setData, post, processing, errors } = useForm({
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
        post(route('invoices.mark-as-paid', invoice.id), {
            onSuccess: () => {
                setPreviewImage(null);
                setData({ payment_proof: null, note: '' });
            },
        });
    };

    return (
        <div className="mx-auto mt-5 h-fit w-full overflow-y-auto rounded-2xl bg-white text-slate-800 dark:bg-gray-900 dark:text-gray-100">
            <Head title="Konfirmasi Pembayaran" />
            <div className="p-4 lg:p-8">
                <Card className="mx-auto max-w-2xl">
                    <CardHeader>
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl font-semibold">Konfirmasi Pembayaran</h2>
                            <p className="text-sm text-gray-500">Silakan upload bukti pembayaran untuk mengkonfirmasi pembayaran</p>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                    Konfirmasi Pembayaran
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default Paid;
