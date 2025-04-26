export interface StatusOption {
    value: 'active' | 'inactive' | 'paused';
    label: string;
}

export const CUSTOMER_STATUS_OPTIONS: StatusOption[] = [
    {
        value: 'active',
        label: 'Active',
    },
    {
        value: 'inactive',
        label: 'Inactive',
    },
    {
        value: 'paused',
        label: 'Paused',
    },
];
