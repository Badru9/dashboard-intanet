export interface StatusOption {
    value: 'online' | 'inactive' | 'offline';
    label: string;
}

export interface CashflowCategoryOption {
    value: 0 | 1;
    label: string;
}

export interface InvoiceStatusOption {
    value: 'paid' | 'unpaid' | 'cancelled';
    label: string;
}

export const CUSTOMER_STATUS_OPTIONS: StatusOption[] = [
    {
        value: 'online',
        label: 'Online',
    },
    {
        value: 'inactive',
        label: 'Inactive',
    },
    {
        value: 'offline',
        label: 'Offline',
    },
];

export const CASHFLOW_CATEGORY_OPTIONS: CashflowCategoryOption[] = [
    {
        value: 0,
        label: 'Pemasukan',
    },
    {
        value: 1,
        label: 'Pengeluaran',
    },
];

export enum Role {
    ADMIN = 'admin',
    DIRECTOR = 'director',
}

export const INVOICE_STATUS_OPTIONS: InvoiceStatusOption[] = [
    {
        value: 'paid',
        label: 'Paid',
    },
    {
        value: 'unpaid',
        label: 'Unpaid',
    },
    {
        value: 'cancelled',
        label: 'Cancelled',
    },
];

export const BILL_DATE_LENGTH = 28;
