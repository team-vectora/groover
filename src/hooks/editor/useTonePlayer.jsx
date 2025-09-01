// src/hooks/editor/useTonePlayer.jsx

"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from "tone";
import { ACOUSTIC_INSTRUMENTS, NOTES } from '../../constants';

const instruments = {};
ACOUSTIC_INSTRUMENTS.forEach(name => {
    instruments[name] = () => new Tone.Sampler({
        urls: { C4: "C4.mp3" },
        baseUrl: `https://nbrosowsky.github.io/tonejs-instruments/samples/${name}/`,
    });
});

export const useTonePlayer = (projectState) => {
    const { pages, bpm, instrument, volume } = projectState;
    const synthRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeCol, setActiveCol] = useState(null);
    const [activeSubIndex, setActiveSubIndex] = useState(null);
    const [isInstrumentLoading, setIsInstrumentLoading] = useState(true);
    const scheduledEventsRef = useRef([]);

    useEffect(() => {
        const loadInstrument = async () => {
            try {
                setIsInstrumentLoading(true);
                synthRef.current?.dispose();
                const newSynth = instruments[instrument]();
                await newSynth.toDestination();
                newSynth.volume.value = volume;
                synthRef.current = newSynth;
            } catch (error) {
                console.error("Erro ao carregar o instrumento:", error);
            } finally {
                setIsInstrumentLoading(false);
            }
        };
        loadInstrument();
    }, [instrument, volume]);

    useEffect(() => {
        Tone.getTransport().bpm.value = bpm;
    }, [bpm]);

    const playNotePiano = useCallback(async (note) => {
        if (isInstrumentLoading || !synthRef.current) return;
        await Tone.start();
        synthRef.current.triggerAttackRelease(note, "8n");
    }, [isInstrumentLoading]);

    const createPlaybackSequence = (targetPages) => {
        const allSubNotes = [];
        let currentTime = 0;
        targetPages.forEach((matrix, matrixIndex) => {
            matrix.forEach((col, colIndex) => {
                const colDuration = Tone.Time("4n").toSeconds();
                const subNotesCount = Math.max(1, ...col.map(note => note?.length || 1));
                const subDuration = colDuration / subNotesCount;
                col.forEach((note, rowIndex) => {
                    (note || []).forEach((subNote, subIndex) => {
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

    const stop = useCallback(() => {
        Tone.Transport.stop();
        scheduledEventsRef.current.forEach(id => Tone.Transport.clear(id));
        scheduledEventsRef.current = [];
        Tone.Transport.position = 0;
        synthRef.current?.releaseAll();
        setIsPlaying(false);
        setActiveCol(null);
        setActiveSubIndex(null);
    }, []);

    const playPause = useCallback(async (sequence, onVisuals, onEnd) => {
        if (isInstrumentLoading || !synthRef.current) return;

        await Tone.start();
        const state = Tone.Transport.state;

        if (state === 'stopped') {
            scheduledEventsRef.current.forEach(id => Tone.Transport.clear(id));
            scheduledEventsRef.current = [];

            let lastEventTime = 0;

            // ✅ LÓGICA DE 'shouldStart' E 'shouldEnd' RESTAURADA E CORRIGIDA
            sequence.forEach(({ matrixIndex, rowIndex, colIndex, subIndex, subNote, startTime, duration }) => {
                lastEventTime = Math.max(lastEventTime, startTime + duration);

                const visualEventId = Tone.Transport.schedule(time => {
                    Tone.Draw.schedule(() => {
                        onVisuals(matrixIndex, colIndex, subIndex);
                    }, time);
                }, startTime);
                scheduledEventsRef.current.push(visualEventId);

                if (subNote?.name) {
                    const findNoteAt = (r, c, s) => sequence.find(item => item.rowIndex === r && item.colIndex === c && item.subIndex === s && item.matrixIndex === matrixIndex);

                    // Lógica de `shouldStart`
                    const prevSubNoteInSameCol = subIndex > 0 ? findNoteAt(rowIndex, colIndex, subIndex - 1) : null;
                    const prevColNoteArray = (pages[matrixIndex] && pages[matrixIndex][colIndex - 1]) ? pages[matrixIndex][colIndex - 1][rowIndex] : null;
                    const lastSubNoteInPrevCol = colIndex > 0 ? findNoteAt(rowIndex, colIndex - 1, (prevColNoteArray?.length || 1) - 1) : null;

                    const shouldStart = (
                        (colIndex === 0 && subIndex === 0) ||
                        subNote?.isSeparated ||
                        (prevSubNoteInSameCol && !prevSubNoteInSameCol.subNote?.name) ||
                        (lastSubNoteInPrevCol && !lastSubNoteInPrevCol.subNote?.name)
                    );

                    // Lógica de `shouldEnd`
                    const currentNoteArray = pages[matrixIndex]?.[colIndex]?.[rowIndex] || [];
                    const nextSubNoteInSameCol = subIndex < currentNoteArray.length - 1 ? findNoteAt(rowIndex, colIndex, subIndex + 1) : null;
                    const firstSubNoteInNextCol = colIndex < (pages[matrixIndex]?.length || 0) - 1 ? findNoteAt(rowIndex, colIndex + 1, 0) : null;

                    const isLastNoteOfSequence = !nextSubNoteInSameCol && !firstSubNoteInNextCol;

                    const shouldEnd = (
                        isLastNoteOfSequence ||
                        (nextSubNoteInSameCol && !nextSubNoteInSameCol.subNote?.name) ||
                        (nextSubNoteInSameCol && nextSubNoteInSameCol.subNote?.isSeparated) ||
                        (!nextSubNoteInSameCol && firstSubNoteInNextCol && !firstSubNoteInNextCol.subNote?.name) ||
                        (!nextSubNoteInSameCol && !firstSubNoteInNextCol)
                    );

                    if (shouldStart) {
                        const attackId = Tone.Transport.schedule(time => {
                            synthRef.current?.triggerAttack(subNote.name, time);
                        }, startTime);
                        scheduledEventsRef.current.push(attackId);
                    }

                    if (shouldEnd) {
                        const releaseId = Tone.Transport.schedule(time => {
                            synthRef.current?.triggerRelease(subNote.name, time);
                        }, startTime + duration);
                        scheduledEventsRef.current.push(releaseId);
                    }
                }
            });
            // --- FIM DA LÓGICA CORRIGIDA ---

            const endEventId = Tone.Transport.schedule(time => {
                Tone.Draw.schedule(() => {
                    onEnd();
                    stop();
                }, time);
            }, lastEventTime);
            scheduledEventsRef.current.push(endEventId);

            Tone.Transport.start();
            setIsPlaying(true);
        } else if (state === 'started') {
            Tone.Transport.pause();
            setIsPlaying(false);
        } else if (state === 'paused') {
            Tone.Transport.start();
            setIsPlaying(true);
        }
    }, [isInstrumentLoading, stop, pages]);

    return {
        synthRef,
        playerState: { isPlaying, activeCol, activeSubIndex, instruments, isInstrumentLoading },
        playerActions: {
            playNotePiano,
            createPlaybackSequence,
            playPause,
            stop,
            setActiveCol,
            setActiveSubIndex
        }
    };
};

export default useTonePlayer;