import { Button, DatePicker, Modal, ModalContent } from '@heroui/react';
import { CalendarDate, today } from '@internationalized/date';
import { useState } from 'react';

interface ActivateCustomerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (billDate: string) => void;
    customerName: string;
}

export default function ActivateCustomerDialog({ isOpen, onClose, onConfirm, customerName }: ActivateCustomerDialogProps) {
    const [billDate, setBillDate] = useState<CalendarDate | null>(today('Asia/Jakarta'));

    const handleDateChange = (value: CalendarDate | null) => setBillDate(value);

    const handleConfirm = () => {
        const formattedDate = `${billDate?.year}-${String(billDate?.month).padStart(2, '0')}-${String(billDate?.day).padStart(2, '0')}`;
        onConfirm(formattedDate);
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30">
                <ModalContent className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Aktivasi Customer {customerName}</h3>
                    <div className="mt-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pilih tanggal tagihan untuk mengaktifkan customer ini.</p>
                        <div className="mt-4">
                            <DatePicker label="Tanggal Tagihan" value={billDate} onChange={handleDateChange} selectorButtonPlacement="start" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <Button color="default" onPress={onClose}>
                            Batal
                        </Button>
                        <Button color="primary" onPress={handleConfirm}>
                            Aktifkan
                        </Button>
                    </div>
                </ModalContent>
            </div>
        </Modal>
    );
}
