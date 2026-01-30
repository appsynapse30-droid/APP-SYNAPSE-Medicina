import { createContext, useContext, useState, useEffect } from 'react'

const CalendarContext = createContext()

// Categorías de eventos con colores
export const eventCategories = {
    examen: {
        label: 'Examen',
        color: '#f85149',
        bgColor: 'rgba(248, 81, 73, 0.15)',
        icon: '📝'
    },
    estudio: {
        label: 'Sesión de Estudio',
        color: '#58a6ff',
        bgColor: 'rgba(88, 166, 255, 0.15)',
        icon: '📖'
    },
    clase: {
        label: 'Clase',
        color: '#3fb950',
        bgColor: 'rgba(63, 185, 80, 0.15)',
        icon: '🎓'
    },
    grupo: {
        label: 'Grupo de Estudio',
        color: '#8b5cf6',
        bgColor: 'rgba(139, 92, 246, 0.15)',
        icon: '👥'
    },
    seminario: {
        label: 'Seminario',
        color: '#f0883e',
        bgColor: 'rgba(240, 136, 62, 0.15)',
        icon: '🎤'
    },
    otro: {
        label: 'Otro',
        color: '#8b949e',
        bgColor: 'rgba(139, 148, 158, 0.15)',
        icon: '📌'
    }
}

// Eventos de ejemplo iniciales
const initialEvents = [
    {
        id: 1,
        title: 'Parcial de Patología',
        date: getDateString(1), // Mañana
        startTime: '09:00',
        endTime: '11:00',
        category: 'examen',
        location: 'Aula 304',
        description: 'Examen parcial que cubre temas de patología general y específica.',
        reminder: true
    },
    {
        id: 2,
        title: 'Grupo de Estudio: Anatomía',
        date: getDateString(2), // En 2 días
        startTime: '14:00',
        endTime: '16:00',
        category: 'grupo',
        location: 'Biblioteca Sala A',
        description: 'Repaso de anatomía del sistema nervioso.',
        reminder: true
    },
    {
        id: 3,
        title: 'Seminario Dr. House',
        date: getDateString(3), // En 3 días
        startTime: '10:00',
        endTime: '12:00',
        category: 'seminario',
        location: 'Zoom Online',
        description: 'Conferencia sobre diagnóstico diferencial.',
        reminder: false
    },
    {
        id: 4,
        title: 'Clase de Farmacología',
        date: getDateString(0), // Hoy
        startTime: '08:00',
        endTime: '10:00',
        category: 'clase',
        location: 'Aula Magna',
        description: 'Mecanismos de acción de los fármacos antihipertensivos.',
        reminder: true
    },
    {
        id: 5,
        title: 'Repaso: Cardiología',
        date: getDateString(0), // Hoy
        startTime: '16:00',
        endTime: '18:00',
        category: 'estudio',
        location: 'Casa',
        description: 'Estudiar ciclo cardíaco y electrocardiograma.',
        reminder: false
    }
]

// Helper para obtener fecha relativa en formato YYYY-MM-DD
function getDateString(daysFromNow) {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date.toISOString().split('T')[0]
}

export function CalendarProvider({ children }) {
    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem('synapse_calendar_events')
        return saved ? JSON.parse(saved) : initialEvents
    })

    const [selectedDate, setSelectedDate] = useState(new Date())
    const [currentView, setCurrentView] = useState('month') // month, week, day

    // Persistir eventos en localStorage
    useEffect(() => {
        localStorage.setItem('synapse_calendar_events', JSON.stringify(events))
    }, [events])

    // Agregar evento
    const addEvent = (eventData) => {
        const newEvent = {
            ...eventData,
            id: Date.now(),
            createdAt: new Date().toISOString()
        }
        setEvents(prev => [...prev, newEvent])
        return newEvent
    }

    // Actualizar evento
    const updateEvent = (id, updates) => {
        setEvents(prev => prev.map(event =>
            event.id === id ? { ...event, ...updates, updatedAt: new Date().toISOString() } : event
        ))
    }

    // Eliminar evento
    const deleteEvent = (id) => {
        setEvents(prev => prev.filter(event => event.id !== id))
    }

    // Obtener eventos para una fecha específica
    const getEventsForDate = (date) => {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0]
        return events
            .filter(event => event.date === dateStr)
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
    }

    // Obtener eventos para un rango de fechas
    const getEventsForRange = (startDate, endDate) => {
        const start = startDate.toISOString().split('T')[0]
        const end = endDate.toISOString().split('T')[0]
        return events
            .filter(event => event.date >= start && event.date <= end)
            .sort((a, b) => {
                if (a.date !== b.date) return a.date.localeCompare(b.date)
                return a.startTime.localeCompare(b.startTime)
            })
    }

    // Obtener próximos eventos (para Dashboard)
    const getUpcomingEvents = (limit = 5) => {
        const today = new Date().toISOString().split('T')[0]
        return events
            .filter(event => event.date >= today)
            .sort((a, b) => {
                if (a.date !== b.date) return a.date.localeCompare(b.date)
                return a.startTime.localeCompare(b.startTime)
            })
            .slice(0, limit)
    }

    // Verificar si una fecha tiene eventos
    const hasEventsOnDate = (date) => {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0]
        return events.some(event => event.date === dateStr)
    }

    // Obtener eventos para el mes actual
    const getEventsForMonth = (year, month) => {
        const startOfMonth = new Date(year, month, 1).toISOString().split('T')[0]
        const endOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0]
        return events.filter(event => event.date >= startOfMonth && event.date <= endOfMonth)
    }

    // Duplicar evento
    const duplicateEvent = (id) => {
        const eventToDuplicate = events.find(e => e.id === id)
        if (eventToDuplicate) {
            const newEvent = {
                ...eventToDuplicate,
                id: Date.now(),
                title: `${eventToDuplicate.title} (copia)`,
                createdAt: new Date().toISOString()
            }
            setEvents(prev => [...prev, newEvent])
            return newEvent
        }
        return null
    }

    const value = {
        events,
        selectedDate,
        setSelectedDate,
        currentView,
        setCurrentView,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventsForDate,
        getEventsForRange,
        getUpcomingEvents,
        hasEventsOnDate,
        getEventsForMonth,
        duplicateEvent,
        eventCategories
    }

    return (
        <CalendarContext.Provider value={value}>
            {children}
        </CalendarContext.Provider>
    )
}

export function useCalendar() {
    const context = useContext(CalendarContext)
    if (!context) {
        throw new Error('useCalendar debe usarse dentro de un CalendarProvider')
    }
    return context
}

export default CalendarContext
