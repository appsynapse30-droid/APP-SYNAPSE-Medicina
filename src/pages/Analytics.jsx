import { useNavigate } from 'react-router-dom'
import {
    TrendingUp,
    Clock,
    Brain,
    Play,
    AlertCircle,
    AlertTriangle,
    Flame,
    BookOpen,
    Target,
    Calendar
} from 'lucide-react'
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar
} from 'recharts'
import { useStudyStats } from '../context/StudyStatsContext'
import { useClinicalCases, medicalCategories } from '../context/ClinicalCasesContext'
import { useLibrary } from '../context/LibraryContext'
import { useSettings } from '../context/SettingsContext'
import './Analytics.css'

export default function Analytics() {
    const navigate = useNavigate()

    // Get data from contexts
    const {
        stats,
        getTodayProgress,
        getStreakInfo,
        getGeneralStats,
        getWeeklyData,
        getLast30Days
    } = useStudyStats()

    const {
        cases,
        getStats: getCasesStats,
        getKnowledgeByCategory,
        getCasesNeedingReview,
        getEstimatedScore
    } = useClinicalCases()

    const { documents, collections } = useLibrary()
    const { settings } = useSettings()

    // Get computed data
    const todayProgress = getTodayProgress()
    const streakInfo = getStreakInfo()
    const generalStats = getGeneralStats()
    const weeklyData = getWeeklyData()
    const knowledgeData = getKnowledgeByCategory()
    const casesStats = getCasesStats()
    const diagnosticItems = getCasesNeedingReview(4)
    const estimatedScore = getEstimatedScore()

    // Calculate week comparison
    const lastWeekTotal = weeklyData.slice(0, 2).reduce((sum, w) => sum + w.hours, 0)
    const thisWeekTotal = weeklyData.slice(2, 4).reduce((sum, w) => sum + w.hours, 0)
    const weekChange = thisWeekTotal - lastWeekTotal

    // Handlers
    const handleStartReview = () => {
        navigate('/simulations')
    }

    const handleReviewCase = (caseId) => {
        navigate('/simulations')
    }

    // Default knowledge data if no cases
    const displayKnowledgeData = knowledgeData.length > 0 ? knowledgeData : [
        { subject: 'Sin datos', value: 0 }
    ]

    return (
        <div className="analytics">
            <div className="analytics-header">
                <div>
                    <h1>Progreso y Análisis</h1>
                    <p>
                        Bienvenido de nuevo, {settings.profile?.displayName || 'Dr. García'}.
                        Tu preparación está al <span className="highlight">{estimatedScore.percentage}%</span>.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={handleStartReview}>
                    <Play size={16} />
                    Iniciar Sesión de Repaso
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-row">
                <div className="stat-card blue">
                    <div className="stat-icon">
                        <TrendingUp size={20} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Puntuación Estimada</span>
                        <div className="stat-value">
                            <span className="stat-number">{estimatedScore.score}</span>
                            <span className="stat-total">/ {estimatedScore.max}</span>
                        </div>
                        <span className={`stat-trend ${weekChange >= 0 ? 'positive' : 'negative'}`}>
                            {weekChange >= 0 ? '↗' : '↘'} {weekChange >= 0 ? '+' : ''}{weekChange.toFixed(1)}h esta semana
                        </span>
                    </div>
                </div>

                <div className="stat-card cyan">
                    <div className="stat-icon">
                        <Clock size={20} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Horas de Estudio Totales</span>
                        <div className="stat-value">
                            <span className="stat-number">{generalStats.totalHours}h</span>
                            <span className="stat-total">Total</span>
                        </div>
                        <span className="stat-trend positive">
                            <Flame size={14} /> Racha: {streakInfo.current} días
                        </span>
                    </div>
                </div>

                <div className="stat-card green">
                    <div className="stat-icon">
                        <Brain size={20} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Casos Dominados</span>
                        <div className="stat-value">
                            <span className="stat-number">{casesStats.byStatus.dominado}</span>
                            <span className="stat-total">/ {casesStats.total}</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: casesStats.total > 0
                                        ? `${(casesStats.byStatus.dominado / casesStats.total) * 100}%`
                                        : '0%'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Stats Row */}
            <div className="mini-stats-row">
                <div className="mini-stat">
                    <BookOpen size={18} />
                    <div className="mini-stat-content">
                        <span className="mini-stat-value">{documents.length}</span>
                        <span className="mini-stat-label">Documentos</span>
                    </div>
                </div>
                <div className="mini-stat">
                    <Target size={18} />
                    <div className="mini-stat-content">
                        <span className="mini-stat-value">{casesStats.byStatus.en_progreso}</span>
                        <span className="mini-stat-label">En Progreso</span>
                    </div>
                </div>
                <div className="mini-stat">
                    <Calendar size={18} />
                    <div className="mini-stat-content">
                        <span className="mini-stat-value">{todayProgress.hours}h</span>
                        <span className="mini-stat-label">Hoy</span>
                    </div>
                </div>
                <div className="mini-stat">
                    <Flame size={18} />
                    <div className="mini-stat-content">
                        <span className="mini-stat-value">{streakInfo.longest}</span>
                        <span className="mini-stat-label">Mejor Racha</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="charts-row">
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <h2>Mapa de Conocimiento</h2>
                            <p>Dominio por Especialidad Médica</p>
                        </div>
                        <span className="chart-badge">{knowledgeData.length} áreas</span>
                    </div>
                    <div className="chart-container radar">
                        {knowledgeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <RadarChart data={displayKnowledgeData}>
                                    <PolarGrid stroke="#30363d" />
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        tick={{ fill: '#8b949e', fontSize: 11 }}
                                    />
                                    <Radar
                                        name="Dominio"
                                        dataKey="value"
                                        stroke="#58a6ff"
                                        fill="#58a6ff"
                                        fillOpacity={0.3}
                                        strokeWidth={2}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#161b22',
                                            border: '1px solid #30363d',
                                            borderRadius: '8px',
                                            color: '#f0f6fc'
                                        }}
                                        formatter={(value, name, props) => [
                                            `${value}% (${props.payload.caseCount} casos)`,
                                            props.payload.fullName
                                        ]}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-chart">
                                <Brain size={48} />
                                <p>Estudia casos clínicos para ver tu mapa de conocimiento</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <h2>Actividad Semanal</h2>
                            <p>Horas de estudio por semana</p>
                        </div>
                        <span className="chart-range">Últimas 4 Semanas</span>
                    </div>
                    <div className="velocity-stats">
                        <span className="velocity-number">
                            Prom {generalStats.weekAverageHours} hrs/día
                        </span>
                        <span className={`velocity-trend ${weekChange >= 0 ? 'positive' : 'negative'}`}>
                            {weekChange >= 0 ? '+' : ''}{((weekChange / Math.max(lastWeekTotal, 1)) * 100).toFixed(0)}% vs semana pasada
                        </span>
                    </div>
                    <div className="chart-container bar">
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={weeklyData}>
                                <XAxis
                                    dataKey="week"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#8b949e', fontSize: 11 }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        background: '#161b22',
                                        border: '1px solid #30363d',
                                        borderRadius: '8px',
                                        color: '#f0f6fc'
                                    }}
                                    formatter={(value) => [`${value} horas`, 'Estudio']}
                                />
                                <Bar
                                    dataKey="hours"
                                    fill="#39d5ff"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="bottom-row">
                <div className="diagnostic-card">
                    <div className="card-header">
                        <div className="header-icon">
                            <span className="sparkle">✦</span>
                        </div>
                        <div>
                            <h2>Diagnóstico IA</h2>
                            <p>Casos que necesitan tu atención</p>
                        </div>
                    </div>

                    <div className="diagnostic-list">
                        {diagnosticItems.length > 0 ? (
                            diagnosticItems.map((item) => (
                                <div key={item.id} className="diagnostic-item">
                                    <div className={`diag-icon ${item.severity}`}>
                                        {item.severity === 'error' ?
                                            <AlertCircle size={18} /> :
                                            <AlertTriangle size={18} />
                                        }
                                    </div>
                                    <div className="diag-content">
                                        <h4>{item.title}</h4>
                                        <p>{item.categoryLabel} • {item.issue}</p>
                                    </div>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => handleReviewCase(item.id)}
                                    >
                                        Repasar
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="empty-diagnostic">
                                <Target size={32} />
                                <p>¡Excelente! No tienes casos pendientes de repaso.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="benchmark-card">
                    <div className="card-header">
                        <h2>Tu Progreso</h2>
                        <span className="rank-badge">
                            {estimatedScore.percentage >= 80 ? '🏆 Avanzado' :
                                estimatedScore.percentage >= 50 ? '📈 Intermedio' :
                                    '🌱 Principiante'}
                        </span>
                    </div>
                    <p>Resumen de tu actividad de estudio</p>

                    <div className="benchmark-item">
                        <div className="benchmark-header">
                            <span>Meta Diaria</span>
                            <span className="benchmark-score">
                                {todayProgress.hours}h / {todayProgress.goalHours}h
                            </span>
                        </div>
                        <div className="benchmark-bar you">
                            <div
                                className="benchmark-fill"
                                style={{ width: `${todayProgress.percentage}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="benchmark-item">
                        <div className="benchmark-header">
                            <span>Dominio General</span>
                            <span className="benchmark-score">{estimatedScore.percentage}%</span>
                        </div>
                        <div className="benchmark-bar avg">
                            <div
                                className="benchmark-fill"
                                style={{ width: `${estimatedScore.percentage}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="benchmark-item">
                        <div className="benchmark-header">
                            <span>Casos Completados</span>
                            <span className="benchmark-score">
                                {casesStats.byStatus.dominado}/{casesStats.total}
                            </span>
                        </div>
                        <div className="benchmark-bar you">
                            <div
                                className="benchmark-fill"
                                style={{
                                    width: casesStats.total > 0
                                        ? `${(casesStats.byStatus.dominado / casesStats.total) * 100}%`
                                        : '0%'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
