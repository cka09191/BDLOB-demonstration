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
      
      <div className="max-w-6xl mx-auto">
        <PriceChart refreshTrigger={refreshTrigger} />
        
        <div className="mt-8 text-center">
          <button 
            onClick={handleRefresh} 
            className="btn btn-primary"
          >
            Refresh Data: {refreshTrigger}
          </button>
        </div>
        
        <div>
          <input type="radio" name="radio-2" className="radio radio-xs radio-secondary" defaultChecked />
          <span className="ml-2">Option 1</span>
          <input type="radio" name="radio-2" className="radio radio-xs radio-secondary" />
          <span className="ml-2">Option 2</span>
        </div>
      </div>
    </div>
  )
}

export default App
