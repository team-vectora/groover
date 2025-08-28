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
        const newSynth = instruments[instrument]();
        if (newSynth) {
            newSynth.volume.value = volume;
            synthRef.current = newSynth;
        }
    }, [instrument, volume]);

    useEffect(() => {
        Tone.getTransport().bpm.value = bpm;
    }, [bpm]);

    const playNotePiano = useCallback(async (note) => {
        await Tone.start();
        synthRef.current?.triggerAttackRelease(note, "8n");
    }, []);

    const createPlaybackSequence = (targetPages) => {
        const allSubNotes = [];
        let currentTime = 0;
        targetPages.forEach((matrix, matrixIndex) => {
            matrix.forEach((col, colIndex) => {
                const colDuration = Tone.Time("4n").toSeconds();
                const subNotesCount = Math.max(1, ...col.map(note => note?.subNotes?.length || 1));
                const subDuration = colDuration / subNotesCount;
                col.forEach((note, rowIndex) => {
                    (note?.subNotes || []).forEach((subNote, subIndex) => {
                        const startTime = currentTime + (subIndex * subDuration);
                        allSubNotes.push({
                            matrixIndex, rowIndex, colIndex, subIndex, subNote,
                            startTime, duration: subDuration, noteName: NOTES[rowIndex],
                            totalSubNotesInCol: subNotesCount
                        });
                    });
                });
                currentTime += colDuration;
            });
        });
        return allSubNotes;
    };

    // ✅ LÓGICA DE PLAYBACK RESTAURADA FIELMENTE DO CÓDIGO ORIGINAL
    const scheduleEventsBasedOnOriginalLogic = (sequence, onScheduleVisuals) => {
        let lastEventTime = 0;

        sequence.forEach(({ matrixIndex, rowIndex, colIndex, subIndex, subNote, startTime, duration }) => {
            lastEventTime = Math.max(lastEventTime, startTime + duration);

            Tone.getTransport().schedule(() => {
                onScheduleVisuals(matrixIndex, colIndex, subIndex);
            }, startTime);

            if (subNote?.name) {
                const currentMatrix = pages[matrixIndex];

                // Função auxiliar para encontrar notas em posições específicas
                const findNoteAt = (r, c, s) => sequence.find(item => item.rowIndex === r && item.colIndex === c && item.subIndex === s && item.matrixIndex === matrixIndex);

                // Lógica de shouldStart
                const prevSubNoteInSameCol = subIndex > 0 ? findNoteAt(rowIndex, colIndex, subIndex - 1) : null;
                const lastSubNoteInPrevCol = colIndex > 0 ? findNoteAt(rowIndex, colIndex - 1, (pages[matrixIndex][colIndex-1][rowIndex]?.subNotes.length || 1) - 1) : null;

                const shouldStart = (
                    (colIndex === 0 && subIndex === 0) ||
                    subNote.isSeparated ||
                    (prevSubNoteInSameCol && !prevSubNoteInSameCol.subNote.name) ||
                    (lastSubNoteInPrevCol && !lastSubNoteInPrevCol.subNote.name)
                );

                // Lógica de shouldEnd
                const nextSubNoteInSameCol = subIndex < (currentMatrix[colIndex][rowIndex]?.subNotes.length || 1) - 1 ? findNoteAt(rowIndex, colIndex, subIndex + 1) : null;
                const firstSubNoteInNextCol = colIndex < currentMatrix.length - 1 ? findNoteAt(rowIndex, colIndex + 1, 0) : null;

                const shouldEnd = (
                    (colIndex === currentMatrix.length - 1 && subIndex === (currentMatrix[colIndex][rowIndex]?.subNotes.length || 1) - 1) ||
                    (nextSubNoteInSameCol && !nextSubNoteInSameCol.subNote.name) ||
                    (firstSubNoteInNextCol && !firstSubNoteInNextCol.subNote.name) ||
                    (nextSubNoteInSameCol && nextSubNoteInSameCol.subNote.isSeparated)
                );

                if (shouldStart) {
                    Tone.getTransport().schedule((time) => {
                        synthRef.current?.triggerAttack(subNote.name, time);
                    }, startTime);
                }

                if (shouldEnd) {
                    Tone.getTransport().schedule((time) => {
                        synthRef.current?.triggerRelease(subNote.name, time);
                    }, startTime + duration);
                }
            }
        });
        return lastEventTime;
    };

    const runPlayback = async (sequence, onVisuals, onEnd) => {
        if (isPlaying) return;
        setIsPlaying(true);
        try {
            await Tone.start();
            Tone.getTransport().cancel();
            Tone.getTransport().bpm.value = bpm;

            const lastEventTime = scheduleEventsBasedOnOriginalLogic(sequence, onVisuals);

            Tone.getTransport().start();
            setTimeout(() => {
                Tone.getTransport().stop();
                synthRef.current?.releaseAll();
                setIsPlaying(false);
                onEnd();
            }, (lastEventTime + 0.2) * 1000); // Aumentei um pouco o tempo para garantir que a última nota termine

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
