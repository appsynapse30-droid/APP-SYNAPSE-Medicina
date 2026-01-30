import { useState, useRef, useCallback, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import {
    ZoomIn,
    ZoomOut,
    RotateCw,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Minimize2,
    Download,
    Search,
    Loader2,
    AlertCircle,
    RefreshCw
} from 'lucide-react'
import './PDFViewer.css'

// Configure PDF.js worker - using CDN for reliability
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

export default function PDFViewer({
    fileUrl,
    fileData,
    fileName = 'Documento',
    onPageChange,
    initialPage = 1
}) {
    const [numPages, setNumPages] = useState(null)
    const [currentPage, setCurrentPage] = useState(initialPage)
    const [scale, setScale] = useState(1.0)
    const [rotation, setRotation] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState(null)
    const [searchText, setSearchText] = useState('')
    const [showSearch, setShowSearch] = useState(false)
    const [pageInputValue, setPageInputValue] = useState('1')
    const [retryCount, setRetryCount] = useState(0)

    const containerRef = useRef(null)
    const [containerWidth, setContainerWidth] = useState(800)

    // Validate PDF data
    const validatePdfData = useCallback((data) => {
        if (!data) return false

        // Check if it's a valid base64 data URL for PDF
        if (typeof data === 'string') {
            // Check for data URL format
            if (data.startsWith('data:application/pdf;base64,')) {
                const base64Part = data.split(',')[1]
                // Basic validation - should not be empty and should be valid base64
                return base64Part && base64Part.length > 100
            }
            // Check for URL
            if (data.startsWith('http') || data.startsWith('/')) {
                return true
            }
        }

        return false
    }, [])

    // Observe container size for responsive scaling
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                const width = containerRef.current.clientWidth - 48
                setContainerWidth(width > 0 ? width : 800)
            }
        }
        updateWidth()
        window.addEventListener('resize', updateWidth)
        return () => window.removeEventListener('resize', updateWidth)
    }, [])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT') return

            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault()
                    goToPage(Math.min(numPages || 1, currentPage + 1))
                    break
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault()
                    goToPage(Math.max(1, currentPage - 1))
                    break
                case '+':
                case '=':
                    e.preventDefault()
                    handleZoomIn()
                    break
                case '-':
                    e.preventDefault()
                    handleZoomOut()
                    break
                case 'f':
                    e.preventDefault()
                    toggleFullscreen()
                    break
                default:
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [currentPage, numPages])

    const onDocumentLoadSuccess = ({ numPages: pages }) => {
        setNumPages(pages)
        setIsLoading(false)
        setLoadError(null)
        setCurrentPage(initialPage)
        setPageInputValue(String(initialPage))
    }

    const onDocumentLoadError = (error) => {
        console.error('Error loading PDF:', error)

        // Provide more helpful error messages
        let errorMessage = 'No se pudo cargar el documento PDF.'

        if (error?.message?.includes('Invalid PDF')) {
            errorMessage = 'El archivo no es un PDF válido o está dañado.'
        } else if (error?.message?.includes('Missing PDF')) {
            errorMessage = 'No se encontró el archivo PDF.'
        } else if (error?.message?.includes('password')) {
            errorMessage = 'El PDF está protegido con contraseña.'
        } else {
            errorMessage = 'Error al procesar el PDF. Puede que el archivo esté corrupto.'
        }

        setLoadError(errorMessage)
        setIsLoading(false)
    }

    const handleRetry = () => {
        setIsLoading(true)
        setLoadError(null)
        setRetryCount(prev => prev + 1)
    }

    const goToPage = useCallback((page) => {
        const validPage = Math.max(1, Math.min(numPages || 1, page))
        setCurrentPage(validPage)
        setPageInputValue(String(validPage))
        if (onPageChange) onPageChange(validPage)
    }, [numPages, onPageChange])

    const handlePageInputChange = (e) => {
        setPageInputValue(e.target.value)
    }

    const handlePageInputSubmit = (e) => {
        if (e.key === 'Enter') {
            const page = parseInt(pageInputValue, 10)
            if (!isNaN(page)) {
                goToPage(page)
            }
        }
    }

    const handleZoomIn = () => {
        setScale(prev => Math.min(3, prev + 0.25))
    }

    const handleZoomOut = () => {
        setScale(prev => Math.max(0.25, prev - 0.25))
    }

    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360)
    }

    const toggleFullscreen = () => {
        try {
            if (!window.document.fullscreenElement) {
                containerRef.current?.requestFullscreen()
                setIsFullscreen(true)
            } else {
                window.document.exitFullscreen()
                setIsFullscreen(false)
            }
        } catch (err) {
            console.error('Fullscreen error:', err)
        }
    }

    const handleDownload = () => {
        try {
            if (fileUrl) {
                const link = window.document.createElement('a')
                link.href = fileUrl
                link.download = fileName
                link.click()
            } else if (fileData) {
                const link = window.document.createElement('a')
                link.href = fileData
                link.download = fileName
                link.click()
            }
        } catch (err) {
            console.error('Download error:', err)
        }
    }

    // Determine the file source
    const pdfSource = fileData || fileUrl

    // If no source, show error
    if (!pdfSource) {
        return (
            <div className="pdf-viewer">
                <div className="pdf-error">
                    <AlertCircle size={48} />
                    <h3>Sin documento</h3>
                    <p>No se ha proporcionado ningún archivo PDF para visualizar.</p>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className={`pdf-viewer ${isFullscreen ? 'fullscreen' : ''}`}
        >
            {/* Toolbar */}
            <div className="pdf-toolbar">
                <div className="toolbar-group">
                    {/* Page Navigation */}
                    <button
                        className="toolbar-btn"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage <= 1 || isLoading}
                        title="Página anterior (←)"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="page-input-group">
                        <input
                            type="text"
                            value={pageInputValue}
                            onChange={handlePageInputChange}
                            onKeyDown={handlePageInputSubmit}
                            onBlur={() => goToPage(parseInt(pageInputValue, 10) || 1)}
                            className="page-input"
                            disabled={isLoading}
                        />
                        <span className="page-divider">/</span>
                        <span className="total-pages">{numPages || '-'}</span>
                    </div>

                    <button
                        className="toolbar-btn"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage >= (numPages || 1) || isLoading}
                        title="Página siguiente (→)"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div className="toolbar-divider" />

                {/* Zoom Controls */}
                <div className="toolbar-group">
                    <button
                        className="toolbar-btn"
                        onClick={handleZoomOut}
                        disabled={scale <= 0.25}
                        title="Reducir zoom (-)"
                    >
                        <ZoomOut size={18} />
                    </button>

                    <span className="zoom-indicator">{Math.round(scale * 100)}%</span>

                    <button
                        className="toolbar-btn"
                        onClick={handleZoomIn}
                        disabled={scale >= 3}
                        title="Aumentar zoom (+)"
                    >
                        <ZoomIn size={18} />
                    </button>
                </div>

                <div className="toolbar-divider" />

                {/* Actions */}
                <div className="toolbar-group">
                    <button
                        className="toolbar-btn"
                        onClick={handleRotate}
                        title="Rotar documento"
                    >
                        <RotateCw size={18} />
                    </button>

                    <button
                        className="toolbar-btn"
                        onClick={() => setShowSearch(!showSearch)}
                        title="Buscar en documento"
                    >
                        <Search size={18} />
                    </button>

                    <button
                        className="toolbar-btn"
                        onClick={toggleFullscreen}
                        title="Pantalla completa (F)"
                    >
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>

                    <button
                        className="toolbar-btn"
                        onClick={handleDownload}
                        title="Descargar PDF"
                    >
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            {showSearch && (
                <div className="pdf-search-bar">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Buscar en el documento..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        autoFocus
                    />
                    <span className="search-hint">Ctrl+F para buscar</span>
                </div>
            )}

            {/* PDF Content */}
            <div className="pdf-content">
                {isLoading && !loadError && (
                    <div className="pdf-loading">
                        <Loader2 size={40} className="spin" />
                        <p>Cargando documento...</p>
                    </div>
                )}

                {loadError && (
                    <div className="pdf-error">
                        <AlertCircle size={48} />
                        <h3>Error al cargar</h3>
                        <p>{loadError}</p>
                        <div className="error-actions">
                            <button className="retry-btn" onClick={handleRetry}>
                                <RefreshCw size={16} />
                                Reintentar
                            </button>
                            <p className="error-hint">
                                O intenta subir el archivo nuevamente
                            </p>
                        </div>
                    </div>
                )}

                {pdfSource && (
                    <Document
                        key={`pdf-doc-${retryCount}`}
                        file={pdfSource}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={null}
                        error={null}
                        className="pdf-document"
                        options={{
                            cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
                            cMapPacked: true,
                        }}
                    >
                        {!isLoading && !loadError && (
                            <Page
                                pageNumber={currentPage}
                                scale={scale}
                                rotate={rotation}
                                width={containerWidth ? Math.min(containerWidth, 900) : 700}
                                className="pdf-page"
                                loading={
                                    <div className="page-loading">
                                        <Loader2 size={24} className="spin" />
                                    </div>
                                }
                                error={
                                    <div className="pdf-error">
                                        <p>Error al cargar esta página</p>
                                    </div>
                                }
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        )}
                    </Document>
                )}
            </div>

            {/* Page Thumbnails / Mini Navigation */}
            {numPages && numPages > 1 && (
                <div className="pdf-page-bar">
                    <div className="page-progress">
                        <div
                            className="progress-fill"
                            style={{ width: `${(currentPage / numPages) * 100}%` }}
                        />
                    </div>
                    <div className="page-dots">
                        {Array.from({ length: Math.min(numPages, 10) }, (_, i) => {
                            const pageNum = numPages <= 10
                                ? i + 1
                                : Math.floor((i / 9) * (numPages - 1)) + 1
                            return (
                                <button
                                    key={i}
                                    className={`page-dot ${currentPage === pageNum ? 'active' : ''}`}
                                    onClick={() => goToPage(pageNum)}
                                    title={`Ir a página ${pageNum}`}
                                />
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
