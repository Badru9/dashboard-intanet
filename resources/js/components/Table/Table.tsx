import { type PaginationProp, type TableColumn, type TableFooter, type TableHeader } from '@/types/table';
import { ClipboardText } from '@phosphor-icons/react';
import clsx from 'clsx';
import { ReactNode } from 'react';
import Pagination from './Pagination';

interface TableProps<T = Record<string, unknown>> {
    data: T[];
    pagination?: PaginationProp;
    header?: TableHeader;
    footer?: TableFooter;
    column: TableColumn<T>[];
    onClickRow?: (data: T) => void;
    className?: string;
    rowClassName?: (data: T) => string;
    numbering?: boolean;
}

export default function Table<T = Record<string, unknown>>({
    data,
    pagination,
    column,
    header,
    footer,
    className = '',
    onClickRow = undefined,
    numbering = true,
    rowClassName,
}: TableProps<T>) {
    return (
        <div className="flex flex-col gap-4 dark:bg-gray-900">
            <div className="w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-700 overflow-x-auto rounded-lg">
                    <table className={clsx('w-full whitespace-nowrap', className)}>
                        <thead>
                            {header != undefined && (
                                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700">
                                    {numbering ? (
                                        <th
                                            className="bg-gray-50 px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-gray-700 dark:text-gray-300"
                                            rowSpan={2}
                                        >
                                            No.
                                        </th>
                                    ) : null}
                                    {header.map((h, idx) => (
                                        <th
                                            key={idx}
                                            rowSpan={h.rowSpan ?? 1}
                                            colSpan={h.colSpan ?? 1}
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                        >
                                            {h.name}
                                        </th>
                                    ))}
                                </tr>
                            )}
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                {numbering && header == undefined ? (
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                        No.
                                    </th>
                                ) : null}
                                {column
                                    .filter((col) => col.header)
                                    .map((col, headIndex) => (
                                        <th
                                            key={'header-' + headIndex}
                                            className={clsx(
                                                'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300',
                                                typeof col.headerClassName === 'function' ? col.headerClassName(col, headIndex) : col.headerClassName,
                                                col.sticky ? 'sticky left-0 z-10 bg-gray-50 dark:bg-gray-800' : '',
                                            )}
                                        >
                                            {col.header}
                                        </th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                            {data.map((dt, index) => (
                                <tr
                                    key={'row-' + index}
                                    className={clsx(
                                        'group transition-colors hover:bg-gray-50 dark:hover:bg-gray-700',
                                        onClickRow !== undefined ? 'cursor-pointer' : '',
                                        rowClassName ? rowClassName(dt) : '',
                                    )}
                                    onClick={() => (onClickRow ? onClickRow(dt) : null)}
                                >
                                    {numbering ? (
                                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                            {pagination ? pagination.from + index : index + 1}
                                        </td>
                                    ) : null}
                                    {column.map((col, cellIndex) => {
                                        const value = typeof col.value === 'function' ? col.value(dt, index) : dt[col.value as keyof T];
                                        const tdClassName = typeof col.className === 'function' ? col.className(dt, index) : col.className;

                                        // Deteksi background dari rowClassName
                                        let stickyBg = '';
                                        if (col.sticky && rowClassName) {
                                            const rowBg = rowClassName(dt);
                                            if (rowBg?.includes('bg-green-50')) stickyBg = 'bg-green-50 dark:bg-green-900';
                                            else if (rowBg?.includes('bg-yellow-50')) stickyBg = 'bg-yellow-50 dark:bg-yellow-900';
                                            else if (rowBg?.includes('bg-red-50')) stickyBg = 'bg-red-50 dark:bg-red-900';
                                            else stickyBg = 'bg-white dark:bg-gray-800';
                                        }

                                        return (
                                            <td
                                                key={'cell-' + index + '-' + cellIndex}
                                                className={clsx(
                                                    'whitespace-nowrap px-6 py-4 text-sm',
                                                    'text-gray-900 dark:text-gray-100',
                                                    tdClassName,
                                                    col.sticky
                                                        ? `z-10 lg:sticky lg:left-0 ${stickyBg} group-hover:bg-gray-50 dark:group-hover:bg-gray-700`
                                                        : '',
                                                )}
                                            >
                                                {value as ReactNode}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            {data.length == 0 ? (
                                <tr>
                                    <td colSpan={column.length + (numbering ? 1 : 0)}>
                                        <div className="flex flex-col items-center px-6 py-16 text-center">
                                            <ClipboardText className="text-gray-400 dark:text-gray-500" size={48} weight="thin" />
                                            <span className="mt-4 text-sm text-gray-500 dark:text-gray-400">Tidak ada data</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                        {footer != undefined && (
                            <tfoot className="bg-gray-50 dark:bg-gray-700">
                                <tr className="border-t border-gray-200 dark:border-gray-700">
                                    {numbering ? <th className="bg-gray-50 px-6 py-3 dark:bg-gray-700"></th> : null}
                                    {footer.map((f, idx) => (
                                        <th
                                            colSpan={f.colSpan ?? 1}
                                            key={idx}
                                            className={clsx('px-6 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100', f.className)}
                                        >
                                            {f.value}
                                        </th>
                                    ))}
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
            {pagination && (
                <Pagination
                    total={pagination.last_page}
                    page={pagination.current_page}
                    onChange={(page) => {
                        if (pagination.onChange) pagination.onChange(page);
                    }}
                />
            )}
        </div>
    );
}
