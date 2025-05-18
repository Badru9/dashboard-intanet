import { currencyFormat } from '@/lib/utils';
import { ChartOptions } from 'chart.js';

const labels = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const data = {
    labels,
    datasets: [
        {
            label: 'Target Pendapatan',
            data: [
                850000000, // 850 juta
                920000000, // 920 juta
                780000000, // 780 juta
                950000000, // 950 juta
                880000000, // 880 juta
                910000000, // 910 juta
                890000000, // 890 juta
                930000000, // 930 juta
                960000000, // 960 juta
                980000000, // 980 juta
                990000000, // 990 juta
                1000000000, // 1 miliar
            ],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            tension: 0.4,
            cubicInterpolationMode: 'monotone' as const,
            fill: true,
        },
        {
            label: 'Realisasi Pendapatan',
            data: [
                750000000, // 750 juta
                780000000, // 780 juta
                720000000, // 720 juta
                800000000, // 800 juta
                820000000, // 820 juta
                850000000, // 850 juta
                880000000, // 880 juta
                900000000, // 900 juta
                920000000, // 920 juta
                940000000, // 940 juta
                960000000, // 960 juta
                980000000, // 980 juta
            ],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            tension: 0.4,
            cubicInterpolationMode: 'monotone' as const,
            fill: true,
        },
    ],
};

const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: true,
            text: 'Grafik Pendapatan Tahunan',
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: function (value: number | string) {
                    if (typeof value === 'number') {
                        return currencyFormat(value);
                    }
                    return value;
                },
            },
        },
    },
};

export { data, options };
