import { useState, useEffect, useCallback } from 'react'
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
    Music,
    Radio,
    Disc3,
    Wind,
    Activity,
    Search
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
import { useMusic } from '../context/MusicContext'
import useNotifications from '../hooks/useNotifications'
import './Analytics.css'


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

    const {
        pomodoroStarted,
        pomodoroCompleted,
        pomodoroBreakStarted,
        pomodoroBreakEnded
    } = useNotifications()

    // --- Music from global context (persists across routes) ---
    const {
        curatedTracks,
        radioStations,
        mode,
        isPlaying: isMusicPlaying,
        currentTrackIndex,
        currentRadioIndex,
        volume: musicVolume,
        binauralMode,
        noiseVolume,
        toggle: toggleMusic,
        next: nextTrack,
        prev: prevTrack,
        selectItem,
        changeVolume,
        switchMode,
        setBinaural,
        changeNoiseVolume,
        getActiveItem,
        searchResults,
        isSearching,
        searchYouTube,
        currentSpotifyTrack,
        searchAndPlaySpotifyTrack
    } = useMusic()

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
                        addPomodoroSession(pomodoroStudyTime, pomodoroBreakTime)
                        if (currentCycle >= pomodoroCycles) {
                            setPomodoroPhase('completed')
                            stopMusic()
                            pomodoroCompleted(pomodoroStudyTime * pomodoroCycles)
                            return 0
                        }
                        setPomodoroPhase('break')
                        pomodoroBreakStarted(pomodoroBreakTime)
                        return pomodoroBreakTime * 60
                    } else if (pomodoroPhase === 'break') {
                        setCurrentCycle(c => c + 1)
                        setPomodoroPhase('studying')
                        pomodoroBreakEnded()
                        return pomodoroStudyTime * 60
                    }
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [pomodoroPhase, currentCycle, pomodoroCycles, pomodoroStudyTime, pomodoroBreakTime])

    const startPomodoro = () => {
        setPomodoroPhase('studying')
        setTimeLeft(pomodoroStudyTime * 60)
        setCurrentCycle(1)
        startMusic()
        pomodoroStarted(pomodoroStudyTime)
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

    const handleVolumeChange = (e) => {
        changeVolume(parseFloat(e.target.value))
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
                    {/* Deep Focus Music Playlist & Neuro-Tools */}
                    <div className="music-card">
                        <div className="music-header" style={{ marginBottom: '10px' }}>
                            <span className="music-label">🎵 Focus & Lo-fi</span>
                            <div className="music-header-controls">
                                {mode === 'youtube' && (
                                    <button className="music-nav-btn" onClick={prevTrack} title="Anterior">
                                        <SkipBack size={16} />
                                    </button>
                                )}
                                <button className="music-toggle" onClick={toggleMusic}>
                                    {isMusicPlaying ? <Pause size={18} /> : <Play size={18} />}
                                </button>
                                <button className="music-nav-btn" onClick={nextTrack} title="Siguiente">
                                    <SkipForward size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Mode Toggles */}
                        <div className="music-mode-toggles" style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                            <button
                                className={`tag-chip ${mode === 'youtube' ? 'active' : ''}`}
                                onClick={() => switchMode('youtube')}
                                style={{ flex: 1, padding: '6px', fontSize: '11px', justifyContent: 'center', background: mode === 'youtube' ? 'var(--bg-elevated)' : 'transparent', border: '1px solid var(--border-primary)' }}
                            >
                                <Music size={12} style={{ marginRight: '4px' }} /> Música
                            </button>
                            <button
                                className={`tag-chip ${mode === 'radio' ? 'active' : ''}`}
                                onClick={() => switchMode('radio')}
                                style={{ flex: 1, padding: '6px', fontSize: '11px', justifyContent: 'center', background: mode === 'radio' ? 'var(--bg-elevated)' : 'transparent', border: '1px solid var(--border-primary)' }}
                            >
                                <Radio size={12} style={{ marginRight: '4px' }} /> Radio en Vivo
                            </button>
                        </div>

                        {/* Search Input for YouTube mode */}
                        {mode === 'youtube' && (
                            <div className="youtube-search-bar" style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                                <input
                                    type="text"
                                    placeholder="Buscar lo-fi, Mozart..."
                                    className="search-input"
                                    style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-primary)',
                                        background: 'var(--bg-elevated)',
                                        color: 'var(--text-primary)',
                                        fontSize: '12px'
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim() !== '') {
                                            searchYouTube(e.target.value.trim())
                                        }
                                    }}
                                />
                                <button
                                    onClick={(e) => {
                                        const val = e.currentTarget.previousElementSibling.value.trim();
                                        if (val !== '') searchYouTube(val)
                                    }}
                                    className="timer-btn primary"
                                    style={{ padding: '8px', borderRadius: '8px' }}
                                    disabled={isSearching}
                                >
                                    <Search size={14} />
                                </button>
                            </div>
                        )}

                        {/* Now Playing info */}
                        <div className="now-playing" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
                            <Music size={14} color="var(--accent-cyan)" />
                            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '10px', overflow: 'hidden' }}>
                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                                    {mode === 'youtube' ? 'REPRODUCIENDO' : 'LIVE STREAMING'}
                                </span>
                                <span className={isMusicPlaying ? 'playing-text' : ''} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {getActiveItem().title}
                                </span>
                            </div>
                        </div>

                        {/* Track List */}
                        <div className="track-list" style={{ maxHeight: '150px', marginBottom: '15px' }}>
                            {isSearching ? (
                                <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    Buscando canciones...
                                </div>
                            ) : mode === 'youtube' ? (
                                searchResults.map((item, i) => {
                                    const isActive = currentSpotifyTrack?.id === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            className={`track-item ${isActive ? 'active' : ''}`}
                                            onClick={() => searchAndPlaySpotifyTrack(item)}
                                        >
                                            <span className="track-number">{i + 1}</span>
                                            <span className="track-title" style={{ textAlign: 'left', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '12px' }}>{item.title}</span>
                                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{item.channel}</span>
                                            </span>
                                            {isActive && isMusicPlaying && (
                                                <div className="track-playing-icon">
                                                    <span /><span /><span />
                                                </div>
                                            )}
                                        </button>
                                    )
                                })
                            ) : (
                                radioStations.map((item, i) => {
                                    const isActive = i === currentRadioIndex;
                                    return (
                                        <button
                                            key={item.id}
                                            className={`track-item ${isActive ? 'active' : ''}`}
                                            onClick={() => selectItem(i, 'radio')}
                                        >
                                            <span className="track-number">{i + 1}</span>
                                            <span className="track-title">{item.title}</span>
                                            {isActive && isMusicPlaying && (
                                                <div className="track-playing-icon">
                                                    <span /><span /><span />
                                                </div>
                                            )}
                                        </button>
                                    )
                                })
                            )}
                        </div>

                        {/* Volume music */}
                        <div className="volume-control" style={{ marginBottom: '15px' }}>
                            <VolumeX size={14} />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={musicVolume}
                                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                                className="volume-slider"
                            />
                            <Volume2 size={14} />
                        </div>

                        {/* Scientific Settings (Binaural & Noise) */}
                        <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                <Activity size={12} style={{ marginRight: '5px', color: 'var(--accent-purple)' }} />
                                <strong>Mejora Cognitiva</strong> (Recomendado)
                            </div>

                            {/* Binaural Beats Select */}
                            <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                                <button
                                    className={`tag-chip ${binauralMode === 'none' ? 'active' : ''}`}
                                    onClick={() => setBinaural('none')}
                                    style={{ flex: 1, padding: '4px', fontSize: '10px', justifyContent: 'center' }}
                                >
                                    Off
                                </button>
                                <button
                                    className={`tag-chip ${binauralMode === 'alpha' ? 'active' : ''}`}
                                    onClick={() => setBinaural('alpha')}
                                    title="Ondas Alfa (8-14Hz): Lectura relajada y memoria"
                                    style={{ flex: 1, padding: '4px', fontSize: '10px', justifyContent: 'center', border: binauralMode === 'alpha' ? '1px solid var(--accent-cyan)' : 'none' }}
                                >
                                    Alfa (Relax)
                                </button>
                                <button
                                    className={`tag-chip ${binauralMode === 'beta' ? 'active' : ''}`}
                                    onClick={() => setBinaural('beta')}
                                    title="Ondas Beta (14-30Hz): Alerta mental y casos clínicos"
                                    style={{ flex: 1, padding: '4px', fontSize: '10px', justifyContent: 'center', border: binauralMode === 'beta' ? '1px solid var(--accent-purple)' : 'none' }}
                                >
                                    Beta (Focus)
                                </button>
                            </div>

                            {/* Brown Noise Slider */}
                            <div className="volume-control" title="Enmascaramiento de fondo: Bloquea distracciones externas con Ruido Marrón" style={{ background: 'var(--bg-elevated)', padding: '8px 10px', borderRadius: '6px' }}>
                                <Wind size={14} color="var(--text-secondary)" />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={noiseVolume}
                                    onChange={(e) => changeNoiseVolume(parseFloat(e.target.value))}
                                    className="volume-slider"
                                    style={{ flex: 1, accentColor: 'var(--text-secondary)' }}
                                />
                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginLeft: '5px', minWidth: '25px', textAlign: 'right' }}>
                                    {Math.round(noiseVolume * 100)}%
                                </span>
                            </div>
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
            </div >

            {/* ====== CALENDAR HEATMAP SECTION ====== */}
            < div className="heatmap-section" >
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
                {
                    hoveredDay && (
                        <div
                            className="heatmap-tooltip"
                            style={{ left: tooltipPos.x, top: tooltipPos.y }}
                        >
                            <strong>{hoveredDay.hours}h</strong> el {new Date(hoveredDay.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    )
                }
            </div >

            {/* ====== EXISTING STATS CARDS ====== */}
            < div className="stats-row" >
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
            </div >

            {/* Additional Stats Row */}
            < div className="mini-stats-row" >
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
            </div >

            {/* Charts Row */}
            < div className="charts-row" >
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
            </div >

            {/* Bottom Row */}
            < div className="bottom-row" >
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
            </div >
        </div >
    )
}
