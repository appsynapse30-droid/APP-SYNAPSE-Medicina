import { useState, useEffect } from 'react'
import {
    X,
    Save,
    ChevronRight,
    ChevronLeft,
    User,
    FileText,
    Activity,
    Stethoscope,
    FlaskConical,
    Pill,
    Lightbulb,
    Plus,
    Trash2,
    AlertCircle
} from 'lucide-react'
import { useClinicalCases, medicalCategories, difficultyLevels } from '../../context/ClinicalCasesContext'

const FORM_SECTIONS = [
    { id: 'general', label: 'General', icon: FileText },
    { id: 'patient', label: 'Paciente', icon: User },
    { id: 'history', label: 'Historia Clínica', icon: FileText },
    { id: 'exam', label: 'Examen Físico', icon: Stethoscope },
    { id: 'studies', label: 'Estudios', icon: FlaskConical },
    { id: 'diagnosis', label: 'Diagnóstico', icon: Activity },
    { id: 'treatment', label: 'Tratamiento', icon: Pill },
    { id: 'learning', label: 'Aprendizaje', icon: Lightbulb },
]

// Template for a new case
const getEmptyCase = () => ({
    title: '',
    category: 'otro',
    difficulty: 3,
    tags: [],
    patient: {
        name: '',
        age: null,
        gender: '',
        weight: null,
        height: null,
        bloodType: '',
        occupation: '',
        photoUrl: ''
    },
    clinicalHistory: {
        chiefComplaint: '',
        historyOfPresentIllness: '',
        pastMedicalHistory: [],
        familyHistory: [],
        allergies: [],
        currentMedications: [],
        socialHistory: {
            smoking: false,
            alcohol: false,
            drugs: false,
            exercise: '',
            diet: '',
            notes: ''
        }
    },
    physicalExam: {
        vitalSigns: {
            bloodPressure: '',
            heartRate: null,
            respiratoryRate: null,
            temperature: null,
            oxygenSaturation: null,
            painScale: null
        },
        general: '',
        cardiovascular: '',
        respiratory: '',
        abdominal: '',
        neurological: '',
        musculoskeletal: '',
        skin: '',
        other: ''
    },
    diagnosticStudies: {
        laboratories: [],
        imaging: [],
        procedures: []
    },
    diagnoses: {
        differentials: [],
        final: {
            name: '',
            icd10: '',
            justification: ''
        }
    },
    treatment: {
        plan: '',
        medications: [],
        procedures: [],
        followUp: ''
    },
    learningNotes: {
        keyPoints: [],
        clinicalPearls: [],
        mistakes: [],
        resources: [],
        personalNotes: ''
    }
})

export default function CaseForm({ caseId, onClose, onSave }) {
    const { getCaseById, addCase, updateCase } = useClinicalCases()
    const [formData, setFormData] = useState(getEmptyCase())
    const [activeSection, setActiveSection] = useState('general')
    const [errors, setErrors] = useState({})

    // Load existing case data if editing
    useEffect(() => {
        if (caseId) {
            const existingCase = getCaseById(caseId)
            if (existingCase) {
                setFormData(existingCase)
            }
        }
    }, [caseId])

    const updateField = (path, value) => {
        setFormData(prev => {
            const keys = path.split('.')
            const newData = JSON.parse(JSON.stringify(prev)) // Deep clone
            let current = newData

            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {}
                }
                current = current[keys[i]]
            }

            current[keys[keys.length - 1]] = value
            return newData
        })
    }

    const addToArray = (path, item) => {
        setFormData(prev => {
            const keys = path.split('.')
            const newData = JSON.parse(JSON.stringify(prev))
            let current = newData

            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {}
                current = current[keys[i]]
            }

            const lastKey = keys[keys.length - 1]
            if (!current[lastKey]) current[lastKey] = []
            current[lastKey] = [...current[lastKey], item]
            return newData
        })
    }

    const removeFromArray = (path, index) => {
        setFormData(prev => {
            const keys = path.split('.')
            const newData = JSON.parse(JSON.stringify(prev))
            let current = newData

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]]
            }

            const lastKey = keys[keys.length - 1]
            current[lastKey] = current[lastKey].filter((_, i) => i !== index)
            return newData
        })
    }

    const updateArrayItem = (path, index, field, value) => {
        setFormData(prev => {
            const keys = path.split('.')
            const newData = JSON.parse(JSON.stringify(prev))
            let current = newData

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]]
            }

            const lastKey = keys[keys.length - 1]
            current[lastKey] = current[lastKey].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
            return newData
        })
    }

    const updateArrayItemDirect = (path, index, value) => {
        setFormData(prev => {
            const keys = path.split('.')
            const newData = JSON.parse(JSON.stringify(prev))
            let current = newData

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]]
            }

            const lastKey = keys[keys.length - 1]
            current[lastKey][index] = value
            return newData
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // Basic validation
        const newErrors = {}
        if (!formData.title?.trim()) {
            newErrors.title = 'El título es obligatorio'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            setActiveSection('general')
            return
        }

        // Save to context
        let savedId
        if (caseId) {
            updateCase(caseId, formData)
            savedId = caseId
        } else {
            savedId = addCase(formData)
        }

        // Notify parent
        if (onSave) {
            onSave(savedId)
        }
    }

    const currentSectionIndex = FORM_SECTIONS.findIndex(s => s.id === activeSection)
    const canGoNext = currentSectionIndex < FORM_SECTIONS.length - 1
    const canGoPrev = currentSectionIndex > 0

    const goNext = () => {
        if (canGoNext) {
            setActiveSection(FORM_SECTIONS[currentSectionIndex + 1].id)
        }
    }

    const goPrev = () => {
        if (canGoPrev) {
            setActiveSection(FORM_SECTIONS[currentSectionIndex - 1].id)
        }
    }

    return (
        <div className="case-form-overlay">
            <div className="case-form-container">
                {/* Header */}
                <div className="form-header">
                    <h2>{caseId ? 'Editar Caso' : 'Nuevo Caso Clínico'}</h2>
                    <button className="btn-close" onClick={onClose} type="button">
                        <X size={20} />
                    </button>
                </div>

                <div className="form-body">
                    {/* Sidebar Navigation */}
                    <nav className="form-nav">
                        {FORM_SECTIONS.map((section, index) => {
                            const Icon = section.icon
                            return (
                                <button
                                    key={section.id}
                                    type="button"
                                    className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                                    onClick={() => setActiveSection(section.id)}
                                >
                                    <span className="nav-number">{index + 1}</span>
                                    <Icon size={16} />
                                    <span className="nav-label">{section.label}</span>
                                </button>
                            )
                        })}
                    </nav>

                    {/* Form Content */}
                    <form className="form-content" onSubmit={handleSubmit}>
                        {/* General Section */}
                        {activeSection === 'general' && (
                            <div className="form-section">
                                <h3>Información General</h3>

                                <div className="form-group">
                                    <label>Título del Caso *</label>
                                    <input
                                        type="text"
                                        value={formData.title || ''}
                                        onChange={(e) => updateField('title', e.target.value)}
                                        placeholder="Ej: Infarto Agudo de Miocardio en adulto mayor"
                                        className={errors.title ? 'error' : ''}
                                    />
                                    {errors.title && <span className="error-msg">{errors.title}</span>}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Categoría</label>
                                        <select
                                            value={formData.category || 'otro'}
                                            onChange={(e) => updateField('category', e.target.value)}
                                        >
                                            {Object.entries(medicalCategories).map(([key, cat]) => (
                                                <option key={key} value={key}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Dificultad</label>
                                        <select
                                            value={formData.difficulty || 3}
                                            onChange={(e) => updateField('difficulty', parseInt(e.target.value))}
                                        >
                                            {Object.entries(difficultyLevels).map(([key, level]) => (
                                                <option key={key} value={key}>{level.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Etiquetas</label>
                                    <div className="tags-input">
                                        <div className="tags-list">
                                            {(formData.tags || []).map((tag, index) => (
                                                <span key={index} className="tag-item">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromArray('tags', index)}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Escribe y presiona Enter"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    const value = e.target.value.trim()
                                                    if (value && !(formData.tags || []).includes(value)) {
                                                        addToArray('tags', value)
                                                        e.target.value = ''
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Patient Section */}
                        {activeSection === 'patient' && (
                            <div className="form-section">
                                <h3>Datos del Paciente</h3>

                                <div className="form-row">
                                    <div className="form-group flex-2">
                                        <label>Nombre</label>
                                        <input
                                            type="text"
                                            value={formData.patient?.name || ''}
                                            onChange={(e) => updateField('patient.name', e.target.value)}
                                            placeholder="Nombre completo"
                                        />
                                    </div>
                                    <div className="form-group flex-1">
                                        <label>Edad</label>
                                        <input
                                            type="number"
                                            value={formData.patient?.age || ''}
                                            onChange={(e) => updateField('patient.age', parseInt(e.target.value) || null)}
                                            placeholder="Años"
                                        />
                                    </div>
                                    <div className="form-group flex-1">
                                        <label>Género</label>
                                        <select
                                            value={formData.patient?.gender || ''}
                                            onChange={(e) => updateField('patient.gender', e.target.value)}
                                        >
                                            <option value="">Seleccionar</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                            <option value="O">Otro</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Peso (kg)</label>
                                        <input
                                            type="number"
                                            value={formData.patient?.weight || ''}
                                            onChange={(e) => updateField('patient.weight', parseFloat(e.target.value) || null)}
                                            placeholder="kg"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Talla (cm)</label>
                                        <input
                                            type="number"
                                            value={formData.patient?.height || ''}
                                            onChange={(e) => updateField('patient.height', parseFloat(e.target.value) || null)}
                                            placeholder="cm"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tipo de Sangre</label>
                                        <select
                                            value={formData.patient?.bloodType || ''}
                                            onChange={(e) => updateField('patient.bloodType', e.target.value)}
                                        >
                                            <option value="">Seleccionar</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Ocupación</label>
                                    <input
                                        type="text"
                                        value={formData.patient?.occupation || ''}
                                        onChange={(e) => updateField('patient.occupation', e.target.value)}
                                        placeholder="Ej: Contador, Jubilado"
                                    />
                                </div>
                            </div>
                        )}

                        {/* History Section */}
                        {activeSection === 'history' && (
                            <div className="form-section">
                                <h3>Historia Clínica</h3>

                                <div className="form-group">
                                    <label>Motivo de Consulta</label>
                                    <textarea
                                        value={formData.clinicalHistory?.chiefComplaint || ''}
                                        onChange={(e) => updateField('clinicalHistory.chiefComplaint', e.target.value)}
                                        placeholder="Principal síntoma o razón de consulta"
                                        rows={2}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Historia de la Enfermedad Actual</label>
                                    <textarea
                                        value={formData.clinicalHistory?.historyOfPresentIllness || ''}
                                        onChange={(e) => updateField('clinicalHistory.historyOfPresentIllness', e.target.value)}
                                        placeholder="Descripción detallada del cuadro actual..."
                                        rows={4}
                                    />
                                </div>

                                {/* Past Medical History */}
                                <div className="form-group">
                                    <label>Antecedentes Personales Patológicos</label>
                                    <div className="array-input">
                                        {(formData.clinicalHistory?.pastMedicalHistory || []).map((item, index) => (
                                            <div key={index} className="array-item">
                                                <input
                                                    type="text"
                                                    value={item}
                                                    onChange={(e) => updateArrayItemDirect('clinicalHistory.pastMedicalHistory', index, e.target.value)}
                                                    placeholder="Ej: Diabetes Mellitus tipo 2"
                                                />
                                                <button type="button" onClick={() => removeFromArray('clinicalHistory.pastMedicalHistory', index)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="btn-add-item"
                                            onClick={() => addToArray('clinicalHistory.pastMedicalHistory', '')}
                                        >
                                            <Plus size={14} />
                                            Agregar antecedente
                                        </button>
                                    </div>
                                </div>

                                {/* Allergies */}
                                <div className="form-group">
                                    <label>Alergias</label>
                                    <div className="array-input">
                                        {(formData.clinicalHistory?.allergies || []).map((allergy, index) => (
                                            <div key={index} className="array-item-row">
                                                <input
                                                    type="text"
                                                    value={allergy.name || ''}
                                                    onChange={(e) => updateArrayItem('clinicalHistory.allergies', index, 'name', e.target.value)}
                                                    placeholder="Alérgeno"
                                                />
                                                <input
                                                    type="text"
                                                    value={allergy.reaction || ''}
                                                    onChange={(e) => updateArrayItem('clinicalHistory.allergies', index, 'reaction', e.target.value)}
                                                    placeholder="Reacción"
                                                />
                                                <button type="button" onClick={() => removeFromArray('clinicalHistory.allergies', index)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="btn-add-item"
                                            onClick={() => addToArray('clinicalHistory.allergies', { name: '', reaction: '' })}
                                        >
                                            <Plus size={14} />
                                            Agregar alergia
                                        </button>
                                    </div>
                                </div>

                                {/* Current Medications */}
                                <div className="form-group">
                                    <label>Medicamentos Actuales</label>
                                    <div className="array-input">
                                        {(formData.clinicalHistory?.currentMedications || []).map((med, index) => (
                                            <div key={index} className="array-item-row">
                                                <input
                                                    type="text"
                                                    value={med.name || ''}
                                                    onChange={(e) => updateArrayItem('clinicalHistory.currentMedications', index, 'name', e.target.value)}
                                                    placeholder="Medicamento"
                                                    className="flex-2"
                                                />
                                                <input
                                                    type="text"
                                                    value={med.dose || ''}
                                                    onChange={(e) => updateArrayItem('clinicalHistory.currentMedications', index, 'dose', e.target.value)}
                                                    placeholder="Dosis"
                                                />
                                                <input
                                                    type="text"
                                                    value={med.frequency || ''}
                                                    onChange={(e) => updateArrayItem('clinicalHistory.currentMedications', index, 'frequency', e.target.value)}
                                                    placeholder="Frecuencia"
                                                />
                                                <button type="button" onClick={() => removeFromArray('clinicalHistory.currentMedications', index)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="btn-add-item"
                                            onClick={() => addToArray('clinicalHistory.currentMedications', { name: '', dose: '', frequency: '' })}
                                        >
                                            <Plus size={14} />
                                            Agregar medicamento
                                        </button>
                                    </div>
                                </div>

                                {/* Social History */}
                                <div className="form-subsection">
                                    <h4>Historia Social</h4>
                                    <div className="form-row checkboxes">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.clinicalHistory?.socialHistory?.smoking || false}
                                                onChange={(e) => updateField('clinicalHistory.socialHistory.smoking', e.target.checked)}
                                            />
                                            Tabaquismo
                                        </label>
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.clinicalHistory?.socialHistory?.alcohol || false}
                                                onChange={(e) => updateField('clinicalHistory.socialHistory.alcohol', e.target.checked)}
                                            />
                                            Alcohol
                                        </label>
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.clinicalHistory?.socialHistory?.drugs || false}
                                                onChange={(e) => updateField('clinicalHistory.socialHistory.drugs', e.target.checked)}
                                            />
                                            Drogas
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Physical Exam Section */}
                        {activeSection === 'exam' && (
                            <div className="form-section">
                                <h3>Examen Físico</h3>

                                <div className="form-subsection">
                                    <h4>Signos Vitales</h4>
                                    <div className="vitals-grid">
                                        <div className="form-group">
                                            <label>PA (mmHg)</label>
                                            <input
                                                type="text"
                                                value={formData.physicalExam?.vitalSigns?.bloodPressure || ''}
                                                onChange={(e) => updateField('physicalExam.vitalSigns.bloodPressure', e.target.value)}
                                                placeholder="120/80"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>FC (lpm)</label>
                                            <input
                                                type="number"
                                                value={formData.physicalExam?.vitalSigns?.heartRate || ''}
                                                onChange={(e) => updateField('physicalExam.vitalSigns.heartRate', parseInt(e.target.value) || null)}
                                                placeholder="80"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>FR (rpm)</label>
                                            <input
                                                type="number"
                                                value={formData.physicalExam?.vitalSigns?.respiratoryRate || ''}
                                                onChange={(e) => updateField('physicalExam.vitalSigns.respiratoryRate', parseInt(e.target.value) || null)}
                                                placeholder="16"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Temp (°C)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={formData.physicalExam?.vitalSigns?.temperature || ''}
                                                onChange={(e) => updateField('physicalExam.vitalSigns.temperature', parseFloat(e.target.value) || null)}
                                                placeholder="36.5"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>SpO2 (%)</label>
                                            <input
                                                type="number"
                                                value={formData.physicalExam?.vitalSigns?.oxygenSaturation || ''}
                                                onChange={(e) => updateField('physicalExam.vitalSigns.oxygenSaturation', parseInt(e.target.value) || null)}
                                                placeholder="98"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Dolor (0-10)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={formData.physicalExam?.vitalSigns?.painScale || ''}
                                                onChange={(e) => updateField('physicalExam.vitalSigns.painScale', parseInt(e.target.value) || null)}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Aspecto General</label>
                                    <textarea
                                        value={formData.physicalExam?.general || ''}
                                        onChange={(e) => updateField('physicalExam.general', e.target.value)}
                                        placeholder="Estado general del paciente..."
                                        rows={2}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Cardiovascular</label>
                                        <textarea
                                            value={formData.physicalExam?.cardiovascular || ''}
                                            onChange={(e) => updateField('physicalExam.cardiovascular', e.target.value)}
                                            rows={2}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Respiratorio</label>
                                        <textarea
                                            value={formData.physicalExam?.respiratory || ''}
                                            onChange={(e) => updateField('physicalExam.respiratory', e.target.value)}
                                            rows={2}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Abdominal</label>
                                        <textarea
                                            value={formData.physicalExam?.abdominal || ''}
                                            onChange={(e) => updateField('physicalExam.abdominal', e.target.value)}
                                            rows={2}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Neurológico</label>
                                        <textarea
                                            value={formData.physicalExam?.neurological || ''}
                                            onChange={(e) => updateField('physicalExam.neurological', e.target.value)}
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Studies Section */}
                        {activeSection === 'studies' && (
                            <div className="form-section">
                                <h3>Estudios Diagnósticos</h3>

                                <div className="form-subsection">
                                    <h4>Laboratorios</h4>
                                    <div className="array-input">
                                        {(formData.diagnosticStudies?.laboratories || []).map((lab, index) => (
                                            <div key={index} className="array-item-row">
                                                <input
                                                    type="text"
                                                    value={lab.test || ''}
                                                    onChange={(e) => updateArrayItem('diagnosticStudies.laboratories', index, 'test', e.target.value)}
                                                    placeholder="Prueba"
                                                    className="flex-2"
                                                />
                                                <input
                                                    type="text"
                                                    value={lab.result || ''}
                                                    onChange={(e) => updateArrayItem('diagnosticStudies.laboratories', index, 'result', e.target.value)}
                                                    placeholder="Resultado"
                                                />
                                                <input
                                                    type="text"
                                                    value={lab.reference || ''}
                                                    onChange={(e) => updateArrayItem('diagnosticStudies.laboratories', index, 'reference', e.target.value)}
                                                    placeholder="Referencia"
                                                />
                                                <label className="checkbox-inline">
                                                    <input
                                                        type="checkbox"
                                                        checked={lab.abnormal || false}
                                                        onChange={(e) => updateArrayItem('diagnosticStudies.laboratories', index, 'abnormal', e.target.checked)}
                                                    />
                                                    <AlertCircle size={14} />
                                                </label>
                                                <button type="button" onClick={() => removeFromArray('diagnosticStudies.laboratories', index)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="btn-add-item"
                                            onClick={() => addToArray('diagnosticStudies.laboratories', { test: '', result: '', reference: '', abnormal: false })}
                                        >
                                            <Plus size={14} />
                                            Agregar laboratorio
                                        </button>
                                    </div>
                                </div>

                                <div className="form-subsection">
                                    <h4>Estudios de Imagen</h4>
                                    <div className="array-input">
                                        {(formData.diagnosticStudies?.imaging || []).map((img, index) => (
                                            <div key={index} className="imaging-item">
                                                <div className="array-item-row">
                                                    <input
                                                        type="text"
                                                        value={img.type || ''}
                                                        onChange={(e) => updateArrayItem('diagnosticStudies.imaging', index, 'type', e.target.value)}
                                                        placeholder="Tipo (Rx, TC, RM)"
                                                    />
                                                    <button type="button" onClick={() => removeFromArray('diagnosticStudies.imaging', index)}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <textarea
                                                    value={img.findings || ''}
                                                    onChange={(e) => updateArrayItem('diagnosticStudies.imaging', index, 'findings', e.target.value)}
                                                    placeholder="Hallazgos..."
                                                    rows={2}
                                                />
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="btn-add-item"
                                            onClick={() => addToArray('diagnosticStudies.imaging', { type: '', description: '', findings: '' })}
                                        >
                                            <Plus size={14} />
                                            Agregar estudio de imagen
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Diagnosis Section */}
                        {activeSection === 'diagnosis' && (
                            <div className="form-section">
                                <h3>Diagnóstico</h3>

                                <div className="form-subsection">
                                    <h4>Diagnóstico Final</h4>
                                    <div className="form-group">
                                        <label>Diagnóstico</label>
                                        <input
                                            type="text"
                                            value={formData.diagnoses?.final?.name || ''}
                                            onChange={(e) => updateField('diagnoses.final.name', e.target.value)}
                                            placeholder="Nombre del diagnóstico"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Código CIE-10</label>
                                            <input
                                                type="text"
                                                value={formData.diagnoses?.final?.icd10 || ''}
                                                onChange={(e) => updateField('diagnoses.final.icd10', e.target.value)}
                                                placeholder="I21.0"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Justificación</label>
                                        <textarea
                                            value={formData.diagnoses?.final?.justification || ''}
                                            onChange={(e) => updateField('diagnoses.final.justification', e.target.value)}
                                            placeholder="Por qué se llegó a este diagnóstico..."
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <div className="form-subsection">
                                    <h4>Diagnósticos Diferenciales</h4>
                                    <div className="array-input">
                                        {(formData.diagnoses?.differentials || []).map((diff, index) => (
                                            <div key={index} className="differential-item">
                                                <div className="array-item-row">
                                                    <input
                                                        type="text"
                                                        value={diff.name || ''}
                                                        onChange={(e) => updateArrayItem('diagnoses.differentials', index, 'name', e.target.value)}
                                                        placeholder="Diagnóstico diferencial"
                                                        className="flex-3"
                                                    />
                                                    <div className="probability-input">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={diff.probability || ''}
                                                            onChange={(e) => updateArrayItem('diagnoses.differentials', index, 'probability', parseInt(e.target.value) || 0)}
                                                        />
                                                        <span>%</span>
                                                    </div>
                                                    <button type="button" onClick={() => removeFromArray('diagnoses.differentials', index)}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <textarea
                                                    value={diff.reasoning || ''}
                                                    onChange={(e) => updateArrayItem('diagnoses.differentials', index, 'reasoning', e.target.value)}
                                                    placeholder="Razonamiento..."
                                                    rows={2}
                                                />
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="btn-add-item"
                                            onClick={() => addToArray('diagnoses.differentials', { name: '', probability: 0, reasoning: '' })}
                                        >
                                            <Plus size={14} />
                                            Agregar diagnóstico diferencial
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Treatment Section */}
                        {activeSection === 'treatment' && (
                            <div className="form-section">
                                <h3>Tratamiento</h3>

                                <div className="form-group">
                                    <label>Plan de Tratamiento</label>
                                    <textarea
                                        value={formData.treatment?.plan || ''}
                                        onChange={(e) => updateField('treatment.plan', e.target.value)}
                                        placeholder="Descripción general del plan de manejo..."
                                        rows={3}
                                    />
                                </div>

                                <div className="form-subsection">
                                    <h4>Medicamentos</h4>
                                    <div className="array-input">
                                        {(formData.treatment?.medications || []).map((med, index) => (
                                            <div key={index} className="array-item-row">
                                                <input
                                                    type="text"
                                                    value={med.name || ''}
                                                    onChange={(e) => updateArrayItem('treatment.medications', index, 'name', e.target.value)}
                                                    placeholder="Medicamento"
                                                    className="flex-2"
                                                />
                                                <input
                                                    type="text"
                                                    value={med.dose || ''}
                                                    onChange={(e) => updateArrayItem('treatment.medications', index, 'dose', e.target.value)}
                                                    placeholder="Dosis"
                                                />
                                                <input
                                                    type="text"
                                                    value={med.route || ''}
                                                    onChange={(e) => updateArrayItem('treatment.medications', index, 'route', e.target.value)}
                                                    placeholder="Vía"
                                                />
                                                <input
                                                    type="text"
                                                    value={med.frequency || ''}
                                                    onChange={(e) => updateArrayItem('treatment.medications', index, 'frequency', e.target.value)}
                                                    placeholder="Frecuencia"
                                                />
                                                <button type="button" onClick={() => removeFromArray('treatment.medications', index)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="btn-add-item"
                                            onClick={() => addToArray('treatment.medications', { name: '', dose: '', route: '', frequency: '', duration: '' })}
                                        >
                                            <Plus size={14} />
                                            Agregar medicamento
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Seguimiento</label>
                                    <textarea
                                        value={formData.treatment?.followUp || ''}
                                        onChange={(e) => updateField('treatment.followUp', e.target.value)}
                                        placeholder="Plan de seguimiento y citas..."
                                        rows={2}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Learning Section */}
                        {activeSection === 'learning' && (
                            <div className="form-section">
                                <h3>Notas de Aprendizaje</h3>

                                <div className="form-group">
                                    <label>Puntos Clave</label>
                                    <div className="array-input">
                                        {(formData.learningNotes?.keyPoints || []).map((point, index) => (
                                            <div key={index} className="array-item">
                                                <input
                                                    type="text"
                                                    value={point}
                                                    onChange={(e) => updateArrayItemDirect('learningNotes.keyPoints', index, e.target.value)}
                                                    placeholder="Punto clave a recordar"
                                                />
                                                <button type="button" onClick={() => removeFromArray('learningNotes.keyPoints', index)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="btn-add-item"
                                            onClick={() => addToArray('learningNotes.keyPoints', '')}
                                        >
                                            <Plus size={14} />
                                            Agregar punto clave
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Perlas Clínicas</label>
                                    <div className="array-input">
                                        {(formData.learningNotes?.clinicalPearls || []).map((pearl, index) => (
                                            <div key={index} className="array-item">
                                                <input
                                                    type="text"
                                                    value={pearl}
                                                    onChange={(e) => updateArrayItemDirect('learningNotes.clinicalPearls', index, e.target.value)}
                                                    placeholder="Perla clínica"
                                                />
                                                <button type="button" onClick={() => removeFromArray('learningNotes.clinicalPearls', index)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="btn-add-item"
                                            onClick={() => addToArray('learningNotes.clinicalPearls', '')}
                                        >
                                            <Plus size={14} />
                                            Agregar perla clínica
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Notas Personales</label>
                                    <textarea
                                        value={formData.learningNotes?.personalNotes || ''}
                                        onChange={(e) => updateField('learningNotes.personalNotes', e.target.value)}
                                        placeholder="Tus reflexiones y notas personales sobre este caso..."
                                        rows={4}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Form Footer */}
                        <div className="form-footer">
                            <div className="nav-buttons">
                                <button
                                    type="button"
                                    className="btn-nav"
                                    onClick={goPrev}
                                    disabled={!canGoPrev}
                                >
                                    <ChevronLeft size={16} />
                                    Anterior
                                </button>
                                <button
                                    type="button"
                                    className="btn-nav"
                                    onClick={goNext}
                                    disabled={!canGoNext}
                                >
                                    Siguiente
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            <div className="action-buttons">
                                <button type="button" className="btn-cancel" onClick={onClose}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-save">
                                    <Save size={16} />
                                    Guardar Caso
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
