import { createContext, useContext, useState, useEffect } from 'react'

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

// Casos de ejemplo
const sampleCases = [
    {
        ...createEmptyCase(),
        id: 'sample-1',
        title: 'Infarto Agudo de Miocardio (STEMI Anterior)',
        category: 'cardiologia',
        difficulty: 4,
        tags: ['STEMI', 'ECG', 'Emergencia', 'Cateterismo'],
        status: 'en_progreso',
        isFavorite: true,
        patient: {
            name: 'Juan Pérez',
            age: 54,
            gender: 'M',
            weight: 82,
            height: 175,
            bloodType: 'O+',
            occupation: 'Contador',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JuanPerez&backgroundColor=b6e3f4',
        },
        clinicalHistory: {
            chiefComplaint: 'Dolor torácico opresivo de 30 minutos de evolución',
            historyOfPresentIllness: 'Paciente masculino de 54 años que inicia con dolor torácico opresivo mientras realizaba jardinería. El dolor es de intensidad 8/10, irradia hacia brazo izquierdo y mandíbula. Se acompaña de diaforesis profusa y náuseas. No mejora con el reposo.',
            pastMedicalHistory: ['Hipertensión arterial diagnosticada hace 5 años', 'Dislipidemia'],
            familyHistory: ['Padre fallecido por IAM a los 60 años', 'Madre con diabetes mellitus tipo 2'],
            socialHistory: {
                smoking: true,
                alcohol: false,
                drugs: false,
                exercise: 'Sedentario',
                diet: 'Alta en grasas saturadas',
                notes: 'Fumador de 1 paquete/día por 20 años',
            },
            allergies: [{ name: 'Penicilina', reaction: 'Rash cutáneo' }],
            currentMedications: [
                { name: 'Losartán', dose: '50mg', frequency: 'Cada 24 horas' },
                { name: 'Atorvastatina', dose: '20mg', frequency: 'Cada noche' }
            ],
        },
        physicalExam: {
            vitalSigns: {
                bloodPressure: '150/95',
                heartRate: 102,
                respiratoryRate: 22,
                temperature: 36.8,
                oxygenSaturation: 94,
                painScale: 8,
            },
            general: 'Paciente ansioso, diaforético, pálido',
            cardiovascular: 'Ruidos cardíacos rítmicos, taquicárdicos. No soplos. Pulsos periféricos presentes simétricos.',
            respiratory: 'Murmullo vesicular conservado bilateral. Sin estertores.',
            abdominal: 'Blando, no doloroso, sin visceromegalias',
            neurological: 'Consciente, orientado. Glasgow 15/15.',
            musculoskeletal: 'Sin alteraciones',
            skin: 'Pálida, fría, diaforética',
            other: '',
        },
        diagnosticStudies: {
            laboratories: [
                { test: 'Troponina I', result: '2.5 ng/mL', reference: '<0.04 ng/mL', abnormal: true },
                { test: 'CPK-MB', result: '45 U/L', reference: '<25 U/L', abnormal: true },
                { test: 'Glucosa', result: '145 mg/dL', reference: '70-100 mg/dL', abnormal: true },
                { test: 'Creatinina', result: '1.1 mg/dL', reference: '0.7-1.3 mg/dL', abnormal: false },
            ],
            imaging: [
                {
                    type: 'ECG 12 derivaciones',
                    description: 'Realizado a los 5 minutos del ingreso',
                    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/ECG_12derivations.png/640px-ECG_12derivations.png',
                    findings: 'Elevación del segmento ST en V1-V4 de 3-4mm. Cambios recíprocos en II, III, aVF. Taquicardia sinusal a 102 lpm.'
                },
            ],
            procedures: [],
        },
        diagnoses: {
            differentials: [
                { name: 'STEMI Anterior (IAM con elevación ST)', probability: 85, reasoning: 'Clínica típica + ECG con elevación ST + Troponinas elevadas' },
                { name: 'Disección Aórtica', probability: 10, reasoning: 'Descartado por presentación típica y ausencia de diferencia de pulsos' },
                { name: 'Embolismo Pulmonar', probability: 5, reasoning: 'Poco probable por ECG y clínica' },
            ],
            final: {
                name: 'Infarto Agudo de Miocardio con Elevación del ST (STEMI) Anterior',
                icd10: 'I21.0',
                justification: 'Cuadro clínico compatible + elevación ST V1-V4 + troponinas positivas'
            },
        },
        treatment: {
            plan: 'Reperfusión urgente mediante angioplastía primaria (PCI)',
            medications: [
                { name: 'Aspirina', dose: '300mg', route: 'VO', frequency: 'Dosis de carga', duration: 'Continuar indefinidamente' },
                { name: 'Clopidogrel', dose: '600mg', route: 'VO', frequency: 'Dosis de carga', duration: 'Mínimo 12 meses' },
                { name: 'Heparina no fraccionada', dose: '60 UI/kg', route: 'IV', frequency: 'Bolo + infusión', duration: 'Durante procedimiento' },
                { name: 'Morfina', dose: '2-4mg', route: 'IV', frequency: 'PRN dolor', duration: 'Fase aguda' },
            ],
            procedures: ['Cateterismo cardíaco urgente', 'Angioplastía primaria con stent'],
            followUp: 'UCI coronaria. Control de troponinas cada 6 horas. Ecocardiograma en 24-48 horas.',
        },
        timeline: [
            { time: '00:00', type: 'system', content: 'Paciente llegó en ambulancia. Dolor torácico opresivo de 30 min de evolución.' },
            { time: '00:05', type: 'action', content: 'Se ordena ECG de 12 derivaciones y troponinas.' },
            { time: '00:08', type: 'result', content: 'ECG: Elevación ST en V1-V4. Taquicardia sinusal.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/ECG_12derivations.png/640px-ECG_12derivations.png' },
            { time: '00:10', type: 'mentor', content: 'Hallazgos compatibles con STEMI anterior. Tiempo puerta-balón debe ser <90 min.' },
            { time: '00:15', type: 'action', content: 'Se activa código infarto. Se administra Aspirina 300mg + Clopidogrel 600mg.' },
            { time: '00:20', type: 'result', content: 'Troponina I: 2.5 ng/mL (elevada).' },
        ],
        learningNotes: {
            keyPoints: [
                'El tiempo es músculo: meta puerta-balón <90 minutos',
                'STEMI anterior indica oclusión de arteria descendente anterior (ADA)',
                'Cambios recíprocos en derivaciones inferiores confirman STEMI',
            ],
            clinicalPearls: [
                'La elevación ST en V1-V4 sugiere afectación de la pared anterior del VI',
                'La diaforesis profusa es un signo de alto riesgo en dolor torácico',
                'Siempre buscar contraindicaciones para fibrinólisis aunque se planee PCI',
            ],
            mistakes: [
                'No retrasar la reperfusión por esperar resultados de laboratorio',
                'No administrar nitratos si sospecha de infarto de VD (ST elevado en V4R)',
            ],
            resources: [
                { title: 'Guías AHA/ACC 2023 STEMI', url: 'https://www.ahajournals.org' },
                { title: 'ECG en el STEMI - UpToDate', url: 'https://www.uptodate.com' },
            ],
            personalNotes: 'Recordar siempre el ABC en la evaluación inicial. El ECG debe realizarse en los primeros 10 minutos.',
        },
        studyStats: {
            timesReviewed: 3,
            lastReviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            nextReviewAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            masteryLevel: 65,
        },
    },
    {
        ...createEmptyCase(),
        id: 'sample-2',
        title: 'Neumonía Adquirida en la Comunidad',
        category: 'neumologia',
        difficulty: 2,
        tags: ['NAC', 'Infección', 'Antibióticos', 'Rx Tórax'],
        status: 'nuevo',
        isFavorite: false,
        patient: {
            name: 'María González',
            age: 67,
            gender: 'F',
            weight: 65,
            height: 160,
            bloodType: 'A+',
            occupation: 'Jubilada',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MariaGonzalez&backgroundColor=ffdfbf',
        },
        clinicalHistory: {
            chiefComplaint: 'Fiebre y tos productiva de 3 días de evolución',
            historyOfPresentIllness: 'Paciente femenina de 67 años con cuadro de 3 días de evolución caracterizado por fiebre de hasta 38.8°C, tos productiva con expectoración amarillenta, disnea de moderados esfuerzos y malestar general. Niega viajes recientes.',
            pastMedicalHistory: ['Diabetes mellitus tipo 2', 'Osteoporosis'],
            familyHistory: ['Madre con EPOC'],
            socialHistory: {
                smoking: false,
                alcohol: false,
                drugs: false,
                exercise: 'Caminata diaria 20 min',
                diet: 'Dieta diabética',
                notes: 'Ex-fumadora (dejó hace 10 años)',
            },
            allergies: [],
            currentMedications: [
                { name: 'Metformina', dose: '850mg', frequency: 'Cada 12 horas' },
                { name: 'Calcio + Vitamina D', dose: '600mg/400UI', frequency: 'Cada 24 horas' }
            ],
        },
        physicalExam: {
            vitalSigns: {
                bloodPressure: '130/80',
                heartRate: 88,
                respiratoryRate: 24,
                temperature: 38.5,
                oxygenSaturation: 92,
                painScale: 3,
            },
            general: 'Paciente febril, orientada, ligera dificultad respiratoria',
            cardiovascular: 'Ruidos cardíacos rítmicos, sin soplos',
            respiratory: 'Estertores crepitantes en base pulmonar derecha. Matidez a la percusión basal derecha.',
            abdominal: 'Sin alteraciones',
            neurological: 'Sin focalidad',
            musculoskeletal: 'Sin alteraciones',
            skin: 'Caliente, rosada, hidratada',
            other: '',
        },
        diagnosticStudies: {
            laboratories: [
                { test: 'Leucocitos', result: '15,200/mm³', reference: '4,500-11,000/mm³', abnormal: true },
                { test: 'PCR', result: '85 mg/L', reference: '<5 mg/L', abnormal: true },
                { test: 'Procalcitonina', result: '0.8 ng/mL', reference: '<0.1 ng/mL', abnormal: true },
                { test: 'Glucosa', result: '180 mg/dL', reference: '70-100 mg/dL', abnormal: true },
            ],
            imaging: [
                {
                    type: 'Radiografía de Tórax PA',
                    description: 'Proyección posteroanterior',
                    imageUrl: '',
                    findings: 'Consolidación en lóbulo inferior derecho con broncograma aéreo. Sin derrame pleural significativo.'
                },
            ],
            procedures: [],
        },
        diagnoses: {
            differentials: [
                { name: 'Neumonía Adquirida en la Comunidad', probability: 90, reasoning: 'Clínica + radiografía compatible + marcadores inflamatorios elevados' },
                { name: 'Tuberculosis pulmonar', probability: 7, reasoning: 'Menos probable por presentación aguda y ausencia de factores de riesgo' },
                { name: 'Neoplasia pulmonar', probability: 3, reasoning: 'Considerar si no hay respuesta al tratamiento' },
            ],
            final: {
                name: 'Neumonía Adquirida en la Comunidad (NAC)',
                icd10: 'J18.9',
                justification: 'Cuadro clínico típico + hallazgos radiológicos + marcadores elevados'
            },
        },
        treatment: {
            plan: 'Hospitalización por CURB-65 = 2 (edad >65, FR >30). Antibioticoterapia empírica.',
            medications: [
                { name: 'Ceftriaxona', dose: '1g', route: 'IV', frequency: 'Cada 24 horas', duration: '7-10 días' },
                { name: 'Azitromicina', dose: '500mg', route: 'IV/VO', frequency: 'Cada 24 horas', duration: '5 días' },
                { name: 'Paracetamol', dose: '1g', route: 'IV/VO', frequency: 'Cada 8 horas PRN', duration: 'Según fiebre' },
            ],
            procedures: [],
            followUp: 'Control de fiebre y saturación. Radiografía de control en 48-72 horas si no hay mejoría.',
        },
        timeline: [],
        learningNotes: {
            keyPoints: [
                'CURB-65 ayuda a decidir hospitalización (>2 = ingreso)',
                'Cobertura empírica debe incluir neumococo y atípicos',
            ],
            clinicalPearls: [
                'La DM es factor de riesgo para NAC y peor pronóstico',
            ],
            mistakes: [],
            resources: [],
            personalNotes: '',
        },
        studyStats: {
            timesReviewed: 0,
            lastReviewedAt: null,
            nextReviewAt: null,
            masteryLevel: 0,
        },
    },
    {
        ...createEmptyCase(),
        id: 'sample-3',
        title: 'Apendicitis Aguda',
        category: 'gastroenterologia',
        difficulty: 2,
        tags: ['Abdomen Agudo', 'Cirugía', 'Urgencia'],
        status: 'dominado',
        isFavorite: false,
        patient: {
            name: 'Carlos Rodríguez',
            age: 28,
            gender: 'M',
            weight: 75,
            height: 178,
            bloodType: 'B+',
            occupation: 'Ingeniero',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CarlosRodriguez&backgroundColor=c0aede',
        },
        clinicalHistory: {
            chiefComplaint: 'Dolor abdominal de 12 horas de evolución',
            historyOfPresentIllness: 'Paciente masculino de 28 años que inicia con dolor periumbilical que posteriormente migra a fosa ilíaca derecha. Se acompaña de náuseas, 1 episodio de vómito y anorexia. Fiebre de 38°C.',
            pastMedicalHistory: [],
            familyHistory: [],
            socialHistory: {
                smoking: false,
                alcohol: true,
                drugs: false,
                exercise: 'Gimnasio 3 veces/semana',
                diet: 'Normal',
                notes: 'Alcohol social los fines de semana',
            },
            allergies: [],
            currentMedications: [],
        },
        physicalExam: {
            vitalSigns: {
                bloodPressure: '120/75',
                heartRate: 92,
                respiratoryRate: 18,
                temperature: 38.2,
                oxygenSaturation: 98,
                painScale: 7,
            },
            general: 'Paciente en posición antiálgica, febril',
            cardiovascular: 'Normal',
            respiratory: 'Normal',
            abdominal: 'Dolor a la palpación en FID. McBurney positivo. Blumberg positivo. Rovsing positivo. Defensa muscular localizada.',
            neurological: 'Sin alteraciones',
            musculoskeletal: 'Sin alteraciones',
            skin: 'Normal',
            other: '',
        },
        diagnosticStudies: {
            laboratories: [
                { test: 'Leucocitos', result: '14,500/mm³', reference: '4,500-11,000/mm³', abnormal: true },
                { test: 'Neutrófilos', result: '85%', reference: '40-70%', abnormal: true },
                { test: 'PCR', result: '45 mg/L', reference: '<5 mg/L', abnormal: true },
            ],
            imaging: [
                {
                    type: 'Ecografía Abdominal',
                    description: 'Enfocada en FID',
                    imageUrl: '',
                    findings: 'Apéndice de 9mm de diámetro, no compresible, con líquido periapendicular.'
                },
            ],
            procedures: [],
        },
        diagnoses: {
            differentials: [
                { name: 'Apendicitis Aguda', probability: 95, reasoning: 'Clínica clásica + signos positivos + imagen compatible' },
                { name: 'Adenitis mesentérica', probability: 3, reasoning: 'Menos probable por edad y presentación' },
                { name: 'Gastroenteritis', probability: 2, reasoning: 'No hay diarrea' },
            ],
            final: {
                name: 'Apendicitis Aguda No Complicada',
                icd10: 'K35.80',
                justification: 'Escala de Alvarado 9/10 + confirmación ecográfica'
            },
        },
        treatment: {
            plan: 'Apendicectomía laparoscópica urgente',
            medications: [
                { name: 'Metronidazol', dose: '500mg', route: 'IV', frequency: 'Preoperatorio', duration: '1 dosis' },
                { name: 'Cefazolina', dose: '2g', route: 'IV', frequency: 'Preoperatorio', duration: '1 dosis' },
            ],
            procedures: ['Apendicectomía laparoscópica'],
            followUp: 'Alta hospitalaria en 24-48 horas si evolución favorable.',
        },
        timeline: [],
        learningNotes: {
            keyPoints: [
                'Dolor migratorio (periumbilical → FID) es clásico',
                'Escala de Alvarado ≥7 indica alta probabilidad',
                'La ecografía es el primer estudio de imagen',
            ],
            clinicalPearls: [
                'El signo del psoas puede indicar apéndice retrocecal',
                'Anorexia casi siempre está presente',
            ],
            mistakes: [
                'No descartar embarazo ectópico en mujeres en edad fértil',
            ],
            resources: [],
            personalNotes: '',
        },
        studyStats: {
            timesReviewed: 5,
            lastReviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            nextReviewAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            masteryLevel: 90,
        },
    }
]

const STORAGE_KEY = 'synapse_clinical_cases'

const ClinicalCasesContext = createContext(null)

export function ClinicalCasesProvider({ children }) {
    const [cases, setCases] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                return JSON.parse(saved)
            } catch {
                return sampleCases
            }
        }
        return sampleCases
    })

    // Persistir en localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cases))
    }, [cases])

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
