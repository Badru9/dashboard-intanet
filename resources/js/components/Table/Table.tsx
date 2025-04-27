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
        <div className="flex flex-col gap-4">
            <div className="w-full rounded-lg border border-gray-200 bg-white">
                <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 overflow-x-auto rounded-lg bg-white py-1">
                    <table className={clsx('w-full whitespace-nowrap', className)}>
                        <thead>
                            {header != undefined && (
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    {numbering ? (
                                        <th
                                            className="bg-gray-50 px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
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
                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                        >
                                            {h.name}
                                        </th>
                                    ))}
                                </tr>
                            )}
                            <tr className="border-b border-gray-200">
                                {numbering && header == undefined ? (
                                    <th className="px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">No.</th>
                                ) : null}
                                {column
                                    .filter((col) => col.header)
                                    .map((col, headIndex) => (
                                        <th
                                            key={'header-' + headIndex}
                                            className={clsx(
                                                'px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase',
                                                typeof col.headerClassName === 'function' ? col.headerClassName(col, headIndex) : col.headerClassName,
                                            )}
                                        >
                                            {col.header}
                                        </th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {data.map((dt, index) => (
                                <tr
                                    key={'row-' + index}
                                    className={clsx(
                                        'transition-colors hover:bg-gray-50',
                                        onClickRow !== undefined ? 'cursor-pointer' : '',
                                        rowClassName ? rowClassName(dt) : '',
                                    )}
                                    onClick={() => (onClickRow ? onClickRow(dt) : null)}
                                >
                                    {numbering ? (
                                        <td className="bg-white px-6 py-4 text-center text-sm whitespace-nowrap text-gray-500">
                                            {pagination ? pagination.from + index : index + 1}
                                        </td>
                                    ) : null}
                                    {column.map((col, cellIndex) => {
                                        const value = typeof col.value === 'function' ? col.value(dt, index) : dt[col.value as keyof T];
                                        const tdClassName = typeof col.className === 'function' ? col.className(dt, index) : col.className;
                                        return (
                                            <td
                                                key={'cell-' + index + '-' + cellIndex}
                                                className={clsx('px-6 py-4 text-sm whitespace-nowrap text-gray-900', tdClassName)}
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
                                            <ClipboardText className="text-gray-400" size={48} weight="thin" />
                                            <span className="mt-4 text-sm text-gray-500">Tidak ada data</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                        {footer != undefined && (
                            <tfoot className="bg-gray-50">
                                <tr className="border-t border-gray-200">
                                    {numbering ? <th className="bg-gray-50 px-6 py-3"></th> : null}
                                    {footer.map((f, idx) => (
                                        <th
                                            colSpan={f.colSpan ?? 1}
                                            key={idx}
                                            className={clsx('px-6 py-3 text-left text-sm font-medium text-gray-900', f.className)}
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
            {pagination && <Pagination pagination={pagination} />}
        </div>
    );
}
