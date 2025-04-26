export interface InternetPackage {
    id: number;
    name: string;
    price: number;
    speed: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface Cashflow {
    id: number;
    description: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: string;
    notes?: string;
}

export interface Customer {
    id: number;
    name: string;
    status: 'active' | 'inactive' | 'paused';
    address: string;
    phone: string;
    join_date: string;
    package?: InternetPackage;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    npwp: string;
    tax_number: string;
}

export interface PageProps {
    [key: string]: unknown;
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
}

export interface Invoice {
    id: number;
    customer_id: number;
    number: string;
    invoiceNumber: string;
    customer: string;
    amount: number;
    status: 'paid' | 'unpaid' | 'cancelled';
    date: string;
    due_date: string;
    created_at: string;
    updated_at: string;
}
