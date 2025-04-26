import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

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

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    is_admin: boolean;
}

// Auth Types
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
export type SidebarItem = {
    title: string;
    href: string;
    icon: string;
    children?: SidebarItem[];
};

export type PageProps = {
    auth: {
        user: User;
    };
    ziggy: {
        location: string;
        query: Record<string, string | number | boolean | null>;
    };
};

export type InternetPackage = {
    id: number;
    name: string;
    speed: string;
    price: number;
};

// Business Types
export type Customer = {
    id: number;
    name: string;
    email?: string;
    phone: string;
    address: string;
    npwp: string;
    coordinate?: string;
    tax_invoice?: string;
    status: CustomerStatus;
    package: InternetPackage;
    join_date: string;
    paused_at?: string;
    inactive_at?: string;
};

export type Invoice = {
    id: number;
    customer_id: number;
    invoiceNumber: string;
    customer: string;
    number: string;
    date: string;
    due_date: string;
    amount: number;
    status: PaidStatus;
    created_at: string;
    updated_at: string;
};

export interface CashflowCategory {
    id: number;
    name: string;
    is_out: boolean;
    note?: string;
}

export type Cashflow = {
    id: number;
    cashflow_category_id: CashflowCategory;
    created_at?: string;
};

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

export enum CustomerStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PAUSED = 'paused',
}
