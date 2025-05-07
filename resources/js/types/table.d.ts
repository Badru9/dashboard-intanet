export type TableColumn<T = Record<string, unknown>> = {
    header?: string;
    value: keyof T | ((data: T, index: number) => React.ReactNode);
    className?: string | ((data: T, index: number) => string);
    headerClassName?: string | ((column: TableColumn<T>, index: number) => string);
    sticky?: boolean;
};

export type TableHeader = Array<{
    name: string;
    rowSpan?: number;
    colSpan?: number;
}>;

export type TableFooter = Array<{
    value: string | number;
    colSpan?: number;
    className?: string;
}>;

export interface PaginationProp {
    current_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    onChange: (page: number) => void;
}
