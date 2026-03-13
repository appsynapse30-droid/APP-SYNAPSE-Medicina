import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, Target, ShieldAlert, Award, ChevronRight } from 'lucide-react'
import './SimulationResults.css'

// Mock Data for the Radar Chart and Results
const MOCK_RESULTS = {
    mode: 'Examen (USMLE Step 1)',
    score: 82,
    totalQuestions: 40,
    correct: 33,
    incorrect: 7,
    timeSpent: '45:20',
    performanceBySystem: [
        { system: 'Cardiovascular', score: 90 },
        { system: 'Respiratorio', score: 85 },
        { system: 'Neurología', score: 70 },
        { system: 'Gastrointestinal', score: 92 },
        { system: 'Endocrinología', score: 75 },
    ],
    weaknesses: [
        'Diagnóstico diferencial de cefaleas tensionales vs migrañas',
        'Manejo inicial de cetoacidosis diabética'
    ],
    pearlsGenerated: 4
}

export default function SimulationResults() {
    const location = useLocation()
    const navigate = useNavigate()
    
    // In a real app we'd get these from navigation state or fetch from DB
    const results = location.state?.results || MOCK_RESULTS

    const renderRadarBar = (system, score) => {
        let colorClass = 'radar-excellent'
        if (score < 75) colorClass = 'radar-warning'
        if (score < 60) colorClass = 'radar-danger'

        return (
            <div key={system} className="radar-bar-container">
                <div className="radar-label">
                    <span>{system}</span>
                    <span>{score}%</span>
                </div>
                <div className="radar-track">
                    <div className={`radar-fill ${colorClass}`} style={{ width: `${score}%` }}></div>
                </div>
            </div>
        )
    }

    return (
        <div className="sim-results-page">
            <div className="results-header">
                <div>
                    <h1>Resultados de Simulación</h1>
                    <p className="subtitle">Modo: {results.mode}</p>
                </div>
                <button className="btn-done" onClick={() => navigate('/simulator')}>
                    Finalizar y Volver
                </button>
            </div>

            <div className="results-grid">
                
                {/* Score Overview */}
                <div className="results-card overview-card">
                    <div className="score-circle">
                        <svg viewBox="0 0 36 36" className="circular-chart">
                            <path className="circle-bg"
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path className="circle-value"
                                strokeDasharray={`${results.score}, 100`}
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <text x="18" y="20.35" className="percentage">{results.score}%</text>
                        </svg>
                    </div>
                    
                    <div className="overview-stats">
                        <div className="stat-item">
                            <CheckCircle className="stat-icon correct" />
                            <div>
                                <span className="stat-val">{results.correct}</span>
                                <span className="stat-label">Correctas</span>
                            </div>
                        </div>
                        <div className="stat-item">
                            <XCircle className="stat-icon incorrect" />
                            <div>
                                <span className="stat-val">{results.incorrect}</span>
                                <span className="stat-label">Incorrectas</span>
                            </div>
                        </div>
                        <div className="stat-item">
                            <Clock className="stat-icon neutral" />
                            <div>
                                <span className="stat-val">{results.timeSpent}</span>
                                <span className="stat-label">Tiempo Total</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Radar Performance */}
                <div className="results-card radar-card">
                    <h3><Target size={20}/> Desempeño por Sistema</h3>
                    <div className="radar-chart">
                        {results.performanceBySystem.map(item => renderRadarBar(item.system, item.score))}
                    </div>
                </div>

                {/* Actionable Insights */}
                <div className="results-card insights-card">
                    <h3><ShieldAlert size={20}/> Áreas Críticas de Mejora</h3>
                    <ul className="weakness-list">
                        {results.weaknesses.map((w, i) => (
                            <li key={i}>{w}</li>
                        ))}
                    </ul>

                    <div className="pearls-summary">
                        <Award size={24} className="pearl-icon" />
                        <div>
                            <h4>+ {results.pearlsGenerated} Flashcards FSRS Generadas</h4>
                            <p>Tus perlas clínicas han sido agregadas a la cola de estudio espaciado.</p>
                        </div>
                        <button className="btn-review-pearls">Revisar Mazo <ChevronRight size={16}/></button>
                    </div>
                </div>

            </div>
        </div>
    )
}
