import { useState } from 'react'
import {
    Clock,
    Pause,
    X,
    Heart,
    Activity,
    Wind,
    Droplets,
    AlertCircle,
    AlertTriangle,
    Bot,
    User,
    BookOpen,
    Lightbulb,
    Send,
    Plus
} from 'lucide-react'
import './Simulations.css'

const timelineEvents = [
    {
        time: '00:00',
        type: 'system',
        label: 'Llegada',
        content: 'Paciente llegó en ambulancia. Se queja de dolor torácico opresivo que comenzó hace 30 minutos mientras hacía jardinería.'
    },
    {
        time: '00:05',
        type: 'action',
        label: 'TÚ',
        content: 'Ordenaste ECG de 12 derivaciones y niveles de Troponina I/T.'
    },
    {
        time: '00:08',
        type: 'result',
        label: 'Diagnóstico',
        content: 'Reporte ECG: Taquicardia sinusal con elevación del ST en derivaciones V1-V4. Cambios recíprocos en II, III, aVF.',
        hasImage: true
    },
    {
        time: '00:10',
        type: 'mentor',
        label: 'Observación',
        content: 'Revisa los hallazgos del ECG en las derivaciones anteriores. Considera los siguientes pasos inmediatos para la terapia de reperfusión.'
    }
]

const differentials = [
    { name: 'STEMI (Anterior)', probability: 85, color: 'blue' },
    { name: 'Disección Aórtica', probability: 10, color: 'gray' },
    { name: 'Embolismo Pulmonar', probability: 5, color: 'gray' }
]

const actionButtons = [
    'Administrar Aspirina',
    'Administrar Nitroglicerina',
    'Consultar Cardiología',
    'Preparar para Cath Lab'
]

export default function Simulations() {
    const [inputValue, setInputValue] = useState('')
    const [isPaused, setIsPaused] = useState(false)

    return (
        <div className="simulations">
            {/* Header */}
            <header className="sim-header">
                <div className="case-info">
                    <div className="case-icon">
                        <Heart size={20} />
                    </div>
                    <div className="case-details">
                        <h1>Caso #402: Dolor Torácico Agudo</h1>
                        <div className="case-meta">
                            <Clock size={14} />
                            <span>Tiempo Transcurrido: 00:14:22</span>
                            <span className="phase-badge critical">Fase Crítica</span>
                        </div>
                    </div>
                </div>
                <div className="sim-controls">
                    <button className="control-btn" onClick={() => setIsPaused(!isPaused)}>
                        <Pause size={16} />
                        {isPaused ? 'Continuar' : 'Pausar'}
                    </button>
                    <button className="control-btn danger">
                        Terminar Simulación
                    </button>
                </div>
            </header>

            <div className="sim-content">
                {/* Patient Sidebar */}
                <aside className="patient-sidebar">
                    <div className="patient-info">
                        <div className="patient-avatar">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe&backgroundColor=b6e3f4" alt="Juan Pérez" />
                        </div>
                        <div className="patient-details">
                            <h2>Juan Pérez</h2>
                            <p>54 años, Masculino</p>
                            <p className="patient-id">ID: #99283-A</p>
                        </div>
                    </div>

                    <div className="patient-tags">
                        <span className="tag blue">Hipertensión</span>
                        <span className="tag blue">Fumador</span>
                    </div>
                    <span className="tag red allergy">Alergia: Penicilina</span>

                    <div className="vitals-section">
                        <h3>SIGNOS VITALES ACTUALES</h3>
                        <div className="vitals-grid">
                            <div className="vital-card">
                                <div className="vital-header">
                                    <span>PA</span>
                                    <Activity size={14} className="up" />
                                </div>
                                <span className="vital-value">150/95</span>
                            </div>
                            <div className="vital-card">
                                <div className="vital-header">
                                    <span>FC</span>
                                    <Activity size={14} className="up" />
                                </div>
                                <span className="vital-value">102</span>
                            </div>
                            <div className="vital-card">
                                <div className="vital-header">
                                    <span>FR</span>
                                    <Wind size={14} />
                                </div>
                                <span className="vital-value">22</span>
                            </div>
                            <div className="vital-card">
                                <div className="vital-header">
                                    <span>O2</span>
                                    <Droplets size={14} className="ok" />
                                </div>
                                <span className="vital-value">94%</span>
                            </div>
                        </div>
                    </div>

                    <div className="symptoms-section">
                        <h3>SÍNTOMAS OBSERVADOS</h3>
                        <div className="symptom-card">
                            <div className="symptom-icon red">
                                <Heart size={18} />
                            </div>
                            <div className="symptom-details">
                                <h4>Dolor Subesternal</h4>
                                <p>Irradia al brazo izquierdo</p>
                            </div>
                        </div>
                        <div className="symptom-card">
                            <div className="symptom-icon blue">
                                <Droplets size={18} />
                            </div>
                            <div className="symptom-details">
                                <h4>Diaforesis</h4>
                                <p>Sudoración profusa observada</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Timeline */}
                <main className="timeline-section">
                    <div className="timeline">
                        {timelineEvents.map((event, index) => (
                            <div key={index} className={`timeline-event ${event.type}`}>
                                <span className="event-time">{event.time}</span>
                                <div className="event-content">
                                    <div className="event-header">
                                        <span className={`event-label ${event.type}`}>{event.type.toUpperCase()}</span>
                                        <span className="event-sublabel">{event.label}</span>
                                    </div>
                                    <p>{event.content}</p>
                                    {event.hasImage && (
                                        <div className="event-image">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/ECG_12derivations.png/640px-ECG_12derivations.png" alt="ECG" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="action-buttons">
                        {actionButtons.map((action) => (
                            <button key={action} className="action-pill">
                                {action}
                            </button>
                        ))}
                    </div>

                    <div className="input-section">
                        <button className="add-btn"><Plus size={18} /></button>
                        <input
                            type="text"
                            placeholder="Sugiere diagnóstico o siguiente acción..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button className="send-btn">
                            <Send size={18} />
                        </button>
                    </div>
                </main>

                {/* AI Analysis Panel */}
                <aside className="analysis-panel">
                    <div className="panel-header">
                        <Bot size={20} />
                        <h2>Análisis IA</h2>
                    </div>

                    <div className="differentials-section">
                        <h3>Probabilidad Diferencial</h3>
                        {differentials.map((d) => (
                            <div key={d.name} className="differential-item">
                                <div className="diff-header">
                                    <span>{d.name}</span>
                                    <span className="diff-percent">{d.probability}%</span>
                                </div>
                                <div className="diff-bar">
                                    <div
                                        className={`diff-fill ${d.color}`}
                                        style={{ width: `${d.probability}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="reasoning-section">
                        <h3>Razonamiento Experto</h3>
                        <p>
                            Tu decisión de ordenar un <a href="#">ECG inmediatamente</a> se alinea con el
                            protocolo estándar para dolor torácico agudo.
                        </p>
                        <div className="learning-point">
                            <Lightbulb size={16} />
                            <div>
                                <span>Punto de Aprendizaje</span>
                                <p>
                                    Nota el patrón de elevación del ST en V1-V4 indicando oclusión de la ADA.
                                    El tiempo hasta la angioplastia es crítico aquí.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="reading-section">
                        <h3>LECTURA RECOMENDADA</h3>
                        <a href="#" className="reading-link">
                            <BookOpen size={14} />
                            Guías AHA: Manejo del STEMI
                        </a>
                    </div>
                </aside>
            </div>
        </div>
    )
}
