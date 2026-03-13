import { useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Bookmark } from 'lucide-react'
import './SimQuestionView.css'

export default function SimQuestionView({ 
    question, 
    mode, 
    onAnswerSubmit, 
    isAnswered,
    userAnswerId 
}) {
    const [selectedOption, setSelectedOption] = useState(userAnswerId)
    const [isMarked, setIsMarked] = useState(false)

    // Reset selection if new question and not answered
    if (question.id !== selectedOption?.questionId && !isAnswered) {
        // setSelectedOption(null) // Handled by key prop on parent usually, but safe to keep state managed
    }

    const handleSelect = (optionId) => {
        if (isAnswered) return
        setSelectedOption(optionId)
    }

    const handleSubmit = () => {
        if (!selectedOption || isAnswered) return
        onAnswerSubmit(selectedOption)
    }

    const getOptionStateClass = (option) => {
        if (!isAnswered) {
            return selectedOption === option.id ? 'selected' : ''
        }

        // In Tutor mode or when reviewing
        if (option.isCorrect) return 'correct'
        if (userAnswerId === option.id && !option.isCorrect) return 'incorrect'
        return 'disabled'
    }

    return (
        <div className="sim-question-view">
            <div className="q-header-actions">
                <span className="q-id">ID: {question.id}</span>
                <button 
                    className={`q-mark-btn ${isMarked ? 'marked' : ''}`}
                    onClick={() => setIsMarked(!isMarked)}
                    title={isMarked ? "Quitar marca" : "Marcar para revisar"}
                >
                    <Bookmark size={18} fill={isMarked ? 'currentColor' : 'none'} />
                    <span>{isMarked ? 'Marcada' : 'Marcar'}</span>
                </button>
            </div>

            <div className="q-stem">
                <p>{question.text}</p>
                {question.labValues && (
                    <div className="q-lab-values">
                        <h4>Valores de Laboratorio Relevantes:</h4>
                        <ul>
                            {question.labValues.map((lab, idx) => (
                                <li key={idx} className={lab.isAbnormal ? 'abnormal' : ''}>
                                    <span className="lab-name">{lab.name}:</span>
                                    <span className="lab-val">{lab.value}</span>
                                    <span className="lab-ref">({lab.reference})</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="q-options">
                <div className="q-instruction">Selecciona la mejor respuesta:</div>
                {question.options.map(option => {
                    const stateClass = getOptionStateClass(option)
                    return (
                        <button
                            key={option.id}
                            className={`q-option-btn ${stateClass}`}
                            onClick={() => handleSelect(option.id)}
                            disabled={isAnswered}
                        >
                            <span className="opt-letter">{option.letter}.</span>
                            <span className="opt-text">{option.text}</span>
                            
                            {isAnswered && option.isCorrect && (
                                <CheckCircle className="status-icon correct" size={20} />
                            )}
                            {isAnswered && userAnswerId === option.id && !option.isCorrect && (
                                <XCircle className="status-icon incorrect" size={20} />
                            )}
                        </button>
                    )
                })}
            </div>

            {!isAnswered && (
                <div className="q-actions-footer">
                    <button 
                        className="btn-submit-answer"
                        disabled={!selectedOption}
                        onClick={handleSubmit}
                    >
                        Confirmar Respuesta
                    </button>
                </div>
            )}
            
            {/* Si es modo EXAMEN pero ya se respondió (al revisar al final) mostramos info mínima. 
                Si es modo TUTOR, el FeedbackPanel se mostrará en el layout principal al lado de esto o debajo. */}
        </div>
    )
}
