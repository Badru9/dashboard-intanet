import { MONTH_LABELS } from '@/constants';
import { Input, Select, SelectItem } from '@heroui/react';
import { useState } from 'react';

export default function MonthAndYearFilter({
    selectedMonth,
    selectedYear,
    onChange,
}: {
    selectedMonth: string;
    selectedYear: string;
    onChange: (month: string, year: string) => void;
}) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const [year, setYear] = useState<string>(selectedYear || currentYear.toString());
    const [month, setMonth] = useState<string>(selectedMonth || (now.getMonth() + 1).toString().padStart(2, '0'));

    const handleMonthChange = (value: string) => {
        setMonth(value);
        onChange(value, year);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        if (parseInt(val) > currentYear) val = currentYear.toString();
        setYear(val);
        onChange(month, val);
    };

    return (
        <div className="mb-4 flex w-full justify-end gap-2 md:w-1/2 lg:w-1/4">
            <Select
                label="Filter Bulan"
                placeholder="Pilih Bulan"
                color="default"
                variant="bordered"
                radius="md"
                selectedKeys={[month]}
                onChange={(e) => handleMonthChange(e.target.value)}
            >
                {MONTH_LABELS.map((m) => (
                    <SelectItem key={m.value} textValue={m.label}>
                        {m.label}
                    </SelectItem>
                ))}
            </Select>
            <Input
                type="number"
                label="Tahun"
                color="default"
                radius="md"
                variant="bordered"
                min={2000}
                max={currentYear}
                value={year}
                onChange={handleYearChange}
            />
        </div>
    );
}
