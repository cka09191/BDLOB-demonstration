
import {LineChart} from '@mui/x-charts/LineChart';

const PriceChart = () => {
  // Fixed sample data for BTC/USDT
  const times = [
    0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7,
    0.8, 0.9, 1.0, 1.1, 1.2, 1.3
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

  return (
    <div className="w-full h-96 p-4">
      <LineChart
        xAxis={[{ data: times }]}
        series={[
          {
            data: prices,
            name: 'BTC/USDT Price',
            color: 'rgb(59, 130, 246)',
            fill: true,
            tension: 0.1,
          },
        ]}
        height={400}
      />
    </div>
  );
};

export default PriceChart;