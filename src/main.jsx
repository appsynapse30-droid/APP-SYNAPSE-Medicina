import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { CalendarProvider } from './context/CalendarContext.jsx'
import { ClinicalCasesProvider } from './context/ClinicalCasesContext.jsx'
import { StudyStatsProvider } from './context/StudyStatsContext.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <SettingsProvider>
                <StudyStatsProvider>
                    <CalendarProvider>
                        <ClinicalCasesProvider>
                            <App />
                        </ClinicalCasesProvider>
                    </CalendarProvider>
                </StudyStatsProvider>
            </SettingsProvider>
        </BrowserRouter>
    </React.StrictMode>,
)

