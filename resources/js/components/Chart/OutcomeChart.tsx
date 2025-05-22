import { currencyFormat } from '@/lib/utils';
import { Spinner } from '@heroui/react';
import type { TooltipItem } from 'chart.js';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface OutcomeChartProps {
    selectedMonth: string;
    selectedYear: string;
}

interface OutcomeChartData {
    labels: string[];
    datasets: Array<{
        data: number[];
        backgroundColor: string[];
        borderColor: string;
        borderWidth: number;
    }>;
}

const OutcomeChart: React.FC<OutcomeChartProps> = ({ selectedMonth, selectedYear }) => {
    const [chartData, setChartData] = useState<OutcomeChartData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/outcome-chart-data?month=${selectedMonth}&year=${selectedYear}`);
                const data: OutcomeChartData = await response.json();
                setChartData(data);
            } catch (error) {
                console.error('Error fetching chart data:', error);
                setChartData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedMonth, selectedYear]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    font: {
                        size: 14,
                    },
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context: TooltipItem<'pie'>) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${currencyFormat(value)}`;
                    },
                },
            },
            title: {
                display: true,
                text: 'Distribusi Pengeluaran per Kategori',
                font: {
                    size: 16,
                    weight: 'bold' as const,
                },
                padding: {
                    top: 10,
                    bottom: 20,
                },
            },
        },
    };

    if (loading) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (!chartData) {
        return (
            <div className="h-[400px] w-full rounded-lg bg-white p-4 shadow-sm dark:bg-gray-900">
                <Pie
                    data={{
                        labels: [],
                        datasets: [
                            {
                                data: [],
                                backgroundColor: [],
                                borderColor: '#fff',
                                borderWidth: 2,
                            },
                        ],
                    }}
                    options={options}
                />
            </div>
        );
    }

    return (
        <div className="relative h-[400px] min-h-[250px] w-full rounded-lg bg-white p-4 shadow-sm md:h-[400px] dark:bg-gray-900">
            <Pie data={chartData} options={options} />
        </div>
    );
};

export default OutcomeChart;
