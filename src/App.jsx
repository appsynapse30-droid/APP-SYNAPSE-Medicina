import { Routes, Route } from 'react-router-dom'

// Providers
import { SupabaseProvider } from './context/SupabaseContext'
import { AuthProvider } from './context/AuthContext'
import { FSRSProvider } from './context/FSRSContext'
import { LibraryProvider } from './context/LibraryContext'

// Components
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Public Pages
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

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
                    <LibraryProvider>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />

                            {/* Protected Routes */}
                            <Route path="/" element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }>
                                <Route index element={<Dashboard />} />
                                <Route path="dashboard" element={<Dashboard />} />
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
                    </LibraryProvider>
                </FSRSProvider>
            </AuthProvider>
        </SupabaseProvider>
    )
}

export default App
