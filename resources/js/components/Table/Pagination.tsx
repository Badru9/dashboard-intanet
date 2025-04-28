import { Pagination as PaginationComponent } from '@heroui/react';

interface CustomPaginationProps {
    total: number;
    page: number;
    onChange: (page: number) => void;
    initialPage?: number;
}

export default function Pagination({ total, page, onChange, initialPage = 1 }: CustomPaginationProps) {
    return (
        <div className="flex items-center justify-end p-3">
            <PaginationComponent total={total} isCompact initialPage={initialPage} showControls color="primary" onChange={onChange} page={page} />
        </div>
    );
}
