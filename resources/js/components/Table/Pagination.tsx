import { type PaginationProp } from '@/types/table';
import { Link } from '@inertiajs/react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface PaginationProps {
    pagination: PaginationProp;
}

export default function Pagination({ pagination }: PaginationProps) {
    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <Link
                    href={pagination.prev_page_url || '#'}
                    className={`relative inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                        pagination.prev_page_url ? 'text-gray-700 hover:bg-gray-50' : 'cursor-not-allowed text-gray-400'
                    }`}
                >
                    <CaretLeft className="mr-2 h-4 w-4" />
                    Previous
                </Link>
                <Link
                    href={pagination.next_page_url || '#'}
                    className={`relative ml-3 inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                        pagination.next_page_url ? 'text-gray-700 hover:bg-gray-50' : 'cursor-not-allowed text-gray-400'
                    }`}
                >
                    Next
                    <CaretRight className="ml-2 h-4 w-4" />
                </Link>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{pagination.from}</span> to <span className="font-medium">{pagination.to}</span> of{' '}
                        <span className="font-medium">{pagination.total}</span> results
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm" aria-label="Pagination">
                        {pagination.links.map((link, index) => {
                            // Handle Previous button
                            if (link.label === '&laquo; Previous') {
                                return (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 ${
                                            link.url ? 'text-gray-500' : 'cursor-not-allowed text-gray-300'
                                        }`}
                                    >
                                        <CaretLeft className="h-5 w-5" />
                                    </Link>
                                );
                            }

                            // Handle Next button
                            if (link.label === 'Next &raquo;') {
                                return (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 ${
                                            link.url ? 'text-gray-500' : 'cursor-not-allowed text-gray-300'
                                        }`}
                                    >
                                        <CaretRight className="h-5 w-5" />
                                    </Link>
                                );
                            }

                            // Handle number links
                            return (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                        link.active
                                            ? 'bg-primary z-10 text-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-green-600'
                                            : 'text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:outline-offset-0'
                                    } `}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
}
