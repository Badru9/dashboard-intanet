import { Button, Modal, ModalContent } from '@heroui/react';
import { Warning } from '@phosphor-icons/react';

interface DeactivateCustomerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    customerName: string;
    type: 'inactive' | 'paused';
}

export default function DeactivateCustomerDialog({ isOpen, onClose, onConfirm, customerName, type }: DeactivateCustomerDialogProps) {
    const config = {
        inactive: {
            title: 'Non-aktifkan Customer',
            description: 'Apakah Anda yakin ingin menonaktifkan customer ini?',
            confirmText: 'Non-aktifkan',
            icon: 'text-red-500',
            confirmButton: 'bg-red-500 hover:bg-red-600',
            iconBg: 'bg-red-100',
        },
        paused: {
            title: 'Pause Customer',
            description: 'Apakah Anda yakin ingin mem-pause customer ini?',
            confirmText: 'Pause',
            icon: 'text-yellow-500',
            confirmButton: 'bg-yellow-500 hover:bg-yellow-600',
            iconBg: 'bg-yellow-100',
        },
    };

    const currentConfig = config[type];

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30">
                <ModalContent className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
                    <div className="flex items-center gap-4">
                        <div className={`rounded-full ${currentConfig.iconBg} p-2`}>
                            <Warning className={`h-6 w-6 ${currentConfig.icon}`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {currentConfig.title} {customerName}
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{currentConfig.description}</p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Customer tidak akan bisa mengakses layanan setelah {type === 'inactive' ? 'dinonaktifkan' : 'dipause'}.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button color="default" variant="bordered" onPress={onClose}>
                            Batal
                        </Button>
                        <Button
                            className={currentConfig.confirmButton}
                            onPress={() => {
                                onConfirm();
                                onClose();
                            }}
                        >
                            {currentConfig.confirmText}
                        </Button>
                    </div>
                </ModalContent>
            </div>
        </Modal>
    );
}
