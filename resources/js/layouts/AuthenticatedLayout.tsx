import { Link, useForm, usePage } from '@inertiajs/react';
import { Bell } from '@phosphor-icons/react';
import { PropsWithChildren } from 'react';

type SidebarItem = {
    name: string;
    icon: string;
    href: string;
};

type PageProps = {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
};

const sidebarItems: SidebarItem[] = [
    { name: 'Dashboard', icon: 'grid', href: route('dashboard') },
    { name: 'Internet Packages', icon: 'wifi', href: route('internet-packages.index') },
    { name: 'Customers', icon: 'users', href: route('customers.index') },
    { name: 'Invoices', icon: 'file-text', href: route('invoices.index') },
    { name: 'Cashflows', icon: 'dollar-sign', href: route('cashflows.index') },
];

const supportItems: SidebarItem[] = [{ name: 'Settings', icon: 'settings', href: route('settings.index') }];

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<PageProps>().props;
    const { post } = useForm({});

    const handleLogout = () => {
        post(route('logout'));
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-200 bg-white">
                {/* Logo */}
                <div className="flex h-16 items-center border-b border-gray-200 px-6">
                    <img src="/images/logo/intanet-text.png" alt="Logo" className="h-8 object-contain" />
                </div>

                {/* Navigation */}
                <div className="flex h-[calc(100vh-4rem)] flex-col justify-between p-4">
                    <div className="space-y-8">
                        {/* Main Menu */}
                        <div>
                            <h2 className="px-4 text-xs font-semibold text-gray-400 uppercase">General Menu</h2>
                            <nav className="mt-4 space-y-1">
                                {sidebarItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
                                    >
                                        <i className={`feather-${item.icon} mr-3 h-5 w-5`} />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Support */}
                        <div>
                            <h2 className="px-4 text-xs font-semibold text-gray-400 uppercase">Support</h2>
                            <nav className="mt-4 space-y-1">
                                {supportItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
                                    >
                                        <i className={`feather-${item.icon} mr-3 h-5 w-5`} />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="border-t border-gray-200 pt-4">
                        <button
                            onClick={handleLogout}
                            className="flex w-full cursor-pointer items-center rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
                        >
                            <i className="feather-log-out mr-3 h-5 w-5" />
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="max-w-full flex-1 overflow-y-hidden pl-64">
                {/* Header */}
                <div className="sticky top-0 z-30 border-b border-gray-200 bg-white">
                    <div className="flex h-16 items-center justify-between px-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-gray-500">Welcome back, {auth.user.name}</p>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-4">
                            <button className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200">
                                <Bell size={24} className="cursor-pointer" />
                            </button>
                            <div className="flex items-center gap-3">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${auth.user.name}&background=random`}
                                    alt={auth.user.name}
                                    className="h-8 w-8 rounded-full"
                                />
                                <span className="font-medium text-gray-900">{auth.user.name}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="h-[calc(100vh-4rem)] overflow-y-auto">{children}</div>
            </main>
        </div>
    );
}
