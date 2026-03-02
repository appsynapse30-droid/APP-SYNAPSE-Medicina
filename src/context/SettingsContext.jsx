import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useAuth } from './AuthContext'

const SettingsContext = createContext()

const STORAGE_KEY_PREFIX = 'synapse_settings'

// Build default settings dynamically based on the authenticated user
const buildDefaultSettings = (authUser) => {
    const userName = authUser?.user_metadata?.display_name
        || authUser?.email?.split('@')[0]
        || 'Usuario'
    const userEmail = authUser?.email || ''
    const avatarSeed = authUser?.email || 'default'

    return {
        // Profile
        profile: {
            displayName: userName,
            email: userEmail,
            specialty: 'Residente de Medicina',
            institution: 'Hospital General',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`,
            yearOfStudy: 3,
            bio: ''
        },

        // Notifications
        notifications: {
            studyReminders: true,
            reminderTime: '09:00',
            streakAlerts: true,
            emailNotifications: false,
            pushNotifications: true,
            weeklyReport: true,
            soundEnabled: true,
            vibrationEnabled: true
        },

        // Privacy & Security
        privacy: {
            profilePublic: false,
            showProgress: true,
            shareStatistics: false,
            dataCollection: true,
            twoFactorEnabled: false,
            sessionTimeout: 30, // minutes
            autoLock: false
        },

        // Appearance
        appearance: {
            theme: 'dark', // 'dark', 'light', 'auto'
            accentColor: 'blue', // 'blue', 'purple', 'green', 'orange'
            fontSize: 'medium', // 'small', 'medium', 'large'
            compactMode: false,
            animationsEnabled: true,
            highContrast: false
        },

        // Language & Region
        language: {
            appLanguage: 'es', // 'es', 'en'
            timezone: 'America/Caracas',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '24h', // '12h', '24h'
            weekStartsOn: 'monday' // 'monday', 'sunday'
        },

        // Study preferences
        study: {
            dailyGoal: 240, // minutes
            breakReminders: true,
            breakInterval: 45, // minutes
            focusMode: false,
            autoPlayNext: true,
            showTimer: true
        }
    }
}

export function SettingsProvider({ children }) {
    const { user } = useAuth()

    // Build per-user storage key and defaults
    const storageKey = user?.id
        ? `${STORAGE_KEY_PREFIX}_${user.id}`
        : STORAGE_KEY_PREFIX

    const defaultSettings = useMemo(() => buildDefaultSettings(user), [user])

    // Current settings state
    const [settings, setSettings] = useState(defaultSettings)

    // Track original settings for change detection
    const [originalSettings, setOriginalSettings] = useState(defaultSettings)

    // Load / re-load settings when user changes (login/logout)
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey)
            if (saved) {
                const parsed = JSON.parse(saved)
                const merged = {
                    profile: { ...defaultSettings.profile, ...parsed.profile },
                    notifications: { ...defaultSettings.notifications, ...parsed.notifications },
                    privacy: { ...defaultSettings.privacy, ...parsed.privacy },
                    appearance: { ...defaultSettings.appearance, ...parsed.appearance },
                    language: { ...defaultSettings.language, ...parsed.language },
                    study: { ...defaultSettings.study, ...parsed.study }
                }
                setSettings(merged)
                setOriginalSettings(merged)
            } else {
                // No saved settings for this user — use fresh defaults
                setSettings(defaultSettings)
                setOriginalSettings(defaultSettings)
            }
        } catch (e) {
            console.error('Error loading settings:', e)
            setSettings(defaultSettings)
            setOriginalSettings(defaultSettings)
        }
    }, [storageKey, user])

    // Apply theme (this stays to show previews instantly)
    useEffect(() => {
        const root = document.documentElement
        const theme = settings.appearance.theme

        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
        } else {
            root.setAttribute('data-theme', theme)
        }

        // Apply accent color
        root.setAttribute('data-accent', settings.appearance.accentColor)

        // Apply font size
        root.setAttribute('data-font-size', settings.appearance.fontSize)

        // Apply compact mode
        if (settings.appearance.compactMode) {
            root.classList.add('compact-mode')
        } else {
            root.classList.remove('compact-mode')
        }

        // Apply high contrast
        if (settings.appearance.highContrast) {
            root.classList.add('high-contrast')
        } else {
            root.classList.remove('high-contrast')
        }

        // Apply animations
        if (!settings.appearance.animationsEnabled) {
            root.classList.add('no-animations')
        } else {
            root.classList.remove('no-animations')
        }
    }, [settings.appearance])

    // Update a specific setting category
    const updateSettings = (category, updates) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                ...updates
            }
        }))
    }

    // Save changes content to LocalStorage
    const saveSettings = () => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(settings))
            setOriginalSettings(settings)
            return true
        } catch (error) {
            console.error('Error saving settings:', error)
            return false
        }
    }

    // Revert changes
    const revertSettings = () => {
        setSettings(originalSettings)
    }

    // Check for changes
    const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings)

    // Update profile
    const updateProfile = (updates) => updateSettings('profile', updates)

    // Update notifications
    const updateNotifications = (updates) => updateSettings('notifications', updates)

    // Update privacy
    const updatePrivacy = (updates) => updateSettings('privacy', updates)

    // Update appearance
    const updateAppearance = (updates) => updateSettings('appearance', updates)

    // Update language
    const updateLanguage = (updates) => updateSettings('language', updates)

    // Update study preferences
    const updateStudy = (updates) => updateSettings('study', updates)

    // Reset all settings
    const resetSettings = () => {
        setSettings(defaultSettings)
        // Note: we don't save immediately here unless user clicks save, 
        // to maintain consistency with the "manual save" paradigm.
        // But reset is usually a destructive action. 
        // Let's treat it as a pending change.
    }

    // Reset specific category
    const resetCategory = (category) => {
        setSettings(prev => ({
            ...prev,
            [category]: defaultSettings[category]
        }))
    }

    // Export settings
    const exportSettings = () => {
        const data = JSON.stringify(settings, null, 2)
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'synapse-settings.json'
        a.click()
        URL.revokeObjectURL(url)
    }

    // Import settings
    const importSettings = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result)
                    const merged = {
                        profile: { ...defaultSettings.profile, ...imported.profile },
                        notifications: { ...defaultSettings.notifications, ...imported.notifications },
                        privacy: { ...defaultSettings.privacy, ...imported.privacy },
                        appearance: { ...defaultSettings.appearance, ...imported.appearance },
                        language: { ...defaultSettings.language, ...imported.language },
                        study: { ...defaultSettings.study, ...imported.study }
                    }
                    setSettings(merged)
                    // Import is treated as an immediate change typically, 
                    // but following the requested pattern, let's allow review.
                    resolve()
                } catch (err) {
                    reject(err)
                }
            }
            reader.onerror = reject
            reader.readAsText(file)
        })
    }

    // Clear all data
    const clearAllData = () => {
        localStorage.clear()
        setSettings(defaultSettings)
        setOriginalSettings(defaultSettings)
        window.location.reload()
    }

    const value = {
        settings,
        hasUnsavedChanges,
        saveSettings,
        revertSettings,
        updateProfile,
        updateNotifications,
        updatePrivacy,
        updateAppearance,
        updateLanguage,
        updateStudy,
        resetSettings,
        resetCategory,
        exportSettings,
        importSettings,
        clearAllData
    }

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider')
    }
    return context
}

export default SettingsContext
