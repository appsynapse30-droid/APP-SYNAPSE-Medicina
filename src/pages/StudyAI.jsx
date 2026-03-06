import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudyAI } from '../context/StudyAIContext'
import {
    Plus,
    Search,
    Brain,
    MessageSquare,
    MoreVertical,
    Pin,
    PinOff,
    Pencil,
    Trash2,
    X,
    Sparkles,
    BookOpen
} from 'lucide-react'
import './StudyAI.css'

export default function StudyAI() {
    const navigate = useNavigate()
    const {
        notebooks,
        searchQuery,
        setSearchQuery,
        createNotebook,
        updateNotebook,
        deleteNotebook,
        togglePinNotebook,
        setActiveNotebookId,
        SPECIALTIES,
        NOTEBOOK_ICONS,
        NOTEBOOK_COLORS
    } = useStudyAI()

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingNotebook, setEditingNotebook] = useState(null)
    const [contextMenu, setContextMenu] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        specialty: '',
        icon: '📚',
        color: '#58a6ff'
    })

    // Sort: pinned first, then by updatedAt
    const sortedNotebooks = [...notebooks].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return new Date(b.updatedAt) - new Date(a.updatedAt)
    })

    const openNotebook = (notebook) => {
        setActiveNotebookId(notebook.id)
        navigate(`/study/notebook/${notebook.id}`)
    }

    const handleCreate = () => {
        if (!formData.title.trim()) return
        if (editingNotebook) {
            updateNotebook(editingNotebook.id, formData)
        } else {
            createNotebook(formData)
        }
        closeModal()
    }

    const openEditModal = (notebook) => {
        setEditingNotebook(notebook)
        setFormData({
            title: notebook.title,
            description: notebook.description || '',
            specialty: notebook.specialty || '',
            icon: notebook.icon,
            color: notebook.color
        })
        setShowCreateModal(true)
        setContextMenu(null)
    }

    const closeModal = () => {
        setShowCreateModal(false)
        setEditingNotebook(null)
        setFormData({ title: '', description: '', specialty: '', icon: '📚', color: '#58a6ff' })
    }

    const handleDelete = (id) => {
        deleteNotebook(id)
        setContextMenu(null)
    }

    const formatDate = (date) => {
        const now = new Date()
        const d = new Date(date)
        const diffMs = now - d
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Hoy'
        if (diffDays === 1) return 'Ayer'
        if (diffDays < 7) return `Hace ${diffDays} días`
        return d.toLocaleDateString('es', { month: 'short', day: 'numeric' })
    }

    return (
        <div className="study-ai-page">
            {/* Page Header */}
            <div className="study-ai-header">
                <div className="study-ai-header-left">
                    <div className="study-ai-icon-title">
                        <div className="study-ai-page-icon">
                            <Brain size={24} />
                        </div>
                        <div>
                            <h1>Estudio IA</h1>
                            <p className="study-ai-subtitle">Tu asistente médico especializado</p>
                        </div>
                    </div>
                </div>
                <div className="study-ai-header-right">
                    <div className="study-ai-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Buscar cuadernos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="search-clear" onClick={() => setSearchQuery('')}>
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <button className="create-notebook-btn" onClick={() => setShowCreateModal(true)}>
                        <Plus size={18} />
                        <span>Nuevo Cuaderno</span>
                    </button>
                </div>
            </div>

            {/* Notebooks Grid */}
            {sortedNotebooks.length > 0 ? (
                <div className="notebooks-grid">
                    {/* New notebook card */}
                    <button className="notebook-card new-card" onClick={() => setShowCreateModal(true)}>
                        <div className="new-card-icon">
                            <Plus size={32} />
                        </div>
                        <span>Crear Cuaderno</span>
                        <p>Organiza un nuevo tema de estudio</p>
                    </button>

                    {sortedNotebooks.map((notebook) => (
                        <div
                            key={notebook.id}
                            className="notebook-card"
                            onClick={() => openNotebook(notebook)}
                        >
                            {notebook.isPinned && (
                                <div className="pin-indicator">
                                    <Pin size={12} />
                                </div>
                            )}

                            <button
                                className="notebook-menu-btn"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setContextMenu(contextMenu === notebook.id ? null : notebook.id)
                                }}
                            >
                                <MoreVertical size={16} />
                            </button>

                            {contextMenu === notebook.id && (
                                <div className="notebook-context-menu" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => { togglePinNotebook(notebook.id); setContextMenu(null) }}>
                                        {notebook.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                                        <span>{notebook.isPinned ? 'Desfijar' : 'Fijar'}</span>
                                    </button>
                                    <button onClick={() => openEditModal(notebook)}>
                                        <Pencil size={14} />
                                        <span>Editar</span>
                                    </button>
                                    <button className="delete-action" onClick={() => handleDelete(notebook.id)}>
                                        <Trash2 size={14} />
                                        <span>Eliminar</span>
                                    </button>
                                </div>
                            )}

                            <div className="notebook-card-icon" style={{ background: `${notebook.color}20` }}>
                                <span>{notebook.icon}</span>
                            </div>

                            <div className="notebook-card-body">
                                <h3>{notebook.title}</h3>
                                {notebook.specialty && (
                                    <span className="notebook-specialty" style={{ color: notebook.color }}>
                                        {notebook.specialty}
                                    </span>
                                )}
                                {notebook.description && (
                                    <p className="notebook-description">{notebook.description}</p>
                                )}
                            </div>

                            <div className="notebook-card-footer">
                                <div className="notebook-meta">
                                    <MessageSquare size={12} />
                                    <span>{notebook.chatsCount} chats</span>
                                </div>
                                <span className="notebook-date">{formatDate(notebook.updatedAt)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="study-ai-empty">
                    <div className="empty-illustration">
                        <div className="empty-icon-ring">
                            <BookOpen size={48} />
                        </div>
                        <div className="empty-sparkle s1"><Sparkles size={16} /></div>
                        <div className="empty-sparkle s2"><Sparkles size={12} /></div>
                        <div className="empty-sparkle s3"><Sparkles size={14} /></div>
                    </div>
                    <h2>Comienza tu estudio con IA</h2>
                    <p>Crea tu primer cuaderno para organizar temas de estudio. Cada cuaderno contiene chats con tu asistente médico especializado que responde con láminas interactivas.</p>
                    <button className="create-notebook-btn large" onClick={() => setShowCreateModal(true)}>
                        <Plus size={20} />
                        <span>Crear mi primer cuaderno</span>
                    </button>
                </div>
            )}

            {/* Click outside to close context menu */}
            {contextMenu && (
                <div className="context-menu-overlay" onClick={() => setContextMenu(null)} />
            )}

            {/* Create / Edit Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingNotebook ? 'Editar Cuaderno' : 'Nuevo Cuaderno'}</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Icon + Color selector */}
                            <div className="form-row icon-color-row">
                                <div className="form-group">
                                    <label>Icono</label>
                                    <div className="icon-picker">
                                        {NOTEBOOK_ICONS.map(icon => (
                                            <button
                                                key={icon}
                                                className={`icon-option ${formData.icon === icon ? 'active' : ''}`}
                                                onClick={() => setFormData({ ...formData, icon })}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Color</label>
                                    <div className="color-picker">
                                        {NOTEBOOK_COLORS.map(color => (
                                            <button
                                                key={color}
                                                className={`color-option ${formData.color === color ? 'active' : ''}`}
                                                style={{ background: color }}
                                                onClick={() => setFormData({ ...formData, color })}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Nombre del cuaderno</label>
                                <input
                                    type="text"
                                    placeholder="ej. Cardiología Clínica"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label>Especialidad</label>
                                <select
                                    value={formData.specialty}
                                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                >
                                    <option value="">Seleccionar especialidad...</option>
                                    {SPECIALTIES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Descripción <span className="optional">(opcional)</span></label>
                                <input
                                    type="text"
                                    placeholder="Breve descripción del cuaderno"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
                            <button
                                className="btn-create"
                                onClick={handleCreate}
                                disabled={!formData.title.trim()}
                            >
                                <span style={{ fontSize: '18px' }}>{formData.icon}</span>
                                {editingNotebook ? 'Guardar cambios' : 'Crear cuaderno'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
