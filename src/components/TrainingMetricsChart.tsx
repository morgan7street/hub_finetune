import React from 'react';
import { Line } from 'react-chartjs-2';
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
import { useTheme } from '../contexts/ThemeContext';

// Register ChartJS components
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

const TrainingMetricsChart: React.FC = () => {
  const { theme } = useTheme();
  
  // Mock data for the chart
  const labels = Array.from({ length: 20 }, (_, i) => `Epoch ${i + 1}`);
  
  const trainingLoss = Array.from({ length: 20 }, (_, i) => 
    2 - (1.8 * Math.exp(-0.15 * i)) + Math.random() * 0.05
  );
  
  const validationLoss = Array.from({ length: 20 }, (_, i) => 
    2 - (1.7 * Math.exp(-0.12 * i)) + Math.random() * 0.08
  );
  
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
          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: theme === 'dark' ? '#f8fafc' : '#0f172a',
        bodyColor: theme === 'dark' ? '#f8fafc' : '#0f172a',
        borderColor: theme === 'dark' ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.4)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        bodyFont: {
          family: "'Inter', sans-serif",
        },
        titleFont: {
          family: "'Inter', sans-serif",
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: theme === 'dark' ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.4)',
        },
        ticks: {
          color: theme === 'dark' ? '#94a3b8' : '#64748b',
          font: {
            family: "'Inter', sans-serif",
            size: 10,
          },
        },
      },
      y: {
        grid: {
          color: theme === 'dark' ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.4)',
        },
        ticks: {
          color: theme === 'dark' ? '#94a3b8' : '#64748b',
          font: {
            family: "'Inter', sans-serif",
            size: 10,
          },
        },
      },
    },
  };
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Training Loss',
        data: trainingLoss,
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: 'Validation Loss',
        data: validationLoss,
        borderColor: 'rgb(20, 184, 166)',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };
  
  return <Line options={options} data={data} />;
};

export default TrainingMetricsChart;