import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md rounded-xl border border-red-200 bg-white p-6 shadow-2xl">
                <DialogHeader className="flex flex-col items-center">
                    <WarningCircle className="mb-2 h-10 w-10 text-red-500" weight="fill" />
                    <DialogTitle className="text-lg font-bold text-red-600">{title}</DialogTitle>
                    <DialogDescription className="mt-2 text-center text-gray-700">{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6 flex justify-end gap-2 text-slate-900">
                    <Button variant="outline" onClick={onClose} disabled={isLoading} className="cursor-pointer border-none">
                        Batal
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={isLoading} className="cursor-pointer">
                        {isLoading ? 'Menghapus...' : 'Hapus'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
