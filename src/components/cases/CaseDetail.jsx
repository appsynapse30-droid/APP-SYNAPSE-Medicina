import { useState } from 'react'
import {
    ArrowLeft,
    Edit2,
    Copy,
    Trash2,
    Star,
    BookOpen,
    Play,
    Clock,
    Calendar,
    Activity,
    Heart,
    Brain,
    Wind,
    Droplets,
    Bug,
    Baby,
    Clipboard,
    User,
    FileText,
    Stethoscope,
    FlaskConical,
    Pill,
    Lightbulb,
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    TrendingUp
} from 'lucide-react'
import { useClinicalCases, medicalCategories, difficultyLevels, caseStatuses } from '../../context/ClinicalCasesContext'

const TABS = [
    { id: 'overview', label: 'Resumen', icon: FileText },
    { id: 'history', label: 'Historia', icon: FileText },
    { id: 'exam', label: 'Examen', icon: Stethoscope },
    { id: 'studies', label: 'Estudios', icon: FlaskConical },
    { id: 'diagnosis', label: 'Diagnóstico', icon: Activity },
    { id: 'treatment', label: 'Tratamiento', icon: Pill },
    { id: 'learning', label: 'Aprendizaje', icon: Lightbulb },
]

// Iconos de categoría
const categoryIcons = {
    cardiologia: Heart,
    neurologia: Brain,
    neumologia: Wind,
    gastroenterologia: Activity,
    endocrinologia: Activity,
    nefrologia: Droplets,
    traumatologia: Clipboard,
    infectologia: Bug,
    pediatria: Baby,
    ginecologia: Heart,
    emergencias: AlertCircle,
    otro: Clipboard,
}

export default function CaseDetail({ caseId, onBack, onEdit, onStudy, onSimulate }) {
    const { getCaseById, toggleFavorite, deleteCase, duplicateCase } = useClinicalCases()
    const [activeTab, setActiveTab] = useState('overview')
    const [openSections, setOpenSections] = useState({})

    const caseData = getCaseById(caseId)

    if (!caseData) {
        return (
            <div className="case-not-found">
                <AlertCircle size={48} />
                <h3>Caso no encontrado</h3>
                <button onClick={onBack}>Volver a la biblioteca</button>
            </div>
        )
    }

    const CategoryIcon = categoryIcons[caseData.category] || Clipboard

    const toggleSection = (sectionId) => {
        setOpenSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }))
    }

    const handleDelete = () => {
        if (confirm('¿Estás seguro de que deseas eliminar este caso?')) {
            deleteCase(caseId)
            onBack()
        }
    }

    const handleDuplicate = () => {
        const newId = duplicateCase(caseId)
        if (newId) {
            // Optionally navigate to the new case
            alert('Caso duplicado exitosamente')
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A'
        return new Date(dateStr).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const renderVitalSign = (label, value, unit = '', isAbnormal = false) => {
        if (!value && value !== 0) return null
        return (
            <div className={`vital-item ${isAbnormal ? 'abnormal' : ''}`}>
                <span className="vital-label">{label}</span>
                <span className="vital-value">{value}{unit}</span>
            </div>
        )
    }

    return (
        <div className="case-detail">
            {/* Header */}
            <div className="detail-header">
                <button className="btn-back" onClick={onBack}>
                    <ArrowLeft size={18} />
                    Biblioteca
                </button>

                <div className="header-actions">
                    <button
                        className={`btn-icon ${caseData.isFavorite ? 'active' : ''}`}
                        onClick={() => toggleFavorite(caseId)}
                        title="Favorito"
                    >
                        <Star size={18} fill={caseData.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                    <button className="btn-icon" onClick={() => onEdit(caseId)} title="Editar">
                        <Edit2 size={18} />
                    </button>
                    <button className="btn-icon" onClick={handleDuplicate} title="Duplicar">
                        <Copy size={18} />
                    </button>
                    <button className="btn-icon danger" onClick={handleDelete} title="Eliminar">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Case Info Header */}
            <div className="case-info-header">
                <div className="case-main-info">
                    <div
                        className="category-badge large"
                        style={{
                            backgroundColor: medicalCategories[caseData.category]?.bgColor,
                            color: medicalCategories[caseData.category]?.color
                        }}
                    >
                        <CategoryIcon size={20} />
                        <span>{medicalCategories[caseData.category]?.label}</span>
                    </div>

                    <h1>{caseData.title || 'Sin título'}</h1>

                    <div className="case-meta-row">
                        <span
                            className="status-badge"
                            style={{
                                backgroundColor: caseStatuses[caseData.status]?.bgColor,
                                color: caseStatuses[caseData.status]?.color
                            }}
                        >
                            {caseStatuses[caseData.status]?.label}
                        </span>

                        <div className="difficulty-indicator">
                            <span>Dificultad:</span>
                            {Array(5).fill(0).map((_, i) => (
                                <span
                                    key={i}
                                    className={`dot ${i < caseData.difficulty ? 'filled' : ''}`}
                                    style={{
                                        backgroundColor: i < caseData.difficulty
                                            ? difficultyLevels[caseData.difficulty]?.color
                                            : undefined
                                    }}
                                />
                            ))}
                            <span className="label">{difficultyLevels[caseData.difficulty]?.label}</span>
                        </div>

                        <div className="date-info">
                            <Calendar size={14} />
                            <span>Actualizado: {formatDate(caseData.updatedAt)}</span>
                        </div>
                    </div>

                    {caseData.tags?.length > 0 && (
                        <div className="tags-row">
                            {caseData.tags.map((tag, idx) => (
                                <span key={idx} className="tag">{tag}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Patient Card */}
                {caseData.patient?.name && (
                    <div className="patient-card">
                        {caseData.patient.photoUrl && (
                            <img
                                src={caseData.patient.photoUrl}
                                alt={caseData.patient.name}
                                className="patient-avatar"
                            />
                        )}
                        <div className="patient-info">
                            <h3>{caseData.patient.name}</h3>
                            <p>
                                {caseData.patient.age && `${caseData.patient.age} años`}
                                {caseData.patient.gender && ` • ${caseData.patient.gender === 'M' ? 'Masculino' : caseData.patient.gender === 'F' ? 'Femenino' : 'Otro'}`}
                            </p>
                            {(caseData.patient.weight || caseData.patient.height) && (
                                <p className="measurements">
                                    {caseData.patient.weight && `${caseData.patient.weight} kg`}
                                    {caseData.patient.weight && caseData.patient.height && ' • '}
                                    {caseData.patient.height && `${caseData.patient.height} cm`}
                                </p>
                            )}
                            {caseData.patient.bloodType && (
                                <span className="blood-type">{caseData.patient.bloodType}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Study Progress */}
                <div className="study-progress-card">
                    <h4>Progreso de Estudio</h4>
                    <div className="progress-bar large">
                        <div
                            className="progress-fill"
                            style={{ width: `${caseData.studyStats?.masteryLevel || 0}%` }}
                        />
                    </div>
                    <div className="progress-stats">
                        <span>{caseData.studyStats?.masteryLevel || 0}% dominado</span>
                        <span>{caseData.studyStats?.timesReviewed || 0} repasos</span>
                    </div>
                    {caseData.studyStats?.lastReviewedAt && (
                        <p className="last-review">
                            <Clock size={12} />
                            Último repaso: {formatDate(caseData.studyStats.lastReviewedAt)}
                        </p>
                    )}
                    <div className="study-actions">
                        <button className="btn-study" onClick={() => onStudy(caseId)}>
                            <BookOpen size={16} />
                            Modo Estudio
                        </button>
                        {caseData.timeline?.length > 0 && (
                            <button className="btn-simulate" onClick={() => onSimulate(caseId)}>
                                <Play size={16} />
                                Simular
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="detail-tabs">
                {TABS.map(tab => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Tab Content */}
            <div className="detail-content">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="tab-content overview">
                        {caseData.clinicalHistory?.chiefComplaint && (
                            <div className="content-section">
                                <h3>Motivo de Consulta</h3>
                                <p className="chief-complaint">{caseData.clinicalHistory.chiefComplaint}</p>
                            </div>
                        )}

                        {caseData.clinicalHistory?.historyOfPresentIllness && (
                            <div className="content-section">
                                <h3>Historia de la Enfermedad Actual</h3>
                                <p>{caseData.clinicalHistory.historyOfPresentIllness}</p>
                            </div>
                        )}

                        {/* Vital Signs */}
                        {caseData.physicalExam?.vitalSigns && (
                            <div className="content-section vitals-section">
                                <h3>Signos Vitales</h3>
                                <div className="vitals-grid">
                                    {renderVitalSign('PA', caseData.physicalExam.vitalSigns.bloodPressure, ' mmHg')}
                                    {renderVitalSign('FC', caseData.physicalExam.vitalSigns.heartRate, ' lpm')}
                                    {renderVitalSign('FR', caseData.physicalExam.vitalSigns.respiratoryRate, ' rpm')}
                                    {renderVitalSign('Temp', caseData.physicalExam.vitalSigns.temperature, ' °C')}
                                    {renderVitalSign('SpO2', caseData.physicalExam.vitalSigns.oxygenSaturation, '%')}
                                    {renderVitalSign('Dolor', caseData.physicalExam.vitalSigns.painScale, '/10')}
                                </div>
                            </div>
                        )}

                        {/* Quick Diagnosis View */}
                        {caseData.diagnoses?.final?.name && (
                            <div className="content-section diagnosis-preview">
                                <h3>Diagnóstico Final</h3>
                                <div className="final-diagnosis">
                                    <span className="diagnosis-name">{caseData.diagnoses.final.name}</span>
                                    {caseData.diagnoses.final.icd10 && (
                                        <span className="icd-code">{caseData.diagnoses.final.icd10}</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="tab-content history">
                        {/* Antecedentes Personales */}
                        {caseData.clinicalHistory?.pastMedicalHistory?.length > 0 && (
                            <div className="content-section collapsible">
                                <button
                                    className="section-header"
                                    onClick={() => toggleSection('pastHistory')}
                                >
                                    <h3>Antecedentes Personales Patológicos</h3>
                                    {openSections.pastHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {openSections.pastHistory !== false && (
                                    <ul className="history-list">
                                        {caseData.clinicalHistory.pastMedicalHistory.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* Antecedentes Familiares */}
                        {caseData.clinicalHistory?.familyHistory?.length > 0 && (
                            <div className="content-section collapsible">
                                <button
                                    className="section-header"
                                    onClick={() => toggleSection('familyHistory')}
                                >
                                    <h3>Antecedentes Familiares</h3>
                                    {openSections.familyHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {openSections.familyHistory !== false && (
                                    <ul className="history-list">
                                        {caseData.clinicalHistory.familyHistory.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* Historia Social */}
                        {caseData.clinicalHistory?.socialHistory && (
                            <div className="content-section">
                                <h3>Historia Social</h3>
                                <div className="social-history">
                                    <div className="habits">
                                        <span className={caseData.clinicalHistory.socialHistory.smoking ? 'positive' : 'negative'}>
                                            {caseData.clinicalHistory.socialHistory.smoking ? '✓' : '✗'} Tabaquismo
                                        </span>
                                        <span className={caseData.clinicalHistory.socialHistory.alcohol ? 'positive' : 'negative'}>
                                            {caseData.clinicalHistory.socialHistory.alcohol ? '✓' : '✗'} Alcohol
                                        </span>
                                        <span className={caseData.clinicalHistory.socialHistory.drugs ? 'positive' : 'negative'}>
                                            {caseData.clinicalHistory.socialHistory.drugs ? '✓' : '✗'} Drogas
                                        </span>
                                    </div>
                                    {caseData.clinicalHistory.socialHistory.exercise && (
                                        <p><strong>Ejercicio:</strong> {caseData.clinicalHistory.socialHistory.exercise}</p>
                                    )}
                                    {caseData.clinicalHistory.socialHistory.diet && (
                                        <p><strong>Dieta:</strong> {caseData.clinicalHistory.socialHistory.diet}</p>
                                    )}
                                    {caseData.clinicalHistory.socialHistory.notes && (
                                        <p className="notes">{caseData.clinicalHistory.socialHistory.notes}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Alergias */}
                        {caseData.clinicalHistory?.allergies?.length > 0 && (
                            <div className="content-section">
                                <h3>Alergias</h3>
                                <div className="allergies-list">
                                    {caseData.clinicalHistory.allergies.map((allergy, idx) => (
                                        <div key={idx} className="allergy-item">
                                            <AlertCircle size={14} />
                                            <span className="allergen">{allergy.name}</span>
                                            {allergy.reaction && (
                                                <span className="reaction">→ {allergy.reaction}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Medicamentos Actuales */}
                        {caseData.clinicalHistory?.currentMedications?.length > 0 && (
                            <div className="content-section">
                                <h3>Medicamentos Actuales</h3>
                                <div className="medications-list">
                                    {caseData.clinicalHistory.currentMedications.map((med, idx) => (
                                        <div key={idx} className="medication-item">
                                            <Pill size={14} />
                                            <span className="med-name">{med.name}</span>
                                            {med.dose && <span className="dose">{med.dose}</span>}
                                            {med.frequency && <span className="frequency">{med.frequency}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Physical Exam Tab */}
                {activeTab === 'exam' && (
                    <div className="tab-content exam">
                        {caseData.physicalExam?.general && (
                            <div className="content-section">
                                <h3>Aspecto General</h3>
                                <p>{caseData.physicalExam.general}</p>
                            </div>
                        )}

                        <div className="exam-grid">
                            {caseData.physicalExam?.cardiovascular && (
                                <div className="exam-item">
                                    <h4>Cardiovascular</h4>
                                    <p>{caseData.physicalExam.cardiovascular}</p>
                                </div>
                            )}
                            {caseData.physicalExam?.respiratory && (
                                <div className="exam-item">
                                    <h4>Respiratorio</h4>
                                    <p>{caseData.physicalExam.respiratory}</p>
                                </div>
                            )}
                            {caseData.physicalExam?.abdominal && (
                                <div className="exam-item">
                                    <h4>Abdominal</h4>
                                    <p>{caseData.physicalExam.abdominal}</p>
                                </div>
                            )}
                            {caseData.physicalExam?.neurological && (
                                <div className="exam-item">
                                    <h4>Neurológico</h4>
                                    <p>{caseData.physicalExam.neurological}</p>
                                </div>
                            )}
                            {caseData.physicalExam?.musculoskeletal && (
                                <div className="exam-item">
                                    <h4>Músculo-esquelético</h4>
                                    <p>{caseData.physicalExam.musculoskeletal}</p>
                                </div>
                            )}
                            {caseData.physicalExam?.skin && (
                                <div className="exam-item">
                                    <h4>Piel y Anexos</h4>
                                    <p>{caseData.physicalExam.skin}</p>
                                </div>
                            )}
                        </div>

                        {caseData.physicalExam?.other && (
                            <div className="content-section">
                                <h3>Otros Hallazgos</h3>
                                <p>{caseData.physicalExam.other}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Studies Tab */}
                {activeTab === 'studies' && (
                    <div className="tab-content studies">
                        {/* Laboratorios */}
                        {caseData.diagnosticStudies?.laboratories?.length > 0 && (
                            <div className="content-section">
                                <h3>Laboratorios</h3>
                                <table className="labs-table">
                                    <thead>
                                        <tr>
                                            <th>Prueba</th>
                                            <th>Resultado</th>
                                            <th>Referencia</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {caseData.diagnosticStudies.laboratories.map((lab, idx) => (
                                            <tr key={idx} className={lab.abnormal ? 'abnormal' : ''}>
                                                <td>{lab.test}</td>
                                                <td className="result">{lab.result}</td>
                                                <td className="reference">{lab.reference}</td>
                                                <td className="status">
                                                    {lab.abnormal && <AlertCircle size={14} />}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Imágenes */}
                        {caseData.diagnosticStudies?.imaging?.length > 0 && (
                            <div className="content-section">
                                <h3>Estudios de Imagen</h3>
                                <div className="imaging-list">
                                    {caseData.diagnosticStudies.imaging.map((img, idx) => (
                                        <div key={idx} className="imaging-item">
                                            <div className="imaging-header">
                                                <h4>{img.type}</h4>
                                                {img.description && <span>{img.description}</span>}
                                            </div>
                                            {img.imageUrl && (
                                                <img
                                                    src={img.imageUrl}
                                                    alt={img.type}
                                                    className="imaging-preview"
                                                />
                                            )}
                                            {img.findings && (
                                                <p className="findings">{img.findings}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Diagnosis Tab */}
                {activeTab === 'diagnosis' && (
                    <div className="tab-content diagnosis">
                        {/* Diagnóstico Final */}
                        {caseData.diagnoses?.final?.name && (
                            <div className="content-section final-diagnosis-section">
                                <h3>Diagnóstico Final</h3>
                                <div className="final-diagnosis-card">
                                    <CheckCircle2 size={24} />
                                    <div>
                                        <h4>{caseData.diagnoses.final.name}</h4>
                                        {caseData.diagnoses.final.icd10 && (
                                            <span className="icd">CIE-10: {caseData.diagnoses.final.icd10}</span>
                                        )}
                                        {caseData.diagnoses.final.justification && (
                                            <p className="justification">{caseData.diagnoses.final.justification}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Diagnósticos Diferenciales */}
                        {caseData.diagnoses?.differentials?.length > 0 && (
                            <div className="content-section">
                                <h3>Diagnósticos Diferenciales</h3>
                                <div className="differentials-list">
                                    {caseData.diagnoses.differentials
                                        .sort((a, b) => b.probability - a.probability)
                                        .map((diff, idx) => (
                                            <div key={idx} className="differential-card">
                                                <div className="diff-header">
                                                    <span className="diff-name">{diff.name}</span>
                                                    <span className="diff-probability">{diff.probability}%</span>
                                                </div>
                                                <div className="probability-bar">
                                                    <div
                                                        className="probability-fill"
                                                        style={{ width: `${diff.probability}%` }}
                                                    />
                                                </div>
                                                {diff.reasoning && (
                                                    <p className="reasoning">{diff.reasoning}</p>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Treatment Tab */}
                {activeTab === 'treatment' && (
                    <div className="tab-content treatment">
                        {caseData.treatment?.plan && (
                            <div className="content-section">
                                <h3>Plan de Tratamiento</h3>
                                <p className="treatment-plan">{caseData.treatment.plan}</p>
                            </div>
                        )}

                        {caseData.treatment?.medications?.length > 0 && (
                            <div className="content-section">
                                <h3>Medicamentos</h3>
                                <div className="treatment-medications">
                                    {caseData.treatment.medications.map((med, idx) => (
                                        <div key={idx} className="treatment-med-card">
                                            <div className="med-main">
                                                <Pill size={16} />
                                                <span className="med-name">{med.name}</span>
                                            </div>
                                            <div className="med-details">
                                                {med.dose && <span>Dosis: {med.dose}</span>}
                                                {med.route && <span>Vía: {med.route}</span>}
                                                {med.frequency && <span>Frecuencia: {med.frequency}</span>}
                                                {med.duration && <span>Duración: {med.duration}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {caseData.treatment?.procedures?.length > 0 && (
                            <div className="content-section">
                                <h3>Procedimientos</h3>
                                <ul className="procedures-list">
                                    {caseData.treatment.procedures.map((proc, idx) => (
                                        <li key={idx}>{proc}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {caseData.treatment?.followUp && (
                            <div className="content-section">
                                <h3>Seguimiento</h3>
                                <p>{caseData.treatment.followUp}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Learning Tab */}
                {activeTab === 'learning' && (
                    <div className="tab-content learning">
                        {caseData.learningNotes?.keyPoints?.length > 0 && (
                            <div className="content-section learning-section">
                                <h3>🎯 Puntos Clave</h3>
                                <ul className="key-points">
                                    {caseData.learningNotes.keyPoints.map((point, idx) => (
                                        <li key={idx}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {caseData.learningNotes?.clinicalPearls?.length > 0 && (
                            <div className="content-section learning-section pearls">
                                <h3>💎 Perlas Clínicas</h3>
                                <ul>
                                    {caseData.learningNotes.clinicalPearls.map((pearl, idx) => (
                                        <li key={idx}>{pearl}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {caseData.learningNotes?.mistakes?.length > 0 && (
                            <div className="content-section learning-section mistakes">
                                <h3>⚠️ Errores a Evitar</h3>
                                <ul>
                                    {caseData.learningNotes.mistakes.map((mistake, idx) => (
                                        <li key={idx}>{mistake}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {caseData.learningNotes?.resources?.length > 0 && (
                            <div className="content-section">
                                <h3>📚 Recursos</h3>
                                <div className="resources-list">
                                    {caseData.learningNotes.resources.map((res, idx) => (
                                        <a
                                            key={idx}
                                            href={res.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="resource-link"
                                        >
                                            {res.title}
                                            <ExternalLink size={12} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {caseData.learningNotes?.personalNotes && (
                            <div className="content-section">
                                <h3>📝 Notas Personales</h3>
                                <p className="personal-notes">{caseData.learningNotes.personalNotes}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
