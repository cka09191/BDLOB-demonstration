
import { useState, useEffect } from 'react';
import {LineChart} from '@mui/x-charts/LineChart';


const PriceChart = ({ refreshTrigger }) => {
  const [chartData, setChartData] = useState({
    timestamps: [],
    bidPrices: [],
    askPrices: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendUrl = import.meta.env.VITE_URL_BACKEND;

  useEffect(() => {
    fetchLOBData();
  }, [refreshTrigger]); // Add refreshTrigger as dependency

  const fetchLOBData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${backendUrl}/lob/latest4500_1s`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.book && Array.isArray(data.book)) {
        const timestamps = data.book.map((_, index) => index);
        
        const bidPrices = [];
        const askPrices = [];
        
        data.book.forEach(bookEntry => {
          if (bookEntry && Array.isArray(bookEntry) && bookEntry.length >= 2) {
            bidPrices.push(bookEntry[0]);
            askPrices.push(bookEntry[1]);
          }
        });
        console.log('Fetched LOB data:', timestamps, bidPrices, askPrices);
        if (bidPrices.length > 0 && askPrices.length > 0) {
          setChartData({
            timestamps,
            bidPrices,
            askPrices
          });
        } else {
          throw new Error('No valid price data found in LOB entries');
        }
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching LOB data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 p-4 flex items-center justify-center">
        <div className="text-lg">Loading LOB data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 p-4">
        <div className="text-red-500 text-center">
          <p>Error loading data: {error}</p>
          <button 
            onClick={fetchLOBData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-center">BTC/USDT Order Book - Best Bid/Ask Prices</h3>
        <p className="text-sm text-gray-600 text-center">
          Data points: {chartData.bidPrices.length} | 
          Latest Bid: ${chartData.bidPrices[chartData.bidPrices.length - 1]?.toFixed(2)} | 
          Latest Ask: ${chartData.askPrices[chartData.askPrices.length - 1]?.toFixed(2)}
          {chartData.bidPrices.length > 0 && (
            <> | Spread: ${(chartData.askPrices[chartData.askPrices.length - 1] - chartData.bidPrices[chartData.bidPrices.length - 1])?.toFixed(2)}</>
          )}
        </p>
        <button 
          onClick={fetchLOBData}
          className="mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 block mx-auto"
        >
          Refresh Data
        </button>
      </div>
      
      <LineChart
        xAxis={[{ 
          data: chartData.timestamps,
          label: 'Time Sequence'
        }]}
        series={[
          {
            data: chartData.bidPrices,
            name: 'Best Bid Price',
            color: '#22c55e', // Green for bid
            curve: 'linear',
          },
          {
            data: chartData.askPrices,
            name: 'Best Ask Price',
            color: '#ef4444', // Red for ask
            curve: 'linear',
          },
        ]}
        height={700}
        margin={{ left: 80, right: 80, top: 40, bottom: 60 }}
      />
    </div>
  );
};

export default PriceChart;