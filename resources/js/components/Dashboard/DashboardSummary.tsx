import SummaryCard from './SummaryCard';

interface DashboardSummaryProps {
    activeCustomers: number;
    monthlyIncome: number;
    monthlyExpense: number;
    unpaidInvoices: number;
}

export default function DashboardSummary({ activeCustomers, monthlyIncome, monthlyExpense, unpaidInvoices }: DashboardSummaryProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard title="Pelanggan Aktif" value={activeCustomers} type="number" color="primary" icon="users" />
            <SummaryCard title="Pendapatan" value={monthlyIncome} type="currency" color="success" icon="dollar" />
            <SummaryCard title="Pengeluaran" value={monthlyExpense} type="currency" color="danger" icon="cart" />
            <SummaryCard title="Pendapatan Belum Masuk" value={unpaidInvoices} type="currency" color="warning" icon="pending" />
        </div>
    );
}
