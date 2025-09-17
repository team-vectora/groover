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
        let globalColIndex = 0;

        targetPages.forEach((matrix, matrixIndex) => {
            matrix.forEach((col, colIndexInPage) => {
                const colDuration = Tone.Time("4n").toSeconds();
                const subNotesCount = Math.max(1, ...col.map(note => note?.length || 1));
                const subDuration = colDuration / subNotesCount;

                col.forEach((note, rowIndex) => {
                    (note || []).forEach((subNote, subIndex) => {
                        if (subNote?.name) {
                            const startTime = currentTime + (subIndex * subDuration);
                            allSubNotes.push({
                                matrixIndex,
                                rowIndex,
                                colIndex: colIndexInPage,
                                subIndex,
                                subNote,
                                startTime,
                                duration: subDuration,
                                noteName: NOTES[rowIndex],
                                globalColIndex,
                                totalSubNotesInCol: subNotesCount
                            });
                        }
                    });
                });
                currentTime += colDuration;
                globalColIndex++;
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

            // Lógica de agendamento VISUAL
            let currentTime = 0;
            const colDuration = Tone.Time("4n").toSeconds();
            pages.forEach((matrix, matrixIndex) => {
                matrix.forEach((col, colIndex) => {
                    const subNotesCount = Math.max(1, ...col.map(note => note?.length || 1));
                    const subDuration = colDuration / subNotesCount;

                    for (let subIndex = 0; subIndex < subNotesCount; subIndex++) {
                        const eventTime = currentTime + (subIndex * subDuration);
                        const visualEventId = Tone.Transport.schedule(time => {
                            Tone.Draw.schedule(() => {
                                onVisuals(matrixIndex, colIndex, subIndex);
                            }, time);
                        }, eventTime);
                        scheduledEventsRef.current.push(visualEventId);
                    }
                    currentTime += colDuration;
                });
            });
            lastEventTime = currentTime;

            // Lógica de agendamento de ÁUDIO
            if (sequence.length > 0) {
                // 1. Criar um mapa de informações estruturais sobre cada coluna
                const colInfoMap = new Map();
                let currentGlobalColIndex = 0;
                pages.forEach((matrix) => {
                    matrix.forEach((col) => {
                        const subNotesCount = Math.max(1, ...col.map(note => note?.length || 1));
                        colInfoMap.set(currentGlobalColIndex, { totalSubNotes: subNotesCount });
                        currentGlobalColIndex++;
                    });
                });

                // 2. Criar o mapa de notas para acesso rápido
                const noteMap = new Map();
                sequence.forEach(event => {
                    const key = `${event.rowIndex}-${event.globalColIndex}-${event.subIndex}`;
                    noteMap.set(key, event.subNote);
                });

                // 3. Função getAdjacentNote refatorada e robusta
                const getAdjacentNote = (currentEvent, direction) => {
                    const { rowIndex, globalColIndex, subIndex } = currentEvent;

                    let adjSubIndex = subIndex + direction;
                    let adjGlobalColIndex = globalColIndex;

                    const currentColInfo = colInfoMap.get(globalColIndex);

                    if (adjSubIndex < 0) { // Navega para a coluna anterior
                        adjGlobalColIndex--;
                        if (adjGlobalColIndex < 0) {
                            return null; // Início da música
                        }
                        const prevColInfo = colInfoMap.get(adjGlobalColIndex);
                        adjSubIndex = prevColInfo.totalSubNotes - 1; // Última sub-nota da coluna anterior

                    } else if (adjSubIndex >= currentColInfo.totalSubNotes) { // Navega para a próxima coluna
                        adjGlobalColIndex++;
                        const nextColInfo = colInfoMap.get(adjGlobalColIndex);
                        if (!nextColInfo) {
                            return null; // Fim da música
                        }
                        adjSubIndex = 0; // Primeira sub-nota da próxima coluna
                    }

                    const key = `${rowIndex}-${adjGlobalColIndex}-${adjSubIndex}`;
                    return noteMap.get(key);
                };

                sequence.forEach((event) => {
                    const prevNote = getAdjacentNote(event, -1);
                    const nextNote = getAdjacentNote(event, +1);

                    const shouldStart = event.subNote.isSeparated || !prevNote || prevNote.isSeparated;
                    const shouldEnd = event.subNote.isSeparated || !nextNote || nextNote.isSeparated;

                    // Logs mantidos para depuração
                    console.group(`Nota: ${event.noteName} (Col: ${event.globalColIndex}, Sub: ${event.subIndex})`);
                    console.log(`%c--- Verificando shouldStart: ${shouldStart} ---`, 'color: skyblue');
                    console.log(`É uma nota separada? (isSeparated):`, event.subNote.isSeparated);
                    console.log(`Célula adjacente anterior é vazia? (!prevNote):`, !prevNote);
                    if (prevNote) {
                        console.log(`Nota anterior é separada? (prevNote.isSeparated):`, prevNote.isSeparated);
                    }
                    console.log(`%c--- Verificando shouldEnd: ${shouldEnd} ---`, 'color: lightgreen');
                    console.log(`É uma nota separada? (isSeparated):`, event.subNote.isSeparated);
                    console.log(`Célula adjacente posterior é vazia? (!nextNote):`, !nextNote);
                    if (nextNote) {
                        console.log(`Próxima nota é separada? (nextNote.isSeparated):`, nextNote.isSeparated);
                    }
                    console.groupEnd();

                    if (shouldStart) {
                        const attackId = Tone.Transport.schedule(time => {
                            synthRef.current?.triggerAttack(event.noteName, time);
                        }, event.startTime);
                        scheduledEventsRef.current.push(attackId);
                    }

                    if (shouldEnd) {
                        const releaseId = Tone.Transport.schedule(time => {
                            synthRef.current?.triggerRelease(event.noteName, time);
                        }, event.startTime + event.duration);
                        scheduledEventsRef.current.push(releaseId);
                    }
                });
            }

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