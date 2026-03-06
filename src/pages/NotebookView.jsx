import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStudyAI } from '../context/StudyAIContext'
import AISlideCard from '../components/study/AISlideCard'
import {
    ArrowLeft,
    Plus,
    Send,
    Sparkles,
    MessageSquare,
    MoreVertical,
    Trash2,
    Pencil,
    Menu,
    X,
    Brain,
    Loader2
} from 'lucide-react'
import './NotebookView.css'

export default function NotebookView() {
    const { notebookId } = useParams()
    const navigate = useNavigate()
    const {
        allNotebooks,
        chats,
        messages,
        activeChatId,
        activeMessages,
        isAILoading,
        setActiveNotebookId,
        setActiveChatId,
        createChat,
        deleteChat,
        renameChat,
        sendMessage
    } = useStudyAI()

    const [inputValue, setInputValue] = useState('')
    const [showSidebar, setShowSidebar] = useState(false)
    const [editingChatId, setEditingChatId] = useState(null)
    const [editChatTitle, setEditChatTitle] = useState('')
    const [chatMenuId, setChatMenuId] = useState(null)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    const notebook = allNotebooks.find(n => n.id === notebookId)
    const notebookChats = chats[notebookId] || []

    // Set active notebook on mount
    useEffect(() => {
        if (notebookId) {
            setActiveNotebookId(notebookId)
            // Auto-select first chat if none selected
            const nbChats = chats[notebookId] || []
            if (nbChats.length > 0 && !activeChatId) {
                setActiveChatId(nbChats[0].id)
            }
        }
    }, [notebookId])

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [activeMessages, isAILoading])

    if (!notebook) {
        return (
            <div className="notebook-not-found">
                <Brain size={48} />
                <h2>Cuaderno no encontrado</h2>
                <button onClick={() => navigate('/study')}>Volver a cuadernos</button>
            </div>
        )
    }

    const handleSend = () => {
        if (!inputValue.trim() || isAILoading) return
        if (!activeChatId) {
            // Create a new chat if none exists
            const newChat = createChat(notebookId, inputValue.trim().slice(0, 50))
            sendMessage(newChat.id, inputValue.trim())
        } else {
            sendMessage(activeChatId, inputValue.trim())
        }
        setInputValue('')
    }

    const handleNewChat = () => {
        const newChat = createChat(notebookId)
        setActiveChatId(newChat.id)
        setShowSidebar(false)
        setTimeout(() => inputRef.current?.focus(), 100)
    }

    const handleSelectChat = (chatId) => {
        setActiveChatId(chatId)
        setShowSidebar(false)
    }

    const handleDeleteChat = (chatId) => {
        deleteChat(chatId, notebookId)
        setChatMenuId(null)
    }

    const startRenameChat = (chat) => {
        setEditingChatId(chat.id)
        setEditChatTitle(chat.title)
        setChatMenuId(null)
    }

    const finishRenameChat = () => {
        if (editChatTitle.trim() && editingChatId) {
            renameChat(editingChatId, notebookId, editChatTitle.trim())
        }
        setEditingChatId(null)
        setEditChatTitle('')
    }

    const renderMessage = (msg) => {
        if (msg.role === 'user') {
            return (
                <div key={msg.id} className="chat-msg user-msg">
                    <div className="msg-bubble user-bubble">
                        <p>{msg.content}</p>
                    </div>
                </div>
            )
        }

        if (msg.contentType === 'slide') {
            let slideData
            try {
                slideData = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content
            } catch {
                slideData = null
            }

            if (slideData) {
                return (
                    <div key={msg.id} className="chat-msg ai-msg">
                        <div className="ai-msg-avatar">
                            <Sparkles size={14} />
                        </div>
                        <div className="ai-msg-content">
                            <AISlideCard slideData={slideData} />
                        </div>
                    </div>
                )
            }
        }

        // Fallback: plain text AI message
        return (
            <div key={msg.id} className="chat-msg ai-msg">
                <div className="ai-msg-avatar">
                    <Sparkles size={14} />
                </div>
                <div className="msg-bubble ai-bubble">
                    <p>{msg.content}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="notebook-view">
            {/* Sidebar Overlay (mobile) */}
            {showSidebar && (
                <div className="sidebar-overlay" onClick={() => setShowSidebar(false)} />
            )}

            {/* Chats Sidebar */}
            <aside className={`chats-sidebar ${showSidebar ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-notebook-info">
                        <span className="sidebar-notebook-icon" style={{ background: `${notebook.color}20` }}>
                            {notebook.icon}
                        </span>
                        <div className="sidebar-notebook-text">
                            <h3>{notebook.title}</h3>
                            {notebook.specialty && (
                                <span style={{ color: notebook.color }}>{notebook.specialty}</span>
                            )}
                        </div>
                    </div>
                    <button className="sidebar-close-btn" onClick={() => setShowSidebar(false)}>
                        <X size={18} />
                    </button>
                </div>

                <button className="new-chat-btn" onClick={handleNewChat}>
                    <Plus size={16} />
                    <span>Nuevo Chat</span>
                </button>

                <div className="chats-list">
                    {notebookChats.length > 0 ? (
                        notebookChats.map(chat => (
                            <div
                                key={chat.id}
                                className={`chat-list-item ${activeChatId === chat.id ? 'active' : ''}`}
                                onClick={() => handleSelectChat(chat.id)}
                            >
                                <MessageSquare size={14} className="chat-item-icon" />

                                {editingChatId === chat.id ? (
                                    <input
                                        className="chat-rename-input"
                                        value={editChatTitle}
                                        onChange={(e) => setEditChatTitle(e.target.value)}
                                        onBlur={finishRenameChat}
                                        onKeyDown={(e) => e.key === 'Enter' && finishRenameChat()}
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <span className="chat-item-title">{chat.title}</span>
                                )}

                                <button
                                    className="chat-item-menu"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setChatMenuId(chatMenuId === chat.id ? null : chat.id)
                                    }}
                                >
                                    <MoreVertical size={14} />
                                </button>

                                {chatMenuId === chat.id && (
                                    <div className="chat-item-dropdown" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => startRenameChat(chat)}>
                                            <Pencil size={12} />
                                            <span>Renombrar</span>
                                        </button>
                                        <button className="delete-action" onClick={() => handleDeleteChat(chat.id)}>
                                            <Trash2 size={12} />
                                            <span>Eliminar</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="chats-empty">
                            <MessageSquare size={24} />
                            <p>Sin chats aún</p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="chat-main">
                {/* Chat Header */}
                <div className="chat-header">
                    <div className="chat-header-left">
                        <button className="header-back-btn" onClick={() => navigate('/study')}>
                            <ArrowLeft size={18} />
                        </button>
                        <button className="header-menu-btn" onClick={() => setShowSidebar(true)}>
                            <Menu size={18} />
                        </button>
                        <div className="chat-header-info">
                            <h2>
                                {activeChatId
                                    ? notebookChats.find(c => c.id === activeChatId)?.title || 'Chat'
                                    : notebook.title
                                }
                            </h2>
                            <span className="chat-header-status">
                                <span className="status-dot-live" />
                                Synapse IA • Especialista Médico
                            </span>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="messages-area">
                    {activeMessages.length > 0 ? (
                        <div className="messages-list">
                            {activeMessages.map(msg => renderMessage(msg))}

                            {isAILoading && (
                                <div className="chat-msg ai-msg">
                                    <div className="ai-msg-avatar">
                                        <Sparkles size={14} />
                                    </div>
                                    <div className="ai-loading-indicator">
                                        <Loader2 size={18} className="spin" />
                                        <span>Synapse está analizando...</span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    ) : (
                        <div className="chat-welcome">
                            <div className="welcome-icon" style={{ background: `${notebook.color}15` }}>
                                <span style={{ fontSize: '40px' }}>{notebook.icon}</span>
                            </div>
                            <h2>{notebook.title}</h2>
                            <p>Hazme cualquier pregunta sobre <strong>{notebook.specialty || 'medicina'}</strong>. Te responderé con láminas detalladas y estructuradas.</p>

                            <div className="welcome-suggestions">
                                <p className="suggestions-label">
                                    <Sparkles size={14} />
                                    Sugerencias para empezar
                                </p>
                                <div className="suggestions-grid">
                                    {getSuggestions(notebook.specialty).map((suggestion, i) => (
                                        <button
                                            key={i}
                                            className="suggestion-chip"
                                            onClick={() => {
                                                setInputValue(suggestion)
                                                inputRef.current?.focus()
                                            }}
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="chat-input-area">
                    <div className="chat-input-container">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Pregunta sobre cualquier tema médico..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            disabled={isAILoading}
                        />
                        <button
                            className={`send-button ${inputValue.trim() ? 'active' : ''}`}
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isAILoading}
                        >
                            {isAILoading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                        </button>
                    </div>
                    <p className="input-hint">
                        <Sparkles size={10} />
                        Las respuestas se presentan como láminas interactivas
                    </p>
                </div>
            </main>
        </div>
    )
}

// ── Suggestions per specialty ──
function getSuggestions(specialty) {
    const map = {
        'Cardiología': [
            '¿Cuáles son las fases del ciclo cardíaco?',
            'Explícame la fisiopatología de la insuficiencia cardíaca',
            '¿Cómo se clasifican las arritmias cardíacas?',
            '¿Qué es un infarto agudo de miocardio?'
        ],
        'Neurología': [
            '¿Cuáles son los 12 pares craneales y sus funciones?',
            'Explícame las vías motoras piramidales',
            '¿Cómo se evalúa la escala de Glasgow?',
            '¿Qué es un accidente cerebrovascular?'
        ],
        'Farmacología': [
            '¿Cuáles son las fases de la farmacocinética?',
            'Explícame los mecanismos de acción de los antibióticos',
            '¿Qué son las interacciones farmacológicas?',
            '¿Cómo funcionan los AINEs?'
        ],
        'Gastroenterología': [
            '¿Cuáles son las causas de la úlcera péptica?',
            'Explícame el síndrome de intestino irritable',
            '¿Cómo se diagnostica la hepatitis?',
            '¿Qué es la enfermedad de Crohn?'
        ]
    }

    return map[specialty] || [
        '¿Cuáles son los signos vitales normales?',
        'Explícame el sistema inmunológico',
        '¿Cómo funciona la hemostasia?',
        '¿Qué es la homeostasis?'
    ]
}
