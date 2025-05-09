export interface StatusOption {
    value: 'active' | 'inactive' | 'paused';
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
        value: 'active',
        label: 'Active',
    },
    {
        value: 'inactive',
        label: 'Inactive',
    },
    {
        value: 'paused',
        label: 'Paused',
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
