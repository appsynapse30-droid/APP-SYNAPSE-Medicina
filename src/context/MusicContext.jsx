import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'

// ============================================================
// RESOURCES: CURATED TRACKS (Option A - High Quality MP3 Local/CDN)
// ============================================================
const CURATED_TRACKS = [
    { id: 't1', title: 'Lofi Study Beats', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3' },
    { id: 't2', title: 'Chillhop Piano', url: 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_651f67f637.mp3?filename=chill-abstract-intention-110820.mp3' },
    { id: 't3', title: 'Rainy Cafe Vibes', url: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_b26ce3ba2b.mp3?filename=lofi-chill-medium-version-109403.mp3' },
    { id: 't4', title: 'Night Owl Jazz', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_169b59664f.mp3?filename=empty-mind-118973.mp3' },
    { id: 't5', title: 'Deep Concentration', url: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_106cd33d02.mp3?filename=lofi-ambient-14227.mp3' },
]

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
    const [mode, setMode] = useState('tracks') // 'tracks' | 'radio'
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
    const [currentRadioIndex, setCurrentRadioIndex] = useState(0)
    const [volume, setVolume] = useState(0.4)

    // Scientific state
    const [binauralMode, setBinauralMode] = useState('none') // 'none' | 'alpha' | 'beta'
    const [noiseVolume, setNoiseVolume] = useState(0) // 0 to 1

    // Refs for real DOM audio element
    const audioRef = useRef(new Audio())
    const isReadyRef = useRef(false)

    // Handle HTML5 Audio Element Setup
    useEffect(() => {
        const ad = audioRef.current
        ad.crossOrigin = 'anonymous'

        const handleEnded = () => {
            if (mode === 'tracks') {
                setCurrentTrackIndex(prev => (prev + 1) % CURATED_TRACKS.length)
            }
        }

        ad.addEventListener('ended', handleEnded)
        return () => ad.removeEventListener('ended', handleEnded)
    }, [mode])

    // Load track/radio source when indices change, only if it's supposed to play
    useEffect(() => {
        const ad = audioRef.current
        const sourceUrl = mode === 'tracks'
            ? CURATED_TRACKS[currentTrackIndex].url
            : RADIO_STATIONS[currentRadioIndex].url

        // If the URL changed, load and play
        if (ad.src !== sourceUrl) {
            ad.src = sourceUrl
            ad.load()
            if (isPlaying) {
                ad.play().catch(e => console.error("Playback failed:", e))
            }
        }
    }, [currentTrackIndex, currentRadioIndex, mode, isPlaying])

    // Volume syncing
    useEffect(() => {
        audioRef.current.volume = volume
    }, [volume])

    // Core playback controls
    const play = useCallback(() => {
        initWebAudio()
        audioRef.current.play().catch(e => console.error("Playback failed:", e))
        setIsPlaying(true)
        startScientificGenerators(binauralMode, noiseVolume)
    }, [binauralMode, noiseVolume])

    const stop = useCallback(() => {
        audioRef.current.pause()
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
        if (mode === 'tracks') {
            setCurrentTrackIndex(prev => (prev + 1) % CURATED_TRACKS.length)
        } else {
            setCurrentRadioIndex(prev => (prev + 1) % RADIO_STATIONS.length)
        }
        if (!isPlaying) play()
    }, [mode, isPlaying, play])

    const prev = useCallback(() => {
        if (mode === 'tracks') {
            setCurrentTrackIndex(prev => (prev - 1 + CURATED_TRACKS.length) % CURATED_TRACKS.length)
        } else {
            setCurrentRadioIndex(prev => (prev - 1 + RADIO_STATIONS.length) % RADIO_STATIONS.length)
        }
        if (!isPlaying) play()
    }, [mode, isPlaying, play])

    const selectItem = useCallback((index, itemMode) => {
        if (itemMode !== mode) {
            setMode(itemMode)
        }
        if (itemMode === 'tracks') {
            setCurrentTrackIndex(index)
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
        if (isPlaying) {
            const tempAd = audioRef.current
            tempAd.pause()
            // Setting state triggers useEffect to load new URL and play
        }
    }, [isPlaying])

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
        return mode === 'tracks' ? CURATED_TRACKS[currentTrackIndex] : RADIO_STATIONS[currentRadioIndex]
    }, [mode, currentTrackIndex, currentRadioIndex])


    const value = {
        curatedTracks: CURATED_TRACKS,
        radioStations: RADIO_STATIONS,
        mode,
        isPlaying,
        currentTrackIndex,
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
        getActiveItem
    }

    return (
        <MusicContext.Provider value={value}>
            {children}
        </MusicContext.Provider>
    )
}

export function useMusic() {
    const ctx = useContext(MusicContext)
    if (!ctx) throw new Error('useMusic must be used within MusicProvider')
    return ctx
}
