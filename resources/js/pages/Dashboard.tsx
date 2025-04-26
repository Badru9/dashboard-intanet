import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="p-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                    <p className="mt-1 text-sm text-gray-500">Monitor your business performance and analytics</p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Credit Limit Card */}
                    <div className="col-span-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Spending Limits Transaction</h2>
                                <span className="text-sm text-gray-500">Today Transaction Limit Mar, 2024</span>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <div className="mb-3 flex items-baseline justify-between">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-gray-900">$50,834.22</span>
                                        <span className="text-sm font-medium text-green-500">+75.68%</span>
                                    </div>
                                    <span className="text-sm text-gray-500">Available credit limit $60,285.00</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                                    <div className="h-full w-3/4 rounded-full bg-green-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Transfer Card */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900">Quick Transfer</h2>
                        </div>

                        <div className="p-6">
                            {/* Quick Transfer Contacts */}
                            <div className="mb-6">
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {['Richo', 'Ronald', 'Arlene', 'Robert', 'Leslie'].map((name) => (
                                        <button key={name} className="flex flex-col items-center gap-2">
                                            <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${name}&background=random`}
                                                    alt={name}
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Transfer Form */}
                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                                        placeholder="Enter transfer amount"
                                        defaultValue="$534.000"
                                    />
                                    <button className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:text-gray-600">
                                        <i className="feather-repeat h-5 w-5" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                                        <i className="feather-credit-card h-5 w-5" />
                                    </div>
                                    <span className="flex-1 font-medium text-gray-900">Bank Indonesia</span>
                                    <i className="feather-chevron-down h-5 w-5 text-gray-400" />
                                </div>

                                <button className="w-full rounded-lg bg-green-600 py-2.5 font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none">
                                    Transfer Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
