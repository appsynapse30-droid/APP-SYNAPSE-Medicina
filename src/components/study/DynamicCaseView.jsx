import { useState, useEffect } from 'react'
import { Activity, Heart, Wind, Thermometer, Droplet, Stethoscope, AlertTriangle } from 'lucide-react'
import './DynamicCaseView.css'

export default function DynamicCaseView({ 
    caseData, 
    initialVitals, 
    onActionSelected 
}) {
    const [vitals, setVitals] = useState(initialVitals)
    const [elapsedTime, setElapsedTime] = useState(0) // in simulated minutes
    const [log, setLog] = useState([]) // Action history
    const [availableActions, setAvailableActions] = useState(caseData.actions)

    // Simulate time passing and vital sign fluctuations (very basic mock)
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 15) // +15 simulated mins per tick
            
            // Artificial drift in vitals if patient is unstable (just an example of dynamics)
            if (caseData.isUnstable) {
                setVitals(prev => ({
                    ...prev,
                    hr: prev.hr > 100 ? prev.hr + 1 : prev.hr,
                    bpSys: prev.bpSys < 90 ? prev.bpSys - 1 : prev.bpSys
                }))
            }
        }, 5000) // 5 real seconds = 15 simulated mins

        return () => clearInterval(timer)
    }, [caseData.isUnstable])

    const handleActionClick = (action) => {
        setLog(prev => [...prev, { time: elapsedTime, action: action.name, result: action.resultText }])
        
        // Update vitals based on action effect
        if (action.effect) {
            setVitals(prev => ({
                ...prev,
                hr: prev.hr + (action.effect.hr || 0),
                bpSys: prev.bpSys + (action.effect.bpSys || 0),
                bpDia: prev.bpDia + (action.effect.bpDia || 0),
                spo2: prev.spo2 + (action.effect.spo2 || 0)
            }))
        }

        // Notify parent 
        onActionSelected(action)
    }

    const getVitalState = (val, type) => {
        if (type === 'hr') {
            if (val < 60 || val > 100) return 'abnormal';
        }
        if (type === 'bpSys') {
            if (val < 90 || val > 140) return 'abnormal';
        }
        if (type === 'spo2') {
            if (val < 94) return 'abnormal';
        }
        return 'normal';
    }

    return (
        <div className="dynamic-case-view">
            {/* Vitals Monitor (Top Bar) */}
            <div className="vitals-monitor">
                <div className={`vital-readout ${getVitalState(vitals.hr, 'hr')}`}>
                    <Heart size={20} className="vital-icon" />
                    <div className="vital-data">
                        <span className="v-label">FC (lpm)</span>
                        <span className="v-val">{vitals.hr}</span>
                    </div>
                </div>

                <div className={`vital-readout ${getVitalState(vitals.bpSys, 'bpSys')}`}>
                    <Activity size={20} className="vital-icon" />
                    <div className="vital-data">
                        <span className="v-label">TA (mmHg)</span>
                        <span className="v-val">{vitals.bpSys}/{vitals.bpDia}</span>
                    </div>
                </div>

                <div className={`vital-readout ${getVitalState(vitals.spo2, 'spo2')}`}>
                    <Wind size={20} className="vital-icon" />
                    <div className="vital-data">
                        <span className="v-label">SpO2 (%)</span>
                        <span className="v-val">{vitals.spo2}</span>
                    </div>
                </div>

                <div className="vital-readout">
                    <Thermometer size={20} className="vital-icon" />
                    <div className="vital-data">
                        <span className="v-label">Temp (°C)</span>
                        <span className="v-val">{vitals.temp}</span>
                    </div>
                </div>

                <div className="sim-time-display">
                    <span className="v-label">Tiempo Simulado</span>
                    <span className="v-val">
                        Día 1 - {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:
                        {(elapsedTime % 60).toString().padStart(2, '0')} hrs
                    </span>
                </div>
            </div>

            <div className="case-work-grid">
                {/* Visualizador de Viñeta y Evolución */}
                <div className="case-content-panel">
                    <div className="case-presentation">
                        <h3><Stethoscope size={18}/> Presentación Inicial</h3>
                        <p>{caseData.presentation}</p>
                    </div>

                    <div className="case-log">
                        <h3>Evolución Clínica</h3>
                        {log.length === 0 ? (
                            <p className="empty-log">Esperando órdenes médicas iniciales...</p>
                        ) : (
                            <ul className="log-list">
                                {log.map((entry, idx) => (
                                    <li key={idx} className="log-entry">
                                        <div className="log-time">+{entry.time} min</div>
                                        <div className="log-action">
                                            <strong>Orden:</strong> {entry.action}
                                        </div>
                                        <div className="log-result">
                                            <strong>Resultado:</strong> {entry.result}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Órdenes Médicas */}
                <div className="case-actions-panel">
                    <h3>Órdenes Médicas Disponibles</h3>
                    <div className="actions-list">
                        {availableActions.map(action => (
                            <button 
                                key={action.id} 
                                className="medical-action-btn"
                                onClick={() => handleActionClick(action)}
                            >
                                <span className="action-category">{action.category}</span>
                                <h4>{action.name}</h4>
                            </button>
                        ))}
                    </div>

                    {caseData.isUnstable && (
                        <div className="unstable-warning">
                            <AlertTriangle size={20} />
                            <span>¡Paciente Inestable! Actúa rápido.</span>
                        </div>
                    )}

                    <button className="finish-case-btn" onClick={() => onActionSelected({ type: 'FINISH_CASE' })}>
                        Finalizar Caso y Evaluar
                    </button>
                </div>
            </div>
        </div>
    )
}
