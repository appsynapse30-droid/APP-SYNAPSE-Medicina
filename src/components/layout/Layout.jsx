import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import BottomNav from './BottomNav'
import useMediaQuery from '../../hooks/useMediaQuery'

export default function Layout() {
    const isMobile = useMediaQuery('(max-width: 768px)')

    return (
        <div className={`app-layout ${isMobile ? 'is-mobile' : ''}`}>
            {!isMobile && <Sidebar />}
            <main className="main-content">
                <Header />
                <div className="page-content">
                    <Outlet />
                </div>
            </main>
            {isMobile && <BottomNav />}
        </div>
    )
}
