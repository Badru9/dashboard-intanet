import { addToast, Button, Input } from '@heroui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface ImportCustomerProps {
    onClose: () => void;
}

type ImportCustomerForm = {
    file: File | null;
};

const ImportCustomer = ({ onClose }: ImportCustomerProps) => {
    const { data, setData, post, processing } = useForm<ImportCustomerForm>({
        file: null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!data.file) {
            addToast({
                title: 'Error',
                description: 'Silakan pilih file terlebih dahulu',
                color: 'danger',
            });
            return;
        }

        post(route('customers.import'), {
            onSuccess: () => {
                addToast({
                    title: 'Sukses',
                    description: 'File berhasil dibaca',
                    color: 'success',
                });
                onClose();
            },
            onError: (error) => {
                addToast({
                    title: 'Error',
                    description: error.message || 'Terjadi kesalahan saat membaca file',
                    color: 'danger',
                });
            },
        });
    };

    const handleDownloadTemplate = () => {
        window.open('/template/template_customers.xlsx', '_blank');
    };

    return (
        <div className="flex flex-col gap-4 p-5">
            <form onSubmit={submit} className="space-y-4">
                <Input
                    type="file"
                    id="file"
                    label="Pilih file"
                    variant="flat"
                    radius="md"
                    color="primary"
                    accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xls"
                    onChange={(e) => {
                        setData('file', e.target.files?.[0] ?? null);
                        if (!e.target.files?.[0]) {
                            addToast({
                                title: 'Error',
                                description: 'Silakan pilih file',
                                color: 'danger',
                            });
                        }
                    }}
                />
                <Button color="default" variant="flat" size="sm" onPress={() => handleDownloadTemplate()}>
                    Download Template
                </Button>
                <div className="mt-3 flex justify-end gap-2">
                    <Button onPress={onClose} color="default">
                        Batal
                    </Button>
                    <Button type="submit" color="primary" isLoading={processing}>
                        Import
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ImportCustomer;
