import { useState, useEffect } from 'react';

const EvaluationStats = ({ refreshTrigger }) => {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(24); // Hours

  const backendUrl = import.meta.env.VITE_URL_BACKEND;

  useEffect(() => {
    fetchEvaluationData();
  }, [refreshTrigger, timeRange]);

  const fetchEvaluationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch statistics
      const statsResponse = await fetch(`${backendUrl}/evaluations/stats?hours=${timeRange}`);
      if (!statsResponse.ok) {
        throw new Error(`HTTP error! status: ${statsResponse.status}`);
      }
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch trend data
      const trendResponse = await fetch(`${backendUrl}/evaluations/trend?hours=${timeRange}`);
      if (!trendResponse.ok) {
        throw new Error(`HTTP error! status: ${trendResponse.status}`);
      }
      const trendData = await trendResponse.json();
      setTrend(trendData);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching evaluation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 70) return 'text-green-600';
    if (accuracy >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyBgColor = (accuracy) => {
    if (accuracy >= 70) return 'bg-green-100';
    if (accuracy >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Prediction Evaluation</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Prediction Evaluation</h2>
        <div className="text-red-600 text-center">
          <p>Error loading evaluation data: {error}</p>
          <button 
            onClick={fetchEvaluationData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats || stats.totalPredictions === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Prediction Evaluation</h2>
        <div className="text-center text-gray-500">
          <p>No evaluation data available for the selected time range.</p>
          <p className="text-sm mt-2">Evaluations will appear after predictions have been running for a while.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Prediction Evaluation</h2>
        <div className="flex items-center space-x-2">
          <label htmlFor="timeRange" className="text-sm font-medium">Time Range:</label>
          <select 
            id="timeRange"
            value={timeRange} 
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value={1}>1 Hour</option>
            <option value={6}>6 Hours</option>
            <option value={24}>24 Hours</option>
            <option value={168}>1 Week</option>
          </select>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${getAccuracyBgColor(stats.accuracy)}`}>
          <h3 className="text-lg font-semibold mb-2">Overall Accuracy</h3>
          <p className={`text-3xl font-bold ${getAccuracyColor(stats.accuracy)}`}>
            {stats.accuracy.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">
            {stats.correctPredictions} / {stats.totalPredictions} predictions
          </p>
        </div>

        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Avg Confidence</h3>
          <p className="text-3xl font-bold text-blue-600">
            {(stats.avgConfidence * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">
            Confidence level
          </p>
        </div>

        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Avg Price Change</h3>
          <p className="text-3xl font-bold text-purple-600">
            {stats.avgPriceChangePercent.toFixed(3)}%
          </p>
          <p className="text-sm text-gray-600">
            Per prediction interval
          </p>
        </div>
      </div>

      {/* Direction-specific Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-green-700">Up Predictions</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Accuracy:</span>
              <span className={`font-bold ${getAccuracyColor(stats.upPredictions.accuracy)}`}>
                {stats.upPredictions.accuracy.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">{stats.upPredictions.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Correct:</span>
              <span className="font-medium">{stats.upPredictions.correct}</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-red-700">Down Predictions</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Accuracy:</span>
              <span className={`font-bold ${getAccuracyColor(stats.downPredictions.accuracy)}`}>
                {stats.downPredictions.accuracy.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">{stats.downPredictions.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Correct:</span>
              <span className="font-medium">{stats.downPredictions.correct}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Trend */}
      {trend && trend.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">Hourly Accuracy Trend</h3>
          <div className="overflow-x-auto">
            <div className="flex space-x-2 min-w-full">
              {trend.map((item, index) => (
                <div key={index} className="flex-shrink-0 bg-gray-50 p-3 rounded text-center min-w-[120px]">
                  <div className="text-xs text-gray-600 mb-1">
                    {new Date(item.hour).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit' 
                    })}
                  </div>
                  <div className={`text-sm font-bold ${getAccuracyColor(item.accuracy)}`}>
                    {item.accuracy.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.correct}/{item.total}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationStats;
