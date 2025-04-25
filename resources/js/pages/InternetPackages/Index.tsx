import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function InternetPackagesIndex() {
    return (
        <AuthenticatedLayout>
            <Head title="Internet Packages" />

            <div className="space-y-6">
                {/* Header with Action */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Internet Packages</h2>
                        <p className="mt-1 text-sm text-gray-500">Manage your internet packages and pricing</p>
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600">
                        <i className="feather-plus h-5 w-5" />
                        Add Package
                    </button>
                </div>

                {/* Packages Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            name: 'Basic Plan',
                            speed: '10 Mbps',
                            price: 299000,
                            features: ['Up to 10 Mbps', 'Unlimited Bandwidth', '24/7 Support'],
                        },
                        {
                            name: 'Pro Plan',
                            speed: '20 Mbps',
                            price: 499000,
                            features: ['Up to 20 Mbps', 'Unlimited Bandwidth', '24/7 Support', 'Static IP'],
                        },
                        {
                            name: 'Business Plan',
                            speed: '50 Mbps',
                            price: 999000,
                            features: ['Up to 50 Mbps', 'Unlimited Bandwidth', '24/7 Priority Support', 'Static IP', 'Custom DNS'],
                        },
                    ].map((pkg, index) => (
                        <div key={index} className="rounded-xl bg-white p-6 shadow-sm">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                                <p className="text-sm text-gray-500">{pkg.speed} Download & Upload</p>
                            </div>

                            <div className="mb-6">
                                <p className="text-3xl font-bold text-gray-900">
                                    Rp {pkg.price.toLocaleString('id-ID')}
                                    <span className="text-base font-normal text-gray-500">/month</span>
                                </p>
                            </div>

                            <ul className="mb-6 space-y-3">
                                {pkg.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                        <i className="feather-check h-5 w-5 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex gap-2">
                                <button className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Edit
                                </button>
                                <button className="flex-1 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
