import { createContext, useContext, useState, useEffect } from 'react'

const StudyStatsContext = createContext(null)

const STORAGE_KEY = 'synapse_study_stats'

// Obtener fecha actual en formato YYYY-MM-DD
const getToday = () => new Date().toISOString().split('T')[0]

// Calcular diferencia en días entre dos fechas
const daysDifference = (date1, date2) => {
    const d1 = new Date(date1 + 'T00:00:00')
    const d2 = new Date(date2 + 'T00:00:00')
    const diffTime = Math.abs(d2 - d1)
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

// Estado inicial
const createInitialState = () => ({
    dailyGoal: 240, // 4 horas en minutos
    studyHistory: {}, // { 'YYYY-MM-DD': minutes }
    currentStreak: 0,
    longestStreak: 0,
    totalStudyTime: 0,
    lastStudyDate: null,
    pomodoroSessions: [], // { date, studyMinutes, breakMinutes, completedAt }
})

export function StudyStatsProvider({ children }) {
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                return { ...createInitialState(), ...parsed }
            } catch {
                return createInitialState()
            }
        }
        return createInitialState()
    })

    // Persistir en localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
    }, [stats])

    // Calcular racha actual al cargar
    useEffect(() => {
        const calculateStreak = () => {
            const today = getToday()
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().split('T')[0]

            let streak = 0
            let checkDate = new Date()

            // Si no hay estudio hoy, empezar desde ayer
            if (!stats.studyHistory[today]) {
                checkDate.setDate(checkDate.getDate() - 1)
            }

            // Contar días consecutivos hacia atrás
            while (true) {
                const dateStr = checkDate.toISOString().split('T')[0]
                if (stats.studyHistory[dateStr] && stats.studyHistory[dateStr] > 0) {
                    streak++
                    checkDate.setDate(checkDate.getDate() - 1)
                } else {
                    break
                }
            }

            if (streak !== stats.currentStreak) {
                setStats(prev => ({
                    ...prev,
                    currentStreak: streak,
                    longestStreak: Math.max(prev.longestStreak, streak)
                }))
            }
        }

        calculateStreak()
    }, [stats.studyHistory])

    // Agregar tiempo de estudio
    const addStudyTime = (minutes) => {
        const today = getToday()

        setStats(prev => {
            const currentTodayMinutes = prev.studyHistory[today] || 0
            const newTodayMinutes = currentTodayMinutes + minutes

            return {
                ...prev,
                studyHistory: {
                    ...prev.studyHistory,
                    [today]: newTodayMinutes
                },
                totalStudyTime: prev.totalStudyTime + minutes,
                lastStudyDate: today,
            }
        })
    }

    // Establecer meta diaria
    const setDailyGoal = (minutes) => {
        setStats(prev => ({
            ...prev,
            dailyGoal: minutes
        }))
    }

    // Obtener progreso de hoy
    const getTodayProgress = () => {
        const today = getToday()
        const todayMinutes = stats.studyHistory[today] || 0
        const percentage = Math.min(100, Math.round((todayMinutes / stats.dailyGoal) * 100))

        return {
            minutes: todayMinutes,
            hours: (todayMinutes / 60).toFixed(1),
            goal: stats.dailyGoal,
            goalHours: (stats.dailyGoal / 60).toFixed(0),
            percentage,
            remaining: Math.max(0, stats.dailyGoal - todayMinutes),
            isComplete: todayMinutes >= stats.dailyGoal,
        }
    }

    // Obtener información de la racha
    const getStreakInfo = () => {
        const today = getToday()
        const hasStudiedToday = (stats.studyHistory[today] || 0) > 0

        return {
            current: stats.currentStreak,
            longest: stats.longestStreak,
            hasStudiedToday,
            message: stats.currentStreak === 0
                ? '¡Comienza tu racha hoy!'
                : stats.currentStreak < 7
                    ? '¡Mantén el fuego encendido!'
                    : stats.currentStreak < 30
                        ? '¡Excelente consistencia!'
                        : '🔥 ¡Racha legendaria!'
        }
    }

    // Obtener estadísticas generales
    const getGeneralStats = () => {
        const today = getToday()
        const last7Days = []

        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            last7Days.push({
                date: dateStr,
                dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
                minutes: stats.studyHistory[dateStr] || 0
            })
        }

        const weekTotal = last7Days.reduce((sum, d) => sum + d.minutes, 0)
        const weekAverage = Math.round(weekTotal / 7)

        return {
            totalMinutes: stats.totalStudyTime,
            totalHours: Math.round(stats.totalStudyTime / 60),
            last7Days,
            weekTotal,
            weekAverage,
            weekAverageHours: (weekAverage / 60).toFixed(1),
        }
    }

    // Obtener datos de los últimos 30 días para gráfico
    const getLast30Days = () => {
        const days = []
        for (let i = 29; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            days.push({
                date: dateStr,
                dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
                dayNum: date.getDate(),
                minutes: stats.studyHistory[dateStr] || 0,
                hours: ((stats.studyHistory[dateStr] || 0) / 60).toFixed(1)
            })
        }
        return days
    }

    // Obtener datos por semana (últimas 4 semanas)
    const getWeeklyData = () => {
        const weeks = []
        for (let w = 3; w >= 0; w--) {
            let weekTotal = 0
            for (let d = 0; d < 7; d++) {
                const date = new Date()
                date.setDate(date.getDate() - (w * 7 + d))
                const dateStr = date.toISOString().split('T')[0]
                weekTotal += stats.studyHistory[dateStr] || 0
            }
            weeks.push({
                week: `Sem ${4 - w}`,
                minutes: weekTotal,
                hours: parseFloat((weekTotal / 60).toFixed(1))
            })
        }
        return weeks
    }

    // Obtener saludo basado en hora del día
    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Buenos días'
        if (hour < 18) return 'Buenas tardes'
        return 'Buenas noches'
    }

    // Registrar sesión Pomodoro completada
    const addPomodoroSession = (studyMinutes, breakMinutes) => {
        const today = getToday()
        const session = {
            date: today,
            studyMinutes,
            breakMinutes,
            completedAt: new Date().toISOString(),
        }
        addStudyTime(studyMinutes)
        setStats(prev => ({
            ...prev,
            pomodoroSessions: [...(prev.pomodoroSessions || []), session],
        }))
    }

    // Obtener sesiones Pomodoro de hoy
    const getTodayPomodoros = () => {
        const today = getToday()
        return (stats.pomodoroSessions || []).filter(s => s.date === today)
    }

    // Datos para calendario heatmap (últimos 365 días)
    const getCalendarHeatmapData = () => {
        const days = []
        for (let i = 364; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            const minutes = stats.studyHistory[dateStr] || 0
            const hours = parseFloat((minutes / 60).toFixed(1))
            // Intensity level: 0=none, 1=light, 2=medium, 3=high, 4=intense
            let level = 0
            if (minutes > 0 && minutes < 60) level = 1
            else if (minutes >= 60 && minutes < 120) level = 2
            else if (minutes >= 120 && minutes < 240) level = 3
            else if (minutes >= 240) level = 4

            days.push({
                date: dateStr,
                minutes,
                hours,
                level,
                dayOfWeek: date.getDay(),
                month: date.getMonth(),
                monthName: date.toLocaleDateString('es-ES', { month: 'short' }),
            })
        }
        return days
    }

    // Obtener estudio acumulado en un rango de fechas
    const getStudyInRange = (startDate, endDate) => {
        let total = 0
        const start = new Date(startDate + 'T00:00:00')
        const end = new Date(endDate + 'T00:00:00')
        const current = new Date(start)
        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0]
            total += stats.studyHistory[dateStr] || 0
            current.setDate(current.getDate() + 1)
        }
        return {
            totalMinutes: total,
            totalHours: parseFloat((total / 60).toFixed(1)),
        }
    }

    const value = {
        stats,
        addStudyTime,
        setDailyGoal,
        getTodayProgress,
        getStreakInfo,
        getGeneralStats,
        getLast30Days,
        getWeeklyData,
        getGreeting,
        addPomodoroSession,
        getTodayPomodoros,
        getCalendarHeatmapData,
        getStudyInRange,
    }

    return (
        <StudyStatsContext.Provider value={value}>
            {children}
        </StudyStatsContext.Provider>
    )
}

export function useStudyStats() {
    const context = useContext(StudyStatsContext)
    if (!context) {
        throw new Error('useStudyStats debe usarse dentro de StudyStatsProvider')
    }
    return context
}
