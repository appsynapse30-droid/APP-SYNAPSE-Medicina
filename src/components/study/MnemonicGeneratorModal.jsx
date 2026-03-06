import { useState, useEffect } from 'react'
import { X, Wand2, Save, Image as ImageIcon, Loader2, Sparkles, RefreshCcw } from 'lucide-react'
import './MnemonicGeneratorModal.css'

export default function MnemonicGeneratorModal({ isOpen, onClose, topic, onSave }) {
    const [concept, setConcept] = useState(topic || '')
    const [isGenerating, setIsGenerating] = useState(false)
    const [result, setResult] = useState(null)
    const [memoryType, setMemoryType] = useState('acrostic') // acrostic, story, visual

    useEffect(() => {
        if (isOpen) {
            setConcept(topic || '')
            setResult(null)
            setIsGenerating(false)
        }
    }, [isOpen, topic])

    if (!isOpen) return null

    const generateMnemonic = () => {
        if (!concept.trim()) return

        setIsGenerating(true)
        setResult(null)

        // Simulate AI API Call
        setTimeout(() => {
            let mockResult = {}
            if (memoryType === 'acrostic') {
                mockResult = {
                    title: `Acróstico para: ${concept}`,
                    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
                    explanation: 'Recuerda las causas comunes usando esta palabra:',
                    acrostic: [
                        { letter: 'M', word: 'Metabólico', desc: 'Alteraciones electrolíticas' },
                        { letter: 'E', word: 'Endocrino', desc: 'Tiroides, suprarrenales' },
                        { letter: 'D', word: 'Drogas', desc: 'Toxicidad, abstinencia' },
                        { letter: 'I', word: 'Infección', desc: 'Sepsis, meningitis' },
                        { letter: 'C', word: 'Cardio', desc: 'Bajo gasto, arritmias' },
                        { letter: 'O', word: 'Oxigenación', desc: 'Hipoxia, hipercapnia' },
                    ]
                }
            } else if (memoryType === 'story') {
                mockResult = {
                    title: `Palacio Mental: ${concept}`,
                    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80',
                    explanation: 'Imagina que entras a una habitación de hospital antigua. En la puerta, un guardia gigante (Representa los bloqueadores beta). Dentro, hay un grifo derramando agua sobre una planta (Diuréticos). En la ventana, un acordeón respirando (Inhibidores ECA).',
                    acrostic: []
                }
            } else {
                mockResult = {
                    title: `Asociación Visual: ${concept}`,
                    image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80',
                    explanation: 'Visualiza un corazón en llamas envuelto por una serpiente constrictora. El fuego representa la inflamación pericárdica (Pericarditis) y la serpiente la constricción y el frote pericárdico.',
                    acrostic: []
                }
            }

            setResult(mockResult)
            setIsGenerating(false)
        }, 3500)
    }

    const handleSave = () => {
        if (onSave && result) {
            let frontText = result.title
            let backHtml = `<p>${result.explanation}</p>`

            if (result.acrostic && result.acrostic.length > 0) {
                backHtml += `<ul>`
                result.acrostic.forEach(item => {
                    backHtml += `<li><strong>${item.letter}</strong> - ${item.word}: ${item.desc}</li>`
                })
                backHtml += `</ul>`
            }

            const cards = [{
                id: Date.now(),
                type: 'mnemonic',
                front: frontText,
                back: backHtml,
                image: result.image
            }]
            onSave(cards)
        }
        onClose()
    }

    return (
        <div className="mnemonics-overlay" onClick={onClose}>
            <div className="mnemonics-modal" onClick={e => e.stopPropagation()}>

                <div className="mnemonics-header">
                    <div className="mnemonics-title">
                        <div className="mn-icon-box">
                            <Wand2 size={24} />
                        </div>
                        <div>
                            <h3>Generador de Mnemotecnias</h3>
                            <p>Convierte información compleja en ganchos visuales y narrativos</p>
                        </div>
                    </div>
                    <button className="mn-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="mnemonics-body">
                    {/* Input Area */}
                    <div className="mn-input-section">
                        <div className="mn-input-group">
                            <label>Concepto Médico, Lista o Patología a Memorizar:</label>
                            <input
                                type="text"
                                value={concept}
                                onChange={(e) => setConcept(e.target.value)}
                                placeholder="Ej: Causas de pancreatitis, Nervios craneales..."
                                disabled={isGenerating}
                            />
                        </div>

                        <div className="mn-options">
                            <label className={`mn-option-btn ${memoryType === 'acrostic' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="mn-type"
                                    checked={memoryType === 'acrostic'}
                                    onChange={() => setMemoryType('acrostic')}
                                    disabled={isGenerating}
                                />
                                Acróstico Analógico
                            </label>
                            <label className={`mn-option-btn ${memoryType === 'story' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="mn-type"
                                    checked={memoryType === 'story'}
                                    onChange={() => setMemoryType('story')}
                                    disabled={isGenerating}
                                />
                                Palacio de la Memoria (Historia)
                            </label>
                            <label className={`mn-option-btn ${memoryType === 'visual' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="mn-type"
                                    checked={memoryType === 'visual'}
                                    onChange={() => setMemoryType('visual')}
                                    disabled={isGenerating}
                                />
                                Asociación Visual (Estilo Sketchy)
                            </label>
                        </div>

                        <button
                            className="mn-generate-btn"
                            onClick={generateMnemonic}
                            disabled={!concept.trim() || isGenerating}
                        >
                            {isGenerating ? (
                                <><Loader2 size={18} className="spin" /> Diseñando Engramas...</>
                            ) : (
                                <><Sparkles size={18} /> Generar Mnemotecnia Artística</>
                            )}
                        </button>
                    </div>

                    {/* Result Area */}
                    <div className="mn-result-section">
                        {!result && !isGenerating ? (
                            <div className="mn-placeholder">
                                <ImageIcon size={64} className="mn-placeholder-icon" />
                                <h4>Imaginación Asistida por IA</h4>
                                <p>Ingresa un tópico y deja que la IA cree imágenes y narrativas memorables para facilitar la retención a largo plazo.</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="mn-generating-state">
                                <div className="mn-gen-animation">
                                    <div className="mn-circle c1"></div>
                                    <div className="mn-circle c2"></div>
                                    <div className="mn-circle c3"></div>
                                    <Wand2 size={40} className="mn-wand" />
                                </div>
                                <h4>Forjando conexiones sinápticas...</h4>
                                <p>Generando prompts visuales y construyendo narrativa.</p>
                            </div>
                        ) : result ? (
                            <div className="mn-result-card fade-in">
                                <div className="mn-result-image-wrapper">
                                    <img src={result.image} alt={result.title} className="mn-result-image" />
                                    <div className="mn-image-overlay">Ilustración Generada por IA</div>
                                </div>
                                <div className="mn-result-content">
                                    <h4 className="mn-result-title">{result.title}</h4>
                                    <p className="mn-result-explanation">{result.explanation}</p>

                                    {result.acrostic && result.acrostic.length > 0 && (
                                        <div className="mn-acrostic-list">
                                            {result.acrostic.map((item, i) => (
                                                <div key={i} className="mn-acrostic-item">
                                                    <span className="mn-letter">{item.letter}</span>
                                                    <span className="mn-word">{item.word}</span>
                                                    <span className="mn-desc">{item.desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Footer Options */}
                <div className="mnemonics-footer">
                    <button
                        className="mn-secondary-btn"
                        onClick={generateMnemonic}
                        disabled={!result || isGenerating}
                    >
                        <RefreshCcw size={16} />
                        Variar Mnemotecnia
                    </button>
                    <button
                        className="mn-primary-btn"
                        onClick={handleSave}
                        disabled={!result || isGenerating}
                    >
                        <Save size={16} />
                        Guardar como Flashcard
                    </button>
                </div>

            </div>
        </div>
    )
}
