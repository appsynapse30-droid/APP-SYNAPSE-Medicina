import { useState } from 'react'
import {
    Minus,
    Plus,
    List,
    Search,
    Highlighter,
    Download,
    Quote,
    Sparkles,
    Send,
    ToggleRight,
    Layers,
    FileText,
    Share2,
    MoreHorizontal
} from 'lucide-react'
import './StudyAI.css'

const chatMessages = [
    {
        id: 1,
        type: 'ai',
        content: "He notado que estás revisando el **ciclo cardíaco**. ¿Te gustaría que te explique la diferencia entre las presiones de sístole y diástole en el contexto del diagrama?",
        time: '10:23 AM'
    },
    {
        id: 2,
        type: 'user',
        content: "Sí, específicamente explícame la relación del bucle presión-volumen aquí."
    }
]

export default function StudyAI() {
    const [zoom, setZoom] = useState(120)
    const [messages, setMessages] = useState(chatMessages)
    const [inputValue, setInputValue] = useState('')
    const [contextEnabled, setContextEnabled] = useState(true)

    const handleSend = () => {
        if (!inputValue.trim()) return
        setMessages([...messages, { id: Date.now(), type: 'user', content: inputValue }])
        setInputValue('')
    }

    return (
        <div className="study-ai">
            {/* Document Viewer */}
            <div className="document-viewer">
                <div className="viewer-toolbar">
                    <div className="zoom-controls">
                        <button onClick={() => setZoom(Math.max(50, zoom - 10))}><Minus size={16} /></button>
                        <span>{zoom}%</span>
                        <button onClick={() => setZoom(Math.min(200, zoom + 10))}><Plus size={16} /></button>
                    </div>
                    <div className="doc-title">
                        <List size={16} />
                        <span>Anatomía de Gray: Cardiov...</span>
                    </div>
                    <div className="viewer-actions">
                        <button><Search size={16} /></button>
                        <button><Highlighter size={16} /></button>
                        <button><Download size={16} /></button>
                    </div>
                </div>

                <div className="document-content" style={{ transform: `scale(${zoom / 100})` }}>
                    <div className="document-page">
                        <div className="chapter-header">
                            <span className="chapter-label">CAPÍTULO 4</span>
                            <span className="page-number">Página 42</span>
                        </div>
                        <h1 className="chapter-title">El Ciclo Cardíaco</h1>

                        <div className="content-grid">
                            <div className="content-text">
                                <p>
                                    El ciclo cardíaco describe la secuencia de eventos que ocurren cuando el corazón
                                    late. Hay dos fases del ciclo cardíaco: la fase de diástole y la
                                    fase de sístole.
                                </p>
                                <p>
                                    En la <span className="highlight">fase de diástole</span>, los ventrículos del corazón
                                    están relajados y el corazón se llena de sangre. En la fase de sístole, los ventrículos
                                    se contraen y bombean sangre fuera del corazón hacia las arterias. Un ciclo cardíaco se
                                    completa cuando el corazón se llena de sangre y la sangre es bombeada fuera del corazón.
                                </p>

                                <h2>Cambios de Presión</h2>
                                <p>
                                    Durante el ciclo cardíaco, la presión dentro de las cámaras cardíacas sube y baja.
                                    Estos cambios de presión abren y cierran las válvulas del corazón. La apertura y
                                    cierre de estas válvulas producen sonidos que pueden escucharse con un estetoscopio.
                                </p>
                            </div>

                            <div className="content-figure">
                                <img
                                    src="https://images.unsplash.com/photo-1559757175-5700dde675bc?w=200&h=200&fit=crop"
                                    alt="Corte transversal del corazón"
                                />
                                <span className="figure-caption">Fig 4.1 Corte transversal del corazón humano</span>

                                <div className="text-selection-popup">
                                    <button className="popup-btn">
                                        <Quote size={14} />
                                        Citar
                                    </button>
                                    <button className="popup-btn ai">
                                        <Sparkles size={14} />
                                        Preguntar IA
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="content-list">
                            <p>Los eventos del ciclo cardíaco son:</p>
                            <ul>
                                <li><strong>Sístole auricular:</strong> Las aurículas se contraen, empujando sangre hacia los ventrículos.</li>
                                <li><strong>Sístole ventricular:</strong> Los ventrículos se contraen, la presión sube, las válvulas AV se cierran.</li>
                                <li><strong>Período de relajación:</strong> Los ventrículos se relajan, la presión baja, las válvulas semilunares se cierran.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Chat Panel */}
            <aside className="ai-panel">
                <div className="ai-panel-header">
                    <div className="ai-title">
                        <h2>Tutor Médico</h2>
                        <span className="ai-status">
                            <span className="status-dot"></span>
                            LEYENDO PÁGINA 42...
                        </span>
                    </div>
                    <button className="more-btn"><MoreHorizontal size={18} /></button>
                </div>

                <div className="chat-container">
                    <span className="chat-date">HOY 10:23 AM</span>

                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`chat-message ${msg.type}`}>
                                {msg.type === 'ai' && (
                                    <div className="ai-avatar">
                                        <Sparkles size={16} />
                                    </div>
                                )}
                                <div className="message-bubble">
                                    <span className="message-sender">
                                        {msg.type === 'ai' ? 'Synapse IA' : ''}
                                    </span>
                                    <p dangerouslySetInnerHTML={{
                                        __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<a href="#" class="inline-link">$1</a>')
                                    }} />
                                </div>
                                {msg.type === 'user' && (
                                    <div className="user-avatar">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=DrSmith" alt="Tú" />
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="typing-indicator">
                            <div className="ai-avatar"><Sparkles size={16} /></div>
                            <div className="typing-dots">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="chat-input-section">
                    <div className="chat-input-wrapper">
                        <input
                            type="text"
                            placeholder="Haz una pregunta de seguimiento..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button className="send-btn" onClick={handleSend}>
                            <Send size={18} />
                        </button>
                    </div>
                    <div className="context-toggle">
                        <ToggleRight size={18} className={contextEnabled ? 'active' : ''} />
                        <span>Contexto: Página 42</span>
                    </div>
                </div>

                <div className="quick-actions">
                    <div className="actions-header">
                        <h3>ACCIONES RÁPIDAS</h3>
                        <Sparkles size={14} />
                    </div>

                    <button className="action-card">
                        <div className="action-icon blue"><Layers size={18} /></div>
                        <div className="action-text">
                            <span>Generar 20 Flashcards</span>
                            <p>Basadas en el contenido del Capítulo 4</p>
                        </div>
                    </button>

                    <button className="action-card">
                        <div className="action-icon purple"><FileText size={18} /></div>
                        <div className="action-text">
                            <span>Resumir Conceptos Clave</span>
                            <p>Crear una hoja de resumen de 1 página</p>
                        </div>
                    </button>

                    <button className="action-card">
                        <div className="action-icon green"><Share2 size={18} /></div>
                        <div className="action-text">
                            <span>Crear Mapa Mental</span>
                            <p>Visualizar conexiones del sistema</p>
                        </div>
                    </button>
                </div>
            </aside>
        </div>
    )
}
