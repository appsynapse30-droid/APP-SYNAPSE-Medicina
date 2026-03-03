import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

// Categorías médicas con metadatos
export const medicalCategories = {
    cardiologia: {
        label: 'Cardiología',
        color: '#f85149',
        bgColor: 'rgba(248, 81, 73, 0.15)',
        icon: 'Heart'
    },
    neurologia: {
        label: 'Neurología',
        color: '#a371f7',
        bgColor: 'rgba(163, 113, 247, 0.15)',
        icon: 'Brain'
    },
    neumologia: {
        label: 'Neumología',
        color: '#39d5ff',
        bgColor: 'rgba(57, 213, 255, 0.15)',
        icon: 'Wind'
    },
    gastroenterologia: {
        label: 'Gastroenterología',
        color: '#f0883e',
        bgColor: 'rgba(240, 136, 62, 0.15)',
        icon: 'Utensils'
    },
    endocrinologia: {
        label: 'Endocrinología',
        color: '#3fb950',
        bgColor: 'rgba(63, 185, 80, 0.15)',
        icon: 'Activity'
    },
    nefrologia: {
        label: 'Nefrología',
        color: '#58a6ff',
        bgColor: 'rgba(88, 166, 255, 0.15)',
        icon: 'Droplets'
    },
    traumatologia: {
        label: 'Traumatología',
        color: '#8b949e',
        bgColor: 'rgba(139, 148, 158, 0.15)',
        icon: 'Bone'
    },
    infectologia: {
        label: 'Infectología',
        color: '#f7c948',
        bgColor: 'rgba(247, 201, 72, 0.15)',
        icon: 'Bug'
    },
    pediatria: {
        label: 'Pediatría',
        color: '#ff7eb6',
        bgColor: 'rgba(255, 126, 182, 0.15)',
        icon: 'Baby'
    },
    ginecologia: {
        label: 'Ginecología',
        color: '#db61a2',
        bgColor: 'rgba(219, 97, 162, 0.15)',
        icon: 'Heart'
    },
    emergencias: {
        label: 'Emergencias',
        color: '#ff4757',
        bgColor: 'rgba(255, 71, 87, 0.15)',
        icon: 'Siren'
    },
    otro: {
        label: 'Otro',
        color: '#8b949e',
        bgColor: 'rgba(139, 148, 158, 0.15)',
        icon: 'Clipboard'
    }
}

// Niveles de dificultad
export const difficultyLevels = {
    1: { label: 'Básico', color: '#3fb950' },
    2: { label: 'Fácil', color: '#58a6ff' },
    3: { label: 'Intermedio', color: '#f7c948' },
    4: { label: 'Avanzado', color: '#f0883e' },
    5: { label: 'Experto', color: '#f85149' }
}

// Estados del caso
export const caseStatuses = {
    nuevo: { label: 'Nuevo', color: '#58a6ff', bgColor: 'rgba(88, 166, 255, 0.15)' },
    en_progreso: { label: 'En Progreso', color: '#f7c948', bgColor: 'rgba(247, 201, 72, 0.15)' },
    dominado: { label: 'Dominado', color: '#3fb950', bgColor: 'rgba(63, 185, 80, 0.15)' }
}

// Plantilla de caso vacío
const createEmptyCase = () => ({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    // Metadatos
    title: '',
    category: 'otro',
    difficulty: 3,
    tags: [],
    status: 'nuevo',
    isFavorite: false,

    // Datos del Paciente
    patient: {
        name: '',
        age: null,
        gender: '',
        weight: null,
        height: null,
        bloodType: '',
        occupation: '',
        photoUrl: '',
    },

    // Historia Clínica
    clinicalHistory: {
        chiefComplaint: '',
        historyOfPresentIllness: '',
        pastMedicalHistory: [],
        familyHistory: [],
        socialHistory: {
            smoking: false,
            alcohol: false,
            drugs: false,
            exercise: '',
            diet: '',
            notes: '',
        },
        allergies: [],
        currentMedications: [],
    },

    // Examen Físico
    physicalExam: {
        vitalSigns: {
            bloodPressure: '',
            heartRate: null,
            respiratoryRate: null,
            temperature: null,
            oxygenSaturation: null,
            painScale: null,
        },
        general: '',
        cardiovascular: '',
        respiratory: '',
        abdominal: '',
        neurological: '',
        musculoskeletal: '',
        skin: '',
        other: '',
    },

    // Estudios y Resultados
    diagnosticStudies: {
        laboratories: [],
        imaging: [],
        procedures: [],
    },

    // Diagnósticos
    diagnoses: {
        differentials: [],
        final: { name: '', icd10: '', justification: '' },
    },

    // Tratamiento
    treatment: {
        plan: '',
        medications: [],
        procedures: [],
        followUp: '',
    },

    // Timeline de Eventos
    timeline: [],

    // Notas de Aprendizaje
    learningNotes: {
        keyPoints: [],
        clinicalPearls: [],
        mistakes: [],
        resources: [],
        personalNotes: '',
    },

    // Estadísticas de Estudio
    studyStats: {
        timesReviewed: 0,
        lastReviewedAt: null,
        nextReviewAt: null,
        masteryLevel: 0,
    },
})

const STORAGE_KEY_PREFIX = 'synapse_clinical_cases'

const ClinicalCasesContext = createContext(null)

export function ClinicalCasesProvider({ children }) {
    const { user } = useAuth()

    // Per-user storage key
    const storageKey = user?.id
        ? `${STORAGE_KEY_PREFIX}_${user.id}`
        : STORAGE_KEY_PREFIX

    const [cases, setCases] = useState([])

    // Load cases when user changes
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey)
            if (saved) {
                const parsed = JSON.parse(saved)
                setCases(Array.isArray(parsed) ? parsed : [])
            } else {
                // New user: start with empty cases
                setCases([])
            }
        } catch {
            setCases([])
        }
    }, [storageKey, user])

    // Persistir en localStorage
    useEffect(() => {
        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(cases))
        }
    }, [cases, storageKey])

    // Crear nuevo caso
    const addCase = (caseData = {}) => {
        const newCase = {
            ...createEmptyCase(),
            ...caseData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        setCases(prev => [newCase, ...prev])
        return newCase.id
    }

    // Actualizar caso
    const updateCase = (id, updates) => {
        setCases(prev => prev.map(c =>
            c.id === id
                ? { ...c, ...updates, updatedAt: new Date().toISOString() }
                : c
        ))
    }

    // Eliminar caso
    const deleteCase = (id) => {
        setCases(prev => prev.filter(c => c.id !== id))
    }

    // Duplicar caso
    const duplicateCase = (id) => {
        const original = cases.find(c => c.id === id)
        if (!original) return null

        const duplicate = {
            ...original,
            id: crypto.randomUUID(),
            title: `${original.title} (Copia)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'nuevo',
            studyStats: {
                timesReviewed: 0,
                lastReviewedAt: null,
                nextReviewAt: null,
                masteryLevel: 0,
            },
        }
        setCases(prev => [duplicate, ...prev])
        return duplicate.id
    }

    // Obtener caso por ID
    const getCaseById = (id) => cases.find(c => c.id === id)

    // Filtrar casos por categoría
    const getCasesByCategory = (category) => cases.filter(c => c.category === category)

    // Filtrar casos por estado
    const getCasesByStatus = (status) => cases.filter(c => c.status === status)

    // Buscar casos
    const searchCases = (query) => {
        const lowerQuery = query.toLowerCase()
        return cases.filter(c =>
            c.title.toLowerCase().includes(lowerQuery) ||
            c.patient.name.toLowerCase().includes(lowerQuery) ||
            c.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
            medicalCategories[c.category]?.label.toLowerCase().includes(lowerQuery)
        )
    }

    // Obtener casos para repasar (basado en repetición espaciada)
    const getStudyCases = () => {
        const now = new Date()
        return cases.filter(c => {
            if (c.status === 'dominado' && c.studyStats.masteryLevel >= 90) {
                // Solo repasar si ya pasó la fecha programada
                if (c.studyStats.nextReviewAt) {
                    return new Date(c.studyStats.nextReviewAt) <= now
                }
            }
            // Incluir casos nuevos y en progreso
            return c.status !== 'dominado'
        }).sort((a, b) => {
            // Priorizar por estado y nivel de dominio
            if (a.status === 'nuevo' && b.status !== 'nuevo') return -1
            if (b.status === 'nuevo' && a.status !== 'nuevo') return 1
            return a.studyStats.masteryLevel - b.studyStats.masteryLevel
        })
    }

    // Marcar caso como estudiado
    const markAsStudied = (id, difficulty = 'normal') => {
        const caseItem = getCaseById(id)
        if (!caseItem) return

        const now = new Date()
        let masteryIncrease = 0
        let daysUntilNextReview = 1

        // Ajustar según dificultad percibida
        switch (difficulty) {
            case 'facil':
                masteryIncrease = 20
                daysUntilNextReview = Math.max(7, (caseItem.studyStats.timesReviewed + 1) * 3)
                break
            case 'normal':
                masteryIncrease = 10
                daysUntilNextReview = Math.max(3, (caseItem.studyStats.timesReviewed + 1) * 2)
                break
            case 'dificil':
                masteryIncrease = 5
                daysUntilNextReview = 1
                break
        }

        const newMastery = Math.min(100, caseItem.studyStats.masteryLevel + masteryIncrease)
        const nextReview = new Date(now.getTime() + daysUntilNextReview * 24 * 60 * 60 * 1000)

        updateCase(id, {
            status: newMastery >= 90 ? 'dominado' : 'en_progreso',
            studyStats: {
                ...caseItem.studyStats,
                timesReviewed: caseItem.studyStats.timesReviewed + 1,
                lastReviewedAt: now.toISOString(),
                nextReviewAt: nextReview.toISOString(),
                masteryLevel: newMastery,
            }
        })
    }

    // Toggle favorito
    const toggleFavorite = (id) => {
        const caseItem = getCaseById(id)
        if (!caseItem) return
        updateCase(id, { isFavorite: !caseItem.isFavorite })
    }

    // Añadir nota de aprendizaje
    const addLearningNote = (id, noteType, content) => {
        const caseItem = getCaseById(id)
        if (!caseItem) return

        const notes = { ...caseItem.learningNotes }

        if (noteType === 'personalNotes') {
            notes.personalNotes = content
        } else if (Array.isArray(notes[noteType])) {
            notes[noteType] = [...notes[noteType], content]
        }

        updateCase(id, { learningNotes: notes })
    }

    // Estadísticas generales
    const getStats = () => {
        const total = cases.length
        const byStatus = {
            nuevo: cases.filter(c => c.status === 'nuevo').length,
            en_progreso: cases.filter(c => c.status === 'en_progreso').length,
            dominado: cases.filter(c => c.status === 'dominado').length,
        }
        const favorites = cases.filter(c => c.isFavorite).length
        const pendingReview = getStudyCases().length

        return { total, byStatus, favorites, pendingReview }
    }

    // Obtener conocimiento promedio por categoría (para radar chart)
    const getKnowledgeByCategory = () => {
        const categoryData = {}

        // Inicializar todas las categorías
        Object.keys(medicalCategories).forEach(cat => {
            categoryData[cat] = { total: 0, count: 0 }
        })

        // Sumar mastery levels por categoría
        cases.forEach(c => {
            if (categoryData[c.category]) {
                categoryData[c.category].total += c.studyStats?.masteryLevel || 0
                categoryData[c.category].count += 1
            }
        })

        // Convertir a formato para radar chart
        return Object.entries(categoryData)
            .filter(([_, data]) => data.count > 0)
            .map(([cat, data]) => ({
                subject: medicalCategories[cat]?.label.substring(0, 6) || cat,
                fullName: medicalCategories[cat]?.label || cat,
                category: cat,
                value: data.count > 0 ? Math.round(data.total / data.count) : 0,
                caseCount: data.count
            }))
    }

    // Obtener casos que necesitan repaso (para diagnóstico IA)
    const getCasesNeedingReview = (limit = 5) => {
        return cases
            .filter(c => c.status !== 'dominado' || c.studyStats?.masteryLevel < 80)
            .sort((a, b) => {
                // Priorizar por menor mastery level
                const masteryA = a.studyStats?.masteryLevel || 0
                const masteryB = b.studyStats?.masteryLevel || 0
                return masteryA - masteryB
            })
            .slice(0, limit)
            .map(c => ({
                id: c.id,
                title: c.title,
                category: c.category,
                categoryLabel: medicalCategories[c.category]?.label || c.category,
                masteryLevel: c.studyStats?.masteryLevel || 0,
                severity: (c.studyStats?.masteryLevel || 0) < 30 ? 'error' : 'warning',
                issue: (c.studyStats?.masteryLevel || 0) < 30
                    ? `Dominio bajo (${c.studyStats?.masteryLevel || 0}%)`
                    : `Necesita repaso (${c.studyStats?.masteryLevel || 0}%)`
            }))
    }

    // Obtener puntuación estimada general
    const getEstimatedScore = () => {
        if (cases.length === 0) return { score: 0, max: 300, percentage: 0 }

        const totalMastery = cases.reduce((sum, c) => sum + (c.studyStats?.masteryLevel || 0), 0)
        const avgMastery = totalMastery / cases.length
        const estimatedScore = Math.round((avgMastery / 100) * 300)

        return {
            score: estimatedScore,
            max: 300,
            percentage: Math.round(avgMastery)
        }
    }

    const value = {
        cases,
        addCase,
        updateCase,
        deleteCase,
        duplicateCase,
        getCaseById,
        getCasesByCategory,
        getCasesByStatus,
        searchCases,
        getStudyCases,
        markAsStudied,
        toggleFavorite,
        addLearningNote,
        getStats,
        getKnowledgeByCategory,
        getCasesNeedingReview,
        getEstimatedScore,
        createEmptyCase,
    }

    return (
        <ClinicalCasesContext.Provider value={value}>
            {children}
        </ClinicalCasesContext.Provider>
    )
}

export function useClinicalCases() {
    const context = useContext(ClinicalCasesContext)
    if (!context) {
        throw new Error('useClinicalCases debe usarse dentro de ClinicalCasesProvider')
    }
    return context
}
