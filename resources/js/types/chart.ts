export interface ChartDataset {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
    cubicInterpolationMode: 'monotone' | 'default';
    fill: boolean;
    borderWidth?: number;
    pointRadius?: number;
    pointHoverRadius?: number;
    pointBackgroundColor?: string;
    pointBorderColor?: string;
    pointBorderWidth?: number;
    pointHoverBackgroundColor?: string;
    pointHoverBorderColor?: string;
    pointHoverBorderWidth?: number;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

export interface ChartResponse {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
        tension: number;
        cubicInterpolationMode: 'monotone';
        fill: boolean;
    }[];
}

export interface TooltipContext {
    dataset: {
        label?: string;
    };
    parsed: {
        y: number | null;
    };
}
