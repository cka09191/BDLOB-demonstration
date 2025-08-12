import { useState } from 'react'
import './App.css'
import PriceChart from './components/PriceChart'

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className='text-3xl font-bold text-center mb-8'>BDLOB Demonstration</h1>
      
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-10 min-h-[700px]">
        <PriceChart refreshTrigger={refreshTrigger} />
        
      </div>
      <div className="mt-8 text-center">
        <button 
          onClick={handleRefresh} 
          className="btn btn-primary"
        >
          Refresh Data: {refreshTrigger}
        </button>
      </div>
    </div>
  )
}

export default App
