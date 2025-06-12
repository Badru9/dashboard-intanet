import { Spinner } from '@heroui/react';
import type { TooltipItem } from 'chart.js';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CustomersDistributionProps {
    selectedMonth: string;
    selectedYear: string;
}

interface CustomersDistributionData {
    labels: string[];
    datasets: Array<{
        data: number[];
        backgroundColor: string[];
        borderColor: string;
        borderWidth: number;
    }>;
}

const CustomersDistributionChart: React.FC<CustomersDistributionProps> = ({ selectedMonth, selectedYear }) => {
    const [chartData, setChartData] = useState<CustomersDistributionData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/customers-distribution-data?month=${selectedMonth}&year=${selectedYear}`);
                const data: CustomersDistributionData = await response.json();

                console.log('check data', data);

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
        cutout: '70%', // Ukuran lubang tengah pada Doughnut chart
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    font: {
                        size: 14,
                    },
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context: TooltipItem<'doughnut'>) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${value}%`;
                    },
                },
            },
            title: {
                display: true,
                text: 'Distribusi Pengguna per Paket Internet',
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
                <Doughnut
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
            <Doughnut data={chartData} options={options} />
        </div>
    );
};

export default CustomersDistributionChart;
