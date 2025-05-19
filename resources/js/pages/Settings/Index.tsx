import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { addToast, Button, Card, Input } from '@heroui/react';
import { Head, router, useForm, usePage } from '@inertiajs/react';

interface Setting {
    id: number;
    key: string;
    label: string;
    value: string;
}

type Props = PageProps & {
    settings: Setting[];
};

export default function Settings() {
    const { settings } = usePage<Props>().props;

    const { data, setData, processing, errors } = useForm({
        ppn: settings.find((s) => s.key === 'ppn')?.value || '',
        bph: settings.find((s) => s.key === 'bph')?.value || '',
        uso: settings.find((s) => s.key === 'uso')?.value || '',
        pph: settings.find((s) => s.key === 'pph')?.value || '',
        admin: settings.find((s) => s.key === 'admin')?.value || '',
        prtg: settings.find((s) => s.key === 'prtg')?.value || '',
        noc_24_jam: settings.find((s) => s.key === 'noc_24_jam')?.value || '',
    });

    const handleNumberInput = (key: keyof typeof data, value: string) => {
        // Ganti titik dengan koma
        let normalizedValue = value.replace('.', ',');

        // Hapus semua karakter kecuali angka dan koma
        normalizedValue = normalizedValue.replace(/[^\d,]/g, '');

        // Pastikan hanya ada satu koma
        const parts = normalizedValue.split(',');
        if (parts.length > 2) {
            normalizedValue = parts[0] + ',' + parts.slice(1).join('');
        }

        // Batasi 2 angka di belakang koma
        if (parts.length > 1 && parts[1].length > 2) {
            normalizedValue = parts[0] + ',' + parts[1].slice(0, 2);
        }

        setData(key, normalizedValue);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Konversi koma ke titik sebelum submit
        const formattedData = Object.entries(data).reduce(
            (acc, [key, value]) => ({
                ...acc,
                [key]: value.replace(',', '.'),
            }),
            {},
        );

        router.patch(route('settings.update'), formattedData, {
            onSuccess: () => {
                addToast({
                    title: 'Success',
                    description: 'Settings updated successfully',
                    color: 'success',
                });
            },
            onError: () => {
                addToast({
                    title: 'Error',
                    description: 'Failed to update settings',
                    color: 'danger',
                });
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Settings" />

            <div className="p-4 lg:p-8">
                <h2 className="mb-5 text-2xl font-bold text-gray-900 dark:text-gray-100">Pengaturan</h2>
                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <Input
                                type="text"
                                label="PPN (%)"
                                value={data.ppn}
                                onChange={(e) => handleNumberInput('ppn', e.target.value)}
                                isInvalid={!!errors.ppn}
                                errorMessage={errors.ppn}
                                required
                            />
                            <Input
                                type="text"
                                label="BPH (%)"
                                value={data.bph}
                                onChange={(e) => handleNumberInput('bph', e.target.value)}
                                isInvalid={!!errors.bph}
                                errorMessage={errors.bph}
                                required
                            />
                            <Input
                                type="text"
                                label="USO (%)"
                                value={data.uso}
                                onChange={(e) => handleNumberInput('uso', e.target.value)}
                                isInvalid={!!errors.uso}
                                errorMessage={errors.uso}
                                required
                            />
                            <Input
                                type="text"
                                label="PPH (%)"
                                value={data.pph}
                                onChange={(e) => handleNumberInput('pph', e.target.value)}
                                isInvalid={!!errors.pph}
                                errorMessage={errors.pph}
                                required
                            />
                            <Input
                                type="text"
                                label="ADMIN (%)"
                                value={data.admin}
                                onChange={(e) => handleNumberInput('admin', e.target.value)}
                                isInvalid={!!errors.admin}
                                errorMessage={errors.admin}
                                required
                            />
                            <Input
                                type="text"
                                label="PRTG (%)"
                                value={data.prtg}
                                onChange={(e) => handleNumberInput('prtg', e.target.value)}
                                isInvalid={!!errors.prtg}
                                errorMessage={errors.prtg}
                                required
                            />
                            <Input
                                type="text"
                                label="NOC 24 Jam (%)"
                                value={data.noc_24_jam}
                                onChange={(e) => handleNumberInput('noc_24_jam', e.target.value)}
                                isInvalid={!!errors.noc_24_jam}
                                errorMessage={errors.noc_24_jam}
                                required
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" color="primary" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
