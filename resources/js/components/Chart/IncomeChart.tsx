import { currencyFormat } from '@/lib/utils';
import { ChartData, ChartResponse, TooltipContext } from '@/types/chart';
import { Spinner } from '@heroui/react';
import { CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface IncomeChartProps {
    selectedMonth: string;
    selectedYear: string;
}

const IncomeChart: React.FC<IncomeChartProps> = ({ selectedMonth, selectedYear }) => {
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/chart-data?month=${selectedMonth}&year=${selectedYear}`);
                const data: ChartResponse = await response.json();

                const modifiedData: ChartData = {
                    ...data,
                    datasets: data.datasets.map((dataset) => ({
                        ...dataset,
                        label: dataset.label,
                        cubicInterpolationMode: 'monotone',
                        fill: false,
                    })),
                };

                setChartData(modifiedData);
            } catch (error) {
                console.error('Error fetching chart data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedMonth, selectedYear]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                        weight: 'normal' as const,
                    },
                },
            },
            title: {
                display: true,
                text: 'Grafik Pendapatan Tahunan',
                font: {
                    size: 16,
                    weight: 'bold' as const,
                    color: '#000',
                },
                padding: {
                    top: 10,
                    bottom: 20,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#000',
                bodyColor: '#000',
                borderColor: '#ddd',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    label: function (context: TooltipContext) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += currencyFormat(context.parsed.y);
                        }
                        return label;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                    callback: function (value: number | string) {
                        if (typeof value === 'number') {
                            return currencyFormat(value);
                        }
                        return value;
                    },
                },
            },
        },
        elements: {
            line: {
                tension: 0.4,
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
                <Line
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
            <Line data={chartData} options={options} />
        </div>
    );
};

export default IncomeChart;
