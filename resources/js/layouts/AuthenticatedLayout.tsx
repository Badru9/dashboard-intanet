import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Switch } from '@heroui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { CurrencyDollar, FileText, Gear, House, List, SignOut, User, Users, WifiHigh } from '@phosphor-icons/react';
import clsx from 'clsx';
import { PropsWithChildren, useEffect, useState } from 'react';

type IconComponent = typeof House | typeof WifiHigh | typeof Users | typeof FileText | typeof CurrencyDollar | typeof Gear | typeof SignOut;

type SidebarItem = {
    name: string;
    Icon: IconComponent;
    href: string;
    routeName?: string; // Ditambahkan untuk menyimpan nama route
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

export const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg aria-hidden="true" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
            <path
                d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.519.32-1.79z"
                fill="currentColor"
            />
        </svg>
    );
};

export const SunIcon = (props: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg aria-hidden="true" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
            <g fill="currentColor">
                <path d="M19 12a7 7 0 11-7-7 7 7 0 017 7z" />
                <path d="M12 22.96a.969.969 0 01-1-.96v-.08a1 1 0 012 0 1.038 1.038 0 01-1 1.04zm7.14-2.82a1.024 1.024 0 01-.71-.29l-.13-.13a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.984.984 0 01-.7.29zm-14.28 0a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a1 1 0 01-.7.29zM22 13h-.08a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zM2.08 13H2a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zm16.93-7.01a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a.984.984 0 01-.7.29zm-14.02 0a1.024 1.024 0 01-.71-.29l-.13-.14a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.97.97 0 01-.7.3zM12 3.04a.969.969 0 01-1-.96V2a1 1 0 012 0 1.038 1.038 0 01-1 1.04z" />
            </g>
        </svg>
    );
};

const MenuItem = ({ item, isOpen, isActive = false }: { item: SidebarItem; isOpen: boolean; isActive?: boolean }) => (
    <Link
        href={item.href}
        className={clsx(
            'flex items-center rounded-full px-4 py-2 transition-all duration-300',
            isOpen ? 'w-full' : 'w-12 justify-center',
            isActive
                ? 'dark:to-primary-dark bg-gradient-to-r from-purple-700 to-primary text-white dark:from-purple-600'
                : 'dark:hover:to-primary-dark text-slate-500 hover:bg-gradient-to-r hover:from-purple-700 hover:to-primary hover:text-white dark:text-gray-300 dark:hover:from-purple-600',
        )}
        title={!isOpen ? item.name : undefined}
    >
        <item.Icon size={isOpen ? 20 : 24} weight={isActive ? 'fill' : 'regular'} />
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

const mainMenuItems: SidebarItem[] = [
    { name: 'Dashboard', Icon: House, href: route('dashboard'), routeName: 'dashboard' },
    { name: 'Customers', Icon: Users, href: route('customers.index'), routeName: 'customers.index' },
    { name: 'Invoices', Icon: FileText, href: route('invoices.index'), routeName: 'invoices.index' },
    { name: 'Cashflows', Icon: CurrencyDollar, href: route('cashflows.index'), routeName: 'cashflows.index' },
];

const settingMenu: SidebarItem[] = [
    { name: 'Internet Packages', Icon: WifiHigh, href: route('internet-packages.index'), routeName: 'internet-packages.index' },
    { name: 'Cashflows Categories', Icon: CurrencyDollar, href: route('cashflow-categories.index'), routeName: 'cashflow-categories.index' },
];
const adminMenuItems: SidebarItem[] = [...settingMenu, { name: 'Users', Icon: Users, href: route('users.index'), routeName: 'users.index' }];

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<PageProps>().props;
    const currentRoute = route().current();

    const { post } = useForm({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTheme(e.target.checked ? 'light' : 'dark');
    };

    const handleLogout = () => {
        post(route('logout'));
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Helper function to check if a route is active
    const isRouteActive = (routeName: string | undefined) => {
        if (!routeName) return false;

        // Check if the current route starts with the given route name
        // This helps with nested routes (e.g. users.edit would match with users.index)
        return currentRoute === routeName || (currentRoute && currentRoute.startsWith(`${routeName}.`));
    };

    const isAdminMenus = auth.user.is_admin === 1 ? adminMenuItems : mainMenuItems;

    return (
        <div className="flex h-screen bg-white text-foreground dark:bg-gray-900 dark:text-gray-100">
            {/* Sidebar */}
            <aside
                className={clsx(
                    'fixed inset-y-0 left-0 z-40 whitespace-nowrap border-r bg-white font-medium transition-all duration-300 dark:border-gray-700 dark:bg-gray-800',
                    isSidebarOpen ? 'w-64' : 'w-20',
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between gap-3 border-b px-6 dark:border-gray-700">
                    <button
                        onClick={toggleSidebar}
                        className="cursor-pointer rounded-lg bg-gray-100 p-2 text-slate-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
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
                            <h2 className={clsx('px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-300', !isSidebarOpen && 'hidden')}>
                                General Menu
                            </h2>
                            <nav className="mt-2 space-y-1">
                                {mainMenuItems.map((item) => (
                                    <MenuItem key={item.name} item={item} isOpen={isSidebarOpen} isActive={isRouteActive(item.routeName)} />
                                ))}
                            </nav>
                            <h2
                                className={clsx(
                                    'mt-5 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-300',
                                    !isSidebarOpen && 'hidden',
                                )}
                            >
                                Settings
                            </h2>
                            <nav className="mt-2 space-y-1">
                                {isAdminMenus.map((item) => (
                                    <MenuItem key={item.name} item={item} isOpen={isSidebarOpen} isActive={isRouteActive(item.routeName)} />
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                        <button
                            onClick={handleLogout}
                            className={clsx(
                                'flex cursor-pointer items-center rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
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
            <main className={clsx('flex-1 overflow-y-hidden transition-all duration-300', isSidebarOpen ? 'pl-64' : 'pl-20')}>
                {/* Header */}
                <div className="sticky top-0 z-30 flex items-center justify-end border-b bg-white px-10 py-3 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center gap-4">
                        <Switch
                            defaultSelected={theme === 'light'}
                            color="primary"
                            size="sm"
                            thumbIcon={({ isSelected, className }) =>
                                isSelected ? <SunIcon className={className} /> : <MoonIcon className={className} />
                            }
                            onChange={handleThemeChange}
                        />

                        <Dropdown>
                            <DropdownTrigger>
                                <button className="flex cursor-pointer items-center gap-3 rounded-full bg-slate-50 px-3 py-2 text-slate-500 dark:bg-gray-700 dark:text-gray-300">
                                    <User size={20} />
                                    <h3 className="text-sm font-medium">{auth.user.name}</h3>
                                </button>
                            </DropdownTrigger>
                            <DropdownMenu className="rounded-lg bg-white shadow-md dark:bg-gray-800">
                                <DropdownItem key="settings">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${auth.user.name}&background=random`}
                                            alt={auth.user.name}
                                            className="h-5 w-5 rounded-full"
                                        />
                                        <h3 className="text-sm font-medium text-gray-900">{auth.user.name}</h3>
                                    </div>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>

                {/* Page Content */}
                <div className="h-[calc(100vh-3rem)] max-w-md overflow-y-auto lg:max-w-7xl xl:max-w-full">
                    <div className="min-h-screen w-full rounded-tl-3xl bg-slate-100 dark:bg-gray-900">{children}</div>
                </div>
            </main>
        </div>
    );
}
