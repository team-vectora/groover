// src/lib/PlaybackEngine.js
import * as Tone from 'tone';
import { NOTES } from '../constants';

class PlaybackEngine {
    constructor(initialBpm = 120) {
        this.audioContext = null;
        this.synth = null;
        this.notes = [];
        this.state = 'STOPPED'; // STOPPED, PLAYING, PAUSED
        this.bpm = initialBpm;
        this.playbackPosition = 0; // Posição em segundos
        this.startTime = 0;
        this.scheduledEvents = [];
        this.onPlayheadUpdate = null; // Callback para a UI
        this.animationFrameId = null;
    }

    async init() {
        if (this.audioContext) return;
        await Tone.start();
        this.audioContext = Tone.getContext().rawContext;
        this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
        console.log('Playback Engine Initialized');
    }

    loadNotes(pages) {
        this.notes = [];
        const colDuration = 60 / this.bpm; // Duração de uma coluna (1 beat) em segundos

        pages.forEach((page, pageIndex) => {
            const pageOffset = pageIndex * 10 * colDuration;
            page.forEach(col => {
                col.forEach(note => {
                    if (note) {
                        this.notes.push({
                            ...note,
                            startTime: (note.start / 4) * colDuration + pageOffset,
                            duration: ((note.end - note.start) / 4) * colDuration,
                            noteName: NOTES[note.pitch],
                        });
                    }
                });
            });
        });
    }

    play() {
        if (this.state === 'PLAYING' || !this.audioContext) return;

        this.startTime = this.audioContext.currentTime - this.playbackPosition;
        this.state = 'PLAYING';
        this.scheduleNotes();
        this.tick();
    }

    pause() {
        if (this.state !== 'PLAYING') return;

        this.stopScheduledNotes();
        this.playbackPosition = this.audioContext.currentTime - this.startTime;
        this.state = 'PAUSED';
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    stop() {
        if (this.state === 'STOPPED') return;

        this.stopScheduledNotes();
        this.playbackPosition = 0;
        this.state = 'STOPPED';
        if (this.onPlayheadUpdate) {
            this.onPlayheadUpdate(0);
        }
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    seek(positionInSeconds) {
        const wasPlaying = this.state === 'PLAYING';
        this.stop();
        this.playbackPosition = positionInSeconds;
        if (wasPlaying) {
            this.play();
        } else {
            if (this.onPlayheadUpdate) {
                this.onPlayheadUpdate(this.playbackPosition);
            }
        }
    }

    scheduleNotes() {
        const lookaheadTime = 0.1; // Agendar notas 100ms à frente
        this.notes.forEach(note => {
            if (note.startTime >= this.playbackPosition) {
                const playTime = this.startTime + note.startTime;
                if (playTime >= this.audioContext.currentTime) {
                    this.synth.triggerAttackRelease(note.noteName, note.duration, playTime);
                }
            }
        });
    }

    stopScheduledNotes() {
        this.synth.releaseAll();
    }

    tick = () => {
        if (this.state !== 'PLAYING') return;

        this.playbackPosition = this.audioContext.currentTime - this.startTime;

        if (this.onPlayheadUpdate) {
            this.onPlayheadUpdate(this.playbackPosition);
        }

        this.animationFrameId = requestAnimationFrame(this.tick);
    }

    setBPM(newBpm) {
        this.bpm = newBpm;
        // Se estiver tocando, precisa recalcular e reagendar
        if(this.state === 'PLAYING') {
            this.pause();
            this.loadNotes(this.pages); // precisa ter acesso às pages
            this.play();
        }
    }
}

export default PlaybackEngine;