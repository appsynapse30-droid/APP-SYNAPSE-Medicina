/**
 * useNotifications Hook — SYNAPSE Notification System
 * 
 * Manages all in-app toast notifications via Sileo.
 * Provides pre-built notification helpers for:
 *  - Pomodoro start / finish
 *  - Daily study goal reached / remaining
 *  - Calendar event reminders
 *  - Auth events (login, logout, register)
 *  - Study session events
 *  - Settings saved
 *  - General success / error / info / warning
 */
import { useCallback, useRef } from 'react'
import { sileo } from 'sileo'

// ─── Notification Sound (Web Audio API — no external files needed) ───────────
const playNotificationSound = (type = 'chime') => {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (!AudioCtx) return
        const ctx = new AudioCtx()

        if (type === 'chime') {
            // Pleasant two-tone chime
            const notes = [880, 1108.73] // A5 → C#6
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.type = 'sine'
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15)
                gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15)
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.8)
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.start(ctx.currentTime + i * 0.15)
                osc.stop(ctx.currentTime + i * 0.15 + 0.8)
            })
        } else if (type === 'success') {
            // Triumphant three-tone arpeggio
            const notes = [523.25, 659.25, 783.99] // C5 → E5 → G5
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.type = 'sine'
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12)
                gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12)
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 1.0)
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.start(ctx.currentTime + i * 0.12)
                osc.stop(ctx.currentTime + i * 0.12 + 1.0)
            })
        } else if (type === 'alert') {
            // Attention-getting double beep
            for (let i = 0; i < 2; i++) {
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.type = 'triangle'
                osc.frequency.setValueAtTime(740, ctx.currentTime + i * 0.25)
                gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.25)
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 0.2)
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.start(ctx.currentTime + i * 0.25)
                osc.stop(ctx.currentTime + i * 0.25 + 0.2)
            }
        }

        // Clean up context after sounds finish
        setTimeout(() => ctx.close(), 2000)
    } catch (e) {
        // Silently fail — sound is a nice-to-have
        console.warn('Notification sound failed:', e)
    }
}

// ─── Notification presets ────────────────────────────────────────────────────

export function useNotifications() {
    // Track one-shot alerts (e.g. daily-goal-reached fires only once per session)
    const firedRef = useRef(new Set())

    // ─── Generic helpers ──────────────────────────────────────────────────────

    const success = useCallback((title, description, opts = {}) => {
        sileo.success({ title, description, ...opts })
    }, [])

    const error = useCallback((title, description, opts = {}) => {
        sileo.error({ title, description, ...opts })
    }, [])

    const info = useCallback((title, description, opts = {}) => {
        sileo.info({ title, description, ...opts })
    }, [])

    const warning = useCallback((title, description, opts = {}) => {
        sileo.warning({ title, description, ...opts })
    }, [])

    const loading = useCallback((title, description, opts = {}) => {
        return sileo.loading({ title, description, ...opts })
    }, [])

    // ─── Pomodoro ─────────────────────────────────────────────────────────────

    const pomodoroStarted = useCallback((studyMinutes) => {
        sileo.info({
            title: '🎯 Pomodoro Iniciado',
            description: `Sesión de ${studyMinutes} minutos. ¡Enfócate!`,
            button: {
                title: 'OK',
                onClick: () => { }
            }
        })
    }, [])

    const pomodoroCompleted = useCallback((studyMinutes) => {
        playNotificationSound('success')
        sileo.success({
            title: '✅ ¡Pomodoro Completado!',
            description: `Has completado ${studyMinutes} min de estudio. ¡Tómate un descanso!`,
            button: {
                title: 'Entendido',
                onClick: () => { }
            }
        })
    }, [])

    const pomodoroBreakStarted = useCallback((breakMinutes) => {
        playNotificationSound('chime')
        sileo.info({
            title: '☕ Tiempo de Descanso',
            description: `Descansa ${breakMinutes} min. Tu cerebro lo necesita.`,
        })
    }, [])

    const pomodoroBreakEnded = useCallback(() => {
        playNotificationSound('alert')
        sileo.warning({
            title: '⏰ Descanso Terminado',
            description: '¡Es hora de volver a estudiar!',
            button: {
                title: 'Continuar',
                onClick: () => { }
            }
        })
    }, [])

    // ─── Study Goals ──────────────────────────────────────────────────────────

    const dailyGoalReached = useCallback(() => {
        // Only fire once per browser session
        if (firedRef.current.has('daily-goal')) return
        firedRef.current.add('daily-goal')

        playNotificationSound('success')
        sileo.success({
            title: '🏆 ¡Meta Diaria Alcanzada!',
            description: '¡Felicidades! Has cumplido tu meta de estudio de hoy.',
            button: {
                title: '¡Genial!',
                onClick: () => { }
            }
        })
    }, [])

    const dailyGoalProgress = useCallback((percentage, remainingMinutes) => {
        const hours = Math.floor(remainingMinutes / 60)
        const mins = remainingMinutes % 60
        const timeStr = hours > 0 ? `${hours}h ${mins}min` : `${mins} min`

        if (percentage >= 75) {
            sileo.info({
                title: '🔥 ¡Casi lo logras!',
                description: `Llevas un ${percentage}%! Solo te faltan ${timeStr} para tu meta.`,
            })
        } else if (percentage >= 50) {
            sileo.info({
                title: '📈 Vas a mitad de camino',
                description: `${percentage}% completado. Faltan ${timeStr} para tu meta.`,
            })
        }
    }, [])

    const studyReminderMorning = useCallback(() => {
        sileo.info({
            title: '📚 ¡Buenos días, Médico!',
            description: 'Es momento de comenzar tu sesión de estudio del día.',
            button: {
                title: 'Estudiar',
                onClick: () => { }
            }
        })
    }, [])

    // ─── Streak ───────────────────────────────────────────────────────────────

    const streakMilestone = useCallback((streakDays) => {
        const msg = streakDays >= 30
            ? `🏅 ¡${streakDays} días de racha legendaria!`
            : streakDays >= 7
                ? `🔥 ¡${streakDays} días consecutivos!`
                : `💪 ¡${streakDays} días de racha!`

        sileo.success({
            title: msg,
            description: 'Tu constancia está dando frutos. ¡Sigue así!',
        })
    }, [])

    const streakAtRisk = useCallback(() => {
        sileo.warning({
            title: '⚠️ ¡Tu racha está en riesgo!',
            description: 'Aún no has estudiado hoy. Completa al menos una sesión.',
            button: {
                title: 'Estudiar Ahora',
                onClick: () => { }
            }
        })
    }, [])

    // ─── Calendar / Events ────────────────────────────────────────────────────

    const upcomingEvent = useCallback((eventTitle, timeUntil, category) => {
        const icons = {
            examen: '📝',
            estudio: '📖',
            clase: '🎓',
            grupo: '👥',
            seminario: '🎤',
            otro: '📌'
        }
        const icon = icons[category] || '📌'

        sileo.warning({
            title: `${icon} Evento Próximo`,
            description: `"${eventTitle}" comienza ${timeUntil}.`,
            button: {
                title: 'Ver Calendario',
                onClick: () => { }
            }
        })
    }, [])

    const eventToday = useCallback((eventTitle, startTime) => {
        sileo.info({
            title: '📆 Evento de Hoy',
            description: `"${eventTitle}" a las ${startTime}.`,
        })
    }, [])

    const examReminder = useCallback((examTitle, daysUntil) => {
        const urgency = daysUntil <= 1 ? 'error' : daysUntil <= 3 ? 'warning' : 'info'
        const method = urgency === 'error' ? sileo.error : urgency === 'warning' ? sileo.warning : sileo.info

        method({
            title: `📝 Examen ${daysUntil <= 1 ? '¡MAÑANA!' : `en ${daysUntil} días`}`,
            description: `"${examTitle}" — Asegúrate de repasar los temas clave.`,
            button: {
                title: 'Revisar',
                onClick: () => { }
            }
        })
    }, [])

    // ─── Study Session ────────────────────────────────────────────────────────

    const sessionStarted = useCallback((deckName) => {
        sileo.info({
            title: '🧠 Sesión de Estudio',
            description: deckName
                ? `Estudiando: "${deckName}". ¡Buena suerte!`
                : '¡Tu sesión ha comenzado! Concéntrate.',
        })
    }, [])

    const sessionCompleted = useCallback((cardsStudied, accuracy) => {
        sileo.success({
            title: '🏆 ¡Sesión Completada!',
            description: `${cardsStudied} tarjetas revisadas con ${accuracy}% de precisión.`,
        })
    }, [])

    const cardMastered = useCallback((count) => {
        if (count > 0 && count % 10 === 0) {
            sileo.success({
                title: '⭐ ¡Progreso Notable!',
                description: `Has dominado ${count} tarjetas. ¡Impresionante!`,
            })
        }
    }, [])

    // ─── Auth ─────────────────────────────────────────────────────────────────

    const welcomeBack = useCallback((displayName) => {
        sileo.success({
            title: `👋 ¡Bienvenido, ${displayName}!`,
            description: 'Continúa donde lo dejaste.',
        })
    }, [])

    const loggedOut = useCallback(() => {
        sileo.info({
            title: '👋 Sesión Cerrada',
            description: 'Has cerrado sesión correctamente.',
        })
    }, [])

    const accountCreated = useCallback(() => {
        sileo.success({
            title: '🎉 ¡Cuenta Creada!',
            description: 'Te hemos enviado un email de verificación.',
        })
    }, [])

    // ─── Settings ─────────────────────────────────────────────────────────────

    const settingsSaved = useCallback(() => {
        sileo.success({
            title: '💾 Configuración Guardada',
            description: 'Tus cambios se han guardado correctamente.',
        })
    }, [])

    const settingsReset = useCallback(() => {
        sileo.info({
            title: '🔄 Configuración Restaurada',
            description: 'Se han restaurado los valores por defecto.',
        })
    }, [])

    const dataExported = useCallback(() => {
        sileo.success({
            title: '📦 Datos Exportados',
            description: 'Tu archivo de configuración se ha descargado.',
        })
    }, [])

    const dataImported = useCallback(() => {
        sileo.success({
            title: '📥 Datos Importados',
            description: 'La configuración se ha importado correctamente.',
        })
    }, [])

    // ─── Library ──────────────────────────────────────────────────────────────

    const documentUploaded = useCallback((name) => {
        sileo.success({
            title: '📄 Documento Subido',
            description: `"${name}" se ha agregado a tu biblioteca.`,
        })
    }, [])

    const deckCreated = useCallback((name) => {
        sileo.success({
            title: '🃏 Mazo Creado',
            description: `"${name}" está listo para estudiar.`,
        })
    }, [])

    // ─── Break Reminder ───────────────────────────────────────────────────────

    const breakReminder = useCallback((minutesStudied) => {
        const hours = Math.floor(minutesStudied / 60)
        const mins = minutesStudied % 60
        const timeStr = hours > 0 ? `${hours}h ${mins}min` : `${mins} min`

        sileo.warning({
            title: '🧘 Hora de Descansar',
            description: `Llevas ${timeStr} estudiando. Haz una pausa para rendir mejor.`,
            button: {
                title: 'Tomar Descanso',
                onClick: () => { }
            }
        })
    }, [])

    // ─── Promise wrapper ──────────────────────────────────────────────────────

    const withPromise = useCallback((promise, options) => {
        return sileo.promise(promise, {
            loading: { title: options.loading || 'Procesando...' },
            success: options.success
                ? (typeof options.success === 'function'
                    ? options.success
                    : () => ({ title: options.success }))
                : () => ({ title: '¡Listo!' }),
            error: options.error
                ? (typeof options.error === 'function'
                    ? options.error
                    : () => ({ title: options.error }))
                : (err) => ({ title: 'Error', description: err?.message || 'Algo salió mal.' }),
        })
    }, [])

    // ─── Dismiss helpers ──────────────────────────────────────────────────────

    const dismiss = useCallback((id) => sileo.dismiss(id), [])
    const clearAll = useCallback(() => sileo.clear(), [])

    return {
        // Generic
        success, error, info, warning, loading, withPromise,
        dismiss, clearAll,

        // Pomodoro
        pomodoroStarted, pomodoroCompleted, pomodoroBreakStarted, pomodoroBreakEnded,

        // Study Goals
        dailyGoalReached, dailyGoalProgress, studyReminderMorning,

        // Streak
        streakMilestone, streakAtRisk,

        // Calendar / Events
        upcomingEvent, eventToday, examReminder,

        // Study Session
        sessionStarted, sessionCompleted, cardMastered,

        // Auth
        welcomeBack, loggedOut, accountCreated,

        // Settings
        settingsSaved, settingsReset, dataExported, dataImported,

        // Library
        documentUploaded, deckCreated,

        // Break
        breakReminder,
    }
}

export default useNotifications
