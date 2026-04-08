import React from 'react'
import ReactDOM from 'react-dom/client'
import MiltonDashboard from './MiltonDashboard'

console.log("[v0] main.jsx loaded, attempting to render MiltonDashboard");

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[v0] ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'system-ui' }}>
          <h1 style={{ color: '#e8453c' }}>Something went wrong</h1>
          <pre style={{ background: '#f5f5f5', padding: 20, overflow: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
console.log("[v0] root element found:", !!rootElement);

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <MiltonDashboard />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log("[v0] ReactDOM.createRoot().render() called successfully");
} catch (err) {
  console.error("[v0] Error during render:", err);
  document.body.innerHTML = `<div style="padding:40px;font-family:system-ui"><h1 style="color:#e8453c">Render Error</h1><pre>${err}</pre></div>`;
}
