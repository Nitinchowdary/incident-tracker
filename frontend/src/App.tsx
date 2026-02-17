import { BrowserRouter, Routes, Route } from 'react-router-dom'
import IncidentList from './pages/IncidentList'
import IncidentDetail from './pages/IncidentDetail'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<IncidentList />} />
            <Route path="/incidents/:id" element={<IncidentDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
