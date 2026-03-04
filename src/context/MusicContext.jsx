import { createContext, useContext, useState, useRef, useCallback } from 'react'

// Deep Focus ambient sound configurations
const FOCUS_TRACKS = [
    { title: 'Lofi Study Beats', baseFreq: 220, type: 'triangle', lfoRate: 0.3, filterFreq: 800, detune: 5 },
    { title: 'Calm Piano Waves', baseFreq: 261.63, type: 'sine', lfoRate: 0.15, filterFreq: 600, detune: 0 },
    { title: 'Ambient Flow', baseFreq: 174.61, type: 'sine', lfoRate: 0.2, filterFreq: 500, detune: 8 },
    { title: 'Rain & Coffee', baseFreq: 146.83, type: 'triangle', lfoRate: 0.4, filterFreq: 1200, detune: 3 },
    { title: 'Night Owl Jazz', baseFreq: 196, type: 'triangle', lfoRate: 0.25, filterFreq: 900, detune: 7 },
    { title: 'Deep Concentration', baseFreq: 130.81, type: 'sine', lfoRate: 0.1, filterFreq: 400, detune: 0 },
    { title: 'Peaceful Morning', baseFreq: 293.66, type: 'sine', lfoRate: 0.35, filterFreq: 700, detune: 4 },
    { title: 'Cosmic Drift', baseFreq: 110, type: 'triangle', lfoRate: 0.08, filterFreq: 350, detune: 10 },
]

// --- Audio Engine (singleton, never destroyed during app lifetime) ---
let audioCtx = null
let masterGain = null
let activeNodes = []

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        masterGain = audioCtx.createGain()
        masterGain.gain.value = 0
        masterGain.connect(audioCtx.destination)
    }
    // Always resume on user gesture
    if (audioCtx.state === 'suspended') {
        audioCtx.resume()
    }
    return { ctx: audioCtx, gain: masterGain }
}

function stopActiveNodes() {
    activeNodes.forEach(node => {
        try { node.stop() } catch (e) { /* already stopped */ }
        try { node.disconnect() } catch (e) { /* already disconnected */ }
    })
    activeNodes = []
}

function playAmbientTrack(trackConfig, volume) {
    const { ctx, gain } = getAudioContext()

    // Stop old nodes immediately
    stopActiveNodes()

    const { baseFreq, type, lfoRate, filterFreq, detune } = trackConfig

    // Create a dedicated sub-gain for this track (avoids conflicts)
    const trackGain = ctx.createGain()
    trackGain.gain.value = 0
    trackGain.connect(gain)

    // Main pad oscillator
    const osc1 = ctx.createOscillator()
    osc1.type = type
    osc1.frequency.value = baseFreq
    osc1.detune.value = detune

    // Harmonic layer (perfect fifth)
    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.value = baseFreq * 1.498  // Slightly detuned fifth for warmth
    osc2.detune.value = -detune

    // Sub bass (octave below)
    const osc3 = ctx.createOscillator()
    osc3.type = 'sine'
    osc3.frequency.value = baseFreq / 2

    // Third harmonic (major third above, quieter)
    const osc4 = ctx.createOscillator()
    osc4.type = 'sine'
    osc4.frequency.value = baseFreq * 1.26  // ~major third
    osc4.detune.value = detune * 2

    // LFO for gentle wobble on main oscillator
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = lfoRate
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = baseFreq * 0.015
    lfo.connect(lfoGain)
    lfoGain.connect(osc1.frequency)

    // Second LFO for filter sweep
    const lfo2 = ctx.createOscillator()
    lfo2.type = 'sine'
    lfo2.frequency.value = lfoRate * 0.7
    const lfo2Gain = ctx.createGain()
    lfo2Gain.gain.value = filterFreq * 0.3
    lfo2.connect(lfo2Gain)

    // Low-pass filter for warmth
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = filterFreq
    filter.Q.value = 0.7
    lfo2Gain.connect(filter.frequency)

    // Gain nodes for individual oscillator mixing
    const g1 = ctx.createGain(); g1.gain.value = 0.22
    const g2 = ctx.createGain(); g2.gain.value = 0.10
    const g3 = ctx.createGain(); g3.gain.value = 0.14
    const g4 = ctx.createGain(); g4.gain.value = 0.06

    // Connect oscillators → individual gains → filter → track gain
    osc1.connect(g1); g1.connect(filter)
    osc2.connect(g2); g2.connect(filter)
    osc3.connect(g3); g3.connect(filter)
    osc4.connect(g4); g4.connect(filter)
    filter.connect(trackGain)

    // Set master gain to target volume
    gain.gain.cancelScheduledValues(ctx.currentTime)
    gain.gain.setValueAtTime(volume, ctx.currentTime)

    // Fade in the track gain
    trackGain.gain.setValueAtTime(0, ctx.currentTime)
    trackGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.5)

    // Start all oscillators
    const now = ctx.currentTime
    osc1.start(now)
    osc2.start(now)
    osc3.start(now)
    osc4.start(now)
    lfo.start(now)
    lfo2.start(now)

    activeNodes = [osc1, osc2, osc3, osc4, lfo, lfo2]
}

function fadeOutAndStop() {
    if (!audioCtx || !masterGain) return
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime)
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime)
    masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8)
    setTimeout(() => {
        stopActiveNodes()
    }, 900)
}

function setMasterVolume(vol) {
    if (!audioCtx || !masterGain) return
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime)
    masterGain.gain.setValueAtTime(vol, audioCtx.currentTime)
}

// --- React Context ---
const MusicContext = createContext(null)

export function MusicProvider({ children }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTrack, setCurrentTrack] = useState(0)
    const [volume, setVolume] = useState(0.3)
    const isPlayingRef = useRef(false)

    const play = useCallback((trackIndex) => {
        const idx = trackIndex !== undefined ? trackIndex : currentTrack
        playAmbientTrack(FOCUS_TRACKS[idx], volume)
        setIsPlaying(true)
        isPlayingRef.current = true
        if (trackIndex !== undefined) setCurrentTrack(idx)
    }, [currentTrack, volume])

    const stop = useCallback(() => {
        fadeOutAndStop()
        setIsPlaying(false)
        isPlayingRef.current = false
    }, [])

    const toggle = useCallback(() => {
        if (isPlayingRef.current) {
            stop()
        } else {
            play()
        }
    }, [play, stop])

    const next = useCallback(() => {
        const nextIdx = (currentTrack + 1) % FOCUS_TRACKS.length
        setCurrentTrack(nextIdx)
        if (isPlayingRef.current) {
            playAmbientTrack(FOCUS_TRACKS[nextIdx], volume)
        }
    }, [currentTrack, volume])

    const prev = useCallback(() => {
        const prevIdx = (currentTrack - 1 + FOCUS_TRACKS.length) % FOCUS_TRACKS.length
        setCurrentTrack(prevIdx)
        if (isPlayingRef.current) {
            playAmbientTrack(FOCUS_TRACKS[prevIdx], volume)
        }
    }, [currentTrack, volume])

    const selectTrack = useCallback((index) => {
        setCurrentTrack(index)
        // Always start playing when user selects a track
        playAmbientTrack(FOCUS_TRACKS[index], volume)
        setIsPlaying(true)
        isPlayingRef.current = true
    }, [volume])

    const changeVolume = useCallback((vol) => {
        setVolume(vol)
        setMasterVolume(vol)
    }, [])

    const value = {
        tracks: FOCUS_TRACKS,
        isPlaying,
        currentTrack,
        volume,
        play,
        stop,
        toggle,
        next,
        prev,
        selectTrack,
        changeVolume,
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
