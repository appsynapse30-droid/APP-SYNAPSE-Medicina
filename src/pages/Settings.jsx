import { useState } from 'react'
import {
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    HelpCircle,
    ChevronRight,
    ChevronLeft,
    Camera,
    Save,
    RotateCcw,
    Download,
    Upload,
    Trash2,
    Moon,
    Sun,
    Monitor,
    Volume2,
    VolumeX,
    Smartphone,
    Mail,
    Clock,
    Calendar,
    Target,
    Coffee,
    Lock,
    Eye,
    EyeOff,
    BarChart3,
    AlertTriangle,
    Check,
    X,
    ExternalLink,
    MessageCircle,
    BookOpen,
    FileQuestion
} from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import './Settings.css'

const ACCENT_COLORS = [
    { id: 'blue', name: 'Azul', color: '#58a6ff' },
    { id: 'purple', name: 'Púrpura', color: '#8b5cf6' },
    { id: 'green', name: 'Verde', color: '#3fb950' },
    { id: 'orange', name: 'Naranja', color: '#f0883e' },
    { id: 'cyan', name: 'Cian', color: '#39d5ff' },
    { id: 'pink', name: 'Rosa', color: '#f472b6' }
]

const SPECIALTIES = [
    'Residente de Medicina',
    'Estudiante de Medicina',
    'Médico General',
    'Cardiología',
    'Neurología',
    'Pediatría',
    'Cirugía',
    'Oncología',
    'Dermatología',
    'Psiquiatría',
    'Otro'
]

const TIMEZONES = [
    { id: 'America/Caracas', label: 'Venezuela (UTC-4)' },
    { id: 'America/Bogota', label: 'Colombia (UTC-5)' },
    { id: 'America/Mexico_City', label: 'México (UTC-6)' },
    { id: 'America/Lima', label: 'Perú (UTC-5)' },
    { id: 'America/Santiago', label: 'Chile (UTC-3)' },
    { id: 'America/Buenos_Aires', label: 'Argentina (UTC-3)' },
    { id: 'Europe/Madrid', label: 'España (UTC+1)' }
]

export default function Settings() {
    const {
        settings,
        updateProfile,
        updateNotifications,
        updatePrivacy,
        updateAppearance,
        updateLanguage,
        updateStudy,
        resetCategory,
        exportSettings,
        importSettings,
        clearAllData,
        hasUnsavedChanges,
        saveSettings,
        revertSettings
    } = useSettings()

    const [activeSection, setActiveSection] = useState(null)
    const [showResetConfirm, setShowResetConfirm] = useState(false)
    const [showClearConfirm, setShowClearConfirm] = useState(false)
    const [saveMessage, setSaveMessage] = useState('')

    const showSaveMessage = (message) => {
        // Only show message if explicitly provided (manual save)
        if (message && typeof message === 'string') {
            setSaveMessage(message)
            setTimeout(() => setSaveMessage(''), 2000)
        }
    }

    const handleManualSave = () => {
        if (saveSettings()) {
            showSaveMessage('¡Cambios guardados correctamente!')
        }
    }

    const handleImportSettings = async (e) => {
        const file = e.target.files[0]
        if (file) {
            try {
                await importSettings(file)
                showSaveMessage('Configuración importada correctamente')
            } catch (err) {
                showSaveMessage('Error al importar configuración')
            }
        }
    }

    const settingSections = [
        {
            id: 'profile',
            icon: User,
            title: 'Configuración de Perfil',
            description: 'Administra los detalles y preferencias de tu cuenta',
            color: 'blue'
        },
        {
            id: 'notifications',
            icon: Bell,
            title: 'Notificaciones',
            description: 'Configura recordatorios de estudio y alertas',
            color: 'orange'
        },
        {
            id: 'privacy',
            icon: Shield,
            title: 'Privacidad y Seguridad',
            description: 'Autenticación de dos factores y configuración de datos',
            color: 'green'
        },
        {
            id: 'appearance',
            icon: Palette,
            title: 'Apariencia',
            description: 'Tema, fuentes y opciones de visualización',
            color: 'purple'
        },
        {
            id: 'language',
            icon: Globe,
            title: 'Idioma y Región',
            description: 'Establece tu idioma y zona horaria preferidos',
            color: 'cyan'
        },
        {
            id: 'help',
            icon: HelpCircle,
            title: 'Ayuda y Soporte',
            description: 'Preguntas frecuentes, tutoriales y contacto de soporte',
            color: 'gray'
        }
    ]

    // Profile Section
    const ProfileSection = () => (
        <div className="settings-section">
            <div className="section-header">
                <button className="back-btn" onClick={() => setActiveSection(null)}>
                    <ChevronLeft size={20} />
                    Volver
                </button>
                <h2>Configuración de Perfil</h2>
            </div>

            <div className="settings-content">
                {/* Avatar */}
                <div className="avatar-section">
                    <div className="avatar-preview">
                        <img src={settings.profile.avatar} alt="Avatar" />
                        <button className="avatar-edit">
                            <Camera size={16} />
                        </button>
                    </div>
                    <div className="avatar-info">
                        <h3>{settings.profile.displayName}</h3>
                        <p>{settings.profile.specialty}</p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="form-group">
                    <label>Nombre para mostrar</label>
                    <input
                        type="text"
                        value={settings.profile.displayName}
                        onChange={(e) => {
                            updateProfile({ displayName: e.target.value })
                            showSaveMessage()
                        }}
                        placeholder="Tu nombre"
                    />
                </div>

                <div className="form-group">
                    <label>Correo electrónico</label>
                    <input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => {
                            updateProfile({ email: e.target.value })
                            showSaveMessage()
                        }}
                        placeholder="correo@ejemplo.com"
                    />
                </div>

                <div className="form-group">
                    <label>Especialidad</label>
                    <select
                        value={settings.profile.specialty}
                        onChange={(e) => {
                            updateProfile({ specialty: e.target.value })
                            showSaveMessage()
                        }}
                    >
                        {SPECIALTIES.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Institución</label>
                    <input
                        type="text"
                        value={settings.profile.institution}
                        onChange={(e) => {
                            updateProfile({ institution: e.target.value })
                            showSaveMessage()
                        }}
                        placeholder="Tu hospital o universidad"
                    />
                </div>

                <div className="form-group">
                    <label>Año de estudio/residencia</label>
                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={settings.profile.yearOfStudy}
                        onChange={(e) => {
                            updateProfile({ yearOfStudy: parseInt(e.target.value) || 1 })
                            showSaveMessage()
                        }}
                    />
                </div>

                <div className="form-group">
                    <label>Biografía</label>
                    <textarea
                        value={settings.profile.bio}
                        onChange={(e) => {
                            updateProfile({ bio: e.target.value })
                            showSaveMessage()
                        }}
                        placeholder="Cuéntanos sobre ti..."
                        rows={3}
                    />
                </div>

                <button className="btn btn-secondary" onClick={() => resetCategory('profile')}>
                    <RotateCcw size={16} />
                    Restablecer perfil
                </button>
            </div>
        </div>
    )

    // Notifications Section
    const NotificationsSection = () => (
        <div className="settings-section">
            <div className="section-header">
                <button className="back-btn" onClick={() => setActiveSection(null)}>
                    <ChevronLeft size={20} />
                    Volver
                </button>
                <h2>Notificaciones</h2>
            </div>

            <div className="settings-content">
                <div className="settings-group">
                    <h3>Recordatorios de estudio</h3>

                    <div className="toggle-option">
                        <div className="toggle-info">
                            <Clock size={18} />
                            <div>
                                <span>Recordatorios diarios</span>
                                <p>Recibe un recordatorio para estudiar</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.notifications.studyReminders}
                                onChange={(e) => {
                                    updateNotifications({ studyReminders: e.target.checked })
                                    showSaveMessage()
                                }}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    {settings.notifications.studyReminders && (
                        <div className="form-group indented">
                            <label>Hora del recordatorio</label>
                            <input
                                type="time"
                                value={settings.notifications.reminderTime}
                                onChange={(e) => {
                                    updateNotifications({ reminderTime: e.target.value })
                                    showSaveMessage()
                                }}
                            />
                        </div>
                    )}

                    <div className="toggle-option">
                        <div className="toggle-info">
                            <Target size={18} />
                            <div>
                                <span>Alertas de racha</span>
                                <p>Notificar si la racha está en riesgo</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.notifications.streakAlerts}
                                onChange={(e) => {
                                    updateNotifications({ streakAlerts: e.target.checked })
                                    showSaveMessage()
                                }}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <div className="settings-group">
                    <h3>Canales de notificación</h3>

                    <div className="toggle-option">
                        <div className="toggle-info">
                            <Mail size={18} />
                            <div>
                                <span>Notificaciones por email</span>
                                <p>Recibe actualizaciones en tu correo</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.notifications.emailNotifications}
                                onChange={(e) => {
                                    updateNotifications({ emailNotifications: e.target.checked })
                                    showSaveMessage()
                                }}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="toggle-option">
                        <div className="toggle-info">
                            <Smartphone size={18} />
                            <div>
                                <span>Notificaciones push</span>
                                <p>Notificaciones del navegador</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.notifications.pushNotifications}
                                onChange={(e) => {
                                    updateNotifications({ pushNotifications: e.target.checked })
                                    showSaveMessage()
                                }}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="toggle-option">
                        <div className="toggle-info">
                            <BarChart3 size={18} />
                            <div>
                                <span>Reporte semanal</span>
                                <p>Resumen de tu progreso cada semana</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.notifications.weeklyReport}
                                onChange={(e) => {
                                    updateNotifications({ weeklyReport: e.target.checked })
                                    showSaveMessage()
                                }}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <div className="settings-group">
                    <h3>Sonido y vibración</h3>

                    <div className="toggle-option">
                        <div className="toggle-info">
                            {settings.notifications.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                            <div>
                                <span>Sonidos</span>
                                <p>Sonidos de notificaciones</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.notifications.soundEnabled}
                                onChange={(e) => {
                                    updateNotifications({ soundEnabled: e.target.checked })
                                    showSaveMessage()
                                }}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )

    // Privacy Section
    const PrivacySection = () => (
        <div className="settings-section">
            <div className="section-header">
                <button className="back-btn" onClick={() => setActiveSection(null)}>
                    <ChevronLeft size={20} />
                    Volver
                </button>
                <h2>Privacidad y Seguridad</h2>
            </div>

            <div className="settings-content">
                <div className="settings-group">
                    <h3>Privacidad del perfil</h3>

                    <div className="toggle-option">
                        <div className="toggle-info">
                            {settings.privacy.profilePublic ? <Eye size={18} /> : <EyeOff size={18} />}
                            <div>
                                <span>Perfil público</span>
                                <p>Permitir que otros vean tu perfil</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.privacy.profilePublic}
                                onChange={(e) => {
                                    updatePrivacy({ profilePublic: e.target.checked })
                                    showSaveMessage()
                                }}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="toggle-option">
                        <div className="toggle-info">
                            <BarChart3 size={18} />
                            <div>
                                <span>Mostrar progreso</span>
                                <p>Compartir estadísticas de estudio</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.privacy.showProgress}
                                onChange={(e) => {
                                    updatePrivacy({ showProgress: e.target.checked })
                                    showSaveMessage()
                                }}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <div className="settings-group">
                    <h3>Seguridad</h3>

                    <div className="toggle-option">
                        <div className="toggle-info">
                            <Lock size={18} />
                            <div>
                                <span>Autenticación de dos factores</span>
                                <p>Añade una capa extra de seguridad</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.privacy.twoFactorEnabled}
                                onChange={(e) => {
                                    updatePrivacy({ twoFactorEnabled: e.target.checked })
                                    showSaveMessage()
                                }}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Tiempo de expiración de sesión</label>
                        <select
                            value={settings.privacy.sessionTimeout}
                            onChange={(e) => {
                                updatePrivacy({ sessionTimeout: parseInt(e.target.value) })
                                showSaveMessage()
                            }}
                        >
                            <option value={15}>15 minutos</option>
                            <option value={30}>30 minutos</option>
                            <option value={60}>1 hora</option>
                            <option value={120}>2 horas</option>
                            <option value={0}>Nunca</option>
                        </select>
                    </div>
                </div>

                <div className="settings-group">
                    <h3>Datos</h3>

                    <div className="toggle-option">
                        <div className="toggle-info">
                            <BarChart3 size={18} />
                            <div>
                                <span>Recopilación de datos</span>
                                <p>Ayuda a mejorar la app enviando datos anónimos</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.privacy.dataCollection}
                                onChange={(e) => {
                                    updatePrivacy({ dataCollection: e.target.checked })
                                    showSaveMessage()
                                }}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="data-actions">
                        <button className="btn btn-secondary" onClick={exportSettings}>
                            <Download size={16} />
                            Exportar mis datos
                        </button>

                        <label className="btn btn-secondary">
                            <Upload size={16} />
                            Importar datos
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImportSettings}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>

                    <div className="danger-zone">
                        <h4>Zona de peligro</h4>
                        <p>Estas acciones son irreversibles</p>
                        <button
                            className="btn btn-danger"
                            onClick={() => setShowClearConfirm(true)}
                        >
                            <Trash2 size={16} />
                            Eliminar todos mis datos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    // Appearance Section
    const AppearanceSection = () => (
        <div className="settings-section">
            <div className="section-header">
                <button className="back-btn" onClick={() => setActiveSection(null)}>
                    <ChevronLeft size={20} />
                    Volver
                </button>
                <h2>Apariencia</h2>
            </div>

            <div className="settings-content">
                <div className="settings-group">
                    <h3>Tema</h3>
                    <div className="theme-options">
                        <button
                            className={`theme-option ${settings.appearance.theme === 'dark' ? 'active' : ''}`}
                            onClick={() => {
                                updateAppearance({ theme: 'dark' })
                                showSaveMessage()
                            }}
                        >
                            <Moon size={24} />
                            <span>Oscuro</span>
                        </button>
                        <button
                            className={`theme-option ${settings.appearance.theme === 'light' ? 'active' : ''}`}
                            onClick={() => {
                                updateAppearance({ theme: 'light' })
                                showSaveMessage()
                            }}
                        >
                            <Sun size={24} />
                            <span>Claro</span>
                        </button>
                        <button
                            className={`theme-option ${settings.appearance.theme === 'auto' ? 'active' : ''}`}
                            onClick={() => {
                                updateAppearance({ theme: 'auto' })
                                showSaveMessage()
                            }}
                        >
                            <Monitor size={24} />
                            <span>Sistema</span>
                        </button>
                    </div>
                </div>

                <div className="settings-group">
                    <h3>Color de acento</h3>
                    <div className="color-options">
                        {ACCENT_COLORS.map(color => (
                            <button
                                key={color.id}
                                className={`color-option ${settings.appearance.accentColor === color.id ? 'active' : ''}`}
                                style={{ '--color': color.color }}
                                onClick={() => {
                                    updateAppearance({ accentColor: color.id })
                                    showSaveMessage()
                                }}
                                title={color.name}
                            >
                                {settings.appearance.accentColor === color.id && <Check size={16} />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="settings-group">
                    <h3>Tamaño de fuente</h3>
                    <div className="font-size-options">
                        <button
                            className={`font-option ${settings.appearance.fontSize === 'small' ? 'active' : ''}`}
                            onClick={() => {
                                updateAppearance({ fontSize: 'small' })
                                showSaveMessage()
                            }}
                        >
                            <span style={{ fontSize: '12px' }}>A</span>
                            Pequeño
                        </button>
                        <button
                            className={`font-option ${settings.appearance.fontSize === 'medium' ? 'active' : ''}`}
                            onClick={() => {
                                updateAppearance({ fontSize: 'medium' })
                                showSaveMessage()
                            }}
                        >
                            <span style={{ fontSize: '16px' }}>A</span>
                            Normal
                        </button>
                        <button
                            className={`font-option ${settings.appearance.fontSize === 'large' ? 'active' : ''}`}
                            onClick={() => {
                                updateAppearance({ fontSize: 'large' })
                                showSaveMessage()
                            }}
                        >
                            <span style={{ fontSize: '20px' }}>A</span>
                            Grande
                        </button>
                    </div>
                </div>

                <div className="settings-group">
                    <h3>Opciones visuales</h3>

                    <div className="toggle-option">
                        <div className="toggle-info">
                            <div>
                                <span>Modo compacto</span>
                                <p>Reduce el espaciado para ver más contenido</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.appearance.compactMode}
                                onChange={(e) => {
                                    updateAppearance({ compactMode: e.target.checked })
                                    showSaveMessage()
                                }}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="toggle-option">
                        <div className="toggle-info">
                            <div>
                                <span>Animaciones</span>
                                <p>Transiciones y efectos visuales</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.appearance.animationsEnabled}
                                onChange={(e) => {
                                    updateAppearance({ animationsEnabled: e.target.checked })
                                    showSaveMessage()
                                }}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="toggle-option">
                        <div className="toggle-info">
                            <div>
                                <span>Alto contraste</span>
                                <p>Mejora la legibilidad</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.appearance.highContrast}
                                onChange={(e) => {
                                    updateAppearance({ highContrast: e.target.checked })
                                    showSaveMessage()
                                }}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )

    // Language Section
    const LanguageSection = () => (
        <div className="settings-section">
            <div className="section-header">
                <button className="back-btn" onClick={() => setActiveSection(null)}>
                    <ChevronLeft size={20} />
                    Volver
                </button>
                <h2>Idioma y Región</h2>
            </div>

            <div className="settings-content">
                <div className="form-group">
                    <label>Idioma de la aplicación</label>
                    <select
                        value={settings.language.appLanguage}
                        onChange={(e) => {
                            updateLanguage({ appLanguage: e.target.value })
                            showSaveMessage()
                        }}
                    >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Zona horaria</label>
                    <select
                        value={settings.language.timezone}
                        onChange={(e) => {
                            updateLanguage({ timezone: e.target.value })
                            showSaveMessage()
                        }}
                    >
                        {TIMEZONES.map(tz => (
                            <option key={tz.id} value={tz.id}>{tz.label}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Formato de fecha</label>
                    <select
                        value={settings.language.dateFormat}
                        onChange={(e) => {
                            updateLanguage({ dateFormat: e.target.value })
                            showSaveMessage()
                        }}
                    >
                        <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Formato de hora</label>
                    <select
                        value={settings.language.timeFormat}
                        onChange={(e) => {
                            updateLanguage({ timeFormat: e.target.value })
                            showSaveMessage()
                        }}
                    >
                        <option value="24h">24 horas (14:30)</option>
                        <option value="12h">12 horas (2:30 PM)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>La semana comienza en</label>
                    <select
                        value={settings.language.weekStartsOn}
                        onChange={(e) => {
                            updateLanguage({ weekStartsOn: e.target.value })
                            showSaveMessage()
                        }}
                    >
                        <option value="monday">Lunes</option>
                        <option value="sunday">Domingo</option>
                    </select>
                </div>
            </div>
        </div>
    )

    // Help Section
    const HelpSection = () => (
        <div className="settings-section">
            <div className="section-header">
                <button className="back-btn" onClick={() => setActiveSection(null)}>
                    <ChevronLeft size={20} />
                    Volver
                </button>
                <h2>Ayuda y Soporte</h2>
            </div>

            <div className="settings-content">
                <div className="help-cards">
                    <a href="#" className="help-card">
                        <div className="help-icon blue">
                            <BookOpen size={20} />
                        </div>
                        <div className="help-info">
                            <h4>Tutoriales</h4>
                            <p>Aprende a usar todas las funciones</p>
                        </div>
                        <ExternalLink size={16} />
                    </a>

                    <a href="#" className="help-card">
                        <div className="help-icon purple">
                            <FileQuestion size={20} />
                        </div>
                        <div className="help-info">
                            <h4>Preguntas Frecuentes</h4>
                            <p>Respuestas a dudas comunes</p>
                        </div>
                        <ExternalLink size={16} />
                    </a>

                    <a href="#" className="help-card">
                        <div className="help-icon green">
                            <MessageCircle size={20} />
                        </div>
                        <div className="help-info">
                            <h4>Contactar Soporte</h4>
                            <p>¿Necesitas ayuda? Escríbenos</p>
                        </div>
                        <ExternalLink size={16} />
                    </a>
                </div>

                <div className="app-info">
                    <div className="app-logo">
                        <span>⚡</span>
                    </div>
                    <h3>Synapse</h3>
                    <p>Plataforma de Estudio Médico</p>
                    <span className="version">Versión 1.0.0</span>

                    <div className="legal-links">
                        <a href="#">Términos de Servicio</a>
                        <span>•</span>
                        <a href="#">Política de Privacidad</a>
                    </div>
                </div>
            </div>
        </div>
    )

    // Render section based on activeSection
    const renderSection = () => {
        switch (activeSection) {
            case 'profile':
                return <ProfileSection />
            case 'notifications':
                return <NotificationsSection />
            case 'privacy':
                return <PrivacySection />
            case 'appearance':
                return <AppearanceSection />
            case 'language':
                return <LanguageSection />
            case 'help':
                return <HelpSection />
            default:
                return null
        }
    }

    // Main settings view
    if (activeSection) {
        return (
            <div className="settings">
                {renderSection()}

                {/* Save notification */}
                {saveMessage && (
                    <div className="save-notification">
                        <Check size={16} />
                        {saveMessage}
                    </div>
                )}

                {/* Clear data confirmation modal */}
                {showClearConfirm && (
                    <div className="modal-overlay">
                        <div className="confirm-modal">
                            <AlertTriangle size={48} className="warning-icon" />
                            <h3>¿Eliminar todos los datos?</h3>
                            <p>Esta acción eliminará permanentemente todos tus documentos, casos clínicos, eventos y configuraciones. No se puede deshacer.</p>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowClearConfirm(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => {
                                        clearAllData()
                                        setShowClearConfirm(false)
                                    }}
                                >
                                    Sí, eliminar todo
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Unsaved Changes Bar */}
                {hasUnsavedChanges && (
                    <div className="unsaved-changes-bar">
                        <div className="unsaved-info">
                            <AlertTriangle size={20} />
                            <span>Tienes cambios sin guardar</span>
                        </div>
                        <div className="unsaved-actions">
                            <button
                                className="btn-ghost"
                                onClick={revertSettings}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-primary-save"
                                onClick={handleManualSave}
                            >
                                <Save size={18} />
                                Guardar cambios
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="settings">
            <div className="settings-header">
                <h1>Configuración</h1>
                <p>Administra tu cuenta y preferencias de la aplicación</p>
            </div>

            <div className="settings-grid">
                {settingSections.map((section) => (
                    <button
                        key={section.id}
                        className="setting-card"
                        onClick={() => setActiveSection(section.id)}
                    >
                        <div className={`setting-icon ${section.color}`}>
                            <section.icon size={22} />
                        </div>
                        <div className="setting-content">
                            <h3>{section.title}</h3>
                            <p>{section.description}</p>
                        </div>
                        <ChevronRight size={20} className="chevron" />
                    </button>
                ))}
            </div>

            <div className="settings-footer">
                <p>Synapse v1.0.0 • Hecho con ❤️ para estudiantes de medicina</p>
            </div>

            {/* Save notification */}
            {saveMessage && (
                <div className="save-notification">
                    <Check size={16} />
                    {saveMessage}
                </div>
            )}
            {/* Unsaved Changes Bar (Main View) */}
            {hasUnsavedChanges && (
                <div className="unsaved-changes-bar">
                    <div className="unsaved-info">
                        <AlertTriangle size={20} />
                        <span>Tienes cambios sin guardar</span>
                    </div>
                    <div className="unsaved-actions">
                        <button
                            className="btn-ghost"
                            onClick={revertSettings}
                        >
                            Cancelar
                        </button>
                        <button
                            className="btn-primary-save"
                            onClick={handleManualSave}
                        >
                            <Save size={18} />
                            Guardar cambios
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
