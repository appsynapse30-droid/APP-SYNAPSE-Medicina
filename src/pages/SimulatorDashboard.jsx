import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFSRS } from '../context/FSRSContext'
import {
    Activity,
    BookOpen,
    Brain,
    BrainCircuit,
    ChevronRight,
    Clock,
    Crosshair,
    Filter,
    Flame,
    Gauge,
    Layers,
    Play,
    Settings2,
    Target,
    Users
} from 'lucide-react'
import './SimulatorDashboard.css'

const SIMULATION_MODES = [
    {
        id: 'repaso',
        title: 'Repaso Espaciado (FSRS)',
        description: 'Estudio de tarjetas (flashcards) con algoritmo de repetición espaciada.',
        icon: Brain,
        color: '#f59e0b'
    },
    {
        id: 'examen',
        title: 'Modo Examen',
        description: 'Simula condiciones reales. Con tiempo y sin feedback inmediato.',
        icon: Clock,
        color: '#ff4b4b'
    },
    {
        id: 'tutor',
        title: 'Modo Tutor',
        description: 'Feedback "Depth-on-Demand" en tiempo real tras cada pregunta.',
        icon: BrainCircuit,
        color: '#10b981'
    },
    {
        id: 'reto',
        title: 'Reto Multijugador',
        description: 'Compite en vivo con otros estudiantes. Gana el más rápido y preciso.',
        icon: Users,
        color: '#8b5cf6'
    },
    {
        id: 'casos_dinamicos',
        title: 'Casos Dinámicos (OSCE/CCS)',
        description: 'Pacientes virtuales. Evalúa toma de decisiones y evolución clínica.',
        icon: Activity,
        color: '#0ea5e9'
    }
]

const LENGTH_OPTIONS = [
    { id: 'micro', label: 'Micro-Quiz', desc: '5-10 preguntas', time: '~10 min' },
    { id: 'standard', label: 'Estándar', desc: '40 preguntas', time: '1 hr' },
    { id: 'full', label: 'Completo', desc: '150 preguntas', time: '3+ hr' },
    { id: 'custom', label: 'Personalizado', desc: 'Elige cantidad', time: 'Variable' },
]

export default function SimulatorDashboard() {
    const navigate = useNavigate()
    const [selectedMode, setSelectedMode] = useState('tutor')
    const [selectedLength, setSelectedLength] = useState('standard')
    const [difficulty, setDifficulty] = useState(3) // 1 to 5
    const [questionState, setQuestionState] = useState('todas') // nuevas, incorrectas, marcadas, todas
    const [isStarting, setIsStarting] = useState(false)
    const { getDueCardsCount } = useFSRS()
    const [dueStats, setDueStats] = useState({ new: 0, due: 0, total: 0 })

    useEffect(() => {
        getDueCardsCount().then(stats => setDueStats(stats))
    }, [getDueCardsCount])

    const handleStartSimulation = () => {
        setIsStarting(true)
        // Simulate loading config and preparing simulation
        setTimeout(() => {
            if (selectedMode === 'repaso') {
                navigate('/study/session')
                return
            }

            navigate('/simulator/active', {
                state: {
                    config: {
                        mode: selectedMode,
                        length: selectedLength,
                        difficulty: difficulty,
                        questionState: questionState
                    }
                }
            })
        }, 1500)
    }

    return (
        <div className="simulator-dashboard-page">
            <header className="simulator-header">
                <div>
                    <h1>Centro de Estudio</h1>
                    <p>Configura tu bloque de estudio y desafía tus conocimientos</p>
                </div>
                <div className="simulator-stats">
                    <div className="stat-badge">
                        <Flame size={16} />
                        <span>Racha: 12 días</span>
                    </div>
                </div>
            </header>

            <div className="simulator-content-grid">
                <div className="simulator-main-col">
                    <section className="config-section">
                        <h2>
                            <Target size={20} />
                            Selecciona el Modo
                        </h2>
                        <div className="modes-grid">
                            {SIMULATION_MODES.map(mode => {
                                const Icon = mode.icon
                                const isActive = selectedMode === mode.id
                                return (
                                    <button
                                        key={mode.id}
                                        className={`mode-card ${isActive ? 'active' : ''}`}
                                        onClick={() => setSelectedMode(mode.id)}
                                        style={{ '--mode-color': mode.color }}
                                    >
                                        <div className="mode-icon-wrapper">
                                            <Icon size={24} />
                                        </div>
                                        <div className="mode-info">
                                            <h3>{mode.title}</h3>
                                            <p>{mode.description}</p>
                                        </div>
                                        {isActive && <div className="active-indicator" />}
                                    </button>
                                )
                            })}
                        </div>
                    </section>

                    <section className="config-section">
                        <h2>
                            <Layers size={20} />
                            Longitud del Bloque
                        </h2>
                        <div className="length-grid">
                            {LENGTH_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    className={`length-card ${selectedLength === opt.id ? 'active' : ''}`}
                                    onClick={() => setSelectedLength(opt.id)}
                                >
                                    <span className="length-label">{opt.label}</span>
                                    <span className="length-desc">{opt.desc}</span>
                                    <span className="length-time">{opt.time}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="simulator-sidebar-col">
                    <section className="config-section filter-panel">
                        <h2>
                            <Settings2 size={20} />
                            Filtros Avanzados
                        </h2>

                        <div className="filter-group">
                            <label>Dificultad (Martillos)</label>
                            <div className="difficulty-selector">
                                {[1, 2, 3, 4, 5].map(level => (
                                    <button
                                        key={level}
                                        className={`diff-btn level-${level} ${difficulty >= level ? 'active' : ''}`}
                                        onClick={() => setDifficulty(level)}
                                        onMouseEnter={(e) => {
                                            const btns = e.currentTarget.parentNode.children
                                            for(let i=0; i<btns.length; i++) {
                                                if (i < level) btns[i].classList.add('hover')
                                                else btns[i].classList.remove('hover')
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            const btns = e.currentTarget.parentNode.children
                                            for(let i=0; i<btns.length; i++) {
                                                btns[i].classList.remove('hover')
                                            }
                                        }}
                                    >
                                        <Gauge size={18} />
                                    </button>
                                ))}
                            </div>
                            <span className="diff-label">
                                {difficulty === 1 ? 'Muy Fácil' :
                                    difficulty === 2 ? 'Fácil' :
                                    difficulty === 3 ? 'Intermedio' :
                                    difficulty === 4 ? 'Difícil' : 'Experto'}
                            </span>
                        </div>

                        <div className="filter-group">
                            <label>Estado de Preguntas</label>
                            <div className="select-wrapper">
                                <select 
                                    value={questionState}
                                    onChange={(e) => setQuestionState(e.target.value)}
                                    className="custom-select"
                                >
                                    <option value="todas">Todas las mezcladas</option>
                                    <option value="nuevas">Solo Nuevas (Unseen)</option>
                                    <option value="incorrectas">Incorrectas Previas (Re-do)</option>
                                    <option value="marcadas">Marcadas/Favoritas</option>
                                </select>
                                <ChevronRight className="select-arrow" size={16} />
                            </div>
                        </div>

                        <div className="filter-group">
                            <label>Sistemas / Disciplinas</label>
                            <button className="open-topics-btn">
                                <Filter size={16} />
                                <span>Seleccionar Temas (Todos)</span>
                            </button>
                        </div>
                    </section>

                    <div className="start-section">
                        <div className="simulation-preview">
                            {selectedMode === 'repaso' ? (
                                <>
                                    <div className="preview-row">
                                        <span className="preview-label">Pendientes hoy:</span>
                                        <span className="preview-val">{dueStats.due + dueStats.new}</span>
                                    </div>
                                    <div className="preview-row">
                                        <span className="preview-label">Tarjetas Nuevas:</span>
                                        <span className="preview-val">{dueStats.new}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="preview-row">
                                        <span className="preview-label">Preguntas estimadas:</span>
                                        <span className="preview-val">
                                            {selectedLength === 'micro' ? '10' : selectedLength === 'standard' ? '40' : '150'}
                                        </span>
                                    </div>
                                    <div className="preview-row">
                                        <span className="preview-label">Duración aprox:</span>
                                        <span className="preview-val">
                                            {selectedLength === 'micro' ? '15 min' : selectedLength === 'standard' ? '60 min' : '3+ hrs'}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                        <button 
                            className={`start-sim-btn ${isStarting ? 'starting' : ''}`}
                            onClick={handleStartSimulation}
                            disabled={isStarting}
                        >
                            {isStarting ? (
                                <>
                                    <div className="spinner"></div>
                                    <span>Preparando Entorno...</span>
                                </>
                            ) : (
                                <>
                                    <Play size={20} fill="currentColor" />
                                    <span>Iniciar Simulación</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
