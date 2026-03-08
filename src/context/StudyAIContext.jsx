import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'

const StudyAIContext = createContext(null)

// ==========================================
// MOCK DATA — será reemplazado por N8N
// ==========================================

const SPECIALTIES = [
    'Cardiología', 'Neurología', 'Gastroenterología', 'Neumología',
    'Endocrinología', 'Nefrología', 'Hematología', 'Reumatología',
    'Infectología', 'Dermatología', 'Pediatría', 'Ginecología',
    'Traumatología', 'Urología', 'Oftalmología', 'Psiquiatría',
    'Anatomía', 'Fisiología', 'Farmacología', 'Bioquímica'
]

const NOTEBOOK_ICONS = ['📚', '🧠', '❤️', '🫁', '🦴', '💊', '🔬', '🩺', '🧬', '🏥', '👁️', '🦷', '🩻', '💉', '🧪']

const NOTEBOOK_COLORS = [
    '#58a6ff', '#8b5cf6', '#3fb950', '#f0883e',
    '#f85149', '#39d5ff', '#f472b6', '#f7c948'
]

// Datos mock de cuadernos iniciales
const INITIAL_NOTEBOOKS = [
    {
        id: 'nb-1',
        title: 'Cardiología Clínica',
        description: 'Estudio del sistema cardiovascular',
        icon: '❤️',
        color: '#f85149',
        specialty: 'Cardiología',
        isPinned: true,
        chatsCount: 3,
        createdAt: new Date('2026-02-20'),
        updatedAt: new Date('2026-03-04')
    },
    {
        id: 'nb-2',
        title: 'Neuroanatomía',
        description: 'Estructuras del SNC y SNP',
        icon: '🧠',
        color: '#8b5cf6',
        specialty: 'Neurología',
        isPinned: false,
        chatsCount: 2,
        createdAt: new Date('2026-02-25'),
        updatedAt: new Date('2026-03-03')
    },
    {
        id: 'nb-3',
        title: 'Farmacología Básica',
        description: 'Mecanismos de acción y farmacocinética',
        icon: '💊',
        color: '#3fb950',
        specialty: 'Farmacología',
        isPinned: false,
        chatsCount: 1,
        createdAt: new Date('2026-03-01'),
        updatedAt: new Date('2026-03-02')
    }
]

// Chats mock por cuaderno
const INITIAL_CHATS = {
    'nb-1': [
        { id: 'chat-1', notebookId: 'nb-1', title: 'Ciclo Cardíaco', createdAt: new Date('2026-03-04'), updatedAt: new Date('2026-03-04') },
        { id: 'chat-2', notebookId: 'nb-1', title: 'Insuficiencia Cardíaca', createdAt: new Date('2026-03-03'), updatedAt: new Date('2026-03-03') },
        { id: 'chat-3', notebookId: 'nb-1', title: 'Arritmias', createdAt: new Date('2026-03-02'), updatedAt: new Date('2026-03-02') },
    ],
    'nb-2': [
        { id: 'chat-4', notebookId: 'nb-2', title: 'Pares Craneales', createdAt: new Date('2026-03-03'), updatedAt: new Date('2026-03-03') },
        { id: 'chat-5', notebookId: 'nb-2', title: 'Vías Motoras', createdAt: new Date('2026-03-01'), updatedAt: new Date('2026-03-01') },
    ],
    'nb-3': [
        { id: 'chat-6', notebookId: 'nb-3', title: 'Antibióticos', createdAt: new Date('2026-03-02'), updatedAt: new Date('2026-03-02') },
    ]
}

// Mensajes mock por chat
const INITIAL_MESSAGES = {
    'chat-1': [
        {
            id: 'msg-1',
            chatId: 'chat-1',
            role: 'user',
            content: '¿Puedes explicarme las fases del ciclo cardíaco?',
            contentType: 'text',
            createdAt: new Date('2026-03-04T10:00:00')
        },
        {
            id: 'msg-2',
            chatId: 'chat-1',
            role: 'assistant',
            content: JSON.stringify({
                title: 'El Ciclo Cardíaco',
                subtitle: 'Fases y eventos mecánicos del corazón',
                sections: [
                    {
                        icon: '📋',
                        title: 'Definición',
                        content: 'El ciclo cardíaco comprende todos los eventos que ocurren desde el inicio de un latido hasta el inicio del siguiente. Tiene una duración aproximada de **0.8 segundos** a una frecuencia cardíaca de 75 lpm.'
                    },
                    {
                        icon: '🔬',
                        title: 'Fases del Ciclo',
                        content: '',
                        list: [
                            '**Sístole auricular** — Contracción de las aurículas que impulsa el 20-30% del llenado ventricular final (la "patada auricular").',
                            '**Contracción isovolumétrica** — Los ventrículos se contraen con todas las válvulas cerradas. La presión sube rápidamente sin cambio de volumen.',
                            '**Eyección ventricular** — Se abren las válvulas semilunares cuando la presión ventricular supera la aórtica/pulmonar. Fase rápida + fase lenta.',
                            '**Relajación isovolumétrica** — Los ventrículos se relajan con todas las válvulas cerradas. La presión cae sin cambio de volumen.',
                            '**Llenado ventricular** — Se abren las válvulas AV. Llenado rápido (70%), diástasis, y sístole auricular (30%).'
                        ]
                    },
                    {
                        icon: '📊',
                        title: 'Presiones Normales',
                        content: '',
                        table: {
                            headers: ['Cámara', 'Sistólica', 'Diastólica'],
                            rows: [
                                ['Ventrículo Izquierdo', '120 mmHg', '0-10 mmHg'],
                                ['Ventrículo Derecho', '25 mmHg', '0-5 mmHg'],
                                ['Aorta', '120 mmHg', '80 mmHg'],
                                ['A. Pulmonar', '25 mmHg', '10 mmHg']
                            ]
                        }
                    },
                    {
                        icon: '💡',
                        title: 'Perla Clínica',
                        content: 'El primer ruido cardíaco (S1) corresponde al cierre de las válvulas AV (mitral y tricúspide) al inicio de la sístole ventricular. El segundo ruido (S2) corresponde al cierre de las válvulas semilunares (aórtica y pulmonar) al final de la sístole.',
                        highlight: true
                    }
                ]
            }),
            contentType: 'slide',
            createdAt: new Date('2026-03-04T10:00:05')
        }
    ]
}

// Respuestas simuladas de la IA
const SIMULATED_RESPONSES = [
    {
        title: 'Respuesta del Especialista',
        subtitle: 'Análisis médico detallado',
        sections: [
            {
                icon: '📋',
                title: 'Definición',
                content: 'Este es un tema fundamental en la medicina. Permíteme explicarte los conceptos clave de manera estructurada.'
            },
            {
                icon: '🔬',
                title: 'Fisiopatología',
                content: 'Los mecanismos subyacentes involucran múltiples vías fisiológicas que interactúan entre sí.',
                list: [
                    '**Mecanismo primario** — Alteración de la homeostasis celular.',
                    '**Mecanismo secundario** — Respuesta inflamatoria y activación inmune.',
                    '**Mecanismo compensatorio** — Adaptaciones fisiológicas del organismo.'
                ]
            },
            {
                icon: '🩺',
                title: 'Manifestaciones Clínicas',
                content: 'Los signos y síntomas pueden variar en presentación y severidad.',
                list: [
                    'Síntoma principal de presentación.',
                    'Signos asociados en la exploración física.',
                    'Hallazgos en estudios complementarios.'
                ]
            },
            {
                icon: '💊',
                title: 'Abordaje Terapéutico',
                content: 'El tratamiento se basa en la evidencia actual y las guías de práctica clínica.',
                list: [
                    '**Primera línea** — Medidas generales y tratamiento farmacológico inicial.',
                    '**Segunda línea** — Ajuste terapéutico según respuesta.',
                    '**Casos refractarios** — Considerar intervenciones avanzadas.'
                ]
            },
            {
                icon: '💡',
                title: 'Perla Clínica',
                content: 'Recuerda siempre correlacionar los hallazgos clínicos con el contexto del paciente. La medicina basada en evidencia es la base, pero el juicio clínico es insustituible.',
                highlight: true
            }
        ]
    }
]

// ==========================================
// PROVIDER
// ==========================================

// Funciones auxiliares para LocalStorage
const loadFromStorage = (key, defaultData) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultData;
    } catch (e) {
        return defaultData;
    }
}

export function StudyAIProvider({ children }) {
    const { user } = useAuth()

    // Inicializar desde localStorage
    const [notebooks, setNotebooks] = useState(() => loadFromStorage('study_ai_notebooks', INITIAL_NOTEBOOKS))
    const [chats, setChats] = useState(() => loadFromStorage('study_ai_chats', INITIAL_CHATS))
    const [messages, setMessages] = useState(() => loadFromStorage('study_ai_messages', INITIAL_MESSAGES))

    const [activeNotebookId, setActiveNotebookId] = useState(null)
    const [activeChatId, setActiveChatId] = useState(null)
    const [isAILoading, setIsAILoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Guardar en localStorage cuando cambien
    useEffect(() => {
        localStorage.setItem('study_ai_notebooks', JSON.stringify(notebooks));
    }, [notebooks]);

    useEffect(() => {
        localStorage.setItem('study_ai_chats', JSON.stringify(chats));
    }, [chats]);

    useEffect(() => {
        localStorage.setItem('study_ai_messages', JSON.stringify(messages));
    }, [messages]);

    // ── Computed values ──
    const activeNotebook = notebooks.find(n => n.id === activeNotebookId) || null
    const activeChats = activeNotebookId ? (chats[activeNotebookId] || []) : []
    const activeMessages = activeChatId ? (messages[activeChatId] || []) : []

    const filteredNotebooks = notebooks.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.specialty && n.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    // ── Notebook CRUD ──
    const createNotebook = useCallback((data) => {
        const newNotebook = {
            id: `nb-${Date.now()}`,
            title: data.title || 'Nuevo Cuaderno',
            description: data.description || '',
            icon: data.icon || '📚',
            color: data.color || '#58a6ff',
            specialty: data.specialty || '',
            isPinned: false,
            chatsCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        setNotebooks(prev => [newNotebook, ...prev])
        setChats(prev => ({ ...prev, [newNotebook.id]: [] }))
        return newNotebook
    }, [])

    const updateNotebook = useCallback((id, updates) => {
        setNotebooks(prev => prev.map(n =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n
        ))
    }, [])

    const deleteNotebook = useCallback((id) => {
        setNotebooks(prev => prev.filter(n => n.id !== id))
        setChats(prev => {
            const next = { ...prev }
            // Also clean up messages for all chats in this notebook
            if (next[id]) {
                next[id].forEach(chat => {
                    setMessages(prevMsgs => {
                        const nextMsgs = { ...prevMsgs }
                        delete nextMsgs[chat.id]
                        return nextMsgs
                    })
                })
            }
            delete next[id]
            return next
        })
        if (activeNotebookId === id) setActiveNotebookId(null)
    }, [activeNotebookId])

    const togglePinNotebook = useCallback((id) => {
        setNotebooks(prev => prev.map(n =>
            n.id === id ? { ...n, isPinned: !n.isPinned } : n
        ))
    }, [])

    // ── Chat CRUD ──
    const createChat = useCallback((notebookId, title = 'Nuevo Chat') => {
        const newChat = {
            id: `chat-${Date.now()}`,
            notebookId,
            title,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        setChats(prev => ({
            ...prev,
            [notebookId]: [newChat, ...(prev[notebookId] || [])]
        }))
        setMessages(prev => ({ ...prev, [newChat.id]: [] }))
        // Update notebook chat count
        setNotebooks(prev => prev.map(n =>
            n.id === notebookId
                ? { ...n, chatsCount: (n.chatsCount || 0) + 1, updatedAt: new Date() }
                : n
        ))
        setActiveChatId(newChat.id)
        return newChat
    }, [])

    const deleteChat = useCallback((chatId, notebookId) => {
        setChats(prev => ({
            ...prev,
            [notebookId]: (prev[notebookId] || []).filter(c => c.id !== chatId)
        }))
        setMessages(prev => {
            const next = { ...prev }
            delete next[chatId]
            return next
        })
        setNotebooks(prev => prev.map(n =>
            n.id === notebookId
                ? { ...n, chatsCount: Math.max(0, (n.chatsCount || 1) - 1) }
                : n
        ))
        if (activeChatId === chatId) setActiveChatId(null)
    }, [activeChatId])

    const renameChat = useCallback((chatId, notebookId, newTitle) => {
        setChats(prev => ({
            ...prev,
            [notebookId]: (prev[notebookId] || []).map(c =>
                c.id === chatId ? { ...c, title: newTitle, updatedAt: new Date() } : c
            )
        }))
    }, [])

    // ── Messages & AI ──
    const sendMessage = useCallback(async (chatId, content) => {
        const userMessage = {
            id: `msg-${Date.now()}`,
            chatId,
            role: 'user',
            content,
            contentType: 'text',
            createdAt: new Date()
        }

        setMessages(prev => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), userMessage]
        }))

        setIsAILoading(true)

        try {
            // Obtener datos del cuaderno actual para contexto
            const currentChat = Object.values(chats).flat().find(c => c.id === chatId)
            const notebook = notebooks.find(n => n.id === currentChat?.notebookId)

            const response = await fetch('https://n8n-n8n.8noypn.easypanel.host/webhook/estudio-ia/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: user?.id || 'default_user',
                    chat_id: chatId,
                    academic_level: 'pregrado',
                    specialty: notebook?.specialty || 'medicina general',
                    query_text: content,
                    generate_flashcards: false,
                    attachments: []
                })
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const rawData = await response.json()

            let data = rawData;

            // Manejar si n8n devuelve el string puro o markdown dentro de un array
            if (Array.isArray(rawData) && rawData[0] && typeof rawData[0].text === 'string') {
                const text = rawData[0].text;
                try {
                    const jsonMatch = text.match(/```json([\s\S]*?)```/);
                    if (jsonMatch && jsonMatch[1]) {
                        data = JSON.parse(jsonMatch[1]);
                        // Asignar el texto que esta fuera del json
                        const outsideText = text.replace(jsonMatch[0], '').trim();
                        if (outsideText && !data.response_text && !data.respuesta) {
                            data.response_text = outsideText;
                        }
                    } else {
                        const pureJsonMatch = text.match(/\{[\s\S]*\}/);
                        if (pureJsonMatch) {
                            data = JSON.parse(pureJsonMatch[0]);
                            const outsideText = text.replace(pureJsonMatch[0], '').replace(/```/g, '').trim();
                            if (outsideText && !data.response_text && !data.respuesta) {
                                data.response_text = outsideText;
                            }
                        } else {
                            data = { response_text: text, confidence_level: 100 };
                        }
                    }
                } catch (e) {
                    console.warn("Fallo el parsing de JSON extraído, cayendo a texto plano.");
                    data = { response_text: text, confidence_level: 100 };
                }
            } else if (Array.isArray(rawData) && rawData.length > 0) {
                // Si N8N retorna el array del JSON pero ya parseado
                data = rawData[0];
            }

            // Mapeo adaptativo si Gemini decide llamarlo "respuesta" en vez de "response_text"
            if (data.respuesta && !data.response_text) {
                data.response_text = data.respuesta;
            }

            const slideData = {
                title: notebook?.title || 'Estudio IA',
                subtitle: `Análisis Socrático (Confianza: ${data.confidence_level || 100}%)`,
                sections: [
                    { icon: '🧠', title: 'Respuesta', content: data.response_text || 'Sin respuesta' }
                ]
            }

            if (data.pedagogical_actions?.reflection_questions?.length > 0) {
                slideData.sections.push({
                    icon: '🤔',
                    title: 'Para Reflexionar',
                    content: '',
                    list: data.pedagogical_actions.reflection_questions
                })
            }

            if (data.pedagogical_actions?.next_topics?.length > 0) {
                slideData.sections.push({
                    icon: '➡️',
                    title: 'Siguientes Temas',
                    content: '',
                    list: data.pedagogical_actions.next_topics
                })
            }

            if (data.references?.length > 0) {
                slideData.sections.push({
                    icon: '📚',
                    title: 'Referencias',
                    content: '',
                    list: data.references
                })
            }

            const aiMessage = {
                id: `msg-${Date.now() + 1}`,
                chatId,
                role: 'assistant',
                content: JSON.stringify(slideData),
                contentType: 'slide',
                createdAt: new Date()
            }

            setMessages(prev => ({
                ...prev,
                [chatId]: [...(prev[chatId] || []), aiMessage]
            }))

        } catch (error) {
            console.error('Error contactando al motor de IA (n8n):', error)
            const errorMessage = {
                id: `msg-${Date.now() + 1}`,
                chatId,
                role: 'assistant',
                content: 'Hubo un error al procesar tu solicitud con el Asistente IA. Revisa la consola o asegúrate de que el workflow de n8n esté activo y tenga configuradas las API Keys.',
                contentType: 'text',
                createdAt: new Date()
            }
            setMessages(prev => ({
                ...prev,
                [chatId]: [...(prev[chatId] || []), errorMessage]
            }))
        } finally {
            setIsAILoading(false)

            // Update chat's updatedAt
            const chat = Object.values(chats).flat().find(c => c.id === chatId)
            if (chat) {
                setChats(prev => ({
                    ...prev,
                    [chat.notebookId]: (prev[chat.notebookId] || []).map(c =>
                        c.id === chatId ? { ...c, updatedAt: new Date() } : c
                    )
                }))
            }
        }
    }, [chats, notebooks, user])

    const value = {
        // State
        notebooks: filteredNotebooks,
        allNotebooks: notebooks,
        chats,
        messages,
        activeNotebook,
        activeNotebookId,
        activeChats,
        activeChatId,
        activeMessages,
        isAILoading,
        searchQuery,

        // Constants
        SPECIALTIES,
        NOTEBOOK_ICONS,
        NOTEBOOK_COLORS,

        // Setters
        setActiveNotebookId,
        setActiveChatId,
        setSearchQuery,

        // Notebook actions
        createNotebook,
        updateNotebook,
        deleteNotebook,
        togglePinNotebook,

        // Chat actions
        createChat,
        deleteChat,
        renameChat,

        // Message actions
        sendMessage,
    }

    return (
        <StudyAIContext.Provider value={value}>
            {children}
        </StudyAIContext.Provider>
    )
}

export function useStudyAI() {
    const context = useContext(StudyAIContext)
    if (!context) {
        throw new Error('useStudyAI must be used within a StudyAIProvider')
    }
    return context
}

export default StudyAIContext
