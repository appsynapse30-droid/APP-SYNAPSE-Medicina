import { Routes, Route } from 'react-router-dom'

// Providers
import { SupabaseProvider } from './context/SupabaseContext'
import { AuthProvider } from './context/AuthContext'
import { FSRSProvider } from './context/FSRSContext'

// Components
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Public Pages
import Login from './pages/Login'
import Register from './pages/Register'

// Protected Pages
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import StudyAI from './pages/StudyAI'
import StudySession from './pages/StudySession'
import ClinicalCases from './pages/ClinicalCases'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import DocumentReader from './pages/DocumentReader'
import Calendar from './pages/Calendar'

function App() {
    return (
        <SupabaseProvider>
            <AuthProvider>
                <FSRSProvider>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected Routes */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Dashboard />} />
                            <Route path="library" element={<Library />} />
                            <Route path="library/document/:id" element={<DocumentReader />} />
                            <Route path="study" element={<StudyAI />} />
                            <Route path="study/session" element={<StudySession />} />
                            <Route path="simulations" element={<ClinicalCases />} />
                            <Route path="analytics" element={<Analytics />} />
                            <Route path="calendar" element={<Calendar />} />
                            <Route path="settings" element={<Settings />} />
                        </Route>
                    </Routes>
                </FSRSProvider>
            </AuthProvider>
        </SupabaseProvider>
    )
}

export default App
