import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Critical Runtime Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'white', background: '#0d1117', height: '100vh', fontFamily: 'system-ui' }}>
                    <h2>Algo salió mal (Error Crítico)</h2>
                    <p style={{ color: '#ff7b72', marginBottom: '20px' }}>{this.state.error?.toString()}</p>
                    <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', background: '#238636', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Recargar Página</button>
                </div>
            );
        }

        return this.props.children;
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ErrorBoundary>,
)


