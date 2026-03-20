import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MiltonDashboard from './MiltonDashboard'
import DirectorDashboard from './DirectorDashboard'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MiltonDashboard />} />
        <Route path="/director" element={<DirectorDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
