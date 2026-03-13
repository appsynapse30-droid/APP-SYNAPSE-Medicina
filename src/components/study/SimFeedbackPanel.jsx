import { useState } from 'react'
import { BookOpen, Sparkles, ChevronDown, ChevronUp, AlertCircle, PlusCircle } from 'lucide-react'
import './SimFeedbackPanel.css'

export default function SimFeedbackPanel({ feedbackData, onCreateFlashcard }) {
    const [expandedSections, setExpandedSections] = useState({
        explanation: true,
        takeaway: true,
        deepDive: false
    })

    if (!feedbackData) return null

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    return (
        <div className="sim-feedback-panel">
            <div className="feedback-header">
                <div className="feedback-title-group">
                    <Sparkles className="feedback-icon" size={20} />
                    <h2>Tutor de Bolsillo (DoD)</h2>
                </div>
                <div className="feedback-badges">
                    <span className="badge-tema">{feedbackData.topic}</span>
                </div>
            </div>

            <div className="feedback-content">
                {/* Por qué es correcta / incorrecta */}
                <div className="feedback-section">
                    <button 
                        className="section-toggle"
                        onClick={() => toggleSection('explanation')}
                    >
                        <h3>Explicación Principal</h3>
                        {expandedSections.explanation ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    
                    {expandedSections.explanation && (
                        <div className="section-body">
                            <p className="main-explanation">{feedbackData.mainExplanation}</p>
                            
                            <div className="options-breakdown">
                                <h4>Análisis de Opciones:</h4>
                                <ul>
                                    {feedbackData.optionsAnalysis.map((opt, i) => (
                                        <li key={i} className={opt.isCorrect ? 'correct-analysis' : 'incorrect-analysis'}>
                                            <span className="opt-id">{opt.letter}</span>
                                            <p>{opt.explanation}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Perla Clínica (Core Takeaway) */}
                <div className="feedback-section highlighted">
                    <button 
                        className="section-toggle"
                        onClick={() => toggleSection('takeaway')}
                    >
                        <div className="title-with-icon">
                            <BookOpen size={16} />
                            <h3>Perla Clínica (Takeaway)</h3>
                        </div>
                        {expandedSections.takeaway ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    
                    {expandedSections.takeaway && (
                        <div className="section-body pearl-body">
                            <p>{feedbackData.clinicalPearl}</p>
                            <button 
                                className="create-flashcard-btn"
                                onClick={() => onCreateFlashcard(feedbackData.clinicalPearl)}
                            >
                                <PlusCircle size={16} />
                                <span>Convertir en Flashcard FSRS</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Depth on Demand (Deep Dive) */}
                <div className="feedback-section depth-on-demand">
                    <button 
                        className="section-toggle"
                        onClick={() => toggleSection('deepDive')}
                    >
                        <div className="title-with-icon">
                            <Sparkles size={16} className="dod-icon" />
                            <h3>Depth-on-Demand (Fisiopatología)</h3>
                        </div>
                        {expandedSections.deepDive ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    
                    {expandedSections.deepDive && (
                        <div className="section-body dod-body">
                            <div className="dod-content">
                                {feedbackData.deepDiveData ? (
                                    <div dangerouslySetInnerHTML={{ __html: feedbackData.deepDiveData }} />
                                ) : (
                                    <p className="dod-placeholder">Explicación fisiopatológica detallada solicitada al cerebro n8n...</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {feedbackData.source && (
                <div className="feedback-footer">
                    <AlertCircle size={14} />
                    <span>Fuente: {feedbackData.source}</span>
                </div>
            )}
        </div>
    )
}
