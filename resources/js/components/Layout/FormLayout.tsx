import { Head } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface FormLayoutProps {
    title: string;
    description?: string;
    children: ReactNode;
}

export default function FormLayout({ title, description, children }: FormLayoutProps) {
    return (
        <div className="p-8">
            <Head title={title} />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">{children}</div>
        </div>
    );
}
