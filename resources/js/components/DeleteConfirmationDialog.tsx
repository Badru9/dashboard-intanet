import { Button, Modal, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { WarningCircle } from '@phosphor-icons/react';

interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    isLoading?: boolean;
}

export default function DeleteConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isLoading = false,
}: DeleteConfirmationDialogProps) {
    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} placement="center">
            <ModalContent className="max-w-md rounded-xl border border-red-200 bg-white p-3 shadow-2xl dark:bg-gray-900 dark:text-gray-100">
                <ModalHeader className="flex flex-col items-center">
                    <WarningCircle className="mb-2 h-10 w-10 text-red-500 dark:text-red-400" weight="fill" />
                    <h3 className="text-lg font-bold text-red-600 dark:text-red-400">{title}</h3>
                    <p className="mt-2 text-center text-gray-600 dark:text-gray-300">{description}</p>
                </ModalHeader>
                <ModalFooter className="mt-6 flex justify-end gap-2 text-slate-900 dark:text-gray-100">
                    <Button variant="bordered" onPress={onClose} disabled={isLoading} className="cursor-pointer">
                        Batal
                    </Button>
                    <Button color="danger" onPress={onConfirm} disabled={isLoading} className="cursor-pointer">
                        {isLoading ? 'Menghapus...' : 'Hapus'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
