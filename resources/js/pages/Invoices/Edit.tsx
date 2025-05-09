/* eslint-disable @typescript-eslint/no-explicit-any */
import { currencyFormat } from '@/lib/utils';
import { Customer, InternetPackage, type Invoices } from '@/types';
import { Button, DatePicker, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { useForm } from '@inertiajs/react';
import { parseDate } from '@internationalized/date';

interface EditInvoiceProps {
    invoice: Invoices;
    onClose: () => void;
    customers: Customer[];
    packages: InternetPackage[];
}

interface InvoiceFormData {
    [key: string]: any;
    customer_id: string;
    package_id: string;
    amount: number;
    status: 'unpaid' | 'paid' | 'cancelled';
    due_date: string | null;
    note: string;
}

export default function EditInvoice({ invoice, onClose, customers, packages }: EditInvoiceProps) {
    console.log('customers', customers);
    console.log('packages', packages);

    const { data, setData, put, processing, errors } = useForm<InvoiceFormData>({
        customer_id: invoice.customer_id.toString(),
        package_id: invoice.package_id.toString(),
        amount: invoice.amount,
        status: invoice.status,
        due_date: invoice.due_date ? invoice.due_date.split('T')[0] : null,
        note: invoice.note || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('invoices.update', invoice.id), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="mx-auto mt-5 h-fit w-full max-w-4xl overflow-y-auto rounded-2xl bg-white text-slate-800 dark:bg-gray-900 dark:text-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6 px-5 pb-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Select
                        label="Customer"
                        id="customer_id"
                        selectedKeys={[data.customer_id]}
                        onChange={(e) => setData('customer_id', e.target.value)}
                        isInvalid={!!errors.customer_id}
                        errorMessage={errors.customer_id}
                    >
                        {customers.map((customer) => (
                            <SelectItem key={customer.id} textValue={customer.name}>
                                {customer.name}
                            </SelectItem>
                        ))}
                    </Select>

                    <Select
                        label="Paket"
                        id="package_id"
                        selectedKeys={[data.package_id]}
                        onChange={(e) => setData('package_id', e.target.value)}
                        isInvalid={!!errors.package_id}
                        errorMessage={errors.package_id}
                    >
                        {packages.map((pkg) => (
                            <SelectItem key={pkg.id} textValue={`${pkg.name} - ${currencyFormat(pkg.price)}`}>
                                {pkg.name} - {currencyFormat(pkg.price)}
                            </SelectItem>
                        ))}
                    </Select>

                    <Input
                        label="Amount"
                        type="number"
                        id="amount"
                        value={data.amount.toString()}
                        onChange={(e) => setData('amount', Number(e.target.value))}
                        isInvalid={!!errors.amount}
                        errorMessage={errors.amount}
                    />

                    <Select
                        label="Status"
                        id="status"
                        selectedKeys={[data.status]}
                        onChange={(e) => setData('status', e.target.value as 'unpaid' | 'paid' | 'cancelled')}
                        isInvalid={!!errors.status}
                        errorMessage={errors.status}
                    >
                        <SelectItem key="unpaid" textValue="Unpaid">
                            Unpaid
                        </SelectItem>
                        <SelectItem key="paid" textValue="Paid">
                            Paid
                        </SelectItem>
                        <SelectItem key="cancelled" textValue="Cancelled">
                            Cancelled
                        </SelectItem>
                    </Select>

                    <DatePicker
                        label="Due Date"
                        id="due_date"
                        value={data.due_date ? parseDate(data.due_date) : null}
                        onChange={(value) =>
                            setData(
                                'due_date',
                                value ? `${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}` : null,
                            )
                        }
                        isInvalid={!!errors.due_date}
                        errorMessage={errors.due_date}
                        selectorButtonPlacement="start"
                    />

                    <Textarea
                        label="Note"
                        id="note"
                        value={data.note}
                        onChange={(e) => setData('note', e.target.value)}
                        isInvalid={!!errors.note}
                        errorMessage={errors.note}
                        className="sm:col-span-2"
                    />
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                    <Button onPress={onClose} color="default">
                        Batal
                    </Button>
                    <Button type="submit" disabled={processing} color="primary">
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
