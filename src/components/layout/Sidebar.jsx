import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    LayoutDashboard,
    BookOpen,
    Brain,
    Stethoscope,
    BarChart3,
    Calendar,
    Settings,
    Zap,
    GraduationCap,
    LogOut
} from 'lucide-react'
import './Sidebar.css'

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Panel' },
    { path: '/library', icon: BookOpen, label: 'Biblioteca' },
    { path: '/study/session', icon: GraduationCap, label: 'Estudiar', highlight: true },
    { path: '/study', icon: Brain, label: 'Estudio IA' },
    { path: '/simulations', icon: Stethoscope, label: 'Casos Clínicos' },
    { path: '/analytics', icon: BarChart3, label: 'Progreso' },
    { path: '/calendar', icon: Calendar, label: 'Calendario' },
]

export default function Sidebar() {
    const { user, signOut, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    // Get display name from user metadata or email
    const displayName = user?.user_metadata?.display_name
        || user?.email?.split('@')[0]
        || 'Usuario'

    const university = user?.user_metadata?.university || 'Estudiante de Medicina'

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <Zap size={24} />
                    </div>
                    <div className="logo-text">
                        <span className="logo-title">Synapse</span>
                        <span className="logo-subtitle">Plataforma de Estudio</span>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`
                        }
                        end={item.path === '/'}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                        {item.highlight && <span className="study-badge">FSRS</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <NavLink to="/settings" className="nav-item">
                    <Settings size={20} />
                    <span>Configuración</span>
                </NavLink>

                {isAuthenticated ? (
                    <>
                        <div className="user-profile">
                            <div className="user-avatar">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`}
                                    alt={displayName}
                                />
                            </div>
                            <div className="user-info">
                                <span className="user-name">{displayName}</span>
                                <span className="user-role">{university}</span>
                            </div>
                        </div>

                        <button className="logout-button" onClick={handleLogout}>
                            <LogOut size={18} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </>
                ) : (
                    <NavLink to="/login" className="nav-item login-item">
                        <LogOut size={20} />
                        <span>Iniciar Sesión</span>
                    </NavLink>
                )}
            </div>
        </aside>
    )
}
