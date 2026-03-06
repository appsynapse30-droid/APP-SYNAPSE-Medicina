import React, { createContext, useContext, useState, useCallback } from 'react'

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

export function StudyAIProvider({ children }) {
    const [notebooks, setNotebooks] = useState(INITIAL_NOTEBOOKS)
    const [chats, setChats] = useState(INITIAL_CHATS)
    const [messages, setMessages] = useState(INITIAL_MESSAGES)
    const [activeNotebookId, setActiveNotebookId] = useState(null)
    const [activeChatId, setActiveChatId] = useState(null)
    const [isAILoading, setIsAILoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

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

        // Simulate AI response
        setIsAILoading(true)

        // Simulate network delay (1.5 - 3 seconds)
        const delay = 1500 + Math.random() * 1500
        await new Promise(resolve => setTimeout(resolve, delay))

        // Generate a contextual mock response
        const slideResponse = generateMockSlide(content)

        const aiMessage = {
            id: `msg-${Date.now() + 1}`,
            chatId,
            role: 'assistant',
            content: JSON.stringify(slideResponse),
            contentType: 'slide',
            createdAt: new Date()
        }

        setMessages(prev => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), aiMessage]
        }))

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
    }, [chats])

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

// ==========================================
// MOCK AI RESPONSE GENERATOR
// ==========================================

function generateMockSlide(userQuestion) {
    const question = userQuestion.toLowerCase()

    // Try to detect medical topic and generate contextual response
    if (question.includes('corazón') || question.includes('cardí') || question.includes('infarto') || question.includes('arritmia')) {
        return {
            title: 'Cardiología',
            subtitle: extractTopic(userQuestion),
            sections: [
                { icon: '📋', title: 'Definición', content: `En relación a tu pregunta sobre "${extractTopic(userQuestion)}", este concepto es fundamental en cardiología. Se refiere a los mecanismos y procesos que afectan el funcionamiento del sistema cardiovascular.` },
                { icon: '🔬', title: 'Fisiopatología', content: '', list: ['**Alteración hemodinámica** — Cambios en precarga, postcarga y contractilidad.', '**Respuesta neurohumoral** — Activación del SRAA y sistema simpático.', '**Remodelado cardíaco** — Cambios adaptativos y desadaptativos en el miocardio.'] },
                { icon: '🩺', title: 'Clínica', content: 'Los hallazgos clínicos principales incluyen:', list: ['Disnea de esfuerzo progresiva.', 'Dolor torácico con características específicas.', 'Alteraciones en la auscultación cardíaca.', 'Edema periférico y signos de congestión.'] },
                { icon: '💊', title: 'Tratamiento', content: '', list: ['**IECA/ARA-II** — Reducción de postcarga y remodelado.', '**Beta-bloqueantes** — Reducción de FC y demanda miocárdica de O₂.', '**Diuréticos** — Manejo de la congestión y sobrecarga de volumen.'] },
                { icon: '💡', title: 'Perla Clínica', content: 'En la evaluación cardiovascular, siempre realizar ECG de 12 derivaciones como estudio inicial. La elevación del segmento ST > 1mm en dos derivaciones contiguas sugiere IAMCEST y requiere activación del protocolo de reperfusión inmediata.', highlight: true }
            ]
        }
    }

    if (question.includes('neuro') || question.includes('cerebr') || question.includes('nervio') || question.includes('craneal')) {
        return {
            title: 'Neurología',
            subtitle: extractTopic(userQuestion),
            sections: [
                { icon: '📋', title: 'Definición', content: `Respecto a "${extractTopic(userQuestion)}", este es un concepto clave en neurociencias. Comprende las estructuras y funciones del sistema nervioso central y periférico.` },
                { icon: '🧠', title: 'Neuroanatomía', content: '', list: ['**Corteza cerebral** — Áreas funcionales y sus especializaciones.', '**Ganglios basales** — Regulación del movimiento y tono muscular.', '**Tronco encefálico** — Funciones vitales y origen de pares craneales.', '**Cerebelo** — Coordinación motora y equilibrio.'] },
                { icon: '🩺', title: 'Exploración Neurológica', content: 'La evaluación sistemática incluye:', list: ['Estado mental y funciones cognitivas superiores.', 'Pares craneales (I al XII).', 'Sistema motor: fuerza, tono, reflejos.', 'Sistema sensitivo: tacto, dolor, propiocepción.', 'Coordinación y marcha.'] },
                { icon: '💡', title: 'Perla Clínica', content: 'La regla de la "O" para recordar los pares craneales sensitivos, motores y mixtos: Some Say Marry Money But My Brother Says Big Brains Matter More (S=Sensitivo, M=Motor, B=Both/Mixto).', highlight: true }
            ]
        }
    }

    if (question.includes('fármaco') || question.includes('medicamento') || question.includes('dosis') || question.includes('antibiótico') || question.includes('farma')) {
        return {
            title: 'Farmacología',
            subtitle: extractTopic(userQuestion),
            sections: [
                { icon: '📋', title: 'Definición', content: `Sobre "${extractTopic(userQuestion)}", este tema abarca los principios farmacológicos fundamentales para la práctica clínica.` },
                { icon: '⚗️', title: 'Farmacocinética', content: '', list: ['**Absorción** — Biodisponibilidad y vías de administración.', '**Distribución** — Volumen de distribución y unión a proteínas plasmáticas.', '**Metabolismo** — Enzimas CYP450 y reacciones de fase I y II.', '**Excreción** — Eliminación renal y hepática.'] },
                { icon: '🎯', title: 'Farmacodinamia', content: 'Los mecanismos de acción pueden clasificarse en:', list: ['Agonistas y antagonistas de receptores.', 'Inhibidores enzimáticos.', 'Moduladores de canales iónicos.', 'Alteración del transporte de membrana.'] },
                { icon: '⚠️', title: 'Efectos Adversos', content: 'Es fundamental conocer el perfil de seguridad de cada fármaco y las interacciones medicamentosas más relevantes.' },
                { icon: '💡', title: 'Perla Clínica', content: 'Recuerda: "Start low, go slow" (Iniciar con dosis bajas e incrementar gradualmente) es la regla de oro en farmacoterapia, especialmente en ancianos y pacientes con insuficiencia renal o hepática.', highlight: true }
            ]
        }
    }

    // Default generic medical response
    return {
        title: 'Medicina',
        subtitle: extractTopic(userQuestion),
        sections: [
            { icon: '📋', title: 'Definición', content: `Excelente pregunta sobre "${extractTopic(userQuestion)}". Permíteme explicarte este concepto de manera detallada y estructurada.` },
            { icon: '🔬', title: 'Fisiopatología', content: 'Los mecanismos involucrados incluyen múltiples vías que se interrelacionan:', list: ['**Proceso primario** — Mecanismo patológico inicial y su desencadenante.', '**Cascada fisiopatológica** — Eventos secundarios y respuesta del organismo.', '**Mecanismos compensatorios** — Adaptaciones fisiológicas ante la noxa.'] },
            { icon: '🩺', title: 'Presentación Clínica', content: 'Los hallazgos más relevantes en la práctica clínica:', list: ['Síntomas principales de presentación.', 'Signos en la exploración física.', 'Hallazgos de laboratorio e imagen.'] },
            { icon: '📊', title: 'Diagnóstico', content: 'El abordaje diagnóstico debe ser sistemático:', list: ['**Historia clínica** — Anamnesis dirigida con antecedentes relevantes.', '**Exploración física** — Búsqueda de signos patognomónicos.', '**Estudios complementarios** — Laboratorio, imagen y estudios especiales.'] },
            { icon: '💊', title: 'Tratamiento', content: '', list: ['**Medidas generales** — Soporte básico y modificaciones del estilo de vida.', '**Tratamiento farmacológico** — Según guías de práctica clínica actualizadas.', '**Seguimiento** — Plan de monitorización y criterios de referencia.'] },
            { icon: '💡', title: 'Perla Clínica', content: 'En la práctica médica, la clave del éxito diagnóstico radica en una historia clínica completa. Se estima que el 70-80% de los diagnósticos se pueden orientar solo con una buena anamnesis, incluso antes de solicitar estudios complementarios.', highlight: true }
        ]
    }
}

function extractTopic(question) {
    // Remove common question words and extract the core topic
    const cleaned = question
        .replace(/^(explícame|explica|qué es|que es|cómo|como|cuáles|cuales|dime|háblame|hablame|puedes explicar|me puedes explicar|qué|que)\s*/i, '')
        .replace(/\?/g, '')
        .trim()

    // Capitalize first letter
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

export default StudyAIContext
