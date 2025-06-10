import { PageProps } from '@/types';
import { addToast, Button, Input } from '@heroui/react';
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface ImportCustomerProps {
    onClose: () => void;
    onDuplicateClick: () => void;
}

type ImportCustomerForm = {
    file: File | null;
};

const ImportCustomer = ({ onClose, onDuplicateClick }: ImportCustomerProps) => {
    const { data, setData, post, processing, errors } = useForm<ImportCustomerForm>({
        file: null,
    });

    const { flash } = usePage<PageProps>().props;

    console.log('props import', flash);

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
            onSuccess: (page) => {
                // Baris ini sangat penting!
                // 'page' adalah objek yang berisi props halaman terbaru setelah permintaan berhasil.
                console.log('Flash data inside onSuccess (from page object):', page.props.flash);
                const currentFlash = page.props.flash as PageProps['flash'];

                // Gunakan 'currentFlash' untuk menentukan deskripsi toast dan endContent
                const description =
                    currentFlash.duplicate_customers_info === null || currentFlash.duplicate_customers_info.length === 0
                        ? 'File berhasil dibaca'
                        : `Terdapat ${currentFlash.duplicate_customers_info.length} duplikat data`;

                addToast({
                    title: 'Import Sukses',
                    description: description,
                    color: 'success',
                    timeout: 5000,
                    endContent: currentFlash.duplicate_customers_info !== null && currentFlash.duplicate_customers_info.length > 0 && (
                        <Button size="sm" color="warning" onPress={onDuplicateClick}>
                            Lihat Detail
                        </Button>
                    ),
                });
                onClose();
            },
            onError: (error) => {
                console.log('error import', error);

                if (error.import_errors) {
                    const errors = Array.isArray(error.import_errors) ? error.import_errors : [error.import_errors];
                    errors.forEach((err: string) => {
                        addToast({
                            title: 'Import Customer Gagal',
                            description: err,
                            color: 'danger',
                        });
                    });
                } else {
                    addToast({
                        title: 'Error',
                        description: error.message || 'Terjadi kesalahan saat membaca file',
                        color: 'danger',
                    });
                }
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
                    isInvalid={!!errors.file}
                    errorMessage={errors.file}
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
