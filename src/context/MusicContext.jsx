import { createContext, useContext, useState, useRef, useCallback } from 'react'

// ============================================================
// NOTE FREQUENCY MAP (scientific pitch notation)
// ============================================================
const NOTE_FREQ = {
    'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'Bb2': 116.54, 'B2': 123.47,
    'C3': 130.81, 'Db3': 138.59, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'Gb3': 185.00, 'G3': 196.00, 'Ab3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'Db4': 277.18, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'Gb4': 369.99, 'G4': 392.00, 'Ab4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'Db5': 554.37, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.26, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    'C6': 1046.50,
}

// ============================================================
// 8 UNIQUE TRACK DEFINITIONS
// Each track defines: tempo, arp pattern, pad chords, bass line
// ============================================================
const FOCUS_TRACKS = [
    {
        title: 'Lofi Study Beats',
        tempo: 72,
        arp: ['C4', 'E4', 'G4', 'B4', 'G4', 'E4', 'A4', 'G4'],
        pads: [['C3', 'E3', 'G3', 'B3'], ['A2', 'C3', 'E3', 'G3'], ['F2', 'A2', 'C3', 'E3'], ['G2', 'B2', 'D3', 'F3']],
        bass: ['C2', 'C2', 'A2', 'A2', 'F2', 'F2', 'G2', 'G2'],
        arpType: 'triangle',
        padType: 'sine',
        filterFreq: 900,
        delayTime: 0.35,
        padBeatLen: 8,
    },
    {
        title: 'Calm Piano Waves',
        tempo: 56,
        arp: ['G4', 'B4', 'D5', 'G5', 'D5', 'B4', 'A4', 'B4'],
        pads: [['G2', 'B2', 'D3', 'G3'], ['E2', 'G2', 'B2', 'E3'], ['C3', 'E3', 'G3', 'C4'], ['D3', 'Gb3', 'A3', 'D4']],
        bass: ['G2', 'G2', 'E2', 'E2', 'C2', 'C2', 'D2', 'D2'],
        arpType: 'sine',
        padType: 'sine',
        filterFreq: 700,
        delayTime: 0.5,
        padBeatLen: 8,
    },
    {
        title: 'Ambient Flow',
        tempo: 45,
        arp: ['D4', 'F4', 'A4', 'D5', 'C5', 'A4', 'F4', 'E4'],
        pads: [['D3', 'F3', 'A3', 'D4'], ['Bb2', 'D3', 'F3', 'A3'], ['G2', 'Bb2', 'D3', 'G3'], ['A2', 'D3', 'F3', 'A3']],
        bass: ['D2', 'D2', 'Bb2', 'Bb2', 'G2', 'G2', 'A2', 'A2'],
        arpType: 'sine',
        padType: 'sine',
        filterFreq: 500,
        delayTime: 0.6,
        padBeatLen: 8,
    },
    {
        title: 'Rain & Coffee',
        tempo: 66,
        arp: ['F4', 'A4', 'C5', 'E5', 'C5', 'A4', 'G4', 'A4'],
        pads: [['F3', 'A3', 'C4', 'E4'], ['Bb2', 'D3', 'F3', 'A3'], ['C3', 'E3', 'G3', 'Bb3'], ['F2', 'A2', 'C3', 'E3']],
        bass: ['F2', 'F2', 'Bb2', 'Bb2', 'C2', 'C2', 'F2', 'F2'],
        arpType: 'triangle',
        padType: 'sine',
        filterFreq: 1100,
        delayTime: 0.3,
        padBeatLen: 8,
    },
    {
        title: 'Night Owl Jazz',
        tempo: 62,
        arp: ['Bb4', 'D5', 'F4', 'A4', 'G4', 'Bb4', 'C5', 'A4'],
        pads: [['Bb2', 'D3', 'F3', 'A3'], ['Eb3', 'G3', 'Bb3', 'D4'], ['F2', 'A2', 'C3', 'Eb3'], ['Bb2', 'D3', 'F3', 'Ab3']],
        bass: ['Bb2', 'Bb2', 'Eb2', 'Eb2', 'F2', 'F2', 'Bb2', 'Bb2'],
        arpType: 'triangle',
        padType: 'sine',
        filterFreq: 950,
        delayTime: 0.4,
        padBeatLen: 8,
    },
    {
        title: 'Deep Concentration',
        tempo: 50,
        arp: ['A3', 'C4', 'E4', 'A4', 'E4', 'C4', 'B3', 'C4'],
        pads: [['A2', 'C3', 'E3', 'A3'], ['F2', 'A2', 'C3', 'E3'], ['D2', 'F2', 'A2', 'D3'], ['E2', 'Ab2', 'B2', 'E3']],
        bass: ['A2', 'A2', 'F2', 'F2', 'D2', 'D2', 'E2', 'E2'],
        arpType: 'sine',
        padType: 'sine',
        filterFreq: 450,
        delayTime: 0.55,
        padBeatLen: 8,
    },
    {
        title: 'Peaceful Morning',
        tempo: 58,
        arp: ['E4', 'Ab4', 'B4', 'E5', 'B4', 'Ab4', 'Gb4', 'Ab4'],
        pads: [['E3', 'Ab3', 'B3', 'E4'], ['Db3', 'E3', 'Ab3', 'B3'], ['A2', 'Db3', 'E3', 'A3'], ['B2', 'Eb3', 'Gb3', 'B3']],
        bass: ['E2', 'E2', 'Db2', 'Db2', 'A2', 'A2', 'B2', 'B2'],
        arpType: 'sine',
        padType: 'sine',
        filterFreq: 750,
        delayTime: 0.45,
        padBeatLen: 8,
    },
    {
        title: 'Cosmic Drift',
        tempo: 40,
        arp: ['Db4', 'E4', 'Ab4', 'Db5', 'B4', 'Ab4', 'E4', 'Db4'],
        pads: [['Db3', 'E3', 'Ab3', 'Db4'], ['A2', 'Db3', 'E3', 'Ab3'], ['Gb2', 'A2', 'Db3', 'E3'], ['Ab2', 'Db3', 'E3', 'Ab3']],
        bass: ['Db2', 'Db2', 'A2', 'A2', 'Gb2', 'Gb2', 'Ab2', 'Ab2'],
        arpType: 'triangle',
        padType: 'sine',
        filterFreq: 400,
        delayTime: 0.7,
        padBeatLen: 8,
    },
]

// ============================================================
// AUDIO ENGINE — Singleton melodic sequencer
// ============================================================
let audioCtx = null
let masterGain = null
let sequencerInterval = null
let activePadOscs = []
let delayNode = null
let feedbackGain = null
let filterNode = null
let padGainNode = null
let arpGainNode = null
let bassGainNode = null

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        masterGain = audioCtx.createGain()
        masterGain.gain.value = 0.3
        masterGain.connect(audioCtx.destination)
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume()
    }
    return audioCtx
}

function createEffectsChain(ctx, trackConfig) {
    // Clean up old effect nodes
    if (filterNode) try { filterNode.disconnect() } catch (e) { }
    if (delayNode) try { delayNode.disconnect() } catch (e) { }
    if (feedbackGain) try { feedbackGain.disconnect() } catch (e) { }
    if (padGainNode) try { padGainNode.disconnect() } catch (e) { }
    if (arpGainNode) try { arpGainNode.disconnect() } catch (e) { }
    if (bassGainNode) try { bassGainNode.disconnect() } catch (e) { }

    // Low-pass filter for warmth
    filterNode = ctx.createBiquadFilter()
    filterNode.type = 'lowpass'
    filterNode.frequency.value = trackConfig.filterFreq
    filterNode.Q.value = 0.5

    // Delay with feedback for spaciousness
    delayNode = ctx.createDelay(2.0)
    delayNode.delayTime.value = trackConfig.delayTime

    feedbackGain = ctx.createGain()
    feedbackGain.gain.value = 0.25

    // Delay feedback loop
    delayNode.connect(feedbackGain)
    feedbackGain.connect(delayNode)

    // Dry path: filter → master
    filterNode.connect(masterGain)
    // Wet path: filter → delay → master
    const delaySend = ctx.createGain()
    delaySend.gain.value = 0.3
    filterNode.connect(delaySend)
    delaySend.connect(delayNode)
    delayNode.connect(masterGain)

    // Sub-gains for each layer
    padGainNode = ctx.createGain()
    padGainNode.gain.value = 0.18
    padGainNode.connect(filterNode)

    arpGainNode = ctx.createGain()
    arpGainNode.gain.value = 0.22
    arpGainNode.connect(filterNode)

    bassGainNode = ctx.createGain()
    bassGainNode.gain.value = 0.15
    bassGainNode.connect(filterNode)
}

// Play a single short note (for arpeggios and bass)
function playNote(ctx, freq, gainNode, type, startTime, duration, isArp) {
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.value = freq

    const noteGain = ctx.createGain()
    noteGain.gain.setValueAtTime(0, startTime)

    if (isArp) {
        // Arp: quick attack, gentle decay for plucky feel
        noteGain.gain.linearRampToValueAtTime(0.6, startTime + 0.02)
        noteGain.gain.exponentialRampToValueAtTime(0.08, startTime + duration * 0.85)
        noteGain.gain.linearRampToValueAtTime(0, startTime + duration)
    } else {
        // Bass: rounder attack, sustained
        noteGain.gain.linearRampToValueAtTime(0.5, startTime + 0.05)
        noteGain.gain.setValueAtTime(0.5, startTime + duration * 0.6)
        noteGain.gain.linearRampToValueAtTime(0, startTime + duration)
    }

    osc.connect(noteGain)
    noteGain.connect(gainNode)
    osc.start(startTime)
    osc.stop(startTime + duration + 0.05)
}

// Start/replace sustained pad chord
function playPadChord(ctx, noteNames, gainNode, padType) {
    // Fade out old pads
    activePadOscs.forEach(({ osc, gain: g }) => {
        const now = ctx.currentTime
        g.gain.cancelScheduledValues(now)
        g.gain.setValueAtTime(g.gain.value, now)
        g.gain.linearRampToValueAtTime(0, now + 1.5)
        setTimeout(() => { try { osc.stop() } catch (e) { } }, 2000)
    })
    activePadOscs = []

    const now = ctx.currentTime

    noteNames.forEach((note, i) => {
        const freq = NOTE_FREQ[note]
        if (!freq) return

        const osc = ctx.createOscillator()
        osc.type = padType
        osc.frequency.value = freq
        // Slight detune for richness
        osc.detune.value = (i - 1.5) * 4

        const noteGain = ctx.createGain()
        noteGain.gain.setValueAtTime(0, now)
        // Slow fade in for dreamy pad feel
        noteGain.gain.linearRampToValueAtTime(0.25, now + 2.0)

        osc.connect(noteGain)
        noteGain.connect(gainNode)
        osc.start(now)

        activePadOscs.push({ osc, gain: noteGain })
    })
}

function stopAll() {
    // Stop sequencer
    if (sequencerInterval) {
        clearInterval(sequencerInterval)
        sequencerInterval = null
    }

    // Fade out master
    if (masterGain && audioCtx) {
        const now = audioCtx.currentTime
        masterGain.gain.cancelScheduledValues(now)
        masterGain.gain.setValueAtTime(masterGain.gain.value, now)
        masterGain.gain.linearRampToValueAtTime(0, now + 0.6)
    }

    // Stop pad oscillators
    setTimeout(() => {
        activePadOscs.forEach(({ osc, gain: g }) => {
            try { osc.stop() } catch (e) { }
            try { osc.disconnect() } catch (e) { }
        })
        activePadOscs = []
    }, 700)
}

function playTrack(trackConfig, volume) {
    const ctx = getAudioContext()

    // Stop anything currently playing
    stopAll()

    // Wait for any fade out to complete
    setTimeout(() => {
        // Set master volume
        masterGain.gain.cancelScheduledValues(ctx.currentTime)
        masterGain.gain.setValueAtTime(volume, ctx.currentTime)

        // Create fresh effects chain
        createEffectsChain(ctx, trackConfig)

        const beatDuration = 60 / trackConfig.tempo  // seconds per beat
        let step = 0
        let currentPadIndex = -1

        function tick() {
            const now = ctx.currentTime
            const arpIndex = step % trackConfig.arp.length
            const bassIndex = step % trackConfig.bass.length
            const padIndex = Math.floor(step / trackConfig.padBeatLen) % trackConfig.pads.length

            // --- Arp note ---
            const arpNote = trackConfig.arp[arpIndex]
            const arpFreq = NOTE_FREQ[arpNote]
            if (arpFreq) {
                playNote(ctx, arpFreq, arpGainNode, trackConfig.arpType, now, beatDuration * 0.8, true)
            }

            // --- Bass note (plays every 2 beats for slower rhythm) ---
            if (step % 2 === 0) {
                const bassNote = trackConfig.bass[bassIndex]
                const bassFreq = NOTE_FREQ[bassNote]
                if (bassFreq) {
                    playNote(ctx, bassFreq, bassGainNode, 'sine', now, beatDuration * 1.8, false)
                }
            }

            // --- Pad chord change ---
            if (padIndex !== currentPadIndex) {
                currentPadIndex = padIndex
                playPadChord(ctx, trackConfig.pads[padIndex], padGainNode, trackConfig.padType)
            }

            step++
        }

        // Play first beat immediately
        tick()

        // Schedule subsequent beats
        sequencerInterval = setInterval(tick, beatDuration * 1000)
    }, 650)
}

function setMasterVolume(vol) {
    if (!audioCtx || !masterGain) return
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime)
    masterGain.gain.setValueAtTime(vol, audioCtx.currentTime)
}

// ============================================================
// REACT CONTEXT (API unchanged)
// ============================================================
const MusicContext = createContext(null)

export function MusicProvider({ children }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTrack, setCurrentTrack] = useState(0)
    const [volume, setVolume] = useState(0.3)
    const isPlayingRef = useRef(false)

    const play = useCallback((trackIndex) => {
        const idx = trackIndex !== undefined ? trackIndex : currentTrack
        playTrack(FOCUS_TRACKS[idx], volume)
        setIsPlaying(true)
        isPlayingRef.current = true
        if (trackIndex !== undefined) setCurrentTrack(idx)
    }, [currentTrack, volume])

    const stop = useCallback(() => {
        stopAll()
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
            playTrack(FOCUS_TRACKS[nextIdx], volume)
        }
    }, [currentTrack, volume])

    const prev = useCallback(() => {
        const prevIdx = (currentTrack - 1 + FOCUS_TRACKS.length) % FOCUS_TRACKS.length
        setCurrentTrack(prevIdx)
        if (isPlayingRef.current) {
            playTrack(FOCUS_TRACKS[prevIdx], volume)
        }
    }, [currentTrack, volume])

    const selectTrack = useCallback((index) => {
        setCurrentTrack(index)
        playTrack(FOCUS_TRACKS[index], volume)
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
