import { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const PriceChart = ({ refreshTrigger }) => {
  const [chartData, setChartData] = useState({
    timestamps: [],
    bidPrices: [],
    askPrices: [],
    predictions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  const backendUrl = import.meta.env.VITE_URL_BACKEND;

  useEffect(() => {
    fetchLOBData();
  }, [refreshTrigger]);

  const fetchLOBData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${backendUrl}/lob/latest4500_1s`);
      const response_prediction = await fetch(`${backendUrl}/predictions/latest-450s`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (!response_prediction.ok) {
        throw new Error(`HTTP error! status: ${response_prediction.status}`);
      }
      
      const data = await response.json();
      const predictionData = await response_prediction.json();
      
      const timestamps = data.timestamps; 
      const bidPrices = [];
      const askPrices = [];
      
      // Build arrays using the provided book data
      data.book.forEach(bookEntry => {
        if (bookEntry && Array.isArray(bookEntry) && bookEntry.length >= 2) {
          bidPrices.push(bookEntry[0]); // Best bid price
          askPrices.push(bookEntry[1]); // Best ask price
        }
      });
      
      // Process prediction data to calculate arrow directions and positions
      const predictionArrows = [];
      if (predictionData && predictionData.predictions && Array.isArray(predictionData.predictions)) {
        predictionData.predictions.forEach(pred => {
          if (pred.weights && Array.isArray(pred.weights) && pred.weights.length >= 3) {
            const [up, down, neutral] = pred.weights;
            
            const direction = (up - down);
            
            // Find the closest timestamp match between prediction and LOB data
            // to find the corresponding bid/ask price for the prediction
            let closestIndex = 0;
            let minTimeDiff = Math.abs(timestamps[0] - pred.timestamp);
          
            for (let i = 0; i < timestamps.length; i++) {
              const timeDiff = Math.abs(timestamps[i] - pred.timestamp);
              if (timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                closestIndex = i;
              }
            }
            
            if (closestIndex >= 0 && closestIndex < bidPrices.length) {
              const PriceAtPrediction = (bidPrices[closestIndex]+askPrices[closestIndex])/2;


              predictionArrows.push({
                timestamp: pred.timestamp,
                y: PriceAtPrediction,
                direction: direction,
                confidence: pred.confidence,
                weights: pred.weights,
              });
            }
          }
        });
      }
      
      if (bidPrices.length > 0 && askPrices.length > 0) {
        setChartData({
          timestamps,
          bidPrices,
          askPrices,
          predictions: predictionArrows
        });
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

  // Prepare prediction data for Chart.js scatter plot with actual timestamps
  const preparePredictionData = () => {
    if (!chartData.predictions || chartData.predictions.length === 0) {
      return [];
    }
    
    return chartData.predictions.map(prediction => ({
      x: prediction.timestamp, // Timestamps are already in milliseconds
      y: prediction.y,
      direction: prediction.direction,
      confidence: prediction.confidence,
      weights: prediction.weights
    }));
  };

  // Prepare bid/ask data with timestamps
  const prepareBidAskData = (prices, timestamps) => {
    return prices.map((price, index) => ({
      x: timestamps[index], // Timestamps are already in milliseconds
      y: price
    }));
  };

  // Prepare data for Chart.js
  const data = {
    datasets: [
      {
        label: 'Best Bid Price',
        data: prepareBidAskData(chartData.bidPrices, chartData.timestamps),
        borderColor: '#22c55e', // Green for bid
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 4,
        type: 'line',
      },
      {
        label: 'Best Ask Price',
        data: prepareBidAskData(chartData.askPrices, chartData.timestamps),
        borderColor: '#ef4444', // Red for ask
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 4,
        type: 'line',
      },
      {
        label: 'Predictions',
        data: preparePredictionData(),
        borderColor: '#8b5cf6', // Purple for predictions
        backgroundColor: function(context) {
          const prediction = context.raw;
          if (!prediction || prediction.direction === undefined) return '#8b5cf6';
          return prediction.direction > 0 ? '#22c55e' : '#ef4444'; // Green for up, red for down
        },
        pointRadius: function(context) {
          const prediction = context.raw;
          if (!prediction || prediction.confidence === undefined) return 6;
          return Math.max(4, Math.min(12, prediction.confidence * 10)); // Size based on confidence
        },
        pointHoverRadius: function(context) {
          const prediction = context.raw;
          if (!prediction || prediction.confidence === undefined) return 8;
          return Math.max(6, Math.min(15, prediction.confidence * 12));
        },
        showLine: false,
        type: 'scatter',
        pointStyle: function(context) {
          const prediction = context.raw;
          if (!prediction || prediction.direction === undefined) return 'circle';
          return prediction.direction > 0 ? 'triangle' : 'rectRot'; // Triangle for up, diamond for down
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'BTC/USDT Order Book - Best Bid/Ask Prices',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'nearest',
        intersect: false,
        callbacks: {
          title: function(tooltipItems) {
            const timestamp = tooltipItems[0].parsed.x;
            const date = new Date(timestamp);
            return date.toLocaleString();
          },
          label: function(context) {
            const datasetLabel = context.dataset.label;
            const value = context.parsed.y;
            
            if (datasetLabel === 'Predictions') {
              const prediction = context.raw;
              const direction = prediction.direction > 0 ? 'UP' : 'DOWN';
              const confidence = (prediction.confidence * 100).toFixed(1);
              const weights = prediction.weights.map(w => (w * 100).toFixed(1));
              return [
                `Prediction: ${direction}`,
                `Price: $${value.toFixed(2)}`,
                `Confidence: ${confidence}%`,
                `Weights [Up, Down, Neutral]: [${weights.join(', ')}]%`
              ];
            }
            
            return `${datasetLabel}: $${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price (USDT)',
        },
        min: Math.min(...chartData.bidPrices, ...chartData.askPrices) - 50,
        max: Math.max(...chartData.bidPrices, ...chartData.askPrices) + 50,
      },
      x: {
        type: 'time',
        time: {
          displayFormats: {
            hour: 'HH:mm',
            minute: 'HH:mm:ss',
            second: 'HH:mm:ss'
          },
          tooltipFormat: 'MMM dd, yyyy HH:mm:ss'
        },
        title: {
          display: true,
          text: 'Time',
        },
        ticks: {
          maxTicksLimit: 10,
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 4
      }
    }
  };

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
          {chartData.predictions && chartData.predictions.length > 0 && (
            <> | Predictions: {chartData.predictions.length}</>
          )}
        </p>

      </div>
      
      <div className="h-96">
        <Line ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
};

export default PriceChart;