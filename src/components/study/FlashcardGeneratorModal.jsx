import { useState, useEffect } from 'react'
import { X, Layers, BrainCircuit, Wand2, Plus, Trash2, Save, Sparkles, Loader2 } from 'lucide-react'
import './FlashcardGeneratorModal.css'

export default function FlashcardGeneratorModal({ isOpen, onClose, slideData, onSave }) {
    const [isGenerating, setIsGenerating] = useState(true)
    const [flashcards, setFlashcards] = useState([])
    const [topic, setTopic] = useState('')

    useEffect(() => {
        if (isOpen && slideData) {
            setIsGenerating(true)
            setTopic(slideData.title || slideData.subtitle || 'Tema Médico')

            // Simulate AI extraction delay
            const timer = setTimeout(() => {
                const generated = generateMockFlashcards(slideData)
                setFlashcards(generated)
                setIsGenerating(false)
            }, 2500)

            return () => clearTimeout(timer)
        }
    }, [isOpen, slideData])

    if (!isOpen) return null

    const handleBackChange = (index, value) => {
        const newCards = [...flashcards]
        newCards[index].back = value
        setFlashcards(newCards)
    }

    const handleFrontChange = (index, value) => {
        const newCards = [...flashcards]
        newCards[index].front = value
        setFlashcards(newCards)
    }

    const handleDelete = (index) => {
        setFlashcards(flashcards.filter((_, i) => i !== index))
    }

    const handleAddBlank = () => {
        setFlashcards([...flashcards, { front: '', back: '' }])
    }

    const handleSave = () => {
        // En un entorno real, aquí se enviarían al FSRSContext o Supabase
        if (onSave) onSave(flashcards)
        onClose()
    }

    return (
        <div className="fc-modal-overlay" onClick={onClose}>
            <div className="fc-modal-content" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="fc-modal-header">
                    <div className="fc-modal-title">
                        <div className="fc-icon-wrapper">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h3>Generador IA de Flashcards</h3>
                            <p>Extrayendo conceptos clave de: <strong>{topic}</strong></p>
                        </div>
                    </div>
                    <button className="fc-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="fc-modal-body">
                    {isGenerating ? (
                        <div className="fc-loading-state">
                            <div className="fc-brain-animation">
                                <BrainCircuit size={48} className="brain-pulse" />
                                <Sparkles size={24} className="sparkle-1" />
                                <Sparkles size={20} className="sparkle-2" />
                            </div>
                            <h4>Synapse está analizando la lámina...</h4>
                            <p>Aplicando algoritmos de procesamiento de lenguaje natural para formular preguntas de alta retención.</p>
                            <Loader2 size={24} className="spin loader-icon" />
                        </div>
                    ) : (
                        <div className="fc-editor-container">
                            <div className="fc-editor-header">
                                <span className="fc-count-badge">{flashcards.length} tarjetas generadas</span>
                                <button className="fc-secondary-btn" onClick={handleAddBlank}>
                                    <Plus size={16} /> Añadir Manualmente
                                </button>
                            </div>

                            <div className="fc-cards-list">
                                {flashcards.map((card, index) => (
                                    <div key={index} className="fc-edit-card">
                                        <div className="fc-card-label">
                                            <span>Tarjeta {index + 1}</span>
                                            <button className="fc-delete-btn" onClick={() => handleDelete(index)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="fc-inputs-row">
                                            <div className="fc-input-group">
                                                <label>Anverso (Pregunta)</label>
                                                <textarea
                                                    value={card.front}
                                                    onChange={e => handleFrontChange(index, e.target.value)}
                                                    placeholder="Escribe la pregunta o concepto..."
                                                    rows={2}
                                                />
                                            </div>
                                            <div className="fc-input-group">
                                                <label>Reverso (Respuesta)</label>
                                                <textarea
                                                    value={card.back}
                                                    onChange={e => handleBackChange(index, e.target.value)}
                                                    placeholder="Escribe la respuesta..."
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isGenerating && (
                    <div className="fc-modal-footer">
                        <button className="fc-cancel-btn" onClick={onClose}>
                            Cancelar
                        </button>
                        <button className="fc-save-btn" onClick={handleSave} disabled={flashcards.length === 0}>
                            <Save size={16} />
                            Guardar {flashcards.length} tarjetas en FSRS
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// Simulated AI Logic for generating flashcards from a Slide
function generateMockFlashcards(slideData) {
    const cards = []

    // We try to extract meaningful Q&A pairs from sections
    if (slideData.sections) {
        slideData.sections.forEach(sec => {
            if (sec.title.toLowerCase().includes('definición')) {
                cards.push({
                    front: `¿Qué es o cómo se define "${slideData.title}"?`,
                    back: sec.content.replace(/\*\*/g, '')
                })
            }
            if (sec.list && sec.list.length > 0) {
                cards.push({
                    front: `Menciona ${sec.list.length} características o puntos clave sobre: ${sec.title}`,
                    back: sec.list.map(l => `• ${l.replace(/\*\*/g, '')}`).join('\n')
                })
            }
            if (sec.highlight || sec.title.toLowerCase().includes('perla')) {
                cards.push({
                    front: `Perla Clínica: ${slideData.title}`,
                    back: sec.content.replace(/\*\*/g, '')
                })
            }
        })
    }

    // Fallback if not enough data
    if (cards.length === 0) {
        cards.push({ front: `Concepto clave sobre ${slideData.title}`, back: 'Respuesta detallada...' })
    }

    return cards
}
