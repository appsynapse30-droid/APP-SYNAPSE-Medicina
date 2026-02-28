import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search,
    Upload,
    Grid3X3,
    List,
    Folder,
    FileText,
    Image as ImageIcon,
    MoreVertical,
    Sparkles,
    CheckSquare,
    X,
    Plus,
    Edit3,
    Trash2,
    FolderPlus,
    Tag,
    SortAsc,
    SortDesc,
    File,
    FilePlus,
    Check,
    Clock,
    Download,
    Loader2,
    AlertCircle
} from 'lucide-react'
import { useLibrary } from '../context/LibraryContext'
import './Library.css'

export default function Library() {
    const navigate = useNavigate()
    const {
        documents,
        collections,
        tags,
        loading,
        uploading,
        uploadProgress,
        error: libraryError,
        addDocument,
        updateDocument,
        deleteDocument,
        moveToCollection,
        addCollection,
        deleteCollection,
        renameCollection,
        searchDocuments,
        createNote,
        downloadDocument,
        validateFile,
        MAX_FILE_SIZE
    } = useLibrary()

    const [viewMode, setViewMode] = useState('grid')
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [selectedCollection, setSelectedCollection] = useState(null)
    const [selectedTags, setSelectedTags] = useState([])
    const [sortBy, setSortBy] = useState('date')
    const [sortOrder, setSortOrder] = useState('desc')

    // Modales
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [showNoteModal, setShowNoteModal] = useState(false)
    const [showCollectionModal, setShowCollectionModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [documentToDelete, setDocumentToDelete] = useState(null)
    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, doc: null })


    // Estados de edición
    const [editingCollection, setEditingCollection] = useState(null)
    const [newCollectionName, setNewCollectionName] = useState('')
    const [noteTitle, setNoteTitle] = useState('')
    const [noteContent, setNoteContent] = useState('')
    const [noteCollection, setNoteCollection] = useState('')
    const [noteTags, setNoteTags] = useState([])

    // Upload
    const [dragActive, setDragActive] = useState(false)
    const [uploadFiles, setUploadFiles] = useState([])
    const [uploadCollection, setUploadCollection] = useState('')
    const [uploadTags, setUploadTags] = useState([])
    const fileInputRef = useRef(null)

    // Filtrar documentos
    const filteredDocuments = searchDocuments(searchQuery, {
        collection: selectedCollection,
        type: activeTab !== 'all' ? activeTab : null,
        tags: selectedTags.length > 0 ? selectedTags : null,
        sortBy
    })

    // Ordenar documentos
    const sortedDocuments = [...filteredDocuments].sort((a, b) => {
        let comparison = 0
        switch (sortBy) {
            case 'date':
                comparison = new Date(b.date) - new Date(a.date)
                break
            case 'name':
                comparison = a.title.localeCompare(b.title)
                break
            case 'size':
                comparison = (b.sizeBytes || 0) - (a.sizeBytes || 0)
                break
            default:
                break
        }
        return sortOrder === 'desc' ? comparison : -comparison
    })

    // Funciones de drag & drop
    const handleDrag = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files)
        }
    }, [])

    const handleFiles = (files) => {
        const fileArray = []
        const errors = []

        Array.from(files).forEach(file => {
            // Validate file
            const validation = validateFile(file)
            if (!validation.valid) {
                errors.push(validation.error)
                return
            }

            fileArray.push({
                file,
                name: file.name,
                size: formatFileSize(file.size),
                sizeBytes: file.size,
                type: getFileType(file.name),
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
            })
        })

        if (errors.length > 0) {
            alert(errors.join('\n'))
        }

        if (fileArray.length > 0) {
            setUploadFiles(prev => [...prev, ...fileArray])
            setShowUploadModal(true)
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const getFileType = (filename) => {
        const ext = filename.split('.').pop().toLowerCase()
        if (['pdf'].includes(ext)) return 'PDF'
        if (['doc', 'docx', 'rtf'].includes(ext)) return 'DOC'
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'IMG'
        if (['ppt', 'pptx'].includes(ext)) return 'PPT'
        if (['xls', 'xlsx', 'csv'].includes(ext)) return 'XLS'
        if (['txt'].includes(ext)) return 'TXT'
        return 'ARCHIVO'
    }

    const processUpload = async () => {
        let hasError = false
        for (const fileData of uploadFiles) {
            const result = await addDocument({
                title: fileData.name,
                type: fileData.type,
                category: `Documento ${fileData.type}`,
                summary: 'Documento subido recientemente',
                tags: uploadTags,
                collection: uploadCollection || null,
                size: fileData.size,
                sizeBytes: fileData.sizeBytes,
                image: fileData.preview || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=200&fit=crop',
                content: null,
                isNote: false
            }, fileData.file)

            if (result?.error) {
                hasError = true
            }
        }

        if (!hasError) {
            setUploadFiles([])
            setUploadCollection('')
            setUploadTags([])
            setShowUploadModal(false)
        }
    }

    const handleCreateNote = () => {
        if (!noteTitle.trim()) return

        createNote(noteTitle, noteContent, noteCollection || null, noteTags)

        setNoteTitle('')
        setNoteContent('')
        setNoteCollection('')
        setNoteTags([])
        setShowNoteModal(false)
    }

    const handleCreateCollection = () => {
        if (!newCollectionName.trim()) return

        const colors = ['#f85149', '#58a6ff', '#8b5cf6', '#3fb950', '#f0883e', '#39d5ff']
        const randomColor = colors[Math.floor(Math.random() * colors.length)]

        addCollection(newCollectionName, randomColor)
        setNewCollectionName('')
        setShowCollectionModal(false)
    }

    const handleContextMenu = (e, doc) => {
        e.preventDefault()
        setContextMenu({ show: true, x: e.clientX, y: e.clientY, doc })
    }

    const closeContextMenu = () => {
        setContextMenu({ show: false, x: 0, y: 0, doc: null })
    }

    const formatRelativeDate = (dateStr) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `hace ${diffMins} min`
        if (diffHours < 24) return `hace ${diffHours}h`
        if (diffDays === 1) return 'ayer'
        if (diffDays < 7) return `hace ${diffDays} días`
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    }

    const toggleTagSelection = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        )
    }

    return (
        <div className="library" onClick={closeContextMenu}>
            {/* Sidebar */}
            <aside className="library-sidebar">
                <div className="sidebar-section">
                    <div className="sidebar-header">
                        <h3 className="sidebar-title">COLECCIONES</h3>
                        <button
                            className="add-collection-btn"
                            onClick={() => setShowCollectionModal(true)}
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                    <ul className="collection-list">
                        <li
                            className={`collection-item ${!selectedCollection ? 'active' : ''}`}
                            onClick={() => setSelectedCollection(null)}
                        >
                            <Folder size={16} />
                            <span>Todos</span>
                            <span className="collection-count">{documents.length}</span>
                        </li>
                        {collections.map((col) => (
                            <li
                                key={col.id}
                                className={`collection-item ${selectedCollection === col.name ? 'active' : ''}`}
                                onClick={() => setSelectedCollection(col.name)}
                            >
                                <Folder size={16} style={{ color: col.color }} />
                                {editingCollection === col.id ? (
                                    <input
                                        type="text"
                                        defaultValue={col.name}
                                        className="edit-collection-input"
                                        autoFocus
                                        onBlur={(e) => {
                                            renameCollection(col.id, e.target.value)
                                            setEditingCollection(null)
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                renameCollection(col.id, e.target.value)
                                                setEditingCollection(null)
                                            }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <>
                                        <span>{col.name}</span>
                                        <span className="collection-count">{col.count}</span>
                                        <div className="collection-actions">
                                            <button onClick={(e) => {
                                                e.stopPropagation()
                                                setEditingCollection(col.id)
                                            }}>
                                                <Edit3 size={12} />
                                            </button>
                                            <button onClick={(e) => {
                                                e.stopPropagation()
                                                deleteCollection(col.id)
                                            }}>
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="sidebar-section">
                    <h3 className="sidebar-title">ETIQUETAS</h3>
                    <div className="tags-filter">
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                className={`tag-filter-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                                onClick={() => toggleTagSelection(tag)}
                            >
                                <Tag size={12} />
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className="library-main"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {/* Drag overlay */}
                {dragActive && (
                    <div className="drag-overlay">
                        <Upload size={48} />
                        <p>Suelta tus archivos aquí</p>
                    </div>
                )}

                {/* Error Banner */}
                {libraryError && (
                    <div className="library-error-banner">
                        <AlertCircle size={18} />
                        <span>{libraryError}</span>
                        <button onClick={() => { }} className="error-dismiss">×</button>
                    </div>
                )}

                {/* Upload Progress Indicator */}
                {uploading && (
                    <div className="upload-progress-banner">
                        <Loader2 size={18} className="spinning" />
                        <span>Subiendo documento... {uploadProgress}%</span>
                        <div className="upload-progress-bar">
                            <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
                        </div>
                    </div>
                )}

                <div className="library-header">
                    <div>
                        <h1>Biblioteca</h1>
                        <p className="library-subtitle">Gestiona tus materiales de estudio e insights generados</p>
                    </div>
                    <div className="header-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowNoteModal(true)}
                        >
                            <FilePlus size={18} />
                            Nueva Nota
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading ? <Loader2 size={18} className="spinning" /> : <Upload size={18} />}
                            {uploading ? 'Subiendo...' : 'Subir Documento'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.svg,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.rtf"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                    </div>
                </div>

                <div className="search-section">
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar 'síntomas de arritmia'... (Búsqueda semántica activa)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="clear-search" onClick={() => setSearchQuery('')}>
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <button className="semantic-toggle active">
                        <Sparkles size={16} />
                        Búsqueda Semántica
                    </button>
                    <div className="sort-controls">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                        >
                            <option value="date">Fecha</option>
                            <option value="name">Nombre</option>
                            <option value="size">Tamaño</option>
                        </select>
                        <button
                            className="sort-order-btn"
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        >
                            {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
                        </button>
                    </div>
                    <div className="view-toggle">
                        <button
                            className={viewMode === 'grid' ? 'active' : ''}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid3X3 size={18} />
                        </button>
                        <button
                            className={viewMode === 'list' ? 'active' : ''}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        Todos
                    </button>
                    <button
                        className={`filter-tab ${activeTab === 'PDF' ? 'active' : ''}`}
                        onClick={() => setActiveTab('PDF')}
                    >
                        PDFs
                    </button>
                    <button
                        className={`filter-tab ${activeTab === 'NOTA' ? 'active' : ''}`}
                        onClick={() => setActiveTab('NOTA')}
                    >
                        Notas
                    </button>
                    <button
                        className={`filter-tab ${activeTab === 'IMG' ? 'active' : ''}`}
                        onClick={() => setActiveTab('IMG')}
                    >
                        Imágenes
                    </button>
                    {selectedTags.length > 0 && (
                        <div className="active-filters">
                            {selectedTags.map(tag => (
                                <span key={tag} className="active-filter-tag">
                                    {tag}
                                    <button onClick={() => toggleTagSelection(tag)}>
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                            <button
                                className="clear-filters"
                                onClick={() => setSelectedTags([])}
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>

                <section className="documents-section">
                    <h2 className="section-label">
                        {selectedCollection || 'TODOS LOS DOCUMENTOS'}
                        <span className="doc-count">({sortedDocuments.length})</span>
                    </h2>

                    {sortedDocuments.length === 0 ? (
                        <div className="empty-state">
                            <File size={48} />
                            <h3>No hay documentos</h3>
                            <p>Sube archivos o crea notas para comenzar</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload size={18} />
                                Subir Documento
                            </button>
                        </div>
                    ) : (
                        <div className={`documents-grid ${viewMode}`}>
                            {sortedDocuments.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="document-card"
                                    onClick={() => navigate(`/library/document/${doc.id}`)}
                                    onContextMenu={(e) => handleContextMenu(e, doc)}
                                >
                                    <div className="document-image">
                                        {doc.image ? (
                                            <img src={doc.image} alt={doc.title} />
                                        ) : (
                                            <div className="no-image">
                                                {doc.isNote ? <FileText size={32} /> : <File size={32} />}
                                            </div>
                                        )}
                                        <span className={`doc-type-badge ${doc.type.toLowerCase()}`}>
                                            {doc.type}
                                        </span>
                                        <button
                                            className="doc-menu"
                                            onClick={(e) => handleContextMenu(e, doc)}
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                    <div className="document-content">
                                        <h3>{doc.title}</h3>
                                        <p className="doc-category">{doc.category}</p>
                                        {doc.summary && (
                                            <div className="doc-summary">
                                                <Sparkles size={12} className="ai-icon" />
                                                <span>RESUMEN IA</span>
                                                <p>{doc.summary}</p>
                                            </div>
                                        )}
                                        <div className="doc-tags">
                                            {doc.tags.map((tag) => (
                                                <span key={tag} className="doc-tag">{tag}</span>
                                            ))}
                                        </div>
                                        <div className="doc-meta">
                                            <span>
                                                <Clock size={12} />
                                                {formatRelativeDate(doc.date)}
                                            </span>
                                            <span>{doc.size}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Context Menu */}
            {contextMenu.show && (
                <div
                    className="context-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => {
                        // TODO: Open document
                        closeContextMenu()
                    }}>
                        <FileText size={14} />
                        Abrir
                    </button>
                    <div className="context-menu-divider" />
                    <div className="context-submenu">
                        <span><FolderPlus size={14} /> Mover a...</span>
                        <div className="submenu-items">
                            <button onClick={() => {
                                moveToCollection(contextMenu.doc.id, null)
                                closeContextMenu()
                            }}>
                                Sin colección
                            </button>
                            {collections.map(col => (
                                <button
                                    key={col.id}
                                    onClick={() => {
                                        moveToCollection(contextMenu.doc.id, col.name)
                                        closeContextMenu()
                                    }}
                                >
                                    <Folder size={12} style={{ color: col.color }} />
                                    {col.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="context-menu-divider" />
                    <button
                        className="danger"
                        onClick={() => {
                            setDocumentToDelete(contextMenu.doc)
                            setShowDeleteModal(true)
                            closeContextMenu()
                        }}
                    >
                        <Trash2 size={14} />
                        Eliminar
                    </button>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Subir Documentos</h2>
                            <button onClick={() => setShowUploadModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="upload-files-list">
                                {uploadFiles.map((file, index) => (
                                    <div key={index} className="upload-file-item">
                                        {file.preview ? (
                                            <img src={file.preview} alt={file.name} className="file-preview" />
                                        ) : (
                                            <div className="file-icon">
                                                <FileText size={24} />
                                            </div>
                                        )}
                                        <div className="file-info">
                                            <span className="file-name">{file.name}</span>
                                            <span className="file-size">{file.size}</span>
                                        </div>
                                        <button
                                            className="remove-file"
                                            onClick={() => setUploadFiles(prev => prev.filter((_, i) => i !== index))}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div
                                className={`drop-zone ${dragActive ? 'active' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setDragActive(false)
                                    if (e.dataTransfer.files) {
                                        handleFiles(e.dataTransfer.files)
                                    }
                                }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload size={32} />
                                <p>Arrastra archivos aquí o haz clic para seleccionar</p>
                            </div>

                            <div className="form-group">
                                <label>Colección (opcional)</label>
                                <select
                                    value={uploadCollection}
                                    onChange={(e) => setUploadCollection(e.target.value)}
                                >
                                    <option value="">Sin colección</option>
                                    {collections.map(col => (
                                        <option key={col.id} value={col.name}>{col.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Etiquetas</label>
                                <div className="tags-input">
                                    {tags.map(tag => (
                                        <button
                                            key={tag}
                                            className={`tag-btn ${uploadTags.includes(tag) ? 'active' : ''}`}
                                            onClick={() => setUploadTags(prev =>
                                                prev.includes(tag)
                                                    ? prev.filter(t => t !== tag)
                                                    : [...prev, tag]
                                            )}
                                        >
                                            {uploadTags.includes(tag) && <Check size={12} />}
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowUploadModal(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={processUpload}
                                disabled={uploadFiles.length === 0 || uploading}
                            >
                                {uploading ? (
                                    <><Loader2 size={16} className="spinning" /> Subiendo...</>
                                ) : (
                                    `Subir ${uploadFiles.length} archivo(s)`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Note Modal */}
            {showNoteModal && (
                <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
                    <div className="modal note-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Nueva Nota</h2>
                            <button onClick={() => setShowNoteModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="form-group">
                                <label>Título</label>
                                <input
                                    type="text"
                                    placeholder="Título de la nota..."
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Contenido</label>
                                <textarea
                                    placeholder="Escribe tu nota aquí..."
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    rows={8}
                                />
                            </div>

                            <div className="form-group">
                                <label>Colección (opcional)</label>
                                <select
                                    value={noteCollection}
                                    onChange={(e) => setNoteCollection(e.target.value)}
                                >
                                    <option value="">Sin colección</option>
                                    {collections.map(col => (
                                        <option key={col.id} value={col.name}>{col.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Etiquetas</label>
                                <div className="tags-input">
                                    {tags.map(tag => (
                                        <button
                                            key={tag}
                                            className={`tag-btn ${noteTags.includes(tag) ? 'active' : ''}`}
                                            onClick={() => setNoteTags(prev =>
                                                prev.includes(tag)
                                                    ? prev.filter(t => t !== tag)
                                                    : [...prev, tag]
                                            )}
                                        >
                                            {noteTags.includes(tag) && <Check size={12} />}
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowNoteModal(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateNote}
                                disabled={!noteTitle.trim()}
                            >
                                Crear Nota
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Collection Modal */}
            {showCollectionModal && (
                <div className="modal-overlay" onClick={() => setShowCollectionModal(false)}>
                    <div className="modal small-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Nueva Colección</h2>
                            <button onClick={() => setShowCollectionModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="form-group">
                                <label>Nombre de la colección</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Medicina Interna..."
                                    value={newCollectionName}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowCollectionModal(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateCollection}
                                disabled={!newCollectionName.trim()}
                            >
                                Crear Colección
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && documentToDelete && (
                <div className="modal-overlay" onClick={() => {
                    setShowDeleteModal(false)
                    setDocumentToDelete(null)
                }}>
                    <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-modal-content">
                            <div className="delete-icon">
                                <Trash2 size={32} />
                            </div>
                            <h2>¿Eliminar documento?</h2>
                            <p>
                                Estás a punto de eliminar <strong>"{documentToDelete.title}"</strong>.
                                Esta acción no se puede deshacer.
                            </p>
                            <div className="delete-modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowDeleteModal(false)
                                        setDocumentToDelete(null)
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => {
                                        deleteDocument(documentToDelete.id)
                                        setShowDeleteModal(false)
                                        setDocumentToDelete(null)
                                    }}
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
