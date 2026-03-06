/**
 * NotificationWatcher — Background component that monitors app state
 * and triggers Sileo toast notifications at the right moments.
 *
 * Watches:
 *  1) Daily study goal reached
 *  2) Streak milestones
 *  3) Streak at risk (evening check)
 *  4) Upcoming calendar events (within 30 min)
 *  5) Daily goal progress at 50% and 75%
 *  6) Break reminders after configurable intervals
 *  7) Exam proximity warnings
 */
import { useEffect, useRef } from 'react'
import { useStudyStats } from '../context/StudyStatsContext'
import { useCalendar } from '../context/CalendarContext'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import useNotifications from '../hooks/useNotifications'

export default function NotificationWatcher() {
    const { user } = useAuth()
    const { getTodayProgress, getStreakInfo, stats } = useStudyStats()
    const { getUpcomingEvents, events } = useCalendar()
    const { settings } = useSettings()

    const {
        dailyGoalReached,
        dailyGoalProgress,
        streakMilestone,
        streakAtRisk,
        upcomingEvent,
        eventToday,
        examReminder,
        breakReminder,
        studyReminderMorning,
    } = useNotifications()

    // Refs to track already-fired one-shot notifications this session
    const firedRef = useRef(new Set())

    // ── 1) Daily goal reached ─────────────────────────────────────────────
    useEffect(() => {
        if (!user) return
        const progress = getTodayProgress()
        if (progress.isComplete && !firedRef.current.has('goal-reached')) {
            firedRef.current.add('goal-reached')
            dailyGoalReached()
        }
    }, [stats.studyHistory, user])

    // ── 2) Daily goal progress milestones (50% / 75%) ────────────────────
    useEffect(() => {
        if (!user) return
        const progress = getTodayProgress()

        if (progress.percentage >= 75 && !firedRef.current.has('p75')) {
            firedRef.current.add('p75')
            dailyGoalProgress(progress.percentage, progress.remaining)
        } else if (progress.percentage >= 50 && progress.percentage < 75 && !firedRef.current.has('p50')) {
            firedRef.current.add('p50')
            dailyGoalProgress(progress.percentage, progress.remaining)
        }
    }, [stats.studyHistory, user])

    // ── 3) Streak notifications ──────────────────────────────────────────
    useEffect(() => {
        if (!user) return
        const streakInfo = getStreakInfo()

        // Milestone (7, 14, 30, 60, 100…)
        const milestones = [7, 14, 21, 30, 60, 90, 100, 150, 200, 365]
        for (const m of milestones) {
            if (streakInfo.current === m && !firedRef.current.has(`streak-${m}`)) {
                firedRef.current.add(`streak-${m}`)
                streakMilestone(m)
                break
            }
        }
    }, [stats.currentStreak, user])

    // ── 4) Streak at risk — check in the evening ─────────────────────────
    useEffect(() => {
        if (!user) return
        if (!settings?.notifications?.streakAlerts) return

        const checkStreakRisk = () => {
            const hour = new Date().getHours()
            const streakInfo = getStreakInfo()

            // After 7pm, if user hasn't studied and has an active streak
            if (hour >= 19 && !streakInfo.hasStudiedToday && streakInfo.current > 0) {
                if (!firedRef.current.has('streak-risk')) {
                    firedRef.current.add('streak-risk')
                    streakAtRisk()
                }
            }
        }

        // Check immediately and then every 30 minutes
        checkStreakRisk()
        const interval = setInterval(checkStreakRisk, 30 * 60 * 1000)
        return () => clearInterval(interval)
    }, [user, stats.currentStreak, settings?.notifications?.streakAlerts])

    // ── 5) Calendar event reminders ──────────────────────────────────────
    useEffect(() => {
        if (!user) return

        const checkUpcomingEvents = () => {
            const now = new Date()
            const todayStr = now.toISOString().split('T')[0]
            const upcomingEvts = getUpcomingEvents(10)

            for (const evt of upcomingEvts) {
                // Only process events with reminders enabled
                if (!evt.reminder) continue

                const eventDate = new Date(`${evt.date}T${evt.startTime}:00`)
                const diffMs = eventDate - now
                const diffMinutes = Math.round(diffMs / 60000)

                // Exam warning: 1-3 days before
                if (evt.category === 'examen') {
                    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
                    if (diffDays > 0 && diffDays <= 3) {
                        const key = `exam-${evt.id}-d${diffDays}`
                        if (!firedRef.current.has(key)) {
                            firedRef.current.add(key)
                            examReminder(evt.title, diffDays)
                        }
                    }
                }

                // Event starting within 30 min
                if (diffMinutes > 0 && diffMinutes <= 30) {
                    const key = `event-soon-${evt.id}`
                    if (!firedRef.current.has(key)) {
                        firedRef.current.add(key)
                        upcomingEvent(evt.title, `en ${diffMinutes} min`, evt.category)
                    }
                }

                // Event today (morning notification)
                if (evt.date === todayStr && diffMinutes > 30) {
                    const key = `event-today-${evt.id}`
                    if (!firedRef.current.has(key)) {
                        firedRef.current.add(key)
                        eventToday(evt.title, evt.startTime)
                    }
                }
            }
        }

        // Check immediately then every 5 minutes
        const timeout = setTimeout(checkUpcomingEvents, 3000) // slight delay after mount
        const interval = setInterval(checkUpcomingEvents, 5 * 60 * 1000)
        return () => {
            clearTimeout(timeout)
            clearInterval(interval)
        }
    }, [user, events])

    // ── 6) Break reminder (continuous study timer) ───────────────────────
    useEffect(() => {
        if (!user) return
        if (!settings?.study?.breakReminders) return

        const breakInterval = (settings?.study?.breakInterval || 45) * 60 * 1000

        const interval = setInterval(() => {
            const progress = getTodayProgress()
            if (progress.minutes > 0) {
                const key = `break-${Math.floor(progress.minutes / (settings?.study?.breakInterval || 45))}`
                if (!firedRef.current.has(key)) {
                    firedRef.current.add(key)
                    breakReminder(progress.minutes)
                }
            }
        }, breakInterval)

        return () => clearInterval(interval)
    }, [user, settings?.study?.breakReminders, settings?.study?.breakInterval])

    // ── 7) Study reminder (configurable time) ────────────────────────────
    useEffect(() => {
        if (!user) return
        if (!settings?.notifications?.studyReminders) return

        const checkMorningReminder = () => {
            const now = new Date()
            const reminderTime = settings?.notifications?.reminderTime || '09:00'
            const [rH, rM] = reminderTime.split(':').map(Number)
            const currentH = now.getHours()
            const currentM = now.getMinutes()

            // Within 5 minutes of the reminder time
            if (currentH === rH && Math.abs(currentM - rM) <= 5) {
                const streakInfo = getStreakInfo()
                if (!streakInfo.hasStudiedToday && !firedRef.current.has('morning-reminder')) {
                    firedRef.current.add('morning-reminder')
                    studyReminderMorning()
                }
            }
        }

        const interval = setInterval(checkMorningReminder, 60 * 1000) // check every minute
        return () => clearInterval(interval)
    }, [user, settings?.notifications?.studyReminders, settings?.notifications?.reminderTime])

    // This component renders nothing
    return null
}
