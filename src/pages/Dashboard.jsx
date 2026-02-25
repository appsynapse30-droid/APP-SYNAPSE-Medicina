import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Clock,
    Flame,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Stethoscope,
    Calendar,
    Lightbulb,
    FileText,
    Layers,
    ChevronRight,
    ChevronLeft,
    BookOpen,
    Play,
    Target,
    Zap,
    ArrowRight,
    RefreshCw
} from 'lucide-react'
import { useCalendar, eventCategories } from '../context/CalendarContext'
import { useStudyStats } from '../context/StudyStatsContext'
import { useClinicalCases, medicalCategories } from '../context/ClinicalCasesContext'
import { useLibrary } from '../context/LibraryContext'
import './Dashboard.css'

export default function Dashboard() {
    const navigate = useNavigate()
    const { getUpcomingEvents } = useCalendar()
    const { getTodayProgress, getStreakInfo, getGreeting, addStudyTime } = useStudyStats()
    const { cases, getStats, getStudyCases } = useClinicalCases()
    const { documents } = useLibrary()

    // Tips de estudio médico
    const studyTips = [
        {
            id: 1,
            title: 'Repetición Espaciada',
            content: '¡La repetición espaciada es clave! Repasa tus casos pendientes hoy para mejorar tu retención un 40%.',
            icon: '🧠',
            link: '/simulations',
            linkText: 'casos pendientes'
        },
        {
            id: 2,
            title: 'Técnica Pomodoro',
            content: 'Estudia en bloques de 25 minutos con descansos de 5 minutos. Después de 4 bloques, toma un descanso de 15-30 minutos.',
            icon: '⏱️',
            link: '/analytics',
            linkText: 'ver progreso'
        },
        {
            id: 3,
            title: 'Enseña para Aprender',
            content: 'Explica los conceptos médicos como si enseñaras a un compañero. Esta técnica mejora la comprensión y memorización.',
            icon: '👨‍🏫',
            link: '/ai',
            linkText: 'practicar con IA'
        },
        {
            id: 4,
            title: 'Mapas Conceptuales',
            content: 'Conecta síntomas, diagnósticos y tratamientos en mapas visuales. El cerebro recuerda mejor las relaciones que datos aislados.',
            icon: '🗺️',
            link: '/library',
            linkText: 'crear notas'
        },
        {
            id: 5,
            title: 'Casos Clínicos Reales',
            content: 'Practica con casos clínicos simulados para desarrollar el razonamiento diagnóstico y mejorar tu toma de decisiones.',
            icon: '🏥',
            link: '/simulations',
            linkText: 'iniciar simulación'
        },
        {
            id: 6,
            title: 'Descanso Activo',
            content: 'El sueño consolida la memoria. Estudia antes de dormir y repasa brevemente al despertar para mejor retención.',
            icon: '😴',
            link: '/analytics',
            linkText: 'ver estadísticas'
        },
        {
            id: 7,
            title: 'Flashcards Activas',
            content: 'Crea tus propias flashcards mientras estudias. El proceso de creación activa la memoria más que solo leer.',
            icon: '📝',
            link: '/flashcards',
            linkText: 'crear flashcards'
        },
        {
            id: 8,
            title: 'Método de Cornell',
            content: 'Divide tus notas en 3 secciones: conceptos clave, notas detalladas y resumen. Facilita el repaso y la comprensión.',
            icon: '📓',
            link: '/library',
            linkText: 'organizar notas'
        }
    ]

    // Estado para el tip actual
    const [currentTipIndex, setCurrentTipIndex] = useState(0)
    const currentTip = studyTips[currentTipIndex]

    // Funciones para navegar entre tips
    const nextTip = () => {
        setCurrentTipIndex((prev) => (prev + 1) % studyTips.length)
    }

    const prevTip = () => {
        setCurrentTipIndex((prev) => (prev - 1 + studyTips.length) % studyTips.length)
    }

    const randomTip = () => {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * studyTips.length)
        } while (newIndex === currentTipIndex && studyTips.length > 1)
        setCurrentTipIndex(newIndex)
    }

    // Datos del calendario
    const upcomingEvents = getUpcomingEvents(4)

    // Datos de estudio
    const todayProgress = getTodayProgress()
    const streakInfo = getStreakInfo()
    const greeting = getGreeting()

    // Datos de casos clínicos
    const casesStats = getStats()
    const studyCases = getStudyCases()

    // Calcular dominio promedio de todos los casos
    const averageMastery = cases.length > 0
        ? Math.round(cases.reduce((sum, c) => sum + (c.studyStats?.masteryLevel || 0), 0) / cases.length)
        : 0

    // Obtener casos con bajo dominio para recomendaciones
    const lowMasteryCases = cases
        .filter(c => c.studyStats?.masteryLevel < 70)
        .sort((a, b) => (a.studyStats?.masteryLevel || 0) - (b.studyStats?.masteryLevel || 0))
        .slice(0, 2)

    // Obtener documentos recientes (últimos 4)
    const recentDocuments = [...documents]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 2)

    // Formatear fecha para mostrar
    const formatEventDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00')
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        if (dateStr === today.toISOString().split('T')[0]) {
            return 'HOY'
        } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
            return 'MAÑANA'
        }

        return date.toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric'
        }).toUpperCase()
    }

    // Obtener color de categoría
    const getCategoryColor = (category) => {
        const colors = {
            examen: 'red',
            estudio: 'blue',
            clase: 'green',
            grupo: 'purple',
            seminario: 'orange',
            otro: 'gray'
        }
        return colors[category] || 'blue'
    }

    // Formatear tiempo relativo
    const formatRelativeTime = (dateStr) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffMins < 60) return `hace ${diffMins} min`
        if (diffHours < 24) return `hace ${diffHours}h`
        if (diffDays === 1) return 'ayer'
        if (diffDays < 7) return `hace ${diffDays} días`
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    }

    // Handlers de navegación
    const handleStartReview = (caseId) => {
        navigate('/simulations', { state: { openCaseId: caseId, mode: 'study' } })
    }

    const handleStartSimulation = (caseId) => {
        navigate('/simulations', { state: { openCaseId: caseId, mode: 'detail' } })
    }

    const handleOpenDocument = (docId) => {
        navigate('/library', { state: { openDocumentId: docId } })
    }

    const handleViewAllDocuments = () => {
        navigate('/library')
    }

    const handleViewAllCases = () => {
        navigate('/simulations')
    }

    // Calcular progreso del anillo circular
    const strokeDashoffset = 125.6 - (125.6 * todayProgress.percentage / 100)

    return (
        <div className="dashboard">
            <div className="dashboard-main">
                <div className="greeting-section">
                    <h1 className="greeting-title">{greeting}, Dr. García</h1>
                    <p className="greeting-subtitle">¿Listo para conectar algunas sinapsis?</p>
                </div>

                {/* Stats Cards con scroll horizontal */}
                <div className="stats-scroll-container">
                    <div className="stats-grid">
                        {/* Meta Diaria */}
                        <div className="stat-card" onClick={() => navigate('/analytics')}>
                            <div className="stat-header">
                                <span className="stat-label">Meta Diaria</span>
                                <div className="progress-ring">
                                    <svg width="48" height="48">
                                        <circle className="progress-ring-bg" cx="24" cy="24" r="20" />
                                        <circle
                                            className="progress-ring-fill"
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            style={{
                                                strokeDasharray: '125.6',
                                                strokeDashoffset: strokeDashoffset
                                            }}
                                        />
                                    </svg>
                                    <span className="progress-percent">{todayProgress.percentage}%</span>
                                </div>
                            </div>
                            <div className="stat-value">
                                <span className="stat-number">{todayProgress.hours} hrs</span>
                                <span className="stat-total">/ {todayProgress.goalHours} hrs</span>
                            </div>
                            <span className={`stat-status ${todayProgress.isComplete ? 'positive' : todayProgress.percentage > 50 ? 'positive' : ''}`}>
                                {todayProgress.isComplete ? '¡Meta completada!' : todayProgress.percentage > 50 ? 'En camino' : 'Sigue adelante'}
                            </span>
                        </div>

                        {/* Racha Actual */}
                        <div className="stat-card streak-card">
                            <div className="stat-header">
                                <span className="stat-label">Racha Actual</span>
                                <Flame className={`stat-icon flame ${streakInfo.current > 0 ? 'active' : ''}`} size={24} />
                            </div>
                            <div className="stat-value">
                                <span className="stat-number">{streakInfo.current} Días</span>
                            </div>
                            <span className="stat-status">{streakInfo.message}</span>
                            {streakInfo.current > 0 && (
                                <div className="streak-badges">
                                    {Array.from({ length: Math.min(7, streakInfo.current) }).map((_, i) => (
                                        <span key={i} className="streak-day active">🔥</span>
                                    ))}
                                    {streakInfo.current < 7 && Array.from({ length: 7 - streakInfo.current }).map((_, i) => (
                                        <span key={i} className="streak-day">○</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Dominio Promedio */}
                        <div className="stat-card" onClick={handleViewAllCases}>
                            <div className="stat-header">
                                <span className="stat-label">Dominio Casos</span>
                                {averageMastery >= 60 ? (
                                    <TrendingUp className="stat-icon trending-up" size={24} />
                                ) : (
                                    <TrendingDown className="stat-icon trending-down" size={24} />
                                )}
                            </div>
                            <div className="stat-value">
                                <span className="stat-number">{averageMastery}%</span>
                            </div>
                            <span className="stat-status">
                                {casesStats.byStatus.dominado} de {casesStats.total} dominados
                            </span>
                        </div>

                        {/* Pendientes de estudio */}
                        <div className="stat-card pending-card" onClick={handleViewAllCases}>
                            <div className="stat-header">
                                <span className="stat-label">Para Repasar</span>
                                <BookOpen className="stat-icon book" size={24} />
                            </div>
                            <div className="stat-value">
                                <span className="stat-number">{casesStats.pendingReview}</span>
                                <span className="stat-total">casos</span>
                            </div>
                            <span className="stat-status">Listos para estudio</span>
                        </div>
                    </div>
                </div>

                {/* Smart Recommendations */}
                <div className="section">
                    <h2 className="section-title">
                        <span className="sparkle">✦</span> Recomendaciones Inteligentes
                    </h2>

                    <div className="recommendations-list">
                        {lowMasteryCases.length > 0 ? (
                            lowMasteryCases.map((caseItem) => (
                                <div key={caseItem.id} className="recommendation-card">
                                    <div
                                        className="recommendation-icon"
                                        style={{
                                            backgroundColor: medicalCategories[caseItem.category]?.bgColor,
                                            color: medicalCategories[caseItem.category]?.color
                                        }}
                                    >
                                        {caseItem.studyStats.masteryLevel < 40 ? (
                                            <AlertTriangle size={20} />
                                        ) : (
                                            <Stethoscope size={20} />
                                        )}
                                    </div>
                                    <div className="recommendation-content">
                                        <h3>{caseItem.title}</h3>
                                        <p>
                                            {medicalCategories[caseItem.category]?.label} •
                                            Dominio: {caseItem.studyStats.masteryLevel}%
                                        </p>
                                    </div>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => handleStartReview(caseItem.id)}
                                    >
                                        <Play size={14} />
                                        Estudiar
                                    </button>
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="recommendation-card">
                                    <div className="recommendation-icon warning">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div className="recommendation-content">
                                        <h3>Repasar Farmacología: Beta-bloqueadores</h3>
                                        <p>Brecha de Conocimiento • Puntuación baja (65%)</p>
                                    </div>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => navigate('/library')}
                                    >
                                        Iniciar Repaso
                                    </button>
                                </div>

                                <div className="recommendation-card">
                                    <div className="recommendation-icon info">
                                        <Stethoscope size={20} />
                                    </div>
                                    <div className="recommendation-content">
                                        <h3>Simulación Clínica: Dolor Torácico Agudo</h3>
                                        <p>Alto Rendimiento • Frecuente en exámenes</p>
                                    </div>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={handleViewAllCases}
                                    >
                                        Iniciar Simulación
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Continue Studying */}
                <div className="section">
                    <div className="section-header">
                        <h2 className="section-title">Continuar Estudiando</h2>
                        <button className="btn btn-ghost" onClick={handleViewAllDocuments}>
                            Ver Todo
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="study-cards">
                        {recentDocuments.length > 0 ? (
                            recentDocuments.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="study-card"
                                    onClick={() => handleOpenDocument(doc.id)}
                                >
                                    <div
                                        className="study-card-image"
                                        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}
                                    >
                                        {doc.image ? (
                                            <img src={doc.image} alt={doc.title} />
                                        ) : (
                                            <div className="study-card-placeholder">
                                                <FileText size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="study-card-content">
                                        <div className="study-card-meta">
                                            {doc.type === 'PDF' ? <FileText size={14} /> : <Layers size={14} />}
                                            <span>{doc.type === 'PDF' ? 'Documento PDF' : doc.type}</span>
                                            <span className="study-time">{formatRelativeTime(doc.date)}</span>
                                        </div>
                                        <h3>{doc.title}</h3>
                                        <div className="study-card-footer">
                                            <span className="study-collection">{doc.collection}</span>
                                            <ArrowRight size={16} className="study-arrow" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="study-card empty-card" onClick={() => navigate('/library')}>
                                    <div className="empty-card-content">
                                        <FileText size={32} />
                                        <p>Agrega documentos a tu biblioteca</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <button className="quick-action-btn" onClick={() => navigate('/simulations')}>
                        <Stethoscope size={20} />
                        <span>Nuevo Caso</span>
                    </button>
                    <button className="quick-action-btn" onClick={() => navigate('/library')}>
                        <FileText size={20} />
                        <span>Subir Documento</span>
                    </button>
                    <button className="quick-action-btn" onClick={() => navigate('/calendar')}>
                        <Calendar size={20} />
                        <span>Agregar Evento</span>
                    </button>
                    <button className="quick-action-btn" onClick={() => navigate('/ai')}>
                        <Zap size={20} />
                        <span>Preguntar IA</span>
                    </button>
                </div>
            </div>

            {/* Right Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="upcoming-section">
                    <div className="section-header">
                        <h2 className="section-title">Próximos</h2>
                        <button
                            className="btn-calendar-link"
                            onClick={() => navigate('/calendar')}
                            title="Ver calendario completo"
                        >
                            <Calendar size={18} />
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="event-list">
                        {upcomingEvents.length === 0 ? (
                            <div className="no-events-dashboard">
                                <p>No hay eventos próximos</p>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => navigate('/calendar')}
                                >
                                    Agregar Evento
                                </button>
                            </div>
                        ) : (
                            upcomingEvents.map(event => (
                                <div
                                    key={event.id}
                                    className="event-item"
                                    onClick={() => navigate('/calendar')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className={`event-dot ${getCategoryColor(event.category)}`}></div>
                                    <div className="event-content">
                                        <span className="event-time">
                                            {formatEventDate(event.date)}, {event.startTime}
                                        </span>
                                        <h4>{event.title}</h4>
                                        {event.location && <p>{event.location}</p>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Study Stats Summary */}
                <div className="stats-summary-card">
                    <div className="stats-summary-header">
                        <Target size={18} />
                        <span>Resumen Semanal</span>
                    </div>
                    <div className="stats-summary-content">
                        <div className="summary-stat">
                            <span className="summary-value">{casesStats.total}</span>
                            <span className="summary-label">Casos</span>
                        </div>
                        <div className="summary-stat">
                            <span className="summary-value">{documents.length}</span>
                            <span className="summary-label">Docs</span>
                        </div>
                        <div className="summary-stat">
                            <span className="summary-value">{streakInfo.longest}</span>
                            <span className="summary-label">Mejor Racha</span>
                        </div>
                    </div>
                </div>

                <div className="tip-card">
                    <div className="tip-header">
                        <div className="tip-title-section">
                            <span className="tip-emoji">{currentTip.icon}</span>
                            <div className="tip-title-content">
                                <span className="tip-label">Consejo de Estudio</span>
                                <h4 className="tip-title">{currentTip.title}</h4>
                            </div>
                        </div>
                        <button
                            className="tip-refresh-btn"
                            onClick={randomTip}
                            title="Nuevo consejo aleatorio"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>
                    <p className="tip-content">
                        {currentTip.content.split(currentTip.linkText)[0]}
                        {currentTip.linkText && (
                            <a
                                href="#"
                                className="tip-link"
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate(currentTip.link)
                                }}
                            >
                                {currentTip.linkText}
                            </a>
                        )}
                        {currentTip.content.split(currentTip.linkText)[1] || ''}
                    </p>
                    <div className="tip-navigation">
                        <button className="tip-nav-btn" onClick={prevTip} title="Consejo anterior">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="tip-counter">{currentTipIndex + 1} / {studyTips.length}</span>
                        <button className="tip-nav-btn" onClick={nextTip} title="Siguiente consejo">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    )
}
