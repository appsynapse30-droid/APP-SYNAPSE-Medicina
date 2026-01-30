import { createContext, useContext, useState, useEffect } from 'react'

const LibraryContext = createContext()

// Datos iniciales de ejemplo
const initialDocuments = [
    {
        id: 1,
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
        content: null,
        isNote: false
    },
    {
        id: 2,
        title: 'Clase 4: Introducción a...',
        type: 'NOTA',
        category: 'Dr. Roberts • Diapositivas',
        summary: 'Puntos clave: Estructura neuronal, potenciales de acción, y...',
        tags: ['Neuro', 'Año 2'],
        collection: 'Neurología',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        size: '2.1 MB',
        sizeBytes: 2100000,
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop',
        content: null,
        isNote: false
    },
    {
        id: 3,
        title: 'Diagrama de Flujo del Ciclo Cardíaco',
        type: 'IMG',
        category: 'Fisiología • Diagrama',
        summary: 'Visualiza cambios de presión en ventrículo izquierdo durante...',
        tags: ['Fisiología', 'Cardiología'],
        collection: 'Cardiología',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        size: '850 KB',
        sizeBytes: 850000,
        image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=300&h=200&fit=crop',
        content: null,
        isNote: false
    }
]

const initialCollections = [
    { id: 1, name: 'Cardiología', count: 12, color: '#f85149' },
    { id: 2, name: 'Neurología', count: 8, color: '#58a6ff' },
    { id: 3, name: 'Patología', count: 24, color: '#8b5cf6' },
    { id: 4, name: 'Farmacología', count: 6, color: '#3fb950' }
]

export function LibraryProvider({ children }) {
    const [documents, setDocuments] = useState(() => {
        const saved = localStorage.getItem('synapse_documents')
        return saved ? JSON.parse(saved) : initialDocuments
    })

    const [collections, setCollections] = useState(() => {
        const saved = localStorage.getItem('synapse_collections')
        return saved ? JSON.parse(saved) : initialCollections
    })

    const [tags, setTags] = useState(() => {
        const saved = localStorage.getItem('synapse_tags')
        return saved ? JSON.parse(saved) : ['Cardiología', 'Neuro', 'Fisiología', 'Año 2', 'Farmacología', 'Anatomía']
    })

    // Persistir en localStorage
    useEffect(() => {
        localStorage.setItem('synapse_documents', JSON.stringify(documents))
    }, [documents])

    useEffect(() => {
        localStorage.setItem('synapse_collections', JSON.stringify(collections))
    }, [collections])

    useEffect(() => {
        localStorage.setItem('synapse_tags', JSON.stringify(tags))
    }, [tags])

    // Función para convertir File a base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result)
            reader.onerror = (error) => reject(error)
        })
    }

    // Funciones para documentos
    const addDocument = async (doc, file = null) => {
        let fileData = null

        // Si hay un archivo, convertirlo a base64 para almacenamiento
        if (file && file.type === 'application/pdf') {
            try {
                fileData = await fileToBase64(file)
            } catch (error) {
                console.error('Error converting file to base64:', error)
            }
        }

        const newDoc = {
            ...doc,
            id: Date.now(),
            date: new Date().toISOString(),
            fileData: fileData // Almacenar el contenido del PDF
        }
        setDocuments(prev => [newDoc, ...prev])

        // Actualizar conteo de colección
        if (doc.collection) {
            updateCollectionCount(doc.collection, 1)
        }

        return newDoc
    }

    const updateDocument = (id, updates) => {
        setDocuments(prev => prev.map(doc =>
            doc.id === id ? { ...doc, ...updates } : doc
        ))
    }

    const deleteDocument = (id) => {
        const doc = documents.find(d => d.id === id)
        if (doc?.collection) {
            updateCollectionCount(doc.collection, -1)
        }
        setDocuments(prev => prev.filter(doc => doc.id !== id))
    }

    const moveToCollection = (docId, collectionName) => {
        const doc = documents.find(d => d.id === docId)
        if (doc) {
            // Decrementar colección anterior
            if (doc.collection) {
                updateCollectionCount(doc.collection, -1)
            }
            // Incrementar nueva colección
            if (collectionName) {
                updateCollectionCount(collectionName, 1)
            }
            updateDocument(docId, { collection: collectionName })
        }
    }

    // Funciones para colecciones
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
            // Mover documentos de esta colección a sin colección
            setDocuments(prev => prev.map(doc =>
                doc.collection === collection.name ? { ...doc, collection: null } : doc
            ))
        }
        setCollections(prev => prev.filter(col => col.id !== id))
    }

    const renameCollection = (id, newName) => {
        const oldCollection = collections.find(c => c.id === id)
        if (oldCollection) {
            // Actualizar documentos con el nuevo nombre
            setDocuments(prev => prev.map(doc =>
                doc.collection === oldCollection.name ? { ...doc, collection: newName } : doc
            ))
        }
        setCollections(prev => prev.map(col =>
            col.id === id ? { ...col, name: newName } : col
        ))
    }

    // Funciones para tags
    const addTag = (tagName) => {
        if (!tags.includes(tagName)) {
            setTags(prev => [...prev, tagName])
        }
    }

    const addTagToDocument = (docId, tagName) => {
        addTag(tagName)
        setDocuments(prev => prev.map(doc =>
            doc.id === docId && !doc.tags.includes(tagName)
                ? { ...doc, tags: [...doc.tags, tagName] }
                : doc
        ))
    }

    const removeTagFromDocument = (docId, tagName) => {
        setDocuments(prev => prev.map(doc =>
            doc.id === docId
                ? { ...doc, tags: doc.tags.filter(t => t !== tagName) }
                : doc
        ))
    }

    // Función de búsqueda
    const searchDocuments = (query, filters = {}) => {
        let results = [...documents]

        // Filtrar por texto
        if (query) {
            const lowerQuery = query.toLowerCase()
            results = results.filter(doc =>
                doc.title.toLowerCase().includes(lowerQuery) ||
                doc.summary?.toLowerCase().includes(lowerQuery) ||
                doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
                doc.category?.toLowerCase().includes(lowerQuery)
            )
        }

        // Filtrar por colección
        if (filters.collection) {
            results = results.filter(doc => doc.collection === filters.collection)
        }

        // Filtrar por tipo
        if (filters.type) {
            results = results.filter(doc => doc.type === filters.type)
        }

        // Filtrar por tags
        if (filters.tags && filters.tags.length > 0) {
            results = results.filter(doc =>
                filters.tags.some(tag => doc.tags.includes(tag))
            )
        }

        // Ordenar
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

    // Crear nota
    const createNote = (title, content, collection = null, tags = []) => {
        return addDocument({
            title,
            type: 'NOTA',
            category: 'Nota personal',
            summary: content.substring(0, 100) + '...',
            tags,
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
        addDocument,
        updateDocument,
        deleteDocument,
        moveToCollection,
        addCollection,
        deleteCollection,
        renameCollection,
        addTag,
        addTagToDocument,
        removeTagFromDocument,
        searchDocuments,
        createNote
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
