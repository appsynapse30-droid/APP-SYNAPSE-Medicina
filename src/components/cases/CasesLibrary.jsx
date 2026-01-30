import { useState, useMemo } from 'react'
import {
    Search,
    Plus,
    Filter,
    Grid,
    List,
    Heart,
    Star,
    Clock,
    BookOpen,
    MoreVertical,
    Edit2,
    Copy,
    Trash2,
    Play,
    ChevronDown,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Brain,
    Activity,
    Wind,
    Droplets,
    Bug,
    Baby,
    Clipboard,
    Stethoscope
} from 'lucide-react'
import { useClinicalCases, medicalCategories, difficultyLevels, caseStatuses } from '../../context/ClinicalCasesContext'

// Mapa de iconos para categorías
const categoryIcons = {
    cardiologia: Heart,
    neurologia: Brain,
    neumologia: Wind,
    gastroenterologia: Activity,
    endocrinologia: Activity,
    nefrologia: Droplets,
    traumatologia: Clipboard,
    infectologia: Bug,
    pediatria: Baby,
    ginecologia: Heart,
    emergencias: AlertCircle,
    otro: Clipboard,
}

export default function CasesLibrary({
    onSelectCase,
    onNewCase,
    onEditCase,
    onStudyCase,
    onSimulateCase
}) {
    const {
        cases,
        deleteCase,
        duplicateCase,
        toggleFavorite,
        getStats,
        searchCases
    } = useClinicalCases()

    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
    const [filterCategory, setFilterCategory] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterDifficulty, setFilterDifficulty] = useState('all')
    const [sortBy, setSortBy] = useState('updatedAt') // 'updatedAt' | 'title' | 'difficulty' | 'mastery'
    const [showFilters, setShowFilters] = useState(false)
    const [activeMenu, setActiveMenu] = useState(null)

    const stats = getStats()

    // Filtrar y ordenar casos
    const filteredCases = useMemo(() => {
        let result = searchQuery ? searchCases(searchQuery) : [...cases]

        // Filtrar por categoría
        if (filterCategory !== 'all') {
            result = result.filter(c => c.category === filterCategory)
        }

        // Filtrar por estado
        if (filterStatus !== 'all') {
            result = result.filter(c => c.status === filterStatus)
        }

        // Filtrar por dificultad
        if (filterDifficulty !== 'all') {
            result = result.filter(c => c.difficulty === parseInt(filterDifficulty))
        }

        // Ordenar
        result.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title)
                case 'difficulty':
                    return b.difficulty - a.difficulty
                case 'mastery':
                    return b.studyStats.masteryLevel - a.studyStats.masteryLevel
                case 'updatedAt':
                default:
                    return new Date(b.updatedAt) - new Date(a.updatedAt)
            }
        })

        return result
    }, [cases, searchQuery, filterCategory, filterStatus, filterDifficulty, sortBy])

    const handleDelete = (id, e) => {
        e.stopPropagation()
        if (confirm('¿Estás seguro de que deseas eliminar este caso?')) {
            deleteCase(id)
        }
        setActiveMenu(null)
    }

    const handleDuplicate = (id, e) => {
        e.stopPropagation()
        duplicateCase(id)
        setActiveMenu(null)
    }

    const handleToggleFavorite = (id, e) => {
        e.stopPropagation()
        toggleFavorite(id)
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Nunca'
        const date = new Date(dateStr)
        const now = new Date()
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Hoy'
        if (diffDays === 1) return 'Ayer'
        if (diffDays < 7) return `Hace ${diffDays} días`

        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    }

    const CategoryIcon = ({ category }) => {
        const Icon = categoryIcons[category] || Clipboard
        return <Icon size={16} />
    }

    return (
        <div className="cases-library">
            {/* Header */}
            <div className="library-header">
                <div className="header-left">
                    <h1>Casos Clínicos</h1>
                    <p>{stats.total} casos guardados</p>
                </div>
                <button className="btn-new-case" onClick={onNewCase}>
                    <Plus size={18} />
                    Nuevo Caso
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-row">
                <div className="stat-mini">
                    <div className="stat-icon nuevo">
                        <AlertCircle size={18} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.byStatus.nuevo}</span>
                        <span className="stat-label">Nuevos</span>
                    </div>
                </div>
                <div className="stat-mini">
                    <div className="stat-icon progreso">
                        <Clock size={18} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.byStatus.en_progreso}</span>
                        <span className="stat-label">En Progreso</span>
                    </div>
                </div>
                <div className="stat-mini">
                    <div className="stat-icon dominado">
                        <CheckCircle2 size={18} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.byStatus.dominado}</span>
                        <span className="stat-label">Dominados</span>
                    </div>
                </div>
                <div className="stat-mini">
                    <div className="stat-icon pendiente">
                        <BookOpen size={18} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.pendingReview}</span>
                        <span className="stat-label">Para Repasar</span>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="library-toolbar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por título, paciente, etiqueta..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="toolbar-actions">
                    <button
                        className={`btn-filter ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={16} />
                        Filtros
                        <ChevronDown size={14} className={showFilters ? 'rotated' : ''} />
                    </button>

                    <select
                        className="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="updatedAt">Más reciente</option>
                        <option value="title">Título A-Z</option>
                        <option value="difficulty">Dificultad</option>
                        <option value="mastery">Dominio</option>
                    </select>

                    <div className="view-toggle">
                        <button
                            className={viewMode === 'grid' ? 'active' : ''}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid size={16} />
                        </button>
                        <button
                            className={viewMode === 'list' ? 'active' : ''}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filter-group">
                        <label>Categoría</label>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="all">Todas</option>
                            {Object.entries(medicalCategories).map(([key, cat]) => (
                                <option key={key} value={key}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Estado</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Todos</option>
                            {Object.entries(caseStatuses).map(([key, status]) => (
                                <option key={key} value={key}>{status.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Dificultad</label>
                        <select
                            value={filterDifficulty}
                            onChange={(e) => setFilterDifficulty(e.target.value)}
                        >
                            <option value="all">Todas</option>
                            {Object.entries(difficultyLevels).map(([key, level]) => (
                                <option key={key} value={key}>{level.label}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        className="btn-clear-filters"
                        onClick={() => {
                            setFilterCategory('all')
                            setFilterStatus('all')
                            setFilterDifficulty('all')
                        }}
                    >
                        Limpiar filtros
                    </button>
                </div>
            )}

            {/* Cases Grid/List */}
            {filteredCases.length === 0 ? (
                <div className="empty-state">
                    <Clipboard size={48} />
                    <h3>No hay casos</h3>
                    <p>
                        {searchQuery || filterCategory !== 'all' || filterStatus !== 'all'
                            ? 'No se encontraron casos con los filtros aplicados'
                            : 'Comienza creando tu primer caso clínico'}
                    </p>
                    {!searchQuery && filterCategory === 'all' && (
                        <button className="btn-primary" onClick={onNewCase}>
                            <Plus size={16} />
                            Crear Primer Caso
                        </button>
                    )}
                </div>
            ) : (
                <div className={`cases-${viewMode}`}>
                    {filteredCases.map(caseItem => (
                        <div
                            key={caseItem.id}
                            className={`case-card ${viewMode}`}
                            onClick={() => onSelectCase(caseItem.id)}
                        >
                            {/* Favorite Button */}
                            <button
                                className={`btn-favorite ${caseItem.isFavorite ? 'active' : ''}`}
                                onClick={(e) => handleToggleFavorite(caseItem.id, e)}
                            >
                                <Star size={16} fill={caseItem.isFavorite ? 'currentColor' : 'none'} />
                            </button>

                            {/* Card Header */}
                            <div className="case-card-header">
                                <div
                                    className="case-category-icon"
                                    style={{
                                        backgroundColor: medicalCategories[caseItem.category]?.bgColor,
                                        color: medicalCategories[caseItem.category]?.color
                                    }}
                                >
                                    <CategoryIcon category={caseItem.category} />
                                </div>
                                <div className="case-meta">
                                    <span
                                        className="case-category"
                                        style={{ color: medicalCategories[caseItem.category]?.color }}
                                    >
                                        {medicalCategories[caseItem.category]?.label}
                                    </span>
                                    <span
                                        className="case-status"
                                        style={{
                                            backgroundColor: caseStatuses[caseItem.status]?.bgColor,
                                            color: caseStatuses[caseItem.status]?.color
                                        }}
                                    >
                                        {caseStatuses[caseItem.status]?.label}
                                    </span>
                                </div>

                                {/* Menu Button */}
                                <div className="case-menu-wrapper">
                                    <button
                                        className="btn-menu"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setActiveMenu(activeMenu === caseItem.id ? null : caseItem.id)
                                        }}
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    {activeMenu === caseItem.id && (
                                        <div className="case-menu">
                                            <button onClick={(e) => {
                                                e.stopPropagation()
                                                onEditCase(caseItem.id)
                                                setActiveMenu(null)
                                            }}>
                                                <Edit2 size={14} />
                                                Editar
                                            </button>
                                            <button onClick={(e) => handleDuplicate(caseItem.id, e)}>
                                                <Copy size={14} />
                                                Duplicar
                                            </button>
                                            {caseItem.timeline?.length > 0 && (
                                                <button onClick={(e) => {
                                                    e.stopPropagation()
                                                    onSimulateCase(caseItem.id)
                                                    setActiveMenu(null)
                                                }}>
                                                    <Play size={14} />
                                                    Simular
                                                </button>
                                            )}
                                            <button
                                                className="danger"
                                                onClick={(e) => handleDelete(caseItem.id, e)}
                                            >
                                                <Trash2 size={14} />
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Patient Info */}
                            {caseItem.patient.photoUrl && viewMode === 'grid' && (
                                <div className="case-patient">
                                    <img
                                        src={caseItem.patient.photoUrl}
                                        alt={caseItem.patient.name}
                                        className="patient-avatar-small"
                                    />
                                    <span className="patient-info-mini">
                                        {caseItem.patient.name}, {caseItem.patient.age}a {caseItem.patient.gender}
                                    </span>
                                </div>
                            )}

                            {/* Title */}
                            <h3 className="case-title">{caseItem.title || 'Sin título'}</h3>

                            {/* Chief Complaint Preview */}
                            {caseItem.clinicalHistory.chiefComplaint && (
                                <p className="case-preview">
                                    {caseItem.clinicalHistory.chiefComplaint.substring(0, 80)}
                                    {caseItem.clinicalHistory.chiefComplaint.length > 80 ? '...' : ''}
                                </p>
                            )}

                            {/* Tags */}
                            {caseItem.tags.length > 0 && (
                                <div className="case-tags">
                                    {caseItem.tags.slice(0, 3).map((tag, idx) => (
                                        <span key={idx} className="case-tag">{tag}</span>
                                    ))}
                                    {caseItem.tags.length > 3 && (
                                        <span className="case-tag more">+{caseItem.tags.length - 3}</span>
                                    )}
                                </div>
                            )}

                            {/* Footer */}
                            <div className="case-card-footer">
                                <div className="case-difficulty">
                                    {Array(5).fill(0).map((_, i) => (
                                        <span
                                            key={i}
                                            className={`difficulty-dot ${i < caseItem.difficulty ? 'filled' : ''}`}
                                            style={{
                                                backgroundColor: i < caseItem.difficulty
                                                    ? difficultyLevels[caseItem.difficulty]?.color
                                                    : undefined
                                            }}
                                        />
                                    ))}
                                </div>

                                <div className="case-mastery">
                                    <div className="mastery-bar">
                                        <div
                                            className="mastery-fill"
                                            style={{ width: `${caseItem.studyStats.masteryLevel}%` }}
                                        />
                                    </div>
                                    <span>{caseItem.studyStats.masteryLevel}%</span>
                                </div>

                                <span className="case-date">
                                    {formatDate(caseItem.updatedAt)}
                                </span>
                            </div>

                            {/* Quick Actions */}
                            <div className="case-actions">
                                <button
                                    className="btn-action"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onStudyCase(caseItem.id)
                                    }}
                                    title="Modo Estudio"
                                >
                                    <BookOpen size={14} />
                                    Estudiar
                                </button>
                                <button
                                    className="btn-action secondary"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onSelectCase(caseItem.id)
                                    }}
                                    title="Ver Detalles"
                                >
                                    Ver Caso
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
