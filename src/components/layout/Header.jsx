import { Search, Bell, Plus } from 'lucide-react'
import './Header.css'

export default function Header() {
    return (
        <header className="header">
            <div className="header-search">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Buscar documentos, casos o temas..."
                    className="search-input"
                />
                <span className="search-shortcut">⌘K</span>
            </div>

            <div className="header-actions">
                <button className="header-btn notification-btn">
                    <Bell size={20} />
                    <span className="notification-dot"></span>
                </button>

                <button className="header-btn quick-action-btn">
                    <Plus size={18} />
                    <span>Acción Rápida</span>
                </button>
            </div>
        </header>
    )
}
