import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function CashflowsIndex() {
    // Ambil data cashflows dari props
    const { cashflows } = usePage().props;

    console.log(cashflows);

    return (
        <AuthenticatedLayout>
            <Head title="Cashflows" />
            <div className="p-8 text-slate-900">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste eos vitae in tempora suscipit dolor quae expedita quis obcaecati?
                Cupiditate?
            </div>
        </AuthenticatedLayout>
    );
}
