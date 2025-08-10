import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount((count) => count + 1)} className="m-10 px-4 py-2 border-2 border-gray-400 rounded hover:bg-gray-100">
        count is {count}
      </button>
    </div>
  )
}

export default App
