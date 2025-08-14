import { useState, useEffect, useRef, useContext } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { MidiContext } from "../contexts/MidiContext";

function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export default function useMidiPlayer() {
    const synthRef = useRef(null);
    const { currentProject } = useContext(MidiContext);

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [midi, setMidi] = useState(null);

    // Carregar MIDI quando o projeto mudar
    useEffect(() => {
        const loadMidi = async () => {
            if (!currentProject || !currentProject.midi) {
                setMidi(null);
                setDuration(0);
                setIsPlaying(false);
                setProgress(0);
                return;
            }

            const base64 = currentProject.midi.split(",")[1];
            const midiData = base64ToArrayBuffer(base64);
            const midiFile = new Midi(midiData);

            setMidi(midiFile);
            setDuration(midiFile.duration);

            if (!synthRef.current) {
                synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
            }
        };

        loadMidi();

        return () => {
            Tone.Transport.stop();
            Tone.Transport.cancel();
            synthRef.current?.dispose();
            synthRef.current = null;
        };
    }, [currentProject]);

    // Programar notas no Tone.js
    useEffect(() => {
        if (!midi) return;

        Tone.Transport.cancel();

        midi.tracks.forEach((track) => {
            track.notes.forEach((note) => {
                Tone.Transport.schedule((time) => {
                    synthRef.current?.triggerAttackRelease(note.name, note.duration, time);
                }, note.time);
            });
        });

        Tone.Transport.scheduleRepeat(() => {
            setProgress(Tone.Transport.seconds);
            if (Tone.Transport.seconds >= duration) {
                setIsPlaying(false);
                Tone.Transport.stop();
                Tone.Transport.position = 0;
                setProgress(0);
            }
        }, 0.1);
    }, [midi, duration]);

    const playPause = async () => {
        if (!midi) return;
        if (!isPlaying) {
            await Tone.start();
            Tone.Transport.start();
            setIsPlaying(true);
        } else {
            Tone.Transport.pause();
            setIsPlaying(false);
        }
    };

    const stop = () => {
        if (!midi) return;
        Tone.Transport.stop();
        Tone.Transport.position = 0;
        setIsPlaying(false);
        setProgress(0);
    };

    const seek = (time) => {
        if (!midi) return;
        Tone.Transport.seconds = time;
        setProgress(time);
    };

    const formatTime = (time) => {
        const min = Math.floor(time / 60).toString().padStart(2, "0");
        const sec = Math.floor(time % 60).toString().padStart(2, "0");
        return `${min}:${sec}`;
    };

    return {
        midi,
        isPlaying,
        progress,
        duration,
        currentProject,
        playPause,
        stop,
        seek,
        formatTime,
    };
}
