import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CalendarProvider } from './context/CalendarContext.jsx'
import { StudyStatsProvider } from './context/StudyStatsContext.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <StudyStatsProvider>
                <CalendarProvider>
                    <App />
                </CalendarProvider>
            </StudyStatsProvider>
        </BrowserRouter>
    </React.StrictMode>,
)


