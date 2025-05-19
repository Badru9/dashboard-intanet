import { currencyFormat } from '@/lib/utils';
import { Card, CardBody, CardHeader } from '@heroui/react';
import {
    Bank,
    Briefcase,
    Calendar,
    ChartLine,
    ClockCounterClockwise,
    CreditCard,
    CurrencyDollar,
    HandCoins,
    Hourglass,
    Receipt,
    ShieldWarning,
    ShoppingCart,
    Users,
    Wallet,
    Warning,
} from '@phosphor-icons/react';

interface SummaryCardProps {
    title: string;
    value: number | string;
    type?: 'currency' | 'number';
    color?: 'primary' | 'success' | 'warning' | 'danger';
    icon?:
        | 'dollar'
        | 'chart'
        | 'warning'
        | 'shield'
        | 'briefcase'
        | 'users'
        | 'cart'
        | 'calendar'
        | 'pending'
        | 'hourglass'
        | 'receipt'
        | 'bank'
        | 'credit-card'
        | 'wallet'
        | 'hand-coins';
}

export default function SummaryCard({ title, value, type = 'number', color = 'primary', icon = 'chart' }: SummaryCardProps) {
    const colorClasses = {
        primary: 'text-blue-600 dark:text-blue-400',
        success: 'text-green-600 dark:text-green-400',
        warning: 'text-yellow-600 dark:text-yellow-400',
        danger: 'text-red-600 dark:text-red-400',
    };

    const iconMap = {
        dollar: CurrencyDollar,
        chart: ChartLine,
        warning: Warning,
        shield: ShieldWarning,
        briefcase: Briefcase,
        users: Users,
        cart: ShoppingCart,
        calendar: Calendar,
        pending: ClockCounterClockwise,
        hourglass: Hourglass,
        receipt: Receipt,
        bank: Bank,
        'credit-card': CreditCard,
        wallet: Wallet,
        'hand-coins': HandCoins,
    };

    const IconComponent = iconMap[icon];

    return (
        <Card className="bg-white dark:bg-slate-900" shadow="none">
            <CardHeader className="flex items-center justify-between pb-0">
                <h3 className={`text-sm font-medium ${colorClasses[color]}`}>{title}</h3>
                <IconComponent className={`${colorClasses[color]} h-5 w-5`} weight="duotone" />
            </CardHeader>
            <CardBody>
                <p className={`text-2xl font-semibold ${colorClasses[color]}`}>{type === 'currency' ? currencyFormat(value as number) : value}</p>
            </CardBody>
        </Card>
    );
}
