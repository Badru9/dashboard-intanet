import { Link, useForm, usePage } from '@inertiajs/react';
import { CurrencyDollar, FileText, Gear, House, List, SignOut, Users, WifiHigh, X } from '@phosphor-icons/react';
import clsx from 'clsx';
import { PropsWithChildren, useState } from 'react';

type IconComponent = typeof House | typeof WifiHigh | typeof Users | typeof FileText | typeof CurrencyDollar | typeof Gear | typeof SignOut;

type SidebarItem = {
    name: string;
    Icon: IconComponent;
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

const MenuItem = ({ item, isOpen }: { item: SidebarItem; isOpen: boolean }) => {
    return (
        <Link
            href={item.href}
            className={clsx(
                'flex items-center rounded-lg px-4 py-2 text-gray-600 transition-all duration-300 hover:translate-x-1 hover:scale-105 hover:bg-gray-100',
                isOpen ? 'w-full' : 'w-12 justify-center',
            )}
            title={!isOpen ? item.name : undefined}
        >
            <item.Icon size={isOpen ? 20 : 24} />
            <span className={clsx('ml-3', !isOpen && 'hidden')}>{item.name}</span>
        </Link>
    );
};

const sidebarItems: SidebarItem[] = [
    { name: 'Dashboard', Icon: House, href: route('dashboard') },
    { name: 'Internet Packages', Icon: WifiHigh, href: route('internet-packages.index') },
    { name: 'Customers', Icon: Users, href: route('customers.index') },
    { name: 'Invoices', Icon: FileText, href: route('invoices.index') },
    { name: 'Cashflows', Icon: CurrencyDollar, href: route('cashflows.index') },
    { name: 'Cashflows Categories', Icon: CurrencyDollar, href: route('cashflow-categories.index') },
];

const supportItems: SidebarItem[] = [{ name: 'Settings', Icon: Gear, href: route('settings.index') }];

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<PageProps>().props;
    const { post } = useForm({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = () => {
        post(route('logout'));
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="bg-smoke-white flex h-screen">
            {/* Sidebar */}
            <aside
                className={clsx(
                    'fixed inset-y-0 left-0 z-40 border-r border-gray-200 bg-white font-medium whitespace-nowrap transition-all duration-300',
                    isSidebarOpen ? 'w-64' : 'w-20',
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between gap-3 border-b border-gray-200 px-6">
                    <img
                        src="/images/logo/intanet-text.png"
                        alt="Logo"
                        className={clsx('h-7 object-contain transition-all duration-300', !isSidebarOpen && 'hidden')}
                    />
                    <button onClick={toggleSidebar} className="cursor-pointer rounded-lg p-2 text-slate-900 hover:bg-gray-100">
                        {isSidebarOpen ? <X size={20} /> : <List size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex h-[calc(100vh-4rem)] flex-col justify-between p-4">
                    <div className="space-y-8">
                        {/* Main Menu */}
                        <div>
                            <h2 className={clsx('px-4 text-xs font-semibold text-gray-400 uppercase', !isSidebarOpen && 'hidden')}>General Menu</h2>
                            <nav className="mt-4 space-y-1">
                                {sidebarItems.map((item) => (
                                    <MenuItem key={item.name} item={item} isOpen={isSidebarOpen} />
                                ))}
                            </nav>
                        </div>

                        {/* Support */}
                        <div>
                            <h2 className={clsx('px-4 text-xs font-semibold text-gray-400 uppercase', !isSidebarOpen && 'hidden')}>Support</h2>
                            <nav className="mt-4 space-y-1">
                                {supportItems.map((item) => (
                                    <MenuItem key={item.name} item={item} isOpen={isSidebarOpen} />
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="border-t border-gray-200 pt-4">
                        <button
                            onClick={handleLogout}
                            className={clsx(
                                'flex cursor-pointer items-center rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100',
                                isSidebarOpen ? 'w-full' : 'w-12 justify-center',
                            )}
                            title={!isSidebarOpen ? 'Log Out' : undefined}
                        >
                            <SignOut size={isSidebarOpen ? 20 : 24} />
                            <span className={clsx('ml-3', !isSidebarOpen && 'hidden')}>Log Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={clsx('flex-1 overflow-y-hidden transition-all duration-300', isSidebarOpen ? 'pl-64' : 'pl-20')}>
                {/* Header */}
                <div className="sticky top-0 z-30 border-b border-gray-200 bg-white">
                    <div className="flex h-20 items-center justify-end px-8 py-4">
                        {/* User Menu */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${auth.user.name}&background=random`}
                                    alt={auth.user.name}
                                    className="h-10 w-10 rounded-full"
                                />
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">{auth.user.name}</span>
                                    <span className="text-sm text-gray-500">{auth.user.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="h-[calc(100vh-5rem)] max-w-md overflow-y-auto p-8 lg:max-w-7xl xl:max-w-full">{children}</div>
            </main>
        </div>
    );
}
