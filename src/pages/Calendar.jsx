import { useState, useEffect } from 'react'
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    X,
    Edit3,
    Trash2,
    Copy,
    Bell,
    BellOff,
    LayoutGrid,
    List,
    CalendarDays
} from 'lucide-react'
import { useCalendar, eventCategories } from '../context/CalendarContext'
import './Calendar.css'

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function Calendar() {
    const {
        events,
        selectedDate,
        setSelectedDate,
        currentView,
        setCurrentView,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventsForDate,
        getUpcomingEvents,
        hasEventsOnDate,
        duplicateEvent
    } = useCalendar()

    const [showEventModal, setShowEventModal] = useState(false)
    const [editingEvent, setEditingEvent] = useState(null)
    const [selectedDayEvents, setSelectedDayEvents] = useState([])
    const [showDayDetail, setShowDayDetail] = useState(false)

    // Estado del formulario de evento
    const [eventForm, setEventForm] = useState({
        title: '',
        date: '',
        startTime: '09:00',
        endTime: '10:00',
        category: 'estudio',
        location: '',
        description: '',
        reminder: true
    })

    // Actualizar eventos del día seleccionado
    useEffect(() => {
        const dayEvents = getEventsForDate(selectedDate)
        setSelectedDayEvents(dayEvents)
    }, [selectedDate, events])

    // Obtener días del mes para el grid
    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDay = firstDay.getDay()

        const days = []

        // Días del mes anterior
        const prevMonth = new Date(year, month, 0)
        const prevMonthDays = prevMonth.getDate()
        for (let i = startingDay - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthDays - i),
                isCurrentMonth: false
            })
        }

        // Días del mes actual
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true
            })
        }

        // Días del siguiente mes
        const remainingDays = 42 - days.length
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false
            })
        }

        return days
    }

    // Navegación del calendario
    const navigateMonth = (direction) => {
        const newDate = new Date(selectedDate)
        newDate.setMonth(newDate.getMonth() + direction)
        setSelectedDate(newDate)
    }

    const goToToday = () => {
        setSelectedDate(new Date())
    }

    // Manejar click en día
    const handleDayClick = (day) => {
        setSelectedDate(day.date)
        if (day.isCurrentMonth) {
            setShowDayDetail(true)
        }
    }

    // Abrir modal para nuevo evento
    const openNewEventModal = (date = selectedDate) => {
        setEditingEvent(null)
        setEventForm({
            title: '',
            date: date.toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '10:00',
            category: 'estudio',
            location: '',
            description: '',
            reminder: true
        })
        setShowEventModal(true)
    }

    // Abrir modal para editar evento
    const openEditEventModal = (event) => {
        setEditingEvent(event)
        setEventForm({
            title: event.title,
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            category: event.category,
            location: event.location || '',
            description: event.description || '',
            reminder: event.reminder
        })
        setShowEventModal(true)
    }

    // Guardar evento
    const handleSaveEvent = (e) => {
        e.preventDefault()
        if (!eventForm.title.trim()) return

        if (editingEvent) {
            updateEvent(editingEvent.id, eventForm)
        } else {
            addEvent(eventForm)
        }

        setShowEventModal(false)
        setEditingEvent(null)
    }

    // Eliminar evento
    const handleDeleteEvent = (id) => {
        if (window.confirm('¿Estás seguro de eliminar este evento?')) {
            deleteEvent(id)
        }
    }

    // Duplicar evento
    const handleDuplicateEvent = (id) => {
        duplicateEvent(id)
    }

    // Formatear fecha
    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00')
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        if (dateStr === today.toISOString().split('T')[0]) {
            return 'Hoy'
        } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
            return 'Mañana'
        }

        return date.toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        })
    }

    // Verificar si es hoy
    const isToday = (date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    // Verificar si está seleccionado
    const isSelected = (date) => {
        return date.toDateString() === selectedDate.toDateString()
    }

    const upcomingEvents = getUpcomingEvents(10)

    return (
        <div className="calendar-page">
            {/* Sidebar con próximos eventos */}
            <aside className="calendar-sidebar">
                <div className="sidebar-section">
                    <button className="btn-new-event" onClick={() => openNewEventModal()}>
                        <Plus size={18} />
                        Nuevo Evento
                    </button>
                </div>

                {/* Mini calendario */}
                <div className="mini-calendar">
                    <div className="mini-calendar-header">
                        <button onClick={() => navigateMonth(-1)}><ChevronLeft size={16} /></button>
                        <span>{MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}</span>
                        <button onClick={() => navigateMonth(1)}><ChevronRight size={16} /></button>
                    </div>
                    <div className="mini-calendar-grid">
                        {DAYS_OF_WEEK.map(day => (
                            <span key={day} className="mini-day-header">{day.charAt(0)}</span>
                        ))}
                        {getDaysInMonth(selectedDate).slice(0, 35).map((day, index) => (
                            <button
                                key={index}
                                className={`mini-day ${!day.isCurrentMonth ? 'other-month' : ''
                                    } ${isToday(day.date) ? 'today' : ''} ${isSelected(day.date) ? 'selected' : ''
                                    } ${hasEventsOnDate(day.date) ? 'has-events' : ''}`}
                                onClick={() => handleDayClick(day)}
                            >
                                {day.date.getDate()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Próximos eventos */}
                <div className="upcoming-section">
                    <h3>Próximos Eventos</h3>
                    <div className="upcoming-list">
                        {upcomingEvents.length === 0 ? (
                            <p className="no-events">No hay eventos próximos</p>
                        ) : (
                            upcomingEvents.map(event => (
                                <div
                                    key={event.id}
                                    className="upcoming-item"
                                    onClick={() => openEditEventModal(event)}
                                    style={{ borderLeftColor: eventCategories[event.category].color }}
                                >
                                    <span className="upcoming-date">{formatDate(event.date)}</span>
                                    <span className="upcoming-title">{event.title}</span>
                                    <span className="upcoming-time">
                                        <Clock size={12} />
                                        {event.startTime}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Leyenda de categorías */}
                <div className="categories-legend">
                    <h3>Categorías</h3>
                    <div className="legend-items">
                        {Object.entries(eventCategories).map(([key, cat]) => (
                            <div key={key} className="legend-item">
                                <span className="legend-dot" style={{ backgroundColor: cat.color }}></span>
                                <span>{cat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Contenido principal del calendario */}
            <main className="calendar-main">
                {/* Header del calendario */}
                <div className="calendar-header">
                    <div className="header-left">
                        <h1>
                            {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                        </h1>
                        <button className="btn-today" onClick={goToToday}>
                            Hoy
                        </button>
                        <div className="nav-buttons">
                            <button onClick={() => navigateMonth(-1)}>
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={() => navigateMonth(1)}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="view-toggle">
                            <button
                                className={currentView === 'month' ? 'active' : ''}
                                onClick={() => setCurrentView('month')}
                                title="Vista mensual"
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                className={currentView === 'week' ? 'active' : ''}
                                onClick={() => setCurrentView('week')}
                                title="Vista semanal"
                            >
                                <CalendarDays size={18} />
                            </button>
                            <button
                                className={currentView === 'list' ? 'active' : ''}
                                onClick={() => setCurrentView('list')}
                                title="Vista de lista"
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Vista mensual */}
                {currentView === 'month' && (
                    <div className="month-view">
                        <div className="weekday-header">
                            {DAYS_OF_WEEK.map(day => (
                                <div key={day} className="weekday">{day}</div>
                            ))}
                        </div>
                        <div className="days-grid">
                            {getDaysInMonth(selectedDate).map((day, index) => {
                                const dayEvents = getEventsForDate(day.date)
                                return (
                                    <div
                                        key={index}
                                        className={`day-cell ${!day.isCurrentMonth ? 'other-month' : ''
                                            } ${isToday(day.date) ? 'today' : ''} ${isSelected(day.date) ? 'selected' : ''
                                            }`}
                                        onClick={() => handleDayClick(day)}
                                    >
                                        <span className="day-number">{day.date.getDate()}</span>
                                        <div className="day-events">
                                            {dayEvents.slice(0, 3).map(event => (
                                                <div
                                                    key={event.id}
                                                    className="event-chip"
                                                    style={{
                                                        backgroundColor: eventCategories[event.category].bgColor,
                                                        color: eventCategories[event.category].color,
                                                        borderLeft: `3px solid ${eventCategories[event.category].color}`
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        openEditEventModal(event)
                                                    }}
                                                >
                                                    <span className="event-time">{event.startTime}</span>
                                                    <span className="event-title">{event.title}</span>
                                                </div>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <span className="more-events">
                                                    +{dayEvents.length - 3} más
                                                </span>
                                            )}
                                        </div>
                                        {day.isCurrentMonth && (
                                            <button
                                                className="add-event-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    openNewEventModal(day.date)
                                                }}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Vista semanal */}
                {currentView === 'week' && (
                    <WeekView
                        selectedDate={selectedDate}
                        getEventsForDate={getEventsForDate}
                        openEditEventModal={openEditEventModal}
                        openNewEventModal={openNewEventModal}
                    />
                )}

                {/* Vista de lista */}
                {currentView === 'list' && (
                    <ListView
                        events={upcomingEvents}
                        openEditEventModal={openEditEventModal}
                        handleDeleteEvent={handleDeleteEvent}
                        handleDuplicateEvent={handleDuplicateEvent}
                        formatDate={formatDate}
                    />
                )}
            </main>

            {/* Modal de detalle del día */}
            {showDayDetail && (
                <div className="modal-overlay" onClick={() => setShowDayDetail(false)}>
                    <div className="day-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {selectedDate.toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                })}
                            </h2>
                            <button className="close-btn" onClick={() => setShowDayDetail(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="day-events-list">
                            {selectedDayEvents.length === 0 ? (
                                <p className="no-events-message">
                                    No hay eventos para este día
                                </p>
                            ) : (
                                selectedDayEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className="day-event-card"
                                        style={{
                                            borderLeftColor: eventCategories[event.category].color
                                        }}
                                    >
                                        <div className="event-header">
                                            <span
                                                className="event-category-badge"
                                                style={{
                                                    backgroundColor: eventCategories[event.category].bgColor,
                                                    color: eventCategories[event.category].color
                                                }}
                                            >
                                                {eventCategories[event.category].icon} {eventCategories[event.category].label}
                                            </span>
                                            <div className="event-actions">
                                                <button onClick={() => openEditEventModal(event)}>
                                                    <Edit3 size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteEvent(event.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <h3>{event.title}</h3>
                                        <div className="event-details">
                                            <span><Clock size={14} /> {event.startTime} - {event.endTime}</span>
                                            {event.location && (
                                                <span><MapPin size={14} /> {event.location}</span>
                                            )}
                                        </div>
                                        {event.description && (
                                            <p className="event-description">{event.description}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        <button
                            className="btn-add-event-day"
                            onClick={() => {
                                setShowDayDetail(false)
                                openNewEventModal(selectedDate)
                            }}
                        >
                            <Plus size={18} />
                            Agregar Evento
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de evento */}
            {showEventModal && (
                <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
                    <div className="event-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingEvent ? 'Editar Evento' : 'Nuevo Evento'}</h2>
                            <button className="close-btn" onClick={() => setShowEventModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveEvent}>
                            <div className="form-group">
                                <label>Título del evento</label>
                                <input
                                    type="text"
                                    value={eventForm.title}
                                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                    placeholder="Ej: Examen de Patología"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fecha</label>
                                    <input
                                        type="date"
                                        value={eventForm.date}
                                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hora inicio</label>
                                    <input
                                        type="time"
                                        value={eventForm.startTime}
                                        onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hora fin</label>
                                    <input
                                        type="time"
                                        value={eventForm.endTime}
                                        onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Categoría</label>
                                <div className="category-selector">
                                    {Object.entries(eventCategories).map(([key, cat]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            className={`category-option ${eventForm.category === key ? 'selected' : ''}`}
                                            style={{
                                                backgroundColor: eventForm.category === key ? cat.bgColor : 'transparent',
                                                borderColor: cat.color,
                                                color: eventForm.category === key ? cat.color : 'var(--text-secondary)'
                                            }}
                                            onClick={() => setEventForm({ ...eventForm, category: key })}
                                        >
                                            {cat.icon} {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Ubicación (opcional)</label>
                                <input
                                    type="text"
                                    value={eventForm.location}
                                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                                    placeholder="Ej: Aula 304, Zoom, etc."
                                />
                            </div>

                            <div className="form-group">
                                <label>Descripción (opcional)</label>
                                <textarea
                                    value={eventForm.description}
                                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                                    placeholder="Agrega notas o detalles adicionales..."
                                    rows={3}
                                />
                            </div>

                            <div className="form-group reminder-toggle">
                                <label>
                                    <button
                                        type="button"
                                        className={`toggle-btn ${eventForm.reminder ? 'active' : ''}`}
                                        onClick={() => setEventForm({ ...eventForm, reminder: !eventForm.reminder })}
                                    >
                                        {eventForm.reminder ? <Bell size={18} /> : <BellOff size={18} />}
                                    </button>
                                    Recordatorio
                                </label>
                            </div>

                            <div className="modal-actions">
                                {editingEvent && (
                                    <button
                                        type="button"
                                        className="btn-delete"
                                        onClick={() => {
                                            handleDeleteEvent(editingEvent.id)
                                            setShowEventModal(false)
                                        }}
                                    >
                                        <Trash2 size={16} />
                                        Eliminar
                                    </button>
                                )}
                                <div className="modal-actions-right">
                                    <button type="button" className="btn-cancel" onClick={() => setShowEventModal(false)}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-save">
                                        {editingEvent ? 'Guardar Cambios' : 'Crear Evento'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

// Componente de vista semanal
function WeekView({ selectedDate, getEventsForDate, openEditEventModal, openNewEventModal }) {
    const getWeekDays = () => {
        const days = []
        const startOfWeek = new Date(selectedDate)
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek)
            day.setDate(day.getDate() + i)
            days.push(day)
        }
        return days
    }

    const weekDays = getWeekDays()
    const hours = Array.from({ length: 14 }, (_, i) => i + 7) // 7am to 8pm

    const isToday = (date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    return (
        <div className="week-view">
            <div className="week-header">
                <div className="time-column-header"></div>
                {weekDays.map((day, index) => (
                    <div key={index} className={`week-day-header ${isToday(day) ? 'today' : ''}`}>
                        <span className="day-name">{DAYS_OF_WEEK[day.getDay()]}</span>
                        <span className="day-number">{day.getDate()}</span>
                    </div>
                ))}
            </div>
            <div className="week-body">
                <div className="time-column">
                    {hours.map(hour => (
                        <div key={hour} className="time-slot">
                            {hour.toString().padStart(2, '0')}:00
                        </div>
                    ))}
                </div>
                {weekDays.map((day, dayIndex) => {
                    const dayEvents = getEventsForDate(day)
                    return (
                        <div key={dayIndex} className={`day-column ${isToday(day) ? 'today' : ''}`}>
                            {hours.map(hour => (
                                <div
                                    key={hour}
                                    className="hour-slot"
                                    onClick={() => openNewEventModal(day)}
                                />
                            ))}
                            {dayEvents.map(event => {
                                const startHour = parseInt(event.startTime.split(':')[0])
                                const startMinute = parseInt(event.startTime.split(':')[1])
                                const endHour = parseInt(event.endTime.split(':')[0])
                                const endMinute = parseInt(event.endTime.split(':')[1])
                                const top = ((startHour - 7) * 60 + startMinute) * (60 / 60)
                                const height = ((endHour - startHour) * 60 + (endMinute - startMinute)) * (60 / 60)

                                return (
                                    <div
                                        key={event.id}
                                        className="week-event"
                                        style={{
                                            top: `${top}px`,
                                            height: `${Math.max(height, 30)}px`,
                                            backgroundColor: eventCategories[event.category].bgColor,
                                            borderLeft: `3px solid ${eventCategories[event.category].color}`,
                                            color: eventCategories[event.category].color
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            openEditEventModal(event)
                                        }}
                                    >
                                        <span className="week-event-time">{event.startTime}</span>
                                        <span className="week-event-title">{event.title}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// Componente de vista de lista
function ListView({ events, openEditEventModal, handleDeleteEvent, handleDuplicateEvent, formatDate }) {
    if (events.length === 0) {
        return (
            <div className="list-view-empty">
                <CalendarIcon size={48} />
                <h3>No hay eventos próximos</h3>
                <p>Crea un nuevo evento para comenzar a organizar tu tiempo de estudio.</p>
            </div>
        )
    }

    // Agrupar eventos por fecha
    const groupedEvents = events.reduce((groups, event) => {
        const date = event.date
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(event)
        return groups
    }, {})

    return (
        <div className="list-view">
            {Object.entries(groupedEvents).map(([date, dayEvents]) => (
                <div key={date} className="list-day-group">
                    <div className="list-day-header">
                        <span className="list-date">{formatDate(date)}</span>
                        <span className="list-count">{dayEvents.length} evento(s)</span>
                    </div>
                    <div className="list-events">
                        {dayEvents.map(event => (
                            <div
                                key={event.id}
                                className="list-event-card"
                                style={{
                                    borderLeftColor: eventCategories[event.category].color
                                }}
                            >
                                <div className="list-event-time">
                                    <Clock size={14} />
                                    {event.startTime} - {event.endTime}
                                </div>
                                <div className="list-event-content">
                                    <h4>{event.title}</h4>
                                    <div className="list-event-meta">
                                        <span
                                            className="list-category"
                                            style={{
                                                backgroundColor: eventCategories[event.category].bgColor,
                                                color: eventCategories[event.category].color
                                            }}
                                        >
                                            {eventCategories[event.category].icon} {eventCategories[event.category].label}
                                        </span>
                                        {event.location && (
                                            <span className="list-location">
                                                <MapPin size={12} /> {event.location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="list-event-actions">
                                    <button title="Editar" onClick={() => openEditEventModal(event)}>
                                        <Edit3 size={16} />
                                    </button>
                                    <button title="Duplicar" onClick={() => handleDuplicateEvent(event.id)}>
                                        <Copy size={16} />
                                    </button>
                                    <button title="Eliminar" onClick={() => handleDeleteEvent(event.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
