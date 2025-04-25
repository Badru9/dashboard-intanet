import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Credit Limit Card */}
                <div className="col-span-2 rounded-xl bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Spending Limits Transaction</h2>
                        <span className="text-sm text-gray-500">Today Transaction Limit Mar, 2024</span>
                    </div>

                    <div className="mb-4">
                        <div className="mb-2 flex items-baseline justify-between">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold">$50,834.22</span>
                                <span className="text-sm text-green-500">+75.68%</span>
                            </div>
                            <span className="text-sm text-gray-500">Available credit limit $60,285.00</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <div className="h-full w-3/4 rounded-full bg-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Quick Transfer Card */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">Quickly Transfer</h2>

                    {/* Quick Transfer Contacts */}
                    <div className="mb-6 flex gap-4">
                        {['Richo', 'Ronald', 'Arlene', 'Robert', 'Leslie'].map((name) => (
                            <button key={name} className="flex flex-col items-center gap-2">
                                <div className="h-12 w-12 rounded-full bg-gray-200">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${name}&background=random`}
                                        alt={name}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                </div>
                                <span className="text-sm text-gray-600">{name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Transfer Form */}
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12 text-gray-900 placeholder-gray-500"
                                placeholder="Enter transfer amount"
                                defaultValue="$534.000"
                            />
                            <button className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 hover:text-gray-600">
                                <i className="feather-repeat h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-2.5">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-blue-600">
                                <i className="feather-credit-card h-4 w-4" />
                            </div>
                            <span className="flex-1 text-gray-900">Bank Indonesia</span>
                            <i className="feather-chevron-down h-5 w-5 text-gray-400" />
                        </div>

                        <button className="w-full rounded-lg bg-green-500 py-2.5 font-medium text-white hover:bg-green-600">Transfer</button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
