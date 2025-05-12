import { BILL_DATE_LENGTH } from '@/constants';
import { Button, Modal, ModalContent, Select, SelectItem } from '@heroui/react';
import { useState } from 'react';

interface ActivateCustomerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (billDate: number) => void;
    customerName: string;
}

export default function ActivateCustomerDialog({ isOpen, onClose, onConfirm, customerName }: ActivateCustomerDialogProps) {
    const [billDate, setBillDate] = useState<string>('1');

    const handleConfirm = () => {
        onConfirm(parseInt(billDate));
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30">
                <ModalContent className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Aktivasi Customer {customerName}</h3>
                    <div className="mt-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pilih tanggal tagihan untuk mengaktifkan customer ini.</p>
                        <div className="mt-4">
                            <Select
                                label="Tanggal Tagihan"
                                id="bill_date"
                                value={billDate}
                                onChange={(e) => setBillDate(e.target.value)}
                                placeholder="Pilih Tanggal"
                                selectedKeys={billDate ? [billDate] : []}
                            >
                                {Array.from({ length: BILL_DATE_LENGTH }, (_, i) => i + 1).map((day) => (
                                    <SelectItem key={day.toString()} textValue={day.toString()}>
                                        {day}
                                    </SelectItem>
                                ))}
                            </Select>
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
