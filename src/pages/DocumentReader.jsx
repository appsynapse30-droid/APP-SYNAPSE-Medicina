import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft,
    Search,
    Highlighter,
    Download,
    Sparkles,
    Send,
    ToggleRight,
    Layers,
    FileText,
    Share2,
    MoreHorizontal,
    Bookmark,
    BookOpen,
    StickyNote,
    Image as ImageIcon,
    AlertCircle,
    RefreshCw,
    Trash2,
    Loader2,
    ExternalLink,
    File
} from 'lucide-react'
import { useLibrary } from '../context/LibraryContext'
import PDFViewer from '../components/PDFViewer'
import './DocumentReader.css'

export default function DocumentReader() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { documents, deleteDocument, getDocumentViewUrl, downloadDocument } = useLibrary()

    const [document, setDocument] = useState(null)
    const [documentNotFound, setDocumentNotFound] = useState(false)
    const [fileUrl, setFileUrl] = useState(null)
    const [fileLoading, setFileLoading] = useState(false)
    const [fileError, setFileError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [contextEnabled, setContextEnabled] = useState(true)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [showAIPanel, setShowAIPanel] = useState(true)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Find the document from context
    useEffect(() => {
        const doc = documents.find(d => String(d.id) === String(id))

        if (doc) {
            setDocument(doc)
            setDocumentNotFound(false)

            setMessages([
                {
                    id: 1,
                    type: 'ai',
                    content: `He cargado "${doc.title}". ${doc.type === 'PDF' ? 'Puedes navegar por las páginas usando las flechas o la barra de herramientas.' : ''} ¿Te gustaría que te explique algún concepto en particular o que genere un resumen del contenido?`,
                    time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                }
            ])
        } else {
            setDocumentNotFound(true)
        }
    }, [id, documents])

    // Fetch the signed URL from Supabase Storage when document is found
    const fetchFileUrl = useCallback(async () => {
        if (!document || document.isSample || !document.filePath) return

        setFileLoading(true)
        setFileError(null)

        try {
            const { url, error } = await getDocumentViewUrl(document.id)
            if (error) throw new Error(error)
            setFileUrl(url)
        } catch (err) {
            console.error('Error fetching file URL:', err)
            setFileError(err.message || 'Error al cargar el archivo')
        } finally {
            setFileLoading(false)
        }
    }, [document, getDocumentViewUrl])

    useEffect(() => {
        if (document && document.filePath) {
            fetchFileUrl()
        }
    }, [document?.id]) // Only refetch when document ID changes

    const handleSend = () => {
        if (!inputValue.trim()) return

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputValue
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')

        setTimeout(() => {
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: `Excelente pregunta sobre "${inputValue.substring(0, 30)}...". Basándome en el contenido del documento ${currentPage > 1 ? `(página ${currentPage})` : ''}, puedo ayudarte a entender mejor este concepto. ¿Quieres que profundice más en algún aspecto específico?`,
                time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
            }
            setMessages(prev => [...prev, aiMessage])
        }, 1500)
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const handleDownload = async () => {
        if (document) {
            if (fileUrl) {
                // Descargar usando la URL firmada
                const link = window.document.createElement('a')
                link.href = fileUrl
                link.download = document.title
                link.target = '_blank'
                link.click()
            } else if (document.filePath) {
                // Fallback: usar la función de descarga del contexto
                await downloadDocument(document.id)
            }
        }
    }

    const handleDelete = async () => {
        if (document) {
            await deleteDocument(document.id)
            navigate('/library')
        }
    }

    // Determinar el tipo de contenido a renderizar
    const getContentType = () => {
        if (!document) return 'loading'
        if (document.isNote || document.type === 'NOTA') return 'note'
        if (document.type === 'PDF') return 'pdf'
        if (document.type === 'IMG') return 'image'
        if (document.type === 'DOC' || document.type === 'PPT' || document.type === 'XLS') return 'office'
        if (document.type === 'TXT') return 'text'
        return 'generic'
    }

    // Documento no encontrado
    if (documentNotFound) {
        return (
            <div className="reader-loading">
                <AlertCircle size={48} className="error-icon" />
                <h3>Documento no encontrado</h3>
                <p>El documento que buscas no existe o ha sido eliminado.</p>
                <button className="btn btn-primary" onClick={() => navigate('/library')}>
                    Volver a Biblioteca
                </button>
            </div>
        )
    }

    // Cargando
    if (!document) {
        return (
            <div className="reader-loading">
                <div className="loading-spinner"></div>
                <p>Cargando documento...</p>
            </div>
        )
    }

    const contentType = getContentType()

    return (
        <div className={`document-reader ${!showAIPanel ? 'full-width' : ''}`}>
            {/* Document Viewer */}
            <div className="reader-main">
                {/* Toolbar */}
                <div className="reader-toolbar">
                    <button className="back-btn" onClick={() => navigate('/library')}>
                        <ArrowLeft size={18} />
                        Biblioteca
                    </button>

                    <div className="toolbar-center">
                        <div className="doc-info">
                            {contentType === 'pdf' && <FileText size={16} />}
                            {contentType === 'note' && <StickyNote size={16} />}
                            {contentType === 'image' && <ImageIcon size={16} />}
                            {(contentType === 'office' || contentType === 'text' || contentType === 'generic') && <File size={16} />}
                            <span className="doc-title-bar">{document.title}</span>
                            <span className="doc-type-indicator">{document.type}</span>
                        </div>
                    </div>

                    <div className="toolbar-actions">
                        <button title="Buscar"><Search size={18} /></button>
                        <button title="Resaltar"><Highlighter size={18} /></button>
                        <button
                            title="Marcar"
                            className={isBookmarked ? 'active' : ''}
                            onClick={() => setIsBookmarked(!isBookmarked)}
                        >
                            <Bookmark size={18} />
                        </button>
                        {(fileUrl || document.filePath) && (
                            <button title="Descargar" onClick={handleDownload}>
                                <Download size={18} />
                            </button>
                        )}
                        <button
                            title={showAIPanel ? 'Ocultar AI' : 'Mostrar AI'}
                            className={showAIPanel ? 'active' : ''}
                            onClick={() => setShowAIPanel(!showAIPanel)}
                        >
                            <Sparkles size={18} />
                        </button>
                        <button
                            title="Eliminar documento"
                            className="delete-btn"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Document Content */}
                <div className="reader-content">
                    {/* Loading state for file URL */}
                    {fileLoading && (
                        <div className="reader-file-loading">
                            <Loader2 size={40} className="spinning" />
                            <p>Cargando archivo desde el servidor...</p>
                        </div>
                    )}

                    {/* Error state */}
                    {fileError && !fileLoading && (
                        <div className="reader-file-error">
                            <AlertCircle size={48} />
                            <h3>Error al cargar el archivo</h3>
                            <p>{fileError}</p>
                            <button className="btn btn-primary" onClick={fetchFileUrl}>
                                <RefreshCw size={16} />
                                Reintentar
                            </button>
                        </div>
                    )}

                    {/* PDF Viewer */}
                    {contentType === 'pdf' && fileUrl && !fileLoading && !fileError && (
                        <PDFViewer
                            fileUrl={fileUrl}
                            fileName={document.title}
                            onPageChange={handlePageChange}
                            initialPage={1}
                        />
                    )}

                    {/* Note Content */}
                    {contentType === 'note' && (
                        <div className="note-viewer">
                            <div className="note-paper">
                                <div className="note-header">
                                    <span className="note-category">{document.category || 'Nota personal'}</span>
                                    <span className="note-date">
                                        {new Date(document.date).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <h1 className="note-title">{document.title}</h1>
                                <div className="note-body">
                                    {document.content || document.summary}
                                </div>
                                {document.tags && document.tags.length > 0 && (
                                    <div className="note-tags">
                                        {document.tags.map(tag => (
                                            <span key={tag} className="note-tag">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Image Viewer */}
                    {contentType === 'image' && !fileLoading && !fileError && (
                        <div className="image-viewer">
                            <img
                                src={fileUrl || document.image}
                                alt={document.title}
                                className="image-content"
                                onError={(e) => {
                                    e.target.style.display = 'none'
                                    setFileError('No se pudo cargar la imagen')
                                }}
                            />
                            <div className="image-caption">
                                <h3>{document.title}</h3>
                                <p>{document.category}</p>
                            </div>
                        </div>
                    )}

                    {/* Office Documents (DOC, PPT, XLS) — Google Docs Viewer + Download */}
                    {contentType === 'office' && fileUrl && !fileLoading && !fileError && (
                        <div className="office-viewer">
                            <div className="office-preview-container">
                                <iframe
                                    src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                                    title={document.title}
                                    className="office-iframe"
                                    frameBorder="0"
                                />
                            </div>
                            <div className="office-fallback">
                                <p>¿El documento no se muestra correctamente?</p>
                                <div className="office-fallback-actions">
                                    <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                    >
                                        <ExternalLink size={16} />
                                        Abrir en nueva pestaña
                                    </a>
                                    <button className="btn btn-primary" onClick={handleDownload}>
                                        <Download size={16} />
                                        Descargar archivo
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Text file viewer */}
                    {contentType === 'text' && fileUrl && !fileLoading && !fileError && (
                        <div className="text-viewer">
                            <TextFileViewer url={fileUrl} />
                        </div>
                    )}

                    {/* Generic file — download prompt */}
                    {contentType === 'generic' && !fileLoading && (
                        <div className="document-placeholder">
                            <div className="placeholder-content">
                                <div className="placeholder-icon">📄</div>
                                <h2>{document.title}</h2>
                                <p className="placeholder-category">{document.category}</p>
                                <p className="placeholder-type">Tipo: {document.type} ({document.size})</p>

                                {document.summary && (
                                    <div className="placeholder-summary">
                                        <div className="summary-header">
                                            <Sparkles size={14} />
                                            <span>Resumen IA</span>
                                        </div>
                                        <p>{document.summary}</p>
                                    </div>
                                )}

                                {fileUrl ? (
                                    <div className="placeholder-actions">
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-secondary"
                                        >
                                            <ExternalLink size={16} />
                                            Abrir en nueva pestaña
                                        </a>
                                        <button className="btn btn-primary" onClick={handleDownload}>
                                            <Download size={16} />
                                            Descargar archivo
                                        </button>
                                    </div>
                                ) : (
                                    <div className="placeholder-info">
                                        <p>
                                            Este documento no tiene contenido visualizable.
                                            Sube el archivo original para ver su contenido completo.
                                        </p>
                                    </div>
                                )}

                                {document.tags && document.tags.length > 0 && (
                                    <div className="placeholder-tags">
                                        {document.tags.map(tag => (
                                            <span key={tag} className="doc-tag">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PDF waiting for URL — show prompt while no URL and no error */}
                    {contentType === 'pdf' && !fileUrl && !fileLoading && !fileError && !document.isSample && document.filePath && (
                        <div className="reader-file-loading">
                            <Loader2 size={40} className="spinning" />
                            <p>Preparando documento...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Chat Panel */}
            {showAIPanel && (
                <aside className="reader-ai-panel">
                    <div className="ai-panel-header">
                        <div className="ai-title">
                            <h2>Tutor Médico</h2>
                            <span className="ai-status">
                                <span className="status-dot"></span>
                                {contentType === 'pdf' ? `LEYENDO PÁGINA ${currentPage}...` : 'ANALIZANDO DOCUMENTO...'}
                            </span>
                        </div>
                        <button className="more-btn"><MoreHorizontal size={18} /></button>
                    </div>

                    <div className="chat-container">
                        <span className="chat-date">
                            HOY {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <div className="chat-messages">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`chat-message ${msg.type}`}>
                                    {msg.type === 'ai' && (
                                        <div className="ai-avatar">
                                            <Sparkles size={16} />
                                        </div>
                                    )}
                                    <div className="message-bubble">
                                        {msg.type === 'ai' && (
                                            <span className="message-sender">Synapse IA</span>
                                        )}
                                        <p>{msg.content}</p>
                                    </div>
                                    {msg.type === 'user' && (
                                        <div className="user-avatar">
                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=DrSmith" alt="Tú" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="chat-input-section">
                        <div className="chat-input-wrapper">
                            <input
                                type="text"
                                placeholder="Haz una pregunta sobre el documento..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button className="send-btn" onClick={handleSend}>
                                <Send size={18} />
                            </button>
                        </div>
                        <div className="context-toggle">
                            <ToggleRight
                                size={18}
                                className={contextEnabled ? 'active' : ''}
                                onClick={() => setContextEnabled(!contextEnabled)}
                            />
                            <span>Contexto: {contentType === 'pdf' ? `Página ${currentPage}` : 'Documento completo'}</span>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <div className="actions-header">
                            <h3>ACCIONES RÁPIDAS</h3>
                            <Sparkles size={14} />
                        </div>

                        <button className="action-card">
                            <div className="action-icon blue">
                                <Layers size={18} />
                            </div>
                            <div className="action-text">
                                <span>Generar Flashcards</span>
                                <p>Crear tarjetas de estudio automáticas</p>
                            </div>
                        </button>

                        <button className="action-card">
                            <div className="action-icon purple">
                                <BookOpen size={18} />
                            </div>
                            <div className="action-text">
                                <span>Resumir Documento</span>
                                <p>Crear resumen de conceptos clave</p>
                            </div>
                        </button>

                        <button className="action-card">
                            <div className="action-icon green">
                                <Share2 size={18} />
                            </div>
                            <div className="action-text">
                                <span>Crear Mapa Mental</span>
                                <p>Visualizar conexiones del tema</p>
                            </div>
                        </button>
                    </div>
                </aside>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-modal-content">
                            <div className="delete-icon">
                                <Trash2 size={32} />
                            </div>
                            <h2>¿Eliminar documento?</h2>
                            <p>
                                Estás a punto de eliminar <strong>"{document?.title}"</strong>.
                                Esta acción no se puede deshacer.
                            </p>
                            <div className="delete-modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                >
                                    <Trash2 size={16} />
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Sub-component: loads and displays plain text files
function TextFileViewer({ url }) {
    const [text, setText] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!url) return
        setLoading(true)
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Error al cargar archivo de texto')
                return res.text()
            })
            .then(content => {
                setText(content)
                setError(null)
            })
            .catch(err => {
                console.error('Error loading text file:', err)
                setError(err.message)
            })
            .finally(() => setLoading(false))
    }, [url])

    if (loading) {
        return (
            <div className="text-loading">
                <Loader2 size={24} className="spinning" />
                <p>Cargando archivo de texto...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-error">
                <AlertCircle size={32} />
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div className="text-content-wrapper">
            <pre className="text-file-content">{text}</pre>
        </div>
    )
}
