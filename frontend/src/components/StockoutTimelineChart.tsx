import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TimelineItem {
  day: number;
  date: string;
  projected_stock: number;
  critical_threshold: number;
}

interface StockoutTimelineChartProps {
  timeline: TimelineItem[];
  medicineName: string;
}

export const StockoutTimelineChart: React.FC<StockoutTimelineChartProps> = ({ timeline, medicineName }) => {
  if (!timeline || timeline.length === 0) return null;

  const labels = timeline.map((t) => `Day ${t.day}`);
  const stockData = timeline.map((t) => t.projected_stock);
  const thresholdData = timeline.map((t) => t.critical_threshold);

  const data = {
    labels,
    datasets: [
      {
        label: `Projected ${medicineName} Balance`,
        data: stockData,
        borderColor: '#f87171',
        backgroundColor: 'rgba(248, 113, 113, 0.15)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Minimum Safety Buffer Threshold',
        data: thresholdData,
        borderColor: '#fbbf24',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#94a3b8', font: { size: 11 } },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
    },
  };

  return (
    <div style={{ height: 260, width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
};
