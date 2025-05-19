import { useAppearance } from '@/hooks/use-appearance';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { CurrencyDollar, FileText, Gear, House, List, Moon, SignOut, Sun, User, Users, WifiHigh } from '@phosphor-icons/react';
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
            is_admin: number;
        };
    };
};

// Tambahkan helper untuk mengambil pathname dari href
const getPathname = (href: string): string => {
    try {
        // Jika href adalah absolute URL, ambil pathname-nya
        return new URL(href, window.location.origin).pathname;
    } catch {
        // Jika href sudah relative, kembalikan langsung
        return href;
    }
};

const isRouteActive = (href: string): boolean => {
    return window.location.pathname === getPathname(href);
};

const MenuItem = ({ item, isOpen, isActive }: { item: SidebarItem; isOpen: boolean; isActive: boolean }) => {
    return (
        <Link
            href={item.href}
            className={clsx(
                'flex items-center rounded-full from-purple-700 to-primary px-4 py-2 text-slate-500 transition-all duration-300 hover:bg-gradient-to-r hover:text-white',
                isOpen ? 'w-full' : 'w-12 justify-center',
                isActive && 'bg-gradient-to-r from-primary to-purple-700 text-white shadow',
            )}
            title={!isOpen ? item.name : undefined}
        >
            <item.Icon size={isOpen ? 20 : 24} />
            <span
                className={clsx(
                    'ml-5 whitespace-nowrap text-sm transition-all duration-300',
                    isOpen ? 'relative w-auto max-w-xs opacity-100 delay-300' : 'absolute w-0 max-w-0 overflow-hidden opacity-0 delay-0',
                )}
                style={{ transitionProperty: 'opacity, width, max-width' }}
            >
                {item.name}
            </span>
        </Link>
    );
};

const mainMenuItems: SidebarItem[] = [
    { name: 'Dashboard', Icon: House, href: route('dashboard') },
    { name: 'Pengguna', Icon: Users, href: route('customers.index') },
    { name: 'Tagihan', Icon: FileText, href: route('invoices.index') },
    { name: 'Transaksi', Icon: CurrencyDollar, href: route('cashflows.index') },
];

const settingMenu: SidebarItem[] = [
    { name: 'Paket Internet', Icon: WifiHigh, href: route('internet-packages.index') },
    { name: 'Kategori Transaksi', Icon: CurrencyDollar, href: route('cashflow-categories.index') },
    { name: 'Pengaturan', Icon: Gear, href: route('settings.index') },
];
const adminMenuItems: SidebarItem[] = [...settingMenu, { name: 'Pengguna', Icon: Users, href: route('users.index') }];

const MobileMenuItem = ({ item, isActive }: { item: SidebarItem; isActive: boolean }) => {
    return (
        <Link
            href={item.href}
            className={clsx(
                'flex items-center gap-3 rounded-lg px-4 py-2 text-slate-500 transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-700 hover:to-primary hover:text-white',
                isActive && 'bg-gradient-to-r from-primary to-purple-700 text-white shadow',
            )}
        >
            <item.Icon size={20} />
            <span className="text-sm">{item.name}</span>
        </Link>
    );
};

const MobileMenu = ({ items, title }: { items: SidebarItem[]; title: string }) => {
    return (
        <div className="space-y-4">
            <h2 className="px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">{title}</h2>
            <nav className="space-y-1">
                {items.map((item) => (
                    <MobileMenuItem key={item.name} item={item} isActive={isRouteActive(item.href)} />
                ))}
            </nav>
        </div>
    );
};

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<PageProps>().props;
    const { appearance, updateAppearance } = useAppearance();
    const { post } = useForm({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = () => {
        post(route('logout'));
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const isAdminMenus = auth.user.is_admin === 1 ? adminMenuItems : mainMenuItems;

    return (
        <div className="flex h-screen bg-white dark:bg-slate-900">
            {/* Desktop Sidebar */}
            <aside
                className={clsx(
                    'fixed inset-y-0 left-0 z-40 hidden whitespace-nowrap bg-white font-medium transition-all duration-300 lg:block dark:bg-slate-900',
                    isSidebarOpen ? 'w-64' : 'w-20',
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between gap-3 px-6">
                    <button
                        onClick={toggleSidebar}
                        className="cursor-pointer rounded-lg bg-gray-100 p-2 text-slate-900 hover:bg-gray-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                    >
                        <List size={20} />
                    </button>
                    <img
                        src={isSidebarOpen ? '/images/logo/intanet-text.png' : '/images/logo/intanet.png'}
                        alt="Logo"
                        className={clsx('h-6 object-contain transition-all duration-300')}
                    />
                </div>

                {/* Navigation */}
                <div className="flex h-[calc(100vh-4rem)] flex-col justify-between p-4">
                    <div className="space-y-8">
                        {/* Main Menu */}
                        <div>
                            <h2 className={clsx('px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500', !isSidebarOpen && 'hidden')}>
                                General Menu
                            </h2>
                            <nav className="mt-2 space-y-1">
                                {mainMenuItems.map((item) => (
                                    <MenuItem key={item.name} item={item} isOpen={isSidebarOpen} isActive={isRouteActive(item.href)} />
                                ))}
                            </nav>
                            <h2
                                className={clsx(
                                    'mt-5 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500',
                                    !isSidebarOpen && 'hidden',
                                )}
                            >
                                Settings
                            </h2>
                            <nav className="mt-2 space-y-1">
                                {isAdminMenus.map((item) => (
                                    <MenuItem key={item.name} item={item} isOpen={isSidebarOpen} isActive={isRouteActive(item.href)} />
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="border-t border-gray-200 pt-4 dark:border-slate-700">
                        <button
                            onClick={handleLogout}
                            className={clsx(
                                'flex cursor-pointer items-center rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800',
                                isSidebarOpen ? 'w-full' : 'w-12 justify-center',
                            )}
                            title={!isSidebarOpen ? 'Log Out' : undefined}
                        >
                            <SignOut size={isSidebarOpen ? 20 : 24} />
                            <span
                                className={clsx(
                                    'ml-3 whitespace-nowrap transition-all duration-300',
                                    isSidebarOpen
                                        ? 'relative w-auto max-w-xs opacity-100 delay-300'
                                        : 'absolute w-0 max-w-0 overflow-hidden opacity-0 delay-0',
                                )}
                                style={{ transitionProperty: 'opacity, width, max-width' }}
                            >
                                Log Out
                            </span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={clsx('flex-1 overflow-y-hidden transition-all duration-300', isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20')}>
                {/* Header */}
                <div className="sticky top-0 z-30 flex w-full items-center justify-between bg-white px-4 py-3 lg:px-10 dark:bg-slate-900">
                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <Popover>
                            <PopoverTrigger>
                                <button className="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-slate-500 transition-colors hover:bg-primary/10 hover:text-primary dark:bg-slate-800 dark:text-slate-300">
                                    <List size={20} />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-4">
                                <div className="flex flex-col space-y-6">
                                    <div className="flex items-center justify-between">
                                        <img src="/images/logo/intanet-text.png" alt="Logo" className="h-6 object-contain" />
                                    </div>
                                    <MobileMenu items={mainMenuItems} title="General Menu" />
                                    <MobileMenu items={isAdminMenus} title="Settings" />
                                    <div className="border-t border-gray-200 pt-4 dark:border-slate-700">
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
                                        >
                                            <SignOut size={20} />
                                            <span className="text-sm">Log Out</span>
                                        </button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Right Side Header Content */}
                    <div className="flex w-full items-center justify-end gap-4">
                        <button
                            onClick={() => updateAppearance(appearance === 'dark' ? 'light' : 'dark')}
                            className="flex cursor-pointer items-center gap-3 rounded-full bg-slate-50 px-3 py-2 text-slate-500 transition-colors hover:bg-primary/10 hover:text-primary dark:bg-slate-800 dark:text-slate-300"
                        >
                            {appearance === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <Dropdown>
                            <DropdownTrigger>
                                <button className="flex cursor-pointer items-center gap-3 rounded-full bg-slate-50 px-3 py-2 text-slate-500 transition-colors hover:bg-primary/10 hover:text-primary dark:bg-slate-800 dark:text-slate-300">
                                    <User size={20} />
                                    <h3 className="text-sm font-medium">{auth.user.name}</h3>
                                </button>
                            </DropdownTrigger>
                            <DropdownMenu className="rounded-lg bg-white shadow-md dark:bg-slate-800">
                                <DropdownItem key="settings">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${auth.user.name}&background=random`}
                                            alt={auth.user.name}
                                            className="h-5 w-5 rounded-full"
                                        />
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{auth.user.name}</h3>
                                    </div>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>

                {/* Page Content */}
                <div className="h-[calc(100vh-3rem)] overflow-y-auto">
                    <div className="min-h-screen w-full rounded-tl-3xl bg-slate-100 dark:bg-slate-800">{children}</div>
                </div>
            </main>
        </div>
    );
}
