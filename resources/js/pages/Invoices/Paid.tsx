import { Invoices } from '@/types';
import { addToast, Button, DatePicker, Textarea } from '@heroui/react';
import { router, useForm } from '@inertiajs/react';
import { parseDate } from '@internationalized/date';

interface PaidProps {
    invoice: Invoices;
    onClose: () => void;
}

const Paid = ({ invoice, onClose }: PaidProps) => {
    // const [previewImage, setPreviewImage] = useState<string | null>(null);
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const { data, setData, processing, errors } = useForm({
        // payment_proof: null as File | null,
        note: '',
        paid_at: formattedDate,
    });

    // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (file) {
    //         setData('payment_proof', file);
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             setPreviewImage(reader.result as string);
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        // if (data.payment_proof) {
        //     formData.append('payment_proof', data.payment_proof);
        // }
        formData.append('note', data.note || '');
        formData.append('paid_at', data.paid_at || '');

        router.post(route('invoices.mark-as-paid', invoice.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                onClose();
                // setPreviewImage(null);
                setData({ note: '', paid_at: '' });
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
                    <DatePicker
                        label="Tanggal Pembayaran"
                        selectorButtonPlacement="start"
                        value={data.paid_at ? parseDate(data.paid_at) : null}
                        onChange={(e) => e && setData('paid_at', e.toString())}
                        isInvalid={!!errors.paid_at}
                        errorMessage={errors.paid_at}
                        isRequired
                    />
                </div>
                {/* <div className="space-y-2">
                    <div className="flex flex-col items-center gap-4">
                        <Input
                            label="Bukti Pembayaran"
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
                </div> */}

                <div className="space-y-2">
                    <Textarea
                        label="Catatan (Opsional)"
                        value={data.note}
                        onChange={(e) => setData('note', e.target.value)}
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
