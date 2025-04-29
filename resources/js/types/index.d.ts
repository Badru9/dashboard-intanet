import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

// Auth Types
export interface Auth {
    user: User;
}

export interface Coordinate {
    latitude: string;
    longitude: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    is_admin: 0 | 1;
}

export type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

export type RegisterForm = {
    name: string;
    email: string;
    username: string;
    password: string;
    password_confirmation: string;
    phone: string;
    address: string;
    terms: boolean;
};

export type ResetPasswordForm = {
    email: string;
    password: string;
    password_confirmation: string;
    token: string;
};

// Layout Types
export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export type SidebarItem = {
    title: string;
    href: string;
    icon: string;
    children?: SidebarItem[];
};

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export type PageProps = {
    auth: {
        user: User;
    };
    ziggy: {
        location: string;
        query: Record<string, string | number | boolean | null>;
    };
};

// Business Types
export interface InternetPackage {
    id: number;
    name: string;
    speed: string;
    price: number;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface Customer {
    id: number;
    name: string;
    email?: string;
    phone: string;
    address: string;
    npwp: string;
    coordinate?: string;
    tax_invoice_number: string;
    status: 'active' | 'inactive' | 'paused';
    package?: InternetPackage;
    join_date: string;
    paused_at?: string;
    inactive_at?: string;
}

export interface Invoices {
    id: number;
    customer_id: number;
    package_id: number;
    created_by: User;
    creator: User;
    invoiceNumber: string;
    customer: Customer;
    package: InternetPackage;
    note?: string;
    due_date: string | null;
    amount: number;
    status: PaidStatus;
    created_at: string;
    updated_at: string;
}

export interface CashflowCategory {
    id: number;
    name: string;
    is_out: 0 | 1;
    note?: string;
    created_at: string;
    updated_at: string;
}

export interface Cashflow {
    id: number;
    amount: number;
    created_by: User;
    invoice: Invoices;
    note?: string;
    category: CashflowCategory;
    created_at: string;
    updated_at: string;
}

// Settings Types
export type ProfileForm = {
    name: string;
    email: string;
};

export type SettingSection = {
    title: string;
    description: string;
    href: string;
    icon: string;
};

// Appearance Types
export type Appearance = 'light' | 'dark' | 'system';

export interface Role {
    id: number;
    name: RoleType;
    created_at: string;
    updated_at: string;
}

// ENUM
export enum PaidStatus {
    PAID = 'paid',
    UNPAID = 'unpaid',
    CANCELLED = 'cancelled',
}

export enum RoleType {
    ADMIN = 'admin',
    DIREKTUR = 'direktur',
}

export enum CashflowType {
    INCOME = 'income',
    EXPENSE = 'expense',
}
