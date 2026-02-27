import { useState, useEffect } from 'react'

/**
 * Hook reutilizable para detectar media queries en React.
 * Escucha cambios en tiempo real (rotación de pantalla, resize).
 * 
 * @param {string} query - CSS media query string, e.g. '(max-width: 768px)'
 * @returns {boolean} - true si la query coincide con la pantalla actual
 * 
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)')
 * const isTablet = useMediaQuery('(max-width: 1024px)')
 */
export default function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches
        }
        return false
    })

    useEffect(() => {
        const mediaQuery = window.matchMedia(query)
        const handler = (e) => setMatches(e.matches)

        // Set initial value
        setMatches(mediaQuery.matches)

        // Listen for changes
        mediaQuery.addEventListener('change', handler)
        return () => mediaQuery.removeEventListener('change', handler)
    }, [query])

    return matches
}
