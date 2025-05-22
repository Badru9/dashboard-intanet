/* eslint-disable @typescript-eslint/no-explicit-any */
import IncomeChart from '@/components/Chart/IncomeChart';
import OutcomeChart from '@/components/Chart/OutcomeChart';
import DashboardSummary from '@/components/Dashboard/DashboardSummary';
import MonthAndYearFilter from '@/components/Dashboard/MonthFilter';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface DashboardProps extends PageProps {
    activeCustomers: number;
    monthlyIncome: number;
    monthlyExpense: number;
    unpaidInvoices: number;
    selectedMonth: string;
    selectedYear: string;
    [key: string]: any;
}

export default function Dashboard() {
    const { activeCustomers, monthlyIncome, monthlyExpense, unpaidInvoices, selectedMonth, selectedYear } = usePage<DashboardProps>().props;

    console.log(usePage<DashboardProps>().props);

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
                <h2 className="mb-4 text-2xl font-bold text-gray-900 lg:mb-0 dark:text-gray-100">Dashboard</h2>
                <div className="flex justify-end">
                    <MonthAndYearFilter selectedMonth={currentMonth} selectedYear={currentYear} onChange={handleMonthYearChange} />
                </div>
                <DashboardSummary
                    activeCustomers={activeCustomers}
                    monthlyIncome={monthlyIncome}
                    monthlyExpense={monthlyExpense}
                    unpaidInvoices={unpaidInvoices}
                />
                <div className="mt-4 flex w-full flex-col gap-4 lg:flex-row">
                    <div className="w-full lg:w-2/3">
                        <IncomeChart selectedMonth={currentMonth} selectedYear={currentYear} />
                    </div>
                    <div className="w-full lg:w-1/3">
                        <OutcomeChart selectedMonth={currentMonth} selectedYear={currentYear} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
