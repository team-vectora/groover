"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from "tone";
import { ACOUSTIC_INSTRUMENTS, NOTES } from '../../constants';

const instruments = {};
ACOUSTIC_INSTRUMENTS.forEach(name => {
    instruments[name] = () => new Tone.Sampler({
        urls: { C4: "C4.mp3" },
        baseUrl: `https://nbrosowsky.github.io/tonejs-instruments/samples/${name}/`,
    }).toDestination();
});

export const useTonePlayer = (projectState) => {
    const { pages, bpm, instrument, volume } = projectState;
    const synthRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeCol, setActiveCol] = useState(null);
    const [activeSubIndex, setActiveSubIndex] = useState(null);

    useEffect(() => {
        synthRef.current?.dispose();
        synthRef.current = instruments[instrument]();
    }, [instrument]);

    useEffect(() => {
        if (synthRef.current) {
            synthRef.current.volume.value = volume;
        }
    }, [volume]);

    const playNotePiano = useCallback((note) => {
        synthRef.current?.triggerAttackRelease(note, "8n");
    },[]);

    const createPlaybackSequence = (targetPages) => {
        const allSubNotes = [];
        let currentTime = 0;

        targetPages.forEach((matrix, matrixIndex) => {
            matrix.forEach((col, colIndex) => {
                const colDuration = Tone.Time("4n").toSeconds();
                const subNotesCount = Math.max(...col.map(note => note?.subNotes?.length || 1));
                const subDuration = colDuration / subNotesCount;

                col.forEach((note, rowIndex) => {
                    (note?.subNotes || []).forEach((subNote, subIndex) => {
                        const startTime = currentTime + (subIndex * subDuration);
                        allSubNotes.push({
                            matrixIndex, rowIndex, colIndex, subIndex, subNote,
                            startTime, duration: subDuration, noteName: NOTES[rowIndex]
                        });
                    });
                });
                currentTime += colDuration;
            });
        });
        return allSubNotes;
    }

    const scheduleEvents = (sequence, onScheduleVisuals) => {
        let lastEventTime = 0;
        sequence.forEach(({ matrixIndex, rowIndex, colIndex, subIndex, subNote, startTime, duration }) => {
            lastEventTime = Math.max(lastEventTime, startTime + duration);

            Tone.getTransport().schedule((time) => {
                onScheduleVisuals(matrixIndex, colIndex, subIndex);
            }, startTime);

            if (subNote?.name) {
                Tone.getTransport().schedule((time) => {
                    synthRef.current?.triggerAttackRelease(subNote.name, duration, time);
                }, startTime);
            }
        });
        return lastEventTime;
    }

    const runPlayback = async (sequence, onVisuals, onEnd) => {
        if (isPlaying) return;
        setIsPlaying(true);

        try {
            await Tone.start();
            Tone.getTransport().cancel();
            Tone.getTransport().bpm.value = bpm;

            const lastEventTime = scheduleEvents(sequence, onVisuals);

            Tone.getTransport().start();

            setTimeout(() => {
                Tone.getTransport().stop();
                synthRef.current?.releaseAll();
                setIsPlaying(false);
                onEnd();
            }, (lastEventTime + 0.1) * 1000);

        } catch (error) {
            console.error('Erro na reprodução:', error);
            setIsPlaying(false);
        }
    };

    return {
        synthRef,
        playerState: { isPlaying, activeCol, activeSubIndex, instruments },
        playerActions: { playNotePiano, runPlayback, createPlaybackSequence, setActiveCol, setActiveSubIndex }
    };
};

export default useTonePlayer;