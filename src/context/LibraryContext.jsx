import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, supabaseHelpers } from '../config/supabase'
import { useAuth } from './AuthContext'

const LibraryContext = createContext()

// Datos iniciales de ejemplo (solo para usuarios sin documentos)
const sampleDocuments = [
    {
        id: 'sample-1',
        title: "Principios de Medicina Interna de Harrison",
        type: 'PDF',
        category: 'Medicina Interna • Libro de Texto',
        summary: 'Cubre mecanismos completos de...',
        tags: ['Cardiología', 'Año 2'],
        collection: 'Cardiología',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        size: '12.4 MB',
        sizeBytes: 12400000,
        image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=300&h=200&fit=crop',
        isNote: false,
        isSample: true
    }
]

const initialCollections = [
    { id: 1, name: 'Cardiología', count: 0, color: '#f85149' },
    { id: 2, name: 'Neurología', count: 0, color: '#58a6ff' },
    { id: 3, name: 'Patología', count: 0, color: '#8b5cf6' },
    { id: 4, name: 'Farmacología', count: 0, color: '#3fb950' }
]

// Constants
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/rtf',
    'application/octet-stream' // Fallback genérico para archivos no reconocidos
]

export function LibraryProvider({ children }) {
    const { user, isAuthenticated } = useAuth()

    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState(null)

    const [collections, setCollections] = useState(() => {
        const saved = localStorage.getItem('synapse_collections')
        return saved ? JSON.parse(saved) : initialCollections
    })

    const [tags, setTags] = useState(() => {
        const saved = localStorage.getItem('synapse_tags')
        return saved ? JSON.parse(saved) : ['Cardiología', 'Neuro', 'Fisiología', 'Año 2', 'Farmacología', 'Anatomía']
    })

    // Persist collections and tags locally (they're lightweight)
    useEffect(() => {
        localStorage.setItem('synapse_collections', JSON.stringify(collections))
    }, [collections])

    useEffect(() => {
        localStorage.setItem('synapse_tags', JSON.stringify(tags))
    }, [tags])

    // Fetch documents from Supabase when user changes
    const fetchDocuments = useCallback(async () => {
        if (!isAuthenticated || !user?.id) {
            setDocuments(sampleDocuments)
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { data, error: fetchError } = await supabaseHelpers.documents.getAll(user.id)

            if (fetchError) throw fetchError

            // Transform Supabase documents to match our format
            const transformedDocs = (data || []).map(doc => ({
                id: doc.id,
                title: doc.name,
                type: getTypeFromMime(doc.file_type),
                mimeType: doc.file_type || 'application/octet-stream',
                category: doc.subject || 'Documento',
                summary: '',
                tags: doc.tags || [],
                collection: doc.subject,
                date: doc.created_at,
                size: formatFileSize(doc.file_size),
                sizeBytes: doc.file_size,
                filePath: doc.file_path,
                isNote: false,
                isSample: false
            }))

            setDocuments(transformedDocs)
        } catch (err) {
            console.error('Error fetching documents:', err)
            setError('Error al cargar documentos')
            setDocuments([])
        } finally {
            setLoading(false)
        }
    }, [user?.id, isAuthenticated])

    useEffect(() => {
        fetchDocuments()
    }, [fetchDocuments])

    // Helper functions
    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B'
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const getTypeFromMime = (mimeType) => {
        if (!mimeType) return 'ARCHIVO'
        if (mimeType.includes('pdf')) return 'PDF'
        if (mimeType.includes('image')) return 'IMG'
        if (mimeType.includes('word') || mimeType.includes('document')) return 'DOC'
        if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PPT'
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'XLS'
        if (mimeType.includes('text/plain') || mimeType.includes('text/csv')) return 'TXT'
        return 'ARCHIVO'
    }

    const validateFile = (file) => {
        if (file.size > MAX_FILE_SIZE) {
            return { valid: false, error: `El archivo "${file.name}" excede el límite de 100MB` }
        }
        // Permitir cualquier archivo si tiene un tipo MIME, o si es un tipo reconocido
        const fileType = file.type || 'application/octet-stream'
        if (!ALLOWED_TYPES.includes(fileType) && fileType !== 'application/octet-stream') {
            // Verificar también por extensión como fallback
            const ext = file.name.split('.').pop().toLowerCase()
            const allowedExtensions = [
                'pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
                'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx',
                'txt', 'csv', 'rtf'
            ]
            if (!allowedExtensions.includes(ext)) {
                return { valid: false, error: `Tipo de archivo no soportado: ${file.name}` }
            }
        }
        return { valid: true, error: null }
    }

    // Add document with file upload to Supabase Storage
    const addDocument = async (docData, file = null) => {
        if (!isAuthenticated || !user?.id) {
            setError('Debes iniciar sesión para subir documentos')
            return { error: 'No autenticado' }
        }

        setUploading(true)
        setUploadProgress(0)
        setError(null)

        try {
            // If we have a file, upload it to Storage first
            let filePath = null
            let fileSize = docData.sizeBytes || 0

            if (file) {
                // Validate file
                const validation = validateFile(file)
                if (!validation.valid) {
                    throw new Error(validation.error)
                }

                setUploadProgress(25)

                // Upload to Supabase Storage
                const { path, error: uploadError } = await supabaseHelpers.storage.uploadDocument(user.id, file)

                if (uploadError) throw uploadError

                filePath = path
                fileSize = file.size
                setUploadProgress(75)
            }

            // Save metadata to database
            const documentRecord = {
                user_id: user.id,
                name: docData.title || file?.name || 'Documento sin nombre',
                file_path: filePath,
                file_size: fileSize,
                file_type: file?.type || 'application/octet-stream',
                subject: docData.collection || docData.category || null,
                tags: docData.tags || []
            }

            const { data, error: dbError } = await supabaseHelpers.documents.create(documentRecord)

            if (dbError) throw dbError

            setUploadProgress(100)

            // Add to local state
            const newDoc = {
                id: data.id,
                title: data.name,
                type: getTypeFromMime(data.file_type),
                mimeType: data.file_type || 'application/octet-stream',
                category: data.subject || 'Documento',
                summary: docData.summary || '',
                tags: data.tags || [],
                collection: data.subject,
                date: data.created_at,
                size: formatFileSize(data.file_size),
                sizeBytes: data.file_size,
                filePath: data.file_path,
                image: docData.image,
                isNote: docData.isNote || false,
                isSample: false
            }

            setDocuments(prev => [newDoc, ...prev])

            // Update collection count
            if (data.subject) {
                updateCollectionCount(data.subject, 1)
            }

            return { data: newDoc, error: null }
        } catch (err) {
            console.error('Error adding document:', err)
            setError(err.message || 'Error al subir documento')
            return { data: null, error: err }
        } finally {
            setUploading(false)
            setTimeout(() => setUploadProgress(0), 1000)
        }
    }

    // Update document metadata
    const updateDocument = async (id, updates) => {
        if (!isAuthenticated) return { error: 'No autenticado' }

        try {
            const { data, error: updateError } = await supabaseHelpers.documents.update(id, {
                name: updates.title,
                subject: updates.collection || updates.category,
                tags: updates.tags
            })

            if (updateError) throw updateError

            setDocuments(prev => prev.map(doc =>
                doc.id === id ? { ...doc, ...updates } : doc
            ))

            return { data, error: null }
        } catch (err) {
            console.error('Error updating document:', err)
            return { data: null, error: err }
        }
    }

    // Delete document from Storage and Database
    const deleteDocument = async (id) => {
        if (!isAuthenticated) return { error: 'No autenticado' }

        const doc = documents.find(d => d.id === id)
        if (!doc) return { error: 'Documento no encontrado' }

        // Skip sample documents
        if (doc.isSample) {
            setDocuments(prev => prev.filter(d => d.id !== id))
            return { error: null }
        }

        try {
            // Delete from Storage if has file
            if (doc.filePath) {
                const { error: storageError } = await supabaseHelpers.storage.deleteDocument(doc.filePath)
                if (storageError) {
                    console.warn('Error deleting from storage:', storageError)
                }
            }

            // Delete from Database
            const { error: dbError } = await supabaseHelpers.documents.delete(id)
            if (dbError) throw dbError

            // Update local state
            if (doc.collection) {
                updateCollectionCount(doc.collection, -1)
            }
            setDocuments(prev => prev.filter(d => d.id !== id))

            return { error: null }
        } catch (err) {
            console.error('Error deleting document:', err)
            setError('Error al eliminar documento')
            return { error: err }
        }
    }

    // Get download URL for a document
    const getDocumentUrl = async (id) => {
        const doc = documents.find(d => d.id === id)
        if (!doc?.filePath) return { url: null, error: 'No file path' }

        const { url, error } = await supabaseHelpers.storage.getSignedUrl(doc.filePath, 7200)
        return { url, error }
    }

    // Get a viewable URL for a document (signed URL with long TTL for viewing)
    const getDocumentViewUrl = async (docId) => {
        const doc = documents.find(d => String(d.id) === String(docId))
        if (!doc) return { url: null, error: 'Documento no encontrado' }
        if (doc.isSample) return { url: doc.image || null, error: null }
        if (!doc.filePath) return { url: null, error: 'Sin archivo asociado' }

        try {
            const { url, error } = await supabaseHelpers.storage.getSignedUrl(doc.filePath, 7200)
            if (error) throw error
            return { url, error: null }
        } catch (err) {
            console.error('Error getting view URL:', err)
            return { url: null, error: err.message || 'Error al obtener URL del documento' }
        }
    }

    // Download a document
    const downloadDocument = async (id) => {
        const doc = documents.find(d => d.id === id)
        if (!doc?.filePath) return { error: 'No file path' }

        try {
            const { data, error } = await supabaseHelpers.storage.downloadDocument(doc.filePath)
            if (error) throw error

            // Create download link
            const url = URL.createObjectURL(data)
            const a = document.createElement('a')
            a.href = url
            a.download = doc.title
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            return { error: null }
        } catch (err) {
            console.error('Error downloading:', err)
            return { error: err }
        }
    }

    const moveToCollection = async (docId, collectionName) => {
        const doc = documents.find(d => d.id === docId)
        if (doc) {
            const oldCollection = doc.collection
            const { error } = await updateDocument(docId, { collection: collectionName })

            if (!error) {
                if (oldCollection) updateCollectionCount(oldCollection, -1)
                if (collectionName) updateCollectionCount(collectionName, 1)
            }
        }
    }

    // Collection functions (kept local)
    const addCollection = (name, color = '#58a6ff') => {
        const newCollection = {
            id: Date.now(),
            name,
            count: 0,
            color
        }
        setCollections(prev => [...prev, newCollection])
        return newCollection
    }

    const updateCollectionCount = (name, delta) => {
        setCollections(prev => prev.map(col =>
            col.name === name ? { ...col, count: Math.max(0, col.count + delta) } : col
        ))
    }

    const deleteCollection = (id) => {
        const collection = collections.find(c => c.id === id)
        if (collection) {
            setDocuments(prev => prev.map(doc =>
                doc.collection === collection.name ? { ...doc, collection: null } : doc
            ))
        }
        setCollections(prev => prev.filter(col => col.id !== id))
    }

    const renameCollection = (id, newName) => {
        const oldCollection = collections.find(c => c.id === id)
        if (oldCollection) {
            setDocuments(prev => prev.map(doc =>
                doc.collection === oldCollection.name ? { ...doc, collection: newName } : doc
            ))
        }
        setCollections(prev => prev.map(col =>
            col.id === id ? { ...col, name: newName } : col
        ))
    }

    // Tag functions
    const addTag = (tagName) => {
        if (!tags.includes(tagName)) {
            setTags(prev => [...prev, tagName])
        }
    }

    const addTagToDocument = async (docId, tagName) => {
        addTag(tagName)
        const doc = documents.find(d => d.id === docId)
        if (doc && !doc.tags.includes(tagName)) {
            await updateDocument(docId, { tags: [...doc.tags, tagName] })
        }
    }

    const removeTagFromDocument = async (docId, tagName) => {
        const doc = documents.find(d => d.id === docId)
        if (doc) {
            await updateDocument(docId, { tags: doc.tags.filter(t => t !== tagName) })
        }
    }

    // Search function
    const searchDocuments = (query, filters = {}) => {
        let results = [...documents]

        if (query) {
            const lowerQuery = query.toLowerCase()
            results = results.filter(doc =>
                doc.title.toLowerCase().includes(lowerQuery) ||
                doc.summary?.toLowerCase().includes(lowerQuery) ||
                doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
                doc.category?.toLowerCase().includes(lowerQuery)
            )
        }

        if (filters.collection) {
            results = results.filter(doc => doc.collection === filters.collection)
        }

        if (filters.type) {
            results = results.filter(doc => doc.type === filters.type)
        }

        if (filters.tags && filters.tags.length > 0) {
            results = results.filter(doc =>
                filters.tags.some(tag => doc.tags.includes(tag))
            )
        }

        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'date':
                    results.sort((a, b) => new Date(b.date) - new Date(a.date))
                    break
                case 'name':
                    results.sort((a, b) => a.title.localeCompare(b.title))
                    break
                case 'size':
                    results.sort((a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0))
                    break
                default:
                    break
            }
        }

        return results
    }

    // Create note (stored in database without file)
    const createNote = async (title, content, collection = null, noteTags = []) => {
        return addDocument({
            title,
            type: 'NOTA',
            category: 'Nota personal',
            summary: content.substring(0, 100) + '...',
            tags: noteTags,
            collection,
            size: `${Math.round(content.length / 1024 * 100) / 100} KB`,
            sizeBytes: content.length,
            image: null,
            content,
            isNote: true
        })
    }

    const value = {
        documents,
        collections,
        tags,
        loading,
        uploading,
        uploadProgress,
        error,
        // Document operations
        addDocument,
        updateDocument,
        deleteDocument,
        moveToCollection,
        getDocumentUrl,
        getDocumentViewUrl,
        downloadDocument,
        // Collection operations
        addCollection,
        deleteCollection,
        renameCollection,
        // Tag operations
        addTag,
        addTagToDocument,
        removeTagFromDocument,
        // Search
        searchDocuments,
        createNote,
        // Refresh
        refreshDocuments: fetchDocuments,
        // Validation
        validateFile,
        MAX_FILE_SIZE
    }

    return (
        <LibraryContext.Provider value={value}>
            {children}
        </LibraryContext.Provider>
    )
}

export function useLibrary() {
    const context = useContext(LibraryContext)
    if (!context) {
        throw new Error('useLibrary debe usarse dentro de un LibraryProvider')
    }
    return context
}

export default LibraryContext
