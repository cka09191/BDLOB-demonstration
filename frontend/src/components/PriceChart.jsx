import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PriceChart = () => {
  // Fixed sample data for BTC/USDT
  const times = [
    '09:00', '09:05', '09:10', '09:15', '09:20', '09:25', '09:30', 
    '09:35', '09:40', '09:45', '09:50', '09:55', '10:00'
  ];
  
  const prices = [
    43250, 43280, 43190, 43350, 43420, 43380, 43450,
    43500, 43480, 43520, 43580, 43550, 43600
  ];

  const data = {
    labels: times,
    datasets: [
      {
        label: 'BTC/USDT Price',
        data: prices,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'BTC/USDT Price Chart',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price (USDT)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
    },
  };

  return (
    <div className="w-full h-96 p-4">
      <Line data={data} options={options} />
    </div>
  );
};

export default PriceChart;