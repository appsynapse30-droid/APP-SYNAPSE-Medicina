import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    TrendingUp,
    Clock,
    Brain,
    Play,
    Pause,
    RotateCcw,
    AlertCircle,
    AlertTriangle,
    Flame,
    BookOpen,
    Target,
    Calendar,
    Volume2,
    VolumeX,
    Coffee,
    Settings,
    Timer,
    ChevronLeft,
    ChevronRight,
    SkipForward,
    SkipBack,
    Music
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

// Deep Focus music playlist (royalty-free lo-fi / ambient beats)
const FOCUS_TRACKS = [
    { title: 'Lofi Study Beats', url: 'https://cdn.pixabay.com/audio/2024/11/28/audio_3a4b1c5d6e.mp3' },
    { title: 'Calm Piano Focus', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3' },
    { title: 'Ambient Flow', url: 'https://cdn.pixabay.com/audio/2024/09/10/audio_6e4e1c5d8a.mp3' },
    { title: 'Rain & Coffee', url: 'https://cdn.pixabay.com/audio/2022/10/09/audio_4d1dcdd069.mp3' },
    { title: 'Night Owl Jazz', url: 'https://cdn.pixabay.com/audio/2023/07/30/audio_e3e836e56f.mp3' },
    { title: 'Deep Concentration', url: 'https://cdn.pixabay.com/audio/2023/10/24/audio_3f7541c8b4.mp3' },
    { title: 'Peaceful Morning', url: 'https://cdn.pixabay.com/audio/2024/02/14/audio_8fdb506997.mp3' },
    { title: 'Cosmic Drift', url: 'https://cdn.pixabay.com/audio/2023/04/17/audio_55b2e01917.mp3' },
]

export default function Analytics() {
    const navigate = useNavigate()

    // --- Existing context hooks ---
    const {
        stats,
        getTodayProgress,
        getStreakInfo,
        getGeneralStats,
        getWeeklyData,
        getLast30Days,
        addPomodoroSession,
        getTodayPomodoros,
        getCalendarHeatmapData,
        getStudyInRange,
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

    // --- Existing computed data ---
    const todayProgress = getTodayProgress()
    const streakInfo = getStreakInfo()
    const generalStats = getGeneralStats()
    const weeklyData = getWeeklyData()
    const knowledgeData = getKnowledgeByCategory()
    const casesStats = getCasesStats()
    const diagnosticItems = getCasesNeedingReview(4)
    const estimatedScore = getEstimatedScore()

    const lastWeekTotal = weeklyData.slice(0, 2).reduce((sum, w) => sum + w.hours, 0)
    const thisWeekTotal = weeklyData.slice(2, 4).reduce((sum, w) => sum + w.hours, 0)
    const weekChange = thisWeekTotal - lastWeekTotal

    const handleStartReview = () => navigate('/simulations')
    const handleReviewCase = () => navigate('/simulations')

    const displayKnowledgeData = knowledgeData.length > 0 ? knowledgeData : [
        { subject: 'Sin datos', value: 0 }
    ]

    // ============ POMODORO STATE ============
    const [pomodoroStudyTime, setPomodoroStudyTime] = useState(25)
    const [pomodoroBreakTime, setPomodoroBreakTime] = useState(5)
    const [pomodoroCycles, setPomodoroCycles] = useState(4)
    const [currentCycle, setCurrentCycle] = useState(1)
    const [pomodoroPhase, setPomodoroPhase] = useState('idle') // idle, studying, break, completed
    const [timeLeft, setTimeLeft] = useState(25 * 60) // in seconds
    const [showPomodoroSettings, setShowPomodoroSettings] = useState(false)

    // Music state
    const audioRef = useRef(null)
    const [isMusicPlaying, setIsMusicPlaying] = useState(false)
    const [musicVolume, setMusicVolume] = useState(0.3)
    const [currentTrack, setCurrentTrack] = useState(0)
    const [musicLoaded, setMusicLoaded] = useState(false)

    // Calendar state
    const [hoveredDay, setHoveredDay] = useState(null)
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

    // Pomodoro timer effect
    useEffect(() => {
        if (pomodoroPhase === 'idle' || pomodoroPhase === 'completed') return

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval)
                    if (pomodoroPhase === 'studying') {
                        // Register study session
                        addPomodoroSession(pomodoroStudyTime, pomodoroBreakTime)
                        if (currentCycle >= pomodoroCycles) {
                            setPomodoroPhase('completed')
                            stopMusic()
                            return 0
                        }
                        // Start break
                        setPomodoroPhase('break')
                        return pomodoroBreakTime * 60
                    } else if (pomodoroPhase === 'break') {
                        // Start next study cycle
                        setCurrentCycle(c => c + 1)
                        setPomodoroPhase('studying')
                        return pomodoroStudyTime * 60
                    }
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [pomodoroPhase, currentCycle, pomodoroCycles, pomodoroStudyTime, pomodoroBreakTime])

    // Music initialization
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio()
            audioRef.current.loop = false
            audioRef.current.volume = musicVolume
            audioRef.current.addEventListener('ended', () => {
                setCurrentTrack(prev => (prev + 1) % FOCUS_TRACKS.length)
            })
            audioRef.current.addEventListener('canplaythrough', () => {
                setMusicLoaded(true)
            })
            audioRef.current.addEventListener('error', () => {
                // Skip to next track on error (bad URL)
                setCurrentTrack(prev => (prev + 1) % FOCUS_TRACKS.length)
            })
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    }, [])

    // Track changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = FOCUS_TRACKS[currentTrack].url
            if (isMusicPlaying) {
                audioRef.current.play().catch(() => { })
            }
        }
    }, [currentTrack])

    const startPomodoro = () => {
        setPomodoroPhase('studying')
        setTimeLeft(pomodoroStudyTime * 60)
        setCurrentCycle(1)
        startMusic()
    }

    const togglePomodoro = () => {
        if (pomodoroPhase === 'idle' || pomodoroPhase === 'completed') {
            startPomodoro()
        } else {
            setPomodoroPhase('idle')
            setTimeLeft(pomodoroStudyTime * 60)
            setCurrentCycle(1)
            stopMusic()
        }
    }

    const resetPomodoro = () => {
        setPomodoroPhase('idle')
        setTimeLeft(pomodoroStudyTime * 60)
        setCurrentCycle(1)
        stopMusic()
    }

    const nextTrack = () => {
        setCurrentTrack(prev => (prev + 1) % FOCUS_TRACKS.length)
    }

    const prevTrack = () => {
        setCurrentTrack(prev => (prev - 1 + FOCUS_TRACKS.length) % FOCUS_TRACKS.length)
    }

    const selectTrack = (index) => {
        setCurrentTrack(index)
        if (!isMusicPlaying) {
            setIsMusicPlaying(true)
            setTimeout(() => {
                if (audioRef.current) audioRef.current.play().catch(() => { })
            }, 100)
        }
    }

    const startMusic = () => {
        if (audioRef.current) {
            audioRef.current.src = FOCUS_TRACKS[currentTrack].url
            audioRef.current.volume = musicVolume
            audioRef.current.play().catch(() => { })
            setIsMusicPlaying(true)
        }
    }

    const stopMusic = () => {
        if (audioRef.current) {
            audioRef.current.pause()
        }
        setIsMusicPlaying(false)
    }

    const toggleMusic = () => {
        if (isMusicPlaying) {
            stopMusic()
        } else {
            startMusic()
        }
    }

    const handleVolumeChange = (e) => {
        const vol = parseFloat(e.target.value)
        setMusicVolume(vol)
        if (audioRef.current) audioRef.current.volume = vol
    }

    // Format seconds to MM:SS
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0')
        const s = (seconds % 60).toString().padStart(2, '0')
        return `${m}:${s}`
    }

    // Timer circle calculations
    const totalSeconds = pomodoroPhase === 'break' ? pomodoroBreakTime * 60 : pomodoroStudyTime * 60
    const progress = totalSeconds > 0 ? (1 - timeLeft / totalSeconds) : 0
    const circleRadius = 120
    const circleCircumference = 2 * Math.PI * circleRadius
    const strokeDashoffset = circleCircumference * (1 - progress)

    // Calendar heatmap data
    const heatmapData = getCalendarHeatmapData()
    const todayPomodoros = getTodayPomodoros()

    // Group heatmap data into weeks for rendering
    const getHeatmapWeeks = () => {
        const weeks = []
        let currentWeek = []
        // Pad the first week with empty cells
        const firstDayOfWeek = heatmapData[0]?.dayOfWeek || 0
        for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push(null)
        }
        heatmapData.forEach(day => {
            currentWeek.push(day)
            if (currentWeek.length === 7) {
                weeks.push(currentWeek)
                currentWeek = []
            }
        })
        if (currentWeek.length > 0) {
            weeks.push(currentWeek)
        }
        return weeks
    }

    // Get month labels for heatmap
    const getMonthLabels = () => {
        const labels = []
        let lastMonth = -1
        const weeks = getHeatmapWeeks()
        weeks.forEach((week, weekIndex) => {
            const validDay = week.find(d => d !== null)
            if (validDay && validDay.month !== lastMonth) {
                lastMonth = validDay.month
                labels.push({ weekIndex, name: validDay.monthName })
            }
        })
        return labels
    }

    const handleDayHover = (day, e) => {
        if (day) {
            setHoveredDay(day)
            const rect = e.target.getBoundingClientRect()
            setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
        }
    }

    const heatmapWeeks = getHeatmapWeeks()
    const monthLabels = getMonthLabels()

    const levelColors = [
        'var(--heatmap-0)',
        'var(--heatmap-1)',
        'var(--heatmap-2)',
        'var(--heatmap-3)',
        'var(--heatmap-4)',
    ]

    return (
        <div className="analytics">
            <div className="analytics-header">
                <div>
                    <h1>Progreso y Análisis</h1>
                    <p>
                        Bienvenido de nuevo, {settings.profile?.displayName || 'Usuario'}.
                        Tu preparación está al <span className="highlight">{estimatedScore.percentage}%</span>.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={handleStartReview}>
                    <Play size={16} />
                    Iniciar Sesión de Repaso
                </button>
            </div>

            {/* ====== POMODORO TIMER SECTION ====== */}
            <div className="pomodoro-section">
                <div className="pomodoro-timer-card">
                    <div className="pomodoro-header">
                        <div className="pomodoro-title">
                            <Timer size={22} />
                            <h2>Pomodoro Timer</h2>
                        </div>
                        <button
                            className="pomodoro-settings-btn"
                            onClick={() => setShowPomodoroSettings(!showPomodoroSettings)}
                        >
                            <Settings size={18} />
                        </button>
                    </div>

                    {/* Settings Panel */}
                    {showPomodoroSettings && (
                        <div className="pomodoro-settings">
                            <div className="setting-row">
                                <label>Estudio: <strong>{pomodoroStudyTime} min</strong></label>
                                <input
                                    type="range"
                                    min="5"
                                    max="90"
                                    step="5"
                                    value={pomodoroStudyTime}
                                    onChange={e => {
                                        setPomodoroStudyTime(Number(e.target.value))
                                        if (pomodoroPhase === 'idle') setTimeLeft(Number(e.target.value) * 60)
                                    }}
                                    disabled={pomodoroPhase !== 'idle'}
                                />
                            </div>
                            <div className="setting-row">
                                <label>Descanso: <strong>{pomodoroBreakTime} min</strong></label>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    step="1"
                                    value={pomodoroBreakTime}
                                    onChange={e => setPomodoroBreakTime(Number(e.target.value))}
                                    disabled={pomodoroPhase !== 'idle'}
                                />
                            </div>
                            <div className="setting-row">
                                <label>Ciclos: <strong>{pomodoroCycles}</strong></label>
                                <input
                                    type="range"
                                    min="1"
                                    max="8"
                                    step="1"
                                    value={pomodoroCycles}
                                    onChange={e => setPomodoroCycles(Number(e.target.value))}
                                    disabled={pomodoroPhase !== 'idle'}
                                />
                            </div>
                        </div>
                    )}

                    {/* Timer Circle */}
                    <div className="timer-visual">
                        <svg className="timer-svg" viewBox="0 0 280 280">
                            <circle
                                className="timer-bg-circle"
                                cx="140"
                                cy="140"
                                r={circleRadius}
                                fill="none"
                                stroke="var(--border-primary)"
                                strokeWidth="8"
                            />
                            <circle
                                className={`timer-progress-circle ${pomodoroPhase}`}
                                cx="140"
                                cy="140"
                                r={circleRadius}
                                fill="none"
                                stroke={pomodoroPhase === 'break' ? 'var(--accent-green)' : 'var(--accent-cyan)'}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circleCircumference}
                                strokeDashoffset={strokeDashoffset}
                                transform="rotate(-90 140 140)"
                            />
                        </svg>
                        <div className="timer-display">
                            <span className="timer-time">{formatTime(timeLeft)}</span>
                            <span className={`timer-phase ${pomodoroPhase}`}>
                                {pomodoroPhase === 'idle' && 'Listo para estudiar'}
                                {pomodoroPhase === 'studying' && '🧠 Estudiando...'}
                                {pomodoroPhase === 'break' && '☕ Descanso'}
                                {pomodoroPhase === 'completed' && '🎉 ¡Completado!'}
                            </span>
                            <span className="timer-cycles">
                                Ciclo {currentCycle} / {pomodoroCycles}
                            </span>
                        </div>
                    </div>

                    {/* Timer Controls */}
                    <div className="timer-controls">
                        <button
                            className={`timer-btn primary ${pomodoroPhase === 'studying' || pomodoroPhase === 'break' ? 'active' : ''}`}
                            onClick={togglePomodoro}
                        >
                            {pomodoroPhase === 'idle' || pomodoroPhase === 'completed' ? (
                                <><Play size={20} /> Iniciar</>
                            ) : (
                                <><Pause size={20} /> Detener</>
                            )}
                        </button>
                        <button
                            className="timer-btn secondary"
                            onClick={resetPomodoro}
                            disabled={pomodoroPhase === 'idle'}
                        >
                            <RotateCcw size={18} /> Reset
                        </button>
                    </div>
                </div>

                {/* Music + Today Stats Panel */}
                <div className="pomodoro-side-panel">
                    {/* Deep Focus Music Playlist */}
                    <div className="music-card">
                        <div className="music-header">
                            <span className="music-label">🎵 Deep Focus</span>
                            <div className="music-header-controls">
                                <button className="music-nav-btn" onClick={prevTrack} title="Anterior">
                                    <SkipBack size={16} />
                                </button>
                                <button className="music-toggle" onClick={toggleMusic}>
                                    {isMusicPlaying ? <Pause size={18} /> : <Play size={18} />}
                                </button>
                                <button className="music-nav-btn" onClick={nextTrack} title="Siguiente">
                                    <SkipForward size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Now Playing */}
                        <div className="now-playing">
                            <Music size={14} />
                            <span className={isMusicPlaying ? 'playing-text' : ''}>
                                {FOCUS_TRACKS[currentTrack].title}
                            </span>
                        </div>

                        {/* Track List */}
                        <div className="track-list">
                            {FOCUS_TRACKS.map((track, i) => (
                                <button
                                    key={i}
                                    className={`track-item ${i === currentTrack ? 'active' : ''}`}
                                    onClick={() => selectTrack(i)}
                                >
                                    <span className="track-number">{i + 1}</span>
                                    <span className="track-title">{track.title}</span>
                                    {i === currentTrack && isMusicPlaying && (
                                        <div className="track-playing-icon">
                                            <span /><span /><span />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Volume */}
                        <div className="volume-control">
                            <VolumeX size={14} />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={musicVolume}
                                onChange={handleVolumeChange}
                                className="volume-slider"
                            />
                            <Volume2 size={14} />
                        </div>
                    </div>

                    {/* Today Pomodoro Stats */}
                    <div className="today-pomodoro-stats">
                        <h3>Hoy</h3>
                        <div className="pomo-stat-grid">
                            <div className="pomo-stat">
                                <span className="pomo-stat-value">{todayPomodoros.length}</span>
                                <span className="pomo-stat-label">Pomodoros</span>
                            </div>
                            <div className="pomo-stat">
                                <span className="pomo-stat-value">{todayProgress.hours}h</span>
                                <span className="pomo-stat-label">Estudiado</span>
                            </div>
                            <div className="pomo-stat">
                                <span className="pomo-stat-value">{todayProgress.percentage}%</span>
                                <span className="pomo-stat-label">Meta Diaria</span>
                            </div>
                            <div className="pomo-stat">
                                <span className="pomo-stat-value">{streakInfo.current}🔥</span>
                                <span className="pomo-stat-label">Racha</span>
                            </div>
                        </div>
                        <div className="daily-progress-bar">
                            <div className="daily-progress-fill" style={{ width: `${todayProgress.percentage}%` }} />
                        </div>
                        <span className="daily-progress-text">
                            {todayProgress.remaining > 0
                                ? `Faltan ${(todayProgress.remaining / 60).toFixed(1)}h para tu meta`
                                : '¡Meta diaria cumplida! 🎉'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ====== CALENDAR HEATMAP SECTION ====== */}
            <div className="heatmap-section">
                <div className="heatmap-header">
                    <div>
                        <h2>Calendario de Estudio</h2>
                        <p>{generalStats.totalHours} horas totales de estudio</p>
                    </div>
                    <div className="heatmap-legend">
                        <span>Menos</span>
                        {levelColors.map((color, i) => (
                            <div
                                key={i}
                                className="legend-cell"
                                style={{ background: color }}
                            />
                        ))}
                        <span>Más</span>
                    </div>
                </div>
                <div className="heatmap-container">
                    <div className="heatmap-months">
                        {monthLabels.map((label, i) => (
                            <span key={i} className="month-label" style={{ gridColumn: label.weekIndex + 1 }}>
                                {label.name}
                            </span>
                        ))}
                    </div>
                    <div className="heatmap-grid-wrapper">
                        <div className="heatmap-days-label">
                            <span>Lun</span>
                            <span></span>
                            <span>Mié</span>
                            <span></span>
                            <span>Vie</span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className="heatmap-grid">
                            {heatmapWeeks.map((week, wi) => (
                                <div key={wi} className="heatmap-week">
                                    {week.map((day, di) => (
                                        <div
                                            key={di}
                                            className={`heatmap-cell ${day ? `level-${day.level}` : 'empty'}`}
                                            onMouseEnter={day ? (e) => handleDayHover(day, e) : undefined}
                                            onMouseLeave={() => setHoveredDay(null)}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {hoveredDay && (
                    <div
                        className="heatmap-tooltip"
                        style={{ left: tooltipPos.x, top: tooltipPos.y }}
                    >
                        <strong>{hoveredDay.hours}h</strong> el {new Date(hoveredDay.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                )}
            </div>

            {/* ====== EXISTING STATS CARDS ====== */}
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
