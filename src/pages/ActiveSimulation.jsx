import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, AlertTriangle, ShieldAlert } from 'lucide-react'
import SimQuestionView from '../components/study/SimQuestionView'
import SimFeedbackPanel from '../components/study/SimFeedbackPanel'
import DynamicCaseView from '../components/study/DynamicCaseView'
import './ActiveSimulation.css'

// --- Mock Data ---
const DUMMY_QUESTION = {
    id: "Q-1045",
    text: "Un paciente masculino de 45 años acude a urgencias con dolor torácico retroesternal opresivo de 30 minutos de evolución, irradiado al brazo izquierdo. Presenta diaforesis y náuseas. El ECG muestra elevación del segmento ST en derivaciones V1 a V4. ¿Cuál es el diagnóstico más probable?",
    labValues: [
        { name: "Troponina I", value: "2.4", reference: "< 0.04 ng/mL", isAbnormal: true },
        { name: "CK-MB", value: "45", reference: "0-16 U/L", isAbnormal: true }
    ],
    options: [
        { id: "A", letter: "A", text: "Infarto agudo de miocardio de pared anterior", isCorrect: true },
        { id: "B", letter: "B", text: "Pericarditis aguda", isCorrect: false },
        { id: "C", letter: "C", text: "Tromboembolismo pulmonar", isCorrect: false },
        { id: "D", letter: "D", text: "Disección aórtica", isCorrect: false },
        { id: "E", letter: "E", text: "Angina inestable", isCorrect: false }
    ]
}

const DUMMY_FEEDBACK = {
    topic: "Cardiología - SCACEST",
    mainExplanation: "El paciente presenta un cuadro clásico de Infarto Agudo de Miocardio con Elevación del ST (SCACEST) de pared anterior. La clínica de dolor opresivo irradiado, los cambios electrocardiográficos en derivadas precordiales (V1-V4) que exploran la cara anterior irrigada por la arteria descendente anterior, y la elevación de biomarcadores cardíacos son confirmatorios.",
    optionsAnalysis: [
        { letter: "A", isCorrect: true, explanation: "V1-V4 reflejan la pared anterior y septal. Con troponinas elevadas, es un IAMCEST." },
        { letter: "B", isCorrect: false, explanation: "La pericarditis típicamente presenta dolor pleurítico que mejora al inclinarse hacia adelante y elevación del ST cóncava difusa, no localizada a un territorio vascular." },
        { letter: "C", isCorrect: false, explanation: "El TEP suele presentar disnea súbita y taquicardia. El dolor es pleurítico, no opresivo típico." }
    ],
    clinicalPearl: "En el IAM de pared anterior, la arteria culprit suele ser la Descendente Anterior Izquierda (LAD). Es el territorio miocárdico más amplio en riesgo.",
    source: "Guías AHA/ACC para el manejo de STEMI",
    deepDiveData: "<p>La oclusión de la arteria descendente anterior izquierda causa isquemia transmural del ventrículo izquierdo anterior. Las células isquémicas fallan en mantener sus gradientes iónicos en reposo, generando corrientes de lesión que se manifiestan como una elevación del segmento ST en el ECG de superficie. La necrosis miocárdica resultante libera proteínas intracelulares como las troponinas a la circulación.</p>"
}

const DUMMY_CASE = {
    id: "CASE-001",
    isUnstable: true,
    presentation: "Mujer de 28 años llevada a urgencias por paramédicos tras ser encontrada obnubilada en su apartamento. Los compañeros de piso reportan que ha estado con náuseas y vómitos los últimos 2 días y se quejaba de dolor abdominal difuso. Tiene aliento afrutado.",
    actions: [
        { id: 1, name: "Vía IV y fluidos isotónicos", category: "Manejo Inicial", resultText: "Canalizada vía periférica. Se inicia bolo de solución salina 0.9%. La paciente mejora levemente su perfusión periférica.", effect: { bpSys: +10, hr: -5 } },
        { id: 2, name: "Gases arteriales y electrolitos", category: "Laboratorios", resultText: "pH 7.15, pCO2 25, HCO3 8, Glucosa 450 mg/dL, Na 132, K 5.2. Anion gap elevado.", effect: null },
        { id: 3, name: "Insulina IV por bomba", category: "Tratamiento", resultText: "Iniciada a 0.1 U/kg/hr. La glucosa comienza a descender lentamente.", effect: null },
        { id: 4, name: "Intubación endotraqueal", category: "Vía Aérea", resultText: "Procedimiento arriesgado innecesario. La paciente protegía la vía aérea aunque obnubilada.", effect: { hr: +20, spo2: -5 } }
    ]
}

const DUMMY_VITALS = { hr: 125, bpSys: 95, bpDia: 55, spo2: 97, rr: 28, temp: 37.2 }

export default function ActiveSimulation() {
    const location = useLocation()
    const navigate = useNavigate()
    const config = location.state?.config

    const [isLoading, setIsLoading] = useState(true)
    const [simData, setSimData] = useState(null)
    const [showExitWarning, setShowExitWarning] = useState(false)

    // Verify config exists
    useEffect(() => {
        if (!config) {
            navigate('/simulator')
            return
        }

        // Mock loading simulation data from backend/n8n
        const initSim = async () => {
            setIsLoading(true)
            // Here we would call Supabase to create the simulation record
            // And potentially trigger n8n to generate the first batch of questions if not pre-fetched
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            setSimData({
                id: 'sim_' + Date.now(),
                mode: config.mode,
                totalQuestions: config.length === 'micro' ? 10 : config.length === 'standard' ? 40 : 150,
                currentQuestion: 1,
                timeRemaining: config.length === 'micro' ? 10 * 60 : 60 * 60, // in seconds
                status: 'in_progress',
                userAnswerId: null, // Track answered state for tutor mode
                showFeedback: false 
            })
            setIsLoading(false)
        }

        initSim()
    }, [config, navigate])

    const handleExit = () => {
        setShowExitWarning(true)
    }

    const confirmExit = () => {
        // Here we would sync status with backend
        navigate('/simulator')
    }

    if (!config) return null

    if (isLoading) {
        return (
            <div className="active-sim-loading">
                <div className="sim-loader-container">
                    <div className="sim-loader-ring"></div>
                    <div className="sim-loader-ring inner"></div>
                    <ShieldAlert size={32} className="sim-loader-icon" />
                </div>
                <h2>Inicializando Entorno de Simulación</h2>
                <p>Generando casos médicos ({config.mode})...</p>
            </div>
        )
    }

    return (
        <div className="active-simulation-container">
            {/* Simulation Header */}
            <header className="sim-active-header">
                <div className="sim-header-left">
                    <button className="sim-exit-btn" onClick={handleExit}>
                        <ArrowLeft size={18} />
                        <span>Salir</span>
                    </button>
                    <div className="sim-mode-badge" data-mode={config.mode}>
                        {config.mode === 'tutor' ? 'Modo Tutor' :
                         config.mode === 'examen' ? 'Modo Examen' :
                         config.mode === 'reto' ? 'Reto Multijugador' : 'Caso Dinámico'}
                    </div>
                </div>

                <div className="sim-header-center">
                    <div className="sim-progress-text">
                        Pregunta {simData?.currentQuestion} de {simData?.totalQuestions}
                    </div>
                    <div className="sim-progress-bar">
                        <div 
                            className="sim-progress-fill" 
                            style={{ width: `${(simData?.currentQuestion / simData?.totalQuestions) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="sim-header-right">
                    <div className={`sim-timer ${simData?.timeRemaining < 300 ? 'urgent' : ''}`}>
                        <Clock size={16} />
                        {Math.floor((simData?.timeRemaining || 0) / 60).toString().padStart(2, '0')}:
                        {((simData?.timeRemaining || 0) % 60).toString().padStart(2, '0')}
                    </div>
                </div>
            </header>

            {/* Simulation Work Area */}
            <main className="sim-work-area">
                <div className={`sim-content-wrapper ${simData?.mode === 'tutor' && simData.showFeedback ? 'split-view' : ''} ${simData?.mode === 'casos_dinamicos' ? 'full-width' : ''}`}>
                    
                    {simData?.mode === 'casos_dinamicos' ? (
                        <DynamicCaseView 
                            caseData={DUMMY_CASE}
                            initialVitals={DUMMY_VITALS}
                            onActionSelected={(action) => {
                                if (action.type === 'FINISH_CASE') {
                                    alert("Caso finalizado. Pasando a evaluación...")
                                    navigate('/simulator')
                                }
                            }}
                        />
                    ) : (
                        <div className="sim-question-column">
                            <SimQuestionView 
                                question={DUMMY_QUESTION}
                                mode={simData?.mode}
                                isAnswered={!!simData?.userAnswerId}
                                userAnswerId={simData?.userAnswerId}
                                onAnswerSubmit={(optionId) => {
                                    setSimData(prev => ({
                                        ...prev,
                                        userAnswerId: optionId,
                                        showFeedback: prev.mode === 'tutor'
                                    }))

                                    if (simData?.mode === 'examen' || simData?.mode === 'reto') {
                                        // In exam mode, we might auto advance or show a "next" button 
                                        setTimeout(() => {
                                            alert("Simulación de avance a siguiente pregunta...")
                                            // Reset
                                            setSimData(prev => ({ ...prev, userAnswerId: null, currentQuestion: prev.currentQuestion + 1 }))
                                        }, 1000)
                                    }
                                }}
                            />

                            {simData?.showFeedback && simData?.mode === 'tutor' && (
                                <button 
                                    className="btn-next-question"
                                    onClick={() => setSimData(prev => ({ 
                                        ...prev, 
                                        userAnswerId: null, 
                                        showFeedback: false,
                                        currentQuestion: prev.currentQuestion + 1 
                                    }))}
                                    style={{ marginTop: '1rem', float: 'right' }}
                                >
                                    Siguiente Pregunta
                                </button>
                            )}
                        </div>
                    )}

                    {/* Feedback Panel (only shown in tutor mode after answering) */}
                    {simData?.mode === 'tutor' && simData.showFeedback && (
                        <div className="sim-feedback-column">
                            <SimFeedbackPanel 
                                feedbackData={DUMMY_FEEDBACK}
                                onCreateFlashcard={(pearl) => {
                                    alert(`Flashcard generada y enviada a FSRS: \n"${pearl}"`)
                                }}
                            />
                        </div>
                    )}
                </div>
            </main>

            {/* Exit Warning Modal */}
            {showExitWarning && (
                <div className="sim-modal-overlay">
                    <div className="sim-modal">
                        <div className="sim-modal-icon warning">
                            <AlertTriangle size={32} />
                        </div>
                        <h3>¿Suspender simulación?</h3>
                        <p>Tu progreso se guardará y podrás retomarlo más tarde desde el panel principal.</p>
                        <div className="sim-modal-actions">
                            <button className="btn-secondary" onClick={() => setShowExitWarning(false)}>
                                Continuar Simulación
                            </button>
                            <button className="btn-danger" onClick={confirmExit}>
                                Suspender y Salir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
