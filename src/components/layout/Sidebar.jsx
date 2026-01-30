import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    BookOpen,
    Brain,
    Stethoscope,
    BarChart3,
    Calendar,
    Settings,
    Zap
} from 'lucide-react'
import './Sidebar.css'

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Panel' },
    { path: '/library', icon: BookOpen, label: 'Biblioteca' },
    { path: '/study', icon: Brain, label: 'Estudio IA' },
    { path: '/simulations', icon: Stethoscope, label: 'Casos Clínicos' },
    { path: '/analytics', icon: BarChart3, label: 'Progreso' },
    { path: '/calendar', icon: Calendar, label: 'Calendario' },
]

export default function Sidebar() {
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
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                        end={item.path === '/'}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <NavLink to="/settings" className="nav-item">
                    <Settings size={20} />
                    <span>Configuración</span>
                </NavLink>

                <div className="user-profile">
                    <div className="user-avatar">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=DrSmith" alt="Dr. García" />
                    </div>
                    <div className="user-info">
                        <span className="user-name">Dr. García</span>
                        <span className="user-role">Residente de Medicina</span>
                    </div>
                </div>
            </div>
        </aside>
    )
}
