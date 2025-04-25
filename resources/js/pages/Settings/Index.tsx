import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

type SettingSection = {
    title: string;
    icon: string;
    description: string;
    href: string;
};

const settingSections: SettingSection[] = [
    {
        title: 'Profile',
        icon: 'user',
        description: 'Manage your profile information, email, and password',
        href: route('settings.profile'),
    },
    {
        title: 'Company',
        icon: 'briefcase',
        description: 'Update your company details, logo, and business information',
        href: route('settings.company'),
    },
    {
        title: 'Billing',
        icon: 'credit-card',
        description: 'View and manage your billing information and payment methods',
        href: route('settings.billing'),
    },
    {
        title: 'Notifications',
        icon: 'bell',
        description: 'Configure how you receive notifications and alerts',
        href: route('settings.notifications'),
    },
    {
        title: 'Security',
        icon: 'shield',
        description: 'Manage your security settings and two-factor authentication',
        href: route('settings.security'),
    },
    {
        title: 'Appearance',
        icon: 'eye',
        description: 'Customize the look and feel of your dashboard',
        href: route('settings.appearance'),
    },
];

export default function Settings() {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <AuthenticatedLayout>
            <Head title="Settings" />

            <div className="space-y-6">
                {/* Settings Overview */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {settingSections.map((section) => (
                        <div
                            key={section.title}
                            className="group cursor-pointer rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md"
                            onClick={() => setActiveTab(section.title.toLowerCase())}
                        >
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600 group-hover:bg-green-500 group-hover:text-white">
                                <i className={`feather-${section.icon} h-6 w-6`} />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">{section.title}</h3>
                            <p className="text-sm text-gray-500">{section.description}</p>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                        <button className="text-sm text-gray-500 hover:text-gray-900">View all</button>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                action: 'Changed password',
                                date: '2 hours ago',
                                icon: 'lock',
                                color: 'text-blue-500 bg-blue-100',
                            },
                            {
                                action: 'Updated profile information',
                                date: 'Yesterday',
                                icon: 'user',
                                color: 'text-green-500 bg-green-100',
                            },
                            {
                                action: 'Enabled two-factor authentication',
                                date: '3 days ago',
                                icon: 'shield',
                                color: 'text-purple-500 bg-purple-100',
                            },
                        ].map((activity, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className={`rounded-lg p-2 ${activity.color}`}>
                                    <i className={`feather-${activity.icon} h-5 w-5`} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{activity.action}</p>
                                    <p className="text-sm text-gray-500">{activity.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
