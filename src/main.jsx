import React from 'react'
import ReactDOM from 'react-dom/client'
import MiltonDashboard from './MiltonDashboard'

console.log("[v0] main.jsx loaded, attempting to render MiltonDashboard");

const rootElement = document.getElementById('root');
console.log("[v0] root element found:", !!rootElement);

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <MiltonDashboard />
  </React.StrictMode>
)
