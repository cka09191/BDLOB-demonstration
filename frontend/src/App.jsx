import { useState } from 'react'
import './App.css'
import PriceChart from './components/PriceChart'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">BDLOB Demonstration</h1>
      
      <div className="max-w-6xl mx-auto">
        <PriceChart />
        
        <div className="mt-8 text-center">
          <button 
            onClick={() => setCount((count) => count + 1)} 
            className="px-6 py-3 bg-blue-500 text-white rounded-lg border hover:bg-blue-600 transition-colors"
          >
            Refresh Data: {count}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
