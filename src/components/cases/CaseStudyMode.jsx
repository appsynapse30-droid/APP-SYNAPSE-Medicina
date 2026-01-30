import { useState, useEffect } from 'react'
import {
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    Eye,
    EyeOff,
    ThumbsUp,
    ThumbsDown,
    Minus,
    RotateCcw,
    CheckCircle2,
    Clock,
    Target,
    Brain,
    Lightbulb,
    AlertCircle,
    ArrowRight,
    Heart,
    Wind,
    Activity,
    Droplets,
    Bug,
    Baby,
    Clipboard
} from 'lucide-react'
import { useClinicalCases, medicalCategories, difficultyLevels } from '../../context/ClinicalCasesContext'

// Etapas del estudio
const STUDY_PHASES = [
    { id: 'presentation', label: 'Presentación' },
    { id: 'history', label: 'Historia' },
    { id: 'exam', label: 'Examen Físico' },
    { id: 'studies', label: 'Estudios' },
    { id: 'diagnosis', label: 'Diagnóstico' },
    { id: 'treatment', label: 'Tratamiento' },
    { id: 'learning', label: 'Puntos Clave' },
]

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

export default function CaseStudyMode({ caseId, onBack, onComplete }) {
    const { getCaseById, markAsStudied } = useClinicalCases()
    const [currentPhase, setCurrentPhase] = useState(0)
    const [revealed, setRevealed] = useState({})
    const [userGuess, setUserGuess] = useState('')
    const [showAnswer, setShowAnswer] = useState(false)
    const [startTime] = useState(Date.now())
    const [isComplete, setIsComplete] = useState(false)

    const caseData = getCaseById(caseId)

    if (!caseData) {
        return (
            <div className="study-error">
                <AlertCircle size={48} />
                <h3>Caso no encontrado</h3>
                <button onClick={onBack}>Volver</button>
            </div>
        )
    }

    const phase = STUDY_PHASES[currentPhase]
    const CategoryIcon = categoryIcons[caseData.category] || Clipboard

    const toggleReveal = (section) => {
        setRevealed(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    const nextPhase = () => {
        if (currentPhase < STUDY_PHASES.length - 1) {
            setCurrentPhase(prev => prev + 1)
            setShowAnswer(false)
            setUserGuess('')
        } else {
            setIsComplete(true)
        }
    }

    const prevPhase = () => {
        if (currentPhase > 0) {
            setCurrentPhase(prev => prev - 1)
        }
    }

    const handleDifficultyRating = (difficulty) => {
        markAsStudied(caseId, difficulty)
        if (onComplete) {
            onComplete()
        } else {
            onBack()
        }
    }

    const getStudyTime = () => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60)
        return elapsed
    }

    // Render phase content
    const renderPhaseContent = () => {
        switch (phase.id) {
            case 'presentation':
                return (
                    <div className="study-phase-content presentation">
                        <div className="patient-presentation">
                            {caseData.patient?.photoUrl && (
                                <img
                                    src={caseData.patient.photoUrl}
                                    alt="Paciente"
                                    className="patient-photo"
                                />
                            )}
                            <div className="patient-basic">
                                <h2>
                                    {caseData.patient?.name || 'Paciente'}
                                    {caseData.patient?.age && `, ${caseData.patient.age} años`}
                                    {caseData.patient?.gender && ` (${caseData.patient.gender})`}
                                </h2>
                                {caseData.patient?.occupation && (
                                    <p className="occupation">{caseData.patient.occupation}</p>
                                )}
                            </div>
                        </div>

                        <div className="chief-complaint-card">
                            <h3>Motivo de Consulta</h3>
                            <p className="complaint-text">
                                "{caseData.clinicalHistory?.chiefComplaint || 'No especificado'}"
                            </p>
                        </div>

                        <div className="study-prompt">
                            <Brain size={20} />
                            <p>¿Qué preguntas harías para la historia clínica? ¿Qué diagnósticos diferenciales te vienen a la mente?</p>
                        </div>
                    </div>
                )

            case 'history':
                return (
                    <div className="study-phase-content history">
                        {/* Historia de la enfermedad */}
                        <div className="reveal-section">
                            <button
                                className="reveal-header"
                                onClick={() => toggleReveal('hpi')}
                            >
                                <span>Historia de la Enfermedad Actual</span>
                                {revealed.hpi ? <ChevronUp size={16} /> : <Eye size={16} />}
                            </button>
                            {revealed.hpi && (
                                <div className="reveal-content">
                                    <p>{caseData.clinicalHistory?.historyOfPresentIllness || 'No disponible'}</p>
                                </div>
                            )}
                        </div>

                        {/* Antecedentes */}
                        <div className="reveal-section">
                            <button
                                className="reveal-header"
                                onClick={() => toggleReveal('pmh')}
                            >
                                <span>Antecedentes Personales</span>
                                {revealed.pmh ? <ChevronUp size={16} /> : <Eye size={16} />}
                            </button>
                            {revealed.pmh && caseData.clinicalHistory?.pastMedicalHistory?.length > 0 && (
                                <div className="reveal-content">
                                    <ul>
                                        {caseData.clinicalHistory.pastMedicalHistory.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Medicamentos */}
                        <div className="reveal-section">
                            <button
                                className="reveal-header"
                                onClick={() => toggleReveal('meds')}
                            >
                                <span>Medicamentos Actuales</span>
                                {revealed.meds ? <ChevronUp size={16} /> : <Eye size={16} />}
                            </button>
                            {revealed.meds && caseData.clinicalHistory?.currentMedications?.length > 0 && (
                                <div className="reveal-content">
                                    {caseData.clinicalHistory.currentMedications.map((med, idx) => (
                                        <div key={idx} className="med-item">
                                            <strong>{med.name}</strong> {med.dose} - {med.frequency}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Alergias */}
                        <div className="reveal-section">
                            <button
                                className="reveal-header"
                                onClick={() => toggleReveal('allergies')}
                            >
                                <span>Alergias</span>
                                {revealed.allergies ? <ChevronUp size={16} /> : <Eye size={16} />}
                            </button>
                            {revealed.allergies && (
                                <div className="reveal-content">
                                    {caseData.clinicalHistory?.allergies?.length > 0 ? (
                                        caseData.clinicalHistory.allergies.map((a, idx) => (
                                            <div key={idx} className="allergy-item">
                                                <AlertCircle size={14} /> {a.name} → {a.reaction}
                                            </div>
                                        ))
                                    ) : (
                                        <p>Sin alergias conocidas</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Historia Social */}
                        <div className="reveal-section">
                            <button
                                className="reveal-header"
                                onClick={() => toggleReveal('social')}
                            >
                                <span>Historia Social</span>
                                {revealed.social ? <ChevronUp size={16} /> : <Eye size={16} />}
                            </button>
                            {revealed.social && caseData.clinicalHistory?.socialHistory && (
                                <div className="reveal-content social-content">
                                    <div className="habits">
                                        <span className={caseData.clinicalHistory.socialHistory.smoking ? 'yes' : 'no'}>
                                            Tabaco: {caseData.clinicalHistory.socialHistory.smoking ? 'Sí' : 'No'}
                                        </span>
                                        <span className={caseData.clinicalHistory.socialHistory.alcohol ? 'yes' : 'no'}>
                                            Alcohol: {caseData.clinicalHistory.socialHistory.alcohol ? 'Sí' : 'No'}
                                        </span>
                                    </div>
                                    {caseData.clinicalHistory.socialHistory.notes && (
                                        <p>{caseData.clinicalHistory.socialHistory.notes}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )

            case 'exam':
                return (
                    <div className="study-phase-content exam">
                        {/* Signos Vitales */}
                        <div className="reveal-section vitals-section">
                            <button
                                className="reveal-header"
                                onClick={() => toggleReveal('vitals')}
                            >
                                <span>Signos Vitales</span>
                                {revealed.vitals ? <ChevronUp size={16} /> : <Eye size={16} />}
                            </button>
                            {revealed.vitals && caseData.physicalExam?.vitalSigns && (
                                <div className="reveal-content vitals-grid">
                                    <div className="vital">
                                        <span className="label">PA</span>
                                        <span className="value">{caseData.physicalExam.vitalSigns.bloodPressure || '-'}</span>
                                    </div>
                                    <div className="vital">
                                        <span className="label">FC</span>
                                        <span className="value">{caseData.physicalExam.vitalSigns.heartRate || '-'} lpm</span>
                                    </div>
                                    <div className="vital">
                                        <span className="label">FR</span>
                                        <span className="value">{caseData.physicalExam.vitalSigns.respiratoryRate || '-'} rpm</span>
                                    </div>
                                    <div className="vital">
                                        <span className="label">T°</span>
                                        <span className="value">{caseData.physicalExam.vitalSigns.temperature || '-'} °C</span>
                                    </div>
                                    <div className="vital">
                                        <span className="label">SpO2</span>
                                        <span className="value">{caseData.physicalExam.vitalSigns.oxygenSaturation || '-'}%</span>
                                    </div>
                                    <div className="vital">
                                        <span className="label">Dolor</span>
                                        <span className="value">{caseData.physicalExam.vitalSigns.painScale || '-'}/10</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* General */}
                        {caseData.physicalExam?.general && (
                            <div className="reveal-section">
                                <button
                                    className="reveal-header"
                                    onClick={() => toggleReveal('general')}
                                >
                                    <span>Aspecto General</span>
                                    {revealed.general ? <ChevronUp size={16} /> : <Eye size={16} />}
                                </button>
                                {revealed.general && (
                                    <div className="reveal-content">
                                        <p>{caseData.physicalExam.general}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cardiovascular */}
                        {caseData.physicalExam?.cardiovascular && (
                            <div className="reveal-section">
                                <button
                                    className="reveal-header"
                                    onClick={() => toggleReveal('cardio')}
                                >
                                    <span>Cardiovascular</span>
                                    {revealed.cardio ? <ChevronUp size={16} /> : <Eye size={16} />}
                                </button>
                                {revealed.cardio && (
                                    <div className="reveal-content">
                                        <p>{caseData.physicalExam.cardiovascular}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Respiratorio */}
                        {caseData.physicalExam?.respiratory && (
                            <div className="reveal-section">
                                <button
                                    className="reveal-header"
                                    onClick={() => toggleReveal('resp')}
                                >
                                    <span>Respiratorio</span>
                                    {revealed.resp ? <ChevronUp size={16} /> : <Eye size={16} />}
                                </button>
                                {revealed.resp && (
                                    <div className="reveal-content">
                                        <p>{caseData.physicalExam.respiratory}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Abdominal */}
                        {caseData.physicalExam?.abdominal && (
                            <div className="reveal-section">
                                <button
                                    className="reveal-header"
                                    onClick={() => toggleReveal('abdominal')}
                                >
                                    <span>Abdominal</span>
                                    {revealed.abdominal ? <ChevronUp size={16} /> : <Eye size={16} />}
                                </button>
                                {revealed.abdominal && (
                                    <div className="reveal-content">
                                        <p>{caseData.physicalExam.abdominal}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Neurológico */}
                        {caseData.physicalExam?.neurological && (
                            <div className="reveal-section">
                                <button
                                    className="reveal-header"
                                    onClick={() => toggleReveal('neuro')}
                                >
                                    <span>Neurológico</span>
                                    {revealed.neuro ? <ChevronUp size={16} /> : <Eye size={16} />}
                                </button>
                                {revealed.neuro && (
                                    <div className="reveal-content">
                                        <p>{caseData.physicalExam.neurological}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )

            case 'studies':
                return (
                    <div className="study-phase-content studies">
                        <div className="study-prompt">
                            <Target size={20} />
                            <p>Con base en la historia y el examen físico, ¿qué estudios ordenarías?</p>
                        </div>

                        {/* Laboratorios */}
                        {caseData.diagnosticStudies?.laboratories?.length > 0 && (
                            <div className="reveal-section">
                                <button
                                    className="reveal-header"
                                    onClick={() => toggleReveal('labs')}
                                >
                                    <span>Laboratorios</span>
                                    {revealed.labs ? <ChevronUp size={16} /> : <Eye size={16} />}
                                </button>
                                {revealed.labs && (
                                    <div className="reveal-content labs-content">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Prueba</th>
                                                    <th>Resultado</th>
                                                    <th>Referencia</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {caseData.diagnosticStudies.laboratories.map((lab, idx) => (
                                                    <tr key={idx} className={lab.abnormal ? 'abnormal' : ''}>
                                                        <td>{lab.test}</td>
                                                        <td>{lab.result}</td>
                                                        <td>{lab.reference}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Imágenes */}
                        {caseData.diagnosticStudies?.imaging?.length > 0 && (
                            <div className="reveal-section">
                                <button
                                    className="reveal-header"
                                    onClick={() => toggleReveal('imaging')}
                                >
                                    <span>Estudios de Imagen</span>
                                    {revealed.imaging ? <ChevronUp size={16} /> : <Eye size={16} />}
                                </button>
                                {revealed.imaging && (
                                    <div className="reveal-content imaging-content">
                                        {caseData.diagnosticStudies.imaging.map((img, idx) => (
                                            <div key={idx} className="imaging-item">
                                                <h4>{img.type}</h4>
                                                {img.imageUrl && (
                                                    <img src={img.imageUrl} alt={img.type} />
                                                )}
                                                <p className="findings">{img.findings}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )

            case 'diagnosis':
                return (
                    <div className="study-phase-content diagnosis">
                        <div className="guess-section">
                            <h3>¿Cuál es tu diagnóstico?</h3>
                            <textarea
                                value={userGuess}
                                onChange={(e) => setUserGuess(e.target.value)}
                                placeholder="Escribe tu diagnóstico y razonamiento..."
                                rows={4}
                            />
                            <button
                                className="btn-reveal-answer"
                                onClick={() => setShowAnswer(true)}
                            >
                                {showAnswer ? <EyeOff size={16} /> : <Eye size={16} />}
                                {showAnswer ? 'Ocultar Respuesta' : 'Ver Respuesta'}
                            </button>
                        </div>

                        {showAnswer && (
                            <>
                                {/* Diagnóstico Final */}
                                {caseData.diagnoses?.final?.name && (
                                    <div className="answer-section final-answer">
                                        <CheckCircle2 size={24} />
                                        <div>
                                            <h4>Diagnóstico Final</h4>
                                            <p className="diagnosis-name">{caseData.diagnoses.final.name}</p>
                                            {caseData.diagnoses.final.icd10 && (
                                                <span className="icd">CIE-10: {caseData.diagnoses.final.icd10}</span>
                                            )}
                                            {caseData.diagnoses.final.justification && (
                                                <p className="justification">{caseData.diagnoses.final.justification}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Diferenciales */}
                                {caseData.diagnoses?.differentials?.length > 0 && (
                                    <div className="differentials-section">
                                        <h4>Diagnósticos Diferenciales</h4>
                                        {caseData.diagnoses.differentials
                                            .sort((a, b) => b.probability - a.probability)
                                            .map((diff, idx) => (
                                                <div key={idx} className="diff-item">
                                                    <div className="diff-header">
                                                        <span>{diff.name}</span>
                                                        <span className="prob">{diff.probability}%</span>
                                                    </div>
                                                    <div className="prob-bar">
                                                        <div style={{ width: `${diff.probability}%` }} />
                                                    </div>
                                                    {diff.reasoning && (
                                                        <p className="reasoning">{diff.reasoning}</p>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )

            case 'treatment':
                return (
                    <div className="study-phase-content treatment">
                        <div className="study-prompt">
                            <Target size={20} />
                            <p>¿Cuál sería tu plan de tratamiento?</p>
                        </div>

                        <div className="reveal-section">
                            <button
                                className="reveal-header"
                                onClick={() => toggleReveal('treatment')}
                            >
                                <span>Plan de Tratamiento</span>
                                {revealed.treatment ? <ChevronUp size={16} /> : <Eye size={16} />}
                            </button>
                            {revealed.treatment && caseData.treatment?.plan && (
                                <div className="reveal-content">
                                    <p>{caseData.treatment.plan}</p>
                                </div>
                            )}
                        </div>

                        {caseData.treatment?.medications?.length > 0 && (
                            <div className="reveal-section">
                                <button
                                    className="reveal-header"
                                    onClick={() => toggleReveal('meds_tx')}
                                >
                                    <span>Medicamentos</span>
                                    {revealed.meds_tx ? <ChevronUp size={16} /> : <Eye size={16} />}
                                </button>
                                {revealed.meds_tx && (
                                    <div className="reveal-content meds-grid">
                                        {caseData.treatment.medications.map((med, idx) => (
                                            <div key={idx} className="med-card">
                                                <strong>{med.name}</strong>
                                                <span>{med.dose}</span>
                                                <span>{med.route}</span>
                                                <span>{med.frequency}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {caseData.treatment?.followUp && (
                            <div className="reveal-section">
                                <button
                                    className="reveal-header"
                                    onClick={() => toggleReveal('followup')}
                                >
                                    <span>Seguimiento</span>
                                    {revealed.followup ? <ChevronUp size={16} /> : <Eye size={16} />}
                                </button>
                                {revealed.followup && (
                                    <div className="reveal-content">
                                        <p>{caseData.treatment.followUp}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )

            case 'learning':
                return (
                    <div className="study-phase-content learning">
                        {caseData.learningNotes?.keyPoints?.length > 0 && (
                            <div className="learning-section key-points">
                                <h3>🎯 Puntos Clave</h3>
                                <ul>
                                    {caseData.learningNotes.keyPoints.map((point, idx) => (
                                        <li key={idx}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {caseData.learningNotes?.clinicalPearls?.length > 0 && (
                            <div className="learning-section pearls">
                                <h3>💎 Perlas Clínicas</h3>
                                <ul>
                                    {caseData.learningNotes.clinicalPearls.map((pearl, idx) => (
                                        <li key={idx}>{pearl}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {caseData.learningNotes?.mistakes?.length > 0 && (
                            <div className="learning-section mistakes">
                                <h3>⚠️ Errores a Evitar</h3>
                                <ul>
                                    {caseData.learningNotes.mistakes.map((m, idx) => (
                                        <li key={idx}>{m}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {caseData.learningNotes?.personalNotes && (
                            <div className="learning-section notes">
                                <h3>📝 Notas Personales</h3>
                                <p>{caseData.learningNotes.personalNotes}</p>
                            </div>
                        )}
                    </div>
                )

            default:
                return null
        }
    }

    // Completion Screen
    if (isComplete) {
        return (
            <div className="study-complete">
                <div className="complete-card">
                    <CheckCircle2 size={64} className="complete-icon" />
                    <h2>¡Caso Completado!</h2>
                    <p>Has repasado todos los aspectos de este caso clínico.</p>

                    <div className="study-stats">
                        <div className="stat">
                            <Clock size={20} />
                            <span>{getStudyTime()} min</span>
                            <label>Tiempo de estudio</label>
                        </div>
                        <div className="stat">
                            <RotateCcw size={20} />
                            <span>{(caseData.studyStats?.timesReviewed || 0) + 1}</span>
                            <label>Repasos totales</label>
                        </div>
                    </div>

                    <div className="difficulty-rating">
                        <h3>¿Qué tan difícil te resultó?</h3>
                        <p>Tu respuesta ajustará la fecha del próximo repaso</p>
                        <div className="rating-buttons">
                            <button
                                className="rating-btn easy"
                                onClick={() => handleDifficultyRating('facil')}
                            >
                                <ThumbsUp size={20} />
                                Fácil
                                <span>Repasar en 7+ días</span>
                            </button>
                            <button
                                className="rating-btn normal"
                                onClick={() => handleDifficultyRating('normal')}
                            >
                                <Minus size={20} />
                                Normal
                                <span>Repasar en 3+ días</span>
                            </button>
                            <button
                                className="rating-btn hard"
                                onClick={() => handleDifficultyRating('dificil')}
                            >
                                <ThumbsDown size={20} />
                                Difícil
                                <span>Repasar mañana</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="case-study-mode">
            {/* Header */}
            <div className="study-header">
                <button className="btn-back" onClick={onBack}>
                    <ArrowLeft size={18} />
                    Salir
                </button>

                <div className="case-title-mini">
                    <CategoryIcon size={16} style={{ color: medicalCategories[caseData.category]?.color }} />
                    <span>{caseData.title}</span>
                </div>

                <div className="study-timer">
                    <Clock size={14} />
                    <span>{getStudyTime()} min</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="study-progress">
                {STUDY_PHASES.map((p, idx) => (
                    <div
                        key={p.id}
                        className={`progress-step ${idx === currentPhase ? 'active' : ''} ${idx < currentPhase ? 'completed' : ''}`}
                    >
                        <span className="step-dot">{idx + 1}</span>
                        <span className="step-label">{p.label}</span>
                    </div>
                ))}
            </div>

            {/* Phase Content */}
            <div className="study-content">
                <h2 className="phase-title">{phase.label}</h2>
                {renderPhaseContent()}
            </div>

            {/* Navigation */}
            <div className="study-navigation">
                <button
                    className="btn-nav prev"
                    onClick={prevPhase}
                    disabled={currentPhase === 0}
                >
                    <ArrowLeft size={16} />
                    Anterior
                </button>

                <span className="phase-indicator">
                    {currentPhase + 1} / {STUDY_PHASES.length}
                </span>

                <button
                    className="btn-nav next"
                    onClick={nextPhase}
                >
                    {currentPhase < STUDY_PHASES.length - 1 ? (
                        <>
                            Siguiente
                            <ArrowRight size={16} />
                        </>
                    ) : (
                        <>
                            Finalizar
                            <CheckCircle2 size={16} />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
