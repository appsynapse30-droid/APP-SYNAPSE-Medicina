import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabaseHelpers } from '../config/supabase'

const StudyAIContext = createContext(null)

// ==========================================
// CONSTANTS
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



// ==========================================
// PROVIDER
// ==========================================

export function StudyAIProvider({ children }) {
    const { user } = useAuth()

    const [notebooks, setNotebooks] = useState([])
    const [chats, setChats] = useState({})
    const [messages, setMessages] = useState({})

    const [activeNotebookId, setActiveNotebookId] = useState(null)
    const [activeChatId, setActiveChatId] = useState(null)
    const [isAILoading, setIsAILoading] = useState(false)
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    // Cargar datos reales desde Supabase
    useEffect(() => {
        let isMounted = true;

        const loadSupabaseData = async () => {
            if (!user?.id) {
                if (isMounted) {
                    setNotebooks([])
                    setChats({})
                    setMessages({})
                    setIsLoadingData(false)
                }
                return
            }

            if (isMounted) setIsLoadingData(true)

            let mappedNotebooks = []
            let chatsMap = {}
            let messagesMap = {}

            // 1. Fetch notebooks (independent try/catch)
            try {
                const { data: nbData, error: nbError } = await supabaseHelpers.studyAI.getNotebooks(user.id)
                if (nbError) {
                    console.error('Error cargando cuadernos:', nbError.message)
                } else if (nbData) {
                    mappedNotebooks = nbData.map(nb => ({
                        id: nb.id,
                        title: nb.title,
                        description: nb.description || '',
                        icon: nb.icon || '📚',
                        color: nb.color || '#58a6ff',
                        specialty: nb.specialty || '',
                        isPinned: nb.is_pinned || false,
                        chatsCount: nb.chats_count || 0,
                        createdAt: new Date(nb.created_at),
                        updatedAt: new Date(nb.updated_at)
                    }))
                }
            } catch (err) {
                console.error('Excepción cargando cuadernos:', err)
            }

            // 2. Fetch chats (independent try/catch)
            try {
                const { data: chData, error: chError } = await supabaseHelpers.studyAI.getChats(user.id)
                if (chError) {
                    console.error('Error cargando chats:', chError.message)
                } else if (chData && chData.length > 0) {
                    chData.forEach(ch => {
                        if (!chatsMap[ch.notebook_id]) chatsMap[ch.notebook_id] = []
                        chatsMap[ch.notebook_id].push({
                            id: ch.id,
                            notebookId: ch.notebook_id,
                            title: ch.title,
                            createdAt: new Date(ch.created_at),
                            updatedAt: new Date(ch.updated_at)
                        })
                    })

                    // 3. Fetch messages only if we have chats
                    try {
                        const chatIds = chData.map(ch => ch.id)
                        const { data: msgData, error: msgError } = await supabaseHelpers.studyAI.getMessages(chatIds)
                        if (msgError) {
                            console.error('Error cargando mensajes:', msgError.message)
                        } else if (msgData) {
                            msgData.forEach(msg => {
                                if (!messagesMap[msg.chat_id]) messagesMap[msg.chat_id] = []
                                messagesMap[msg.chat_id].push({
                                    id: msg.id,
                                    chatId: msg.chat_id,
                                    role: msg.role,
                                    content: msg.content,
                                    contentType: msg.content_type,
                                    createdAt: new Date(msg.created_at)
                                })
                            })
                        }
                    } catch (msgErr) {
                        console.error('Excepción cargando mensajes:', msgErr)
                    }
                }
            } catch (err) {
                console.error('Excepción cargando chats:', err)
            }

            if (isMounted) {
                setNotebooks(mappedNotebooks)
                setChats(chatsMap)
                setMessages(messagesMap)
                setIsLoadingData(false)
            }
        }

        loadSupabaseData()

        return () => { isMounted = false }
    }, [user?.id])

    // ── Computed values ──
    const activeNotebook = notebooks.find(n => n.id === activeNotebookId) || null
    const activeChats = activeNotebookId ? (chats[activeNotebookId] || []) : []
    const activeMessages = activeChatId ? (messages[activeChatId] || []) : []

    const filteredNotebooks = notebooks.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.specialty && n.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    // ── Notebook CRUD ──
    const createNotebook = useCallback(async (data) => {
        if (!user?.id) {
            console.error('createNotebook: No hay usuario autenticado')
            return null
        }

        const dbNotebook = {
            user_id: user.id,
            title: data.title || 'Nuevo Cuaderno',
            description: data.description || '',
            icon: data.icon || '📚',
            color: data.color || '#58a6ff',
            specialty: data.specialty || '',
            is_pinned: false,
            chats_count: 0
        }

        try {
            const result = await supabaseHelpers.studyAI.createNotebook(dbNotebook)
            const { data: created, error } = result

            if (error) {
                console.error('Error Supabase al crear cuaderno:', error.message || error)
                return null
            }

            if (!created) {
                console.error('Supabase no devolvió datos del cuaderno creado')
                return null
            }

            const newNotebook = {
                id: created.id,
                title: created.title,
                description: created.description || '',
                icon: created.icon || '📚',
                color: created.color || '#58a6ff',
                specialty: created.specialty || '',
                isPinned: created.is_pinned || false,
                chatsCount: created.chats_count || 0,
                createdAt: new Date(created.created_at),
                updatedAt: new Date(created.updated_at)
            }

            setNotebooks(prev => [newNotebook, ...prev])
            setChats(prev => ({ ...prev, [newNotebook.id]: [] }))
            return newNotebook
        } catch (err) {
            console.error('Excepción al crear cuaderno:', err)
            return null
        }
    }, [user?.id])

    const updateNotebook = useCallback(async (id, updates) => {
        const dbUpdates = {}
        if (updates.title !== undefined) dbUpdates.title = updates.title
        if (updates.description !== undefined) dbUpdates.description = updates.description
        if (updates.icon !== undefined) dbUpdates.icon = updates.icon
        if (updates.color !== undefined) dbUpdates.color = updates.color
        if (updates.specialty !== undefined) dbUpdates.specialty = updates.specialty

        const { data: updated, error } = await supabaseHelpers.studyAI.updateNotebook(id, dbUpdates)
        if (error) {
            console.error("Error al actualizar el cuaderno")
            return
        }

        setNotebooks(prev => prev.map(n =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date(updated.updated_at) } : n
        ))
    }, [])

    const deleteNotebook = useCallback(async (id) => {
        const { error } = await supabaseHelpers.studyAI.deleteNotebook(id)
        if (error) {
            console.error("Error al eliminar el cuaderno")
            return
        }

        setNotebooks(prev => prev.filter(n => n.id !== id))
        setChats(prev => {
            const next = { ...prev }
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

    const togglePinNotebook = useCallback(async (id) => {
        const notebook = notebooks.find(n => n.id === id)
        if (!notebook) return

        const isPinned = !notebook.isPinned
        const { data: updated, error } = await supabaseHelpers.studyAI.updateNotebook(id, { is_pinned: isPinned })
        if (error) {
            console.error("Error al fijar el cuaderno")
            return
        }

        setNotebooks(prev => prev.map(n =>
            n.id === id ? { ...n, isPinned, updatedAt: new Date(updated.updated_at) } : n
        ))
    }, [notebooks])

    // ── Chat CRUD ──
    const createChat = useCallback(async (notebookId, title = 'Nuevo Chat') => {
        if (!user) return null

        const dbChat = {
            user_id: user.id,
            notebook_id: notebookId,
            title
        }

        const { data: created, error } = await supabaseHelpers.studyAI.createChat(dbChat)
        if (error) {
            console.error("Error al crear el chat")
            return null
        }

        const newChat = {
            id: created.id,
            notebookId: created.notebook_id,
            title: created.title,
            createdAt: new Date(created.created_at),
            updatedAt: new Date(created.updated_at)
        }

        setChats(prev => ({
            ...prev,
            [notebookId]: [newChat, ...(prev[notebookId] || [])]
        }))
        setMessages(prev => ({ ...prev, [newChat.id]: [] }))

        // Update notebook chat count
        const notebook = notebooks.find(n => n.id === notebookId)
        if (notebook) {
            const newCount = notebook.chatsCount + 1
            await supabaseHelpers.studyAI.updateNotebook(notebookId, { chats_count: newCount })
            setNotebooks(prev => prev.map(n =>
                n.id === notebookId
                    ? { ...n, chatsCount: newCount, updatedAt: new Date() }
                    : n
            ))
        }

        setActiveChatId(newChat.id)
        return newChat
    }, [user, notebooks])

    const deleteChat = useCallback(async (chatId, notebookId) => {
        const { error } = await supabaseHelpers.studyAI.deleteChat(chatId)
        if (error) {
            console.error("Error al eliminar el chat")
            return
        }

        setChats(prev => ({
            ...prev,
            [notebookId]: (prev[notebookId] || []).filter(c => c.id !== chatId)
        }))
        setMessages(prev => {
            const next = { ...prev }
            delete next[chatId]
            return next
        })

        const notebook = notebooks.find(n => n.id === notebookId)
        if (notebook) {
            const newCount = Math.max(0, notebook.chatsCount - 1)
            await supabaseHelpers.studyAI.updateNotebook(notebookId, { chats_count: newCount })
            setNotebooks(prev => prev.map(n =>
                n.id === notebookId
                    ? { ...n, chatsCount: newCount }
                    : n
            ))
        }

        if (activeChatId === chatId) setActiveChatId(null)
    }, [activeChatId, notebooks])

    const renameChat = useCallback(async (chatId, notebookId, newTitle) => {
        const { data: updated, error } = await supabaseHelpers.studyAI.updateChat(chatId, { title: newTitle })
        if (error) {
            console.error("Error al renombrar el chat")
            return
        }

        setChats(prev => ({
            ...prev,
            [notebookId]: (prev[notebookId] || []).map(c =>
                c.id === chatId ? { ...c, title: newTitle, updatedAt: new Date(updated.updated_at) } : c
            )
        }))
    }, [])

    // ── Messages & AI ──
    const sendMessage = useCallback(async (chatId, content) => {
        setIsAILoading(true)

        try {
            // Save User message to Supabase
            const { data: dbUserMsg, error: userMsgErr } = await supabaseHelpers.studyAI.createMessage({
                chat_id: chatId,
                role: 'user',
                content: content,
                content_type: 'text'
            })

            if (userMsgErr) {
                console.error("Error al enviar mensaje")
                throw userMsgErr
            }

            const userMessage = {
                id: dbUserMsg.id,
                chatId: dbUserMsg.chat_id,
                role: dbUserMsg.role,
                content: dbUserMsg.content,
                contentType: dbUserMsg.content_type,
                createdAt: new Date(dbUserMsg.created_at)
            }

            setMessages(prev => ({
                ...prev,
                [chatId]: [...(prev[chatId] || []), userMessage]
            }))

            // Obtener datos del cuaderno actual para contexto
            const currentChat = Object.values(chats).flat().find(c => c.id === chatId)
            const notebook = notebooks.find(n => n.id === currentChat?.notebookId)

            let response;
            let retries = 3;
            let currentDelay = 1000;

            while (retries > 0) {
                try {
                    response = await fetch('https://n8n-n8n.8noypn.easypanel.host/webhook/estudio-ia/query', {
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

                    if (response.ok) {
                        break; // exito
                    } else {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                } catch (fetchErr) {
                    retries--;
                    if (retries === 0) {
                        throw fetchErr;
                    }
                    // Esperar antes de reintentar
                    await new Promise(res => setTimeout(res, currentDelay));
                    currentDelay *= 2; // backoff exponencial
                }
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

            // Save AI message to Supabase
            const { data: dbAiMsg, error: aiMsgErr } = await supabaseHelpers.studyAI.createMessage({
                chat_id: chatId,
                role: 'assistant',
                content: JSON.stringify(slideData),
                content_type: 'slide'
            })

            if (aiMsgErr) {
                console.error('Error al guardar respuesta del AI:', aiMsgErr.message)
                throw aiMsgErr
            }

            const aiMessage = {
                id: dbAiMsg.id,
                chatId: dbAiMsg.chat_id,
                role: dbAiMsg.role,
                content: dbAiMsg.content,
                contentType: dbAiMsg.content_type,
                createdAt: new Date(dbAiMsg.created_at)
            }

            setMessages(prev => ({
                ...prev,
                [chatId]: [...(prev[chatId] || []), aiMessage]
            }))

            // Update chat's updatedAt in Supabase
            await supabaseHelpers.studyAI.updateChat(chatId, { updated_at: new Date().toISOString() })

            // Update local state for chat
            const chatToUpdate = Object.values(chats).flat().find(c => c.id === chatId)
            if (chatToUpdate) {
                setChats(prev => ({
                    ...prev,
                    [chatToUpdate.notebookId]: (prev[chatToUpdate.notebookId] || []).map(c =>
                        c.id === chatId ? { ...c, updatedAt: new Date() } : c
                    )
                }))
            }

        } catch (error) {
            console.error('Error contactando al motor de IA (n8n) o DB:', error)
            const errorMessage = {
                id: `msg-${Date.now() + 1}`,
                chatId,
                role: 'assistant',
                content: 'Hubo un error al procesar tu solicitud. Revisa la consola o asegúrate de tener conexión.',
                contentType: 'text',
                createdAt: new Date()
            }
            setMessages(prev => ({
                ...prev,
                [chatId]: [...(prev[chatId] || []), errorMessage]
            }))
        } finally {
            setIsAILoading(false)
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
