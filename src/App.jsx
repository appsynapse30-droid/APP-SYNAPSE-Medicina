import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import StudyAI from './pages/StudyAI'
import ClinicalCases from './pages/ClinicalCases'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import DocumentReader from './pages/DocumentReader'
import Calendar from './pages/Calendar'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="library" element={<Library />} />
                <Route path="library/document/:id" element={<DocumentReader />} />
                <Route path="study" element={<StudyAI />} />
                <Route path="simulations" element={<ClinicalCases />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="settings" element={<Settings />} />
            </Route>
        </Routes>
    )
}

export default App

