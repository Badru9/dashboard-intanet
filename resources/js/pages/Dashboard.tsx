/* eslint-disable @typescript-eslint/no-explicit-any */
import CustomersDistributionChart from '@/components/Chart/CustomersDistribution';
import IncomeChart from '@/components/Chart/IncomeChart';
import OutcomeChart from '@/components/Chart/OutcomeChart';
import DashboardSummary from '@/components/Dashboard/DashboardSummary';
import MonthAndYearFilter from '@/components/Dashboard/MonthFilter';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface DashboardProps extends PageProps {
    onlineCustomers: number;
    monthlyIncome: number;
    monthlyExpense: number;
    unpaidInvoices: number;
    selectedMonth: string;
    selectedYear: string;
    [key: string]: any;
}

export default function Dashboard() {
    const { onlineCustomers, monthlyIncome, monthlyExpense, unpaidInvoices, selectedMonth, selectedYear } = usePage<DashboardProps>().props;

    console.log('hereeee', usePage<DashboardProps>().props);

    const [currentMonth, setCurrentMonth] = useState(selectedMonth);
    const [currentYear, setCurrentYear] = useState(selectedYear);

    console.log(currentMonth);

    const handleMonthYearChange = (month: string, year: string) => {
        setCurrentMonth(month);
        setCurrentYear(year);
        router.get(route('dashboard'), { month, year }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"> */}
            <div className="p-4 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h2>
                <div className="mb-2 mt-4">
                    <MonthAndYearFilter selectedMonth={currentMonth} selectedYear={currentYear} onChange={handleMonthYearChange} />
                </div>
                <DashboardSummary
                    activeCustomers={onlineCustomers}
                    monthlyIncome={monthlyIncome}
                    monthlyExpense={monthlyExpense}
                    unpaidInvoices={unpaidInvoices}
                />
                <div className="mt-4 grid gap-4 md:grid-rows-3 lg:grid-cols-3 lg:grid-rows-4">
                    <div className="col-span-2">
                        <IncomeChart selectedMonth={currentMonth} selectedYear={currentYear} />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <OutcomeChart selectedMonth={currentMonth} selectedYear={currentYear} />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <CustomersDistributionChart selectedMonth={currentMonth} selectedYear={currentYear} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
