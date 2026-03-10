import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import YouTube from 'react-youtube'

// ============================================================
// RESOURCES: LIVE STREAM RADIOS (Option B/C - 24/7 Streams)
// ============================================================
const RADIO_STATIONS = [
    { id: 'r1', title: 'Lofi Girl / Chillhop (Radio)', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
    { id: 'r2', title: 'Ambient Sleeping Pill (Deep Flow)', url: 'http://ice1.somafm.com/defcon-128-mp3' },
    { id: 'r3', title: 'Groove Salad (Downtempo)', url: 'http://ice1.somafm.com/groovesalad-128-mp3' },
]

// ============================================================
// SCIENTIFIC AUDIO GENERATOR (Binaural Beats & Brown Noise)
// ============================================================
let audioCtx = null
let binauralOscL = null
let binauralOscR = null
let binauralGain = null

let brownNoiseNode = null
let brownNoiseGain = null

function initWebAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume()
    }
    return audioCtx
}

function createBrownNoise(ctx) {
    const bufferSize = 2 * ctx.sampleRate
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    let lastOut = 0
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        output[i] = (lastOut + (0.02 * white)) / 1.02
        lastOut = output[i]
        output[i] *= 3.5 // (roughly compensate gain)
    }
    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = noiseBuffer
    noiseSource.loop = true
    return noiseSource
}

function startScientificGenerators(binauralMode, noiseVolume) {
    const ctx = initWebAudio()

    // 1. Binaural Beats setup
    if (!binauralOscL) {
        binauralGain = ctx.createGain()
        binauralGain.gain.value = 0
        binauralGain.connect(ctx.destination)

        const merger = ctx.createChannelMerger(2)
        binauralOscL = ctx.createOscillator()
        binauralOscR = ctx.createOscillator()

        binauralOscL.connect(merger, 0, 0) // Left ear
        binauralOscR.connect(merger, 0, 1) // Right ear
        merger.connect(binauralGain)

        binauralOscL.start()
        binauralOscR.start()
    }

    // frequencies based on mode
    const baseFreq = 200 // Carrier
    let diff = 0 // Beat frequency
    if (binauralMode === 'alpha') diff = 10 // Alpha (8-14Hz) - Relaxed focus
    if (binauralMode === 'beta') diff = 20  // Beta (14-30Hz) - Alert concentration

    if (diff > 0) {
        binauralOscL.frequency.setValueAtTime(baseFreq, ctx.currentTime)
        binauralOscR.frequency.setValueAtTime(baseFreq + diff, ctx.currentTime)
        binauralGain.gain.setTargetAtTime(0.15, ctx.currentTime, 0.5) // Gentle volume
    } else {
        binauralGain.gain.setTargetAtTime(0, ctx.currentTime, 0.5)
    }

    // 2. Brown Noise setup (Masking)
    if (!brownNoiseNode) {
        brownNoiseGain = ctx.createGain()
        brownNoiseGain.gain.value = 0
        brownNoiseGain.connect(ctx.destination)

        brownNoiseNode = createBrownNoise(ctx)
        brownNoiseNode.connect(brownNoiseGain)
        brownNoiseNode.start()
    }

    // Apply smooth volume change
    brownNoiseGain.gain.setTargetAtTime(Math.min(noiseVolume, 0.8), ctx.currentTime, 0.5)
}

function setScientificVolume(noiseVolume) {
    if (brownNoiseGain && audioCtx) {
        brownNoiseGain.gain.setTargetAtTime(Math.min(noiseVolume, 0.8), audioCtx.currentTime, 0.1)
    }
}

function setBinauralModeRaw(mode) {
    if (!audioCtx || !binauralOscL || !binauralGain) return
    const baseFreq = 200
    let diff = 0
    if (mode === 'alpha') diff = 10
    if (mode === 'beta') diff = 20

    if (diff > 0) {
        binauralOscL.frequency.setValueAtTime(baseFreq, audioCtx.currentTime)
        binauralOscR.frequency.setValueAtTime(baseFreq + diff, audioCtx.currentTime)
        binauralGain.gain.setTargetAtTime(0.15, audioCtx.currentTime, 0.5)
    } else {
        binauralGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5)
    }
}


// ============================================================
// REACT CONTEXT API
// ============================================================
const MusicContext = createContext(null)

export function MusicProvider({ children }) {
    // Media playback state
    const [mode, setMode] = useState('youtube') // 'youtube' | 'radio'
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentRadioIndex, setCurrentRadioIndex] = useState(0)
    const [volume, setVolume] = useState(0.4)

    // YouTube Mini Spotify State
    const [searchResults, setSearchResults] = useState([])
    const [currentSpotifyTrack, setCurrentSpotifyTrack] = useState(null)
    const [isSearching, setIsSearching] = useState(false)
    const [youtubePlayer, setYoutubePlayer] = useState(null)

    // Scientific state
    const [binauralMode, setBinauralMode] = useState('none') // 'none' | 'alpha' | 'beta'
    const [noiseVolume, setNoiseVolume] = useState(0) // 0 to 1

    // Refs for real DOM audio element
    const audioRef = useRef(new Audio())

    // -----------------------------------------------------------------
    // HTML5 RADIO AUDIO HANDLING
    // -----------------------------------------------------------------
    useEffect(() => {
        const ad = audioRef.current
        ad.crossOrigin = 'anonymous'

        const handleEnded = () => {
            if (mode === 'radio') {
                setCurrentRadioIndex(prev => (prev + 1) % RADIO_STATIONS.length)
            }
        }

        ad.addEventListener('ended', handleEnded)
        return () => ad.removeEventListener('ended', handleEnded)
    }, [mode])

    useEffect(() => {
        const ad = audioRef.current
        if (mode === 'radio') {
            const sourceUrl = RADIO_STATIONS[currentRadioIndex].url
            if (ad.src !== sourceUrl) {
                ad.src = sourceUrl
                ad.load()
            }
            if (isPlaying) {
                ad.play().catch(e => console.error("Playback failed:", e))
                // Pause YT if exists
                if (youtubePlayer && typeof youtubePlayer.pauseVideo === 'function') {
                    youtubePlayer.pauseVideo()
                }
            } else {
                ad.pause()
            }
        } else {
            // mode youtube
            ad.pause()
            if (isPlaying && youtubePlayer && typeof youtubePlayer.playVideo === 'function') {
                youtubePlayer.playVideo()
            } else if (!isPlaying && youtubePlayer && typeof youtubePlayer.pauseVideo === 'function') {
                youtubePlayer.pauseVideo()
            }
        }
    }, [currentRadioIndex, mode, isPlaying, youtubePlayer])

    // Volume syncing
    useEffect(() => {
        audioRef.current.volume = volume
        if (youtubePlayer && typeof youtubePlayer.setVolume === 'function') {
            youtubePlayer.setVolume(volume * 100) // YT expects 0-100
        }
    }, [volume, youtubePlayer])

    // -----------------------------------------------------------------
    // YOUTUBE SEARCH & PLAYER HANDLING
    // -----------------------------------------------------------------
    const searchYouTube = useCallback(async (query) => {
        setIsSearching(true)
        const instances = [
            'https://pipedapi.kavin.rocks',
            'https://pipedapi.smnz.de',
            'https://pipedapi.lunar.icu',
            'https://api.piped.projectsegfau.lt'
        ]

        let foundItems = []
        for (const url of instances) {
            try {
                const res = await fetch(`${url}/search?q=${encodeURIComponent(query + ' lofi study relaxing focus')}&filter=music_songs`)
                if (res.ok) {
                    const data = await res.json()
                    foundItems = data.items.slice(0, 15).map(item => ({
                        id: item.url.split('?v=')[1],
                        title: item.title,
                        thumbnail: item.thumbnail,
                        channel: item.uploaderName
                    }))
                    break // Stop if successful
                }
            } catch (e) {
                console.warn(`Piped instance ${url} failed, trying next...`)
            }
        }

        // If API fails or yields no results, provide some defaults
        if (foundItems.length === 0) {
            foundItems = [
                { id: 'jfKfPfyJRdk', title: 'lofi hip hop radio - beats to relax/study to', channel: 'Lofi Girl', thumbnail: '' },
                { id: '5qap5aO4i9A', title: 'lofi hip hop radio - beats to sleep/chill to', channel: 'Lofi Girl', thumbnail: '' },
                { id: '4xDzrMQvK8Y', title: 'Chillhop Radio - jazzy & lofi hip hop beats', channel: 'Chillhop Music', thumbnail: '' }
            ]
        }

        setSearchResults(foundItems)
        setIsSearching(false)
        return foundItems
    }, [])

    const searchAndPlaySpotifyTrack = useCallback((trackObj) => {
        setCurrentSpotifyTrack(trackObj)
        setMode('youtube')
        setIsPlaying(true)
        initWebAudio()
        startScientificGenerators(binauralMode, noiseVolume)
        // Note: The YT iframe will detect currentSpotifyTrack and update its ID, then auto-play
    }, [binauralMode, noiseVolume])

    const playNextSpotifyTrack = useCallback(() => {
        if (!currentSpotifyTrack || searchResults.length === 0) return
        const currentIndex = searchResults.findIndex(t => t.id === currentSpotifyTrack.id)
        if (currentIndex !== -1 && currentIndex < searchResults.length - 1) {
            searchAndPlaySpotifyTrack(searchResults[currentIndex + 1])
        }
    }, [currentSpotifyTrack, searchResults, searchAndPlaySpotifyTrack])

    const playPrevSpotifyTrack = useCallback(() => {
        if (!currentSpotifyTrack || searchResults.length === 0) return
        const currentIndex = searchResults.findIndex(t => t.id === currentSpotifyTrack.id)
        if (currentIndex > 0) {
            searchAndPlaySpotifyTrack(searchResults[currentIndex - 1])
        }
    }, [currentSpotifyTrack, searchResults, searchAndPlaySpotifyTrack])


    // -----------------------------------------------------------------
    // CORE PLAYBACK CONTROLS
    // -----------------------------------------------------------------
    const play = useCallback(() => {
        initWebAudio()
        setIsPlaying(true)
        startScientificGenerators(binauralMode, noiseVolume)
    }, [binauralMode, noiseVolume])

    const stop = useCallback(() => {
        setIsPlaying(false)
        if (binauralGain && audioCtx) {
            binauralGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5)
        }
        if (brownNoiseGain && audioCtx) {
            brownNoiseGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5)
        }
    }, [])

    const toggle = useCallback(() => {
        if (isPlaying) stop()
        else play()
    }, [isPlaying, play, stop])

    const next = useCallback(() => {
        if (mode === 'youtube') {
            playNextSpotifyTrack()
        } else {
            setCurrentRadioIndex(prev => (prev + 1) % RADIO_STATIONS.length)
        }
        if (!isPlaying) play()
    }, [mode, isPlaying, play, playNextSpotifyTrack])

    const prev = useCallback(() => {
        if (mode === 'youtube') {
            playPrevSpotifyTrack()
        } else {
            setCurrentRadioIndex(prev => (prev - 1 + RADIO_STATIONS.length) % RADIO_STATIONS.length)
        }
        if (!isPlaying) play()
    }, [mode, isPlaying, play, playPrevSpotifyTrack])

    const selectItem = useCallback((index, itemMode) => {
        if (itemMode !== mode) {
            setMode(itemMode)
        }
        if (itemMode === 'youtube') {
            // Should be handled by searchAndPlaySpotifyTrack for tracks
        } else {
            setCurrentRadioIndex(index)
        }
        if (!isPlaying) play()
    }, [mode, isPlaying, play])

    const changeVolume = useCallback((vol) => {
        setVolume(vol)
    }, [])

    const switchMode = useCallback((newMode) => {
        setMode(newMode)
    }, [])

    // Scientific Controls
    const setBinaural = useCallback((bm) => {
        setBinauralMode(bm)
        if (isPlaying) {
            initWebAudio()
            startScientificGenerators(bm, noiseVolume)
            setBinauralModeRaw(bm)
        }
    }, [isPlaying, noiseVolume])

    const changeNoiseVolume = useCallback((nv) => {
        setNoiseVolume(nv)
        if (isPlaying) {
            initWebAudio()
            startScientificGenerators(binauralMode, nv)
            setScientificVolume(nv)
        }
    }, [isPlaying, binauralMode])

    const getActiveItem = useCallback(() => {
        return mode === 'youtube'
            ? (currentSpotifyTrack || { title: 'No track selected' })
            : RADIO_STATIONS[currentRadioIndex]
    }, [mode, currentSpotifyTrack, currentRadioIndex])


    const value = {
        radioStations: RADIO_STATIONS,
        mode,
        isPlaying,
        searchResults,
        isSearching,
        currentSpotifyTrack,
        currentRadioIndex,
        volume,
        binauralMode,
        noiseVolume,
        play,
        stop,
        toggle,
        next,
        prev,
        selectItem,
        changeVolume,
        switchMode,
        setBinaural,
        changeNoiseVolume,
        getActiveItem,
        searchYouTube,
        searchAndPlaySpotifyTrack
    }

    return (
        <MusicContext.Provider value={value}>
            {children}
            {/* Invisible YouTube Player for Audio integration */}
            <div style={{ display: 'none' }}>
                {currentSpotifyTrack && (
                    <YouTube
                        videoId={currentSpotifyTrack.id}
                        opts={{
                            height: '0',
                            width: '0',
                            playerVars: {
                                autoplay: 1,
                                controls: 0,
                                disablekb: 1,
                                fs: 0,
                                rel: 0,
                                iv_load_policy: 3
                            }
                        }}
                        onReady={(e) => {
                            setYoutubePlayer(e.target)
                            e.target.setVolume(volume * 100)
                            if (!isPlaying || mode !== 'youtube') e.target.pauseVideo()
                        }}
                        onStateChange={(e) => {
                            // 0 = ended, 1 = playing, 2 = paused
                            if (e.data === 0) {
                                playNextSpotifyTrack()
                            }
                            // Sync state if YT player is unexpectedly paused
                            if (e.data === 2 && isPlaying && mode === 'youtube') {
                                setIsPlaying(false)
                            }
                            if (e.data === 1 && !isPlaying && mode === 'youtube') {
                                setIsPlaying(true)
                            }
                        }}
                        onError={(e) => {
                            console.error("YouTube Player Error", e)
                            playNextSpotifyTrack()
                        }}
                    />
                )}
            </div>
        </MusicContext.Provider>
    )
}

export function useMusic() {
    const ctx = useContext(MusicContext)
    if (!ctx) throw new Error('useMusic must be used within MusicProvider')
    return ctx
}
