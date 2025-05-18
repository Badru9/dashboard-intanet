import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { data, options } from './data';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function InterpolationChart() {
    return (
        <div className="w-full rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
            <Line options={options} data={data} />
        </div>
    );
}
