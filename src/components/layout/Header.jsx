import { useState } from 'react'
import { Search, Bell, X } from 'lucide-react'
import useMediaQuery from '../../hooks/useMediaQuery'
import './Header.css'

export default function Header() {
    const [searchOpen, setSearchOpen] = useState(false)
    const isMobile = useMediaQuery('(max-width: 768px)')

    return (
        <header className={`header ${isMobile ? 'header-mobile' : ''}`}>
            {isMobile ? (
                /* ---- MOBILE HEADER ---- */
                <>
                    <div className="header-mobile-logo">
                        <span className="header-mobile-brand">Synapse</span>
                    </div>

                    {searchOpen ? (
                        <div className="header-mobile-search-open">
                            <Search size={16} className="header-mobile-search-icon" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="header-mobile-search-input"
                                autoFocus
                            />
                            <button className="header-mobile-search-close" onClick={() => setSearchOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="header-mobile-actions">
                            <button className="header-btn header-mobile-icon-btn" onClick={() => setSearchOpen(true)}>
                                <Search size={20} />
                            </button>
                            <button className="header-btn header-mobile-icon-btn notification-btn">
                                <Bell size={20} />
                                <span className="notification-dot"></span>
                            </button>
                        </div>
                    )}
                </>
            ) : (
                /* ---- DESKTOP HEADER ---- */
                <>
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
                    </div>
                </>
            )}
        </header>
    )
}
