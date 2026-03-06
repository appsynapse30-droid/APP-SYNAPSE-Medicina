import { useState, useRef, useEffect } from 'react'
import { X, Image as ImageIcon, Sparkles, BrainCircuit, ScanSearch, Plus, Save, MousePointer2, Trash2 } from 'lucide-react'
import './ImageOcclusionModal.css'

export default function ImageOcclusionModal({ isOpen, onClose, initialImage, onSave }) {
    const [image, setImage] = useState(initialImage || null)
    const [shapes, setShapes] = useState([])
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [drawMode, setDrawMode] = useState(false) // true = drawing manually
    const [mode, setMode] = useState('hideAll') // 'hideAll' or 'hideOne'
    const [selectedShape, setSelectedShape] = useState(null)

    // Drawing state
    const [isDrawing, setIsDrawing] = useState(false)
    const [startPos, setStartPos] = useState({ x: 0, y: 0 })
    const [currentRect, setCurrentRect] = useState(null)

    const containerRef = useRef(null)
    const imgRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            if (initialImage) setImage(initialImage)
            setShapes([])
            setDrawMode(false)
            setSelectedShape(null)
        }
    }, [isOpen, initialImage])

    if (!isOpen) return null

    // Simulate AI detection
    const handleAutoDetect = () => {
        if (!image) return
        setIsAnalyzing(true)

        setTimeout(() => {
            // Mock detected labels/text regions
            const mockShapes = [
                { id: 1, x: 15, y: 20, width: 25, height: 8 },
                { id: 2, x: 60, y: 35, width: 20, height: 8 },
                { id: 3, x: 25, y: 65, width: 18, height: 8 },
                { id: 4, x: 70, y: 75, width: 22, height: 8 }
            ]
            setShapes(mockShapes)
            setIsAnalyzing(false)
            setDrawMode(false) // Exit draw mode if they were in it
        }, 2000)
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setImage(url)
            setShapes([])
        }
    }

    // Mouse events for drawing
    const handlePointerDown = (e) => {
        if (!drawMode || !imgRef.current) return

        const rect = imgRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        setIsDrawing(true)
        setStartPos({ x, y })
        setCurrentRect({ x, y, width: 0, height: 0 })
        setSelectedShape(null)
    }

    const handlePointerMove = (e) => {
        if (!isDrawing || !drawMode || !imgRef.current) return

        const rect = imgRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))

        setCurrentRect({
            x: Math.min(startPos.x, x),
            y: Math.min(startPos.y, y),
            width: Math.abs(x - startPos.x),
            height: Math.abs(y - startPos.y)
        })
    }

    const handlePointerUp = () => {
        if (!isDrawing || !drawMode) return
        setIsDrawing(false)

        if (currentRect && currentRect.width > 2 && currentRect.height > 2) {
            setShapes([...shapes, { ...currentRect, id: Date.now() }])
        }
        setCurrentRect(null)
    }

    const handleDeleteShape = (e, id) => {
        e.stopPropagation()
        setShapes(shapes.filter(s => s.id !== id))
        if (selectedShape === id) setSelectedShape(null)
    }

    const handleSave = () => {
        if (onSave && shapes.length > 0) {
            const flashcards = shapes.map((shape, idx) => ({
                id: shape.id,
                type: 'image-occlusion',
                image: image,
                mode: mode,
                questionShapeId: shape.id,
                allShapes: shapes,
                front: `Identifica la estructura oculta (${idx + 1}/${shapes.length})`,
                back: 'Imagen con revelación'
            }))
            onSave(flashcards)
        }
        onClose()
    }

    return (
        <div className="io-modal-overlay" onClick={onClose}>
            <div className="io-modal-content" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="io-modal-header">
                    <div className="io-modal-title">
                        <div className="io-icon-wrapper">
                            <ImageIcon size={20} />
                        </div>
                        <div>
                            <h3>Oclusión de Imágenes</h3>
                            <p>Oculta texto o estructuras para crear tarjetas anatómicas</p>
                        </div>
                    </div>
                    <button className="io-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="io-modal-body">
                    {/* Left Panel: Editor */}
                    <div className="io-editor-panel">
                        {!image ? (
                            <div className="io-upload-placeholder">
                                <ImageIcon size={48} className="placeholder-icon" />
                                <h4>Sube una imagen anatómica o diagrama</h4>
                                <p>Formatos soportados: JPG, PNG, WEBP</p>
                                <label className="io-upload-btn">
                                    <input type="file" accept="image/*" onChange={handleFileUpload} />
                                    Seleccionar Imagen
                                </label>
                            </div>
                        ) : (
                            <div
                                className="io-canvas-container"
                                ref={containerRef}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerLeave={handlePointerUp}
                                style={{ cursor: drawMode ? 'crosshair' : 'default' }}
                            >
                                <img
                                    src={image}
                                    alt="Para ocluir"
                                    className={`io-target-image ${isAnalyzing ? 'analyzing' : ''}`}
                                    ref={imgRef}
                                />

                                {/* Overlay for scanning effect */}
                                {isAnalyzing && <div className="io-scan-line"></div>}

                                {/* Existing Shapes */}
                                {shapes.map(shape => (
                                    <div
                                        key={shape.id}
                                        className={`io-shape ${selectedShape === shape.id ? 'selected' : ''}`}
                                        style={{
                                            left: `${shape.x}%`,
                                            top: `${shape.y}%`,
                                            width: `${shape.width}%`,
                                            height: `${shape.height}%`,
                                            pointerEvents: drawMode ? 'none' : 'auto'
                                        }}
                                        onClick={(e) => {
                                            if (!drawMode) {
                                                e.stopPropagation()
                                                setSelectedShape(shape.id)
                                            }
                                        }}
                                    >
                                        {(!drawMode || selectedShape === shape.id) && (
                                            <button
                                                className="io-shape-delete"
                                                onClick={(e) => handleDeleteShape(e, shape.id)}
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {/* Drawing Rect */}
                                {drawMode && isDrawing && currentRect && (
                                    <div
                                        className="io-shape drawing"
                                        style={{
                                            left: `${currentRect.x}%`,
                                            top: `${currentRect.y}%`,
                                            width: `${currentRect.width}%`,
                                            height: `${currentRect.height}%`,
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Toolbar & Settings */}
                    <div className="io-sidebar">
                        <div className="io-sidebar-section">
                            <h4>Herramientas</h4>
                            <div className="io-tools-grid">
                                <button
                                    className="io-tool-btn ai-magic"
                                    onClick={handleAutoDetect}
                                    disabled={!image || isAnalyzing}
                                >
                                    {isAnalyzing ? <BrainCircuit className="spin" size={18} /> : <ScanSearch size={18} />}
                                    <span>Auto-Detectar</span>
                                </button>
                                <button
                                    className={`io-tool-btn ${drawMode ? 'active' : ''}`}
                                    onClick={() => setDrawMode(!drawMode)}
                                    disabled={!image}
                                >
                                    <Plus size={18} />
                                    <span>Dibujar Máscara</span>
                                </button>
                                <button
                                    className={`io-tool-btn ${!drawMode && image ? 'active' : ''}`}
                                    onClick={() => setDrawMode(false)}
                                    disabled={!image}
                                >
                                    <MousePointer2 size={18} />
                                    <span>Seleccionar</span>
                                </button>
                            </div>
                        </div>

                        <div className="io-sidebar-section">
                            <h4>Modo de Generación</h4>
                            <div className="io-mode-selector">
                                <label className={`io-mode-card ${mode === 'hideAll' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="occlusionMode"
                                        checked={mode === 'hideAll'}
                                        onChange={() => setMode('hideAll')}
                                    />
                                    <div className="mode-info">
                                        <h5>Ocluir Todo, Revelar Una</h5>
                                        <p>Todas las máscaras están ocultas en el anverso. Se revela una sola en el reverso.</p>
                                    </div>
                                </label>
                                <label className={`io-mode-card ${mode === 'hideOne' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="occlusionMode"
                                        checked={mode === 'hideOne'}
                                        onChange={() => setMode('hideOne')}
                                    />
                                    <div className="mode-info">
                                        <h5>Ocluir Una, Revelar Todas</h5>
                                        <p>Solo una máscara está oculta a la vez. El resto del texto es visible.</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="io-sidebar-footer">
                            <div className="io-stats">
                                <span>{shapes.length}</span> máscaras creadas
                            </div>
                            <button
                                className="io-save-btn"
                                onClick={handleSave}
                                disabled={shapes.length === 0}
                            >
                                <Save size={16} />
                                Generar {shapes.length} Flashcards
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
