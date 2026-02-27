import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    BarChart3,
    MoreHorizontal,
    Stethoscope,
    Calendar,
    Settings,
    Brain,
    LogOut,
    X
} from 'lucide-react'
import './BottomNav.css'

const mainNavItems = [
    { path: '/', icon: LayoutDashboard, label: 'Panel' },
    { path: '/library', icon: BookOpen, label: 'Biblioteca' },
    { path: '/study/session', icon: GraduationCap, label: 'Estudiar' },
    { path: '/analytics', icon: BarChart3, label: 'Progreso' },
]

const moreNavItems = [
    { path: '/study', icon: Brain, label: 'Estudio IA' },
    { path: '/simulations', icon: Stethoscope, label: 'Casos Clínicos' },
    { path: '/calendar', icon: Calendar, label: 'Calendario' },
    { path: '/settings', icon: Settings, label: 'Configuración' },
]

export default function BottomNav() {
    const [showMore, setShowMore] = useState(false)
    const { signOut } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        setShowMore(false)
        await signOut()
        navigate('/login')
    }

    return (
        <>
            {/* Overlay for "More" menu */}
            {showMore && (
                <div className="bottom-nav-overlay" onClick={() => setShowMore(false)} />
            )}

            {/* "More" expanded menu */}
            {showMore && (
                <div className="bottom-nav-more-menu">
                    <div className="more-menu-header">
                        <span>Más opciones</span>
                        <button className="more-menu-close" onClick={() => setShowMore(false)}>
                            <X size={20} />
                        </button>
                    </div>
                    <nav className="more-menu-items">
                        {moreNavItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `more-menu-item ${isActive ? 'active' : ''}`
                                }
                                onClick={() => setShowMore(false)}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                        <button className="more-menu-item logout" onClick={handleLogout}>
                            <LogOut size={20} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </nav>
                </div>
            )}

            {/* Bottom Navigation Bar */}
            <nav className="bottom-nav">
                {mainNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `bottom-nav-item ${isActive ? 'active' : ''}`
                        }
                        end={item.path === '/'}
                    >
                        <item.icon size={22} />
                        <span className="bottom-nav-label">{item.label}</span>
                    </NavLink>
                ))}
                <button
                    className={`bottom-nav-item ${showMore ? 'active' : ''}`}
                    onClick={() => setShowMore(!showMore)}
                >
                    <MoreHorizontal size={22} />
                    <span className="bottom-nav-label">Más</span>
                </button>
            </nav>
        </>
    )
}
