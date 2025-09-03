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

    // ✅ CORRIGIDO: Agora cria uma linha do tempo contínua a partir de todas as páginas.
    const createPlaybackSequence = (targetPages) => {
        const allSubNotes = [];
        let currentTime = 0;
        let globalColIndex = 0; // Índice de coluna global para rastreamento contínuo.

        targetPages.forEach((matrix, matrixIndex) => {
            matrix.forEach((col, colIndexInPage) => {
                const colDuration = Tone.Time("4n").toSeconds();
                const subNotesCount = Math.max(1, ...col.map(note => note?.length || 1));
                const subDuration = colDuration / subNotesCount;

                col.forEach((note, rowIndex) => {
                    (note || []).forEach((subNote, subIndex) => {
                        if (subNote?.name) { // Só adiciona eventos que têm notas
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
                                globalColIndex, // Armazena o índice global
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
        if (isInstrumentLoading || !synthRef.current) return; // Removido sequence.length === 0 para permitir play em projetos vazios

        await Tone.start();
        const state = Tone.Transport.state;

        if (state === 'stopped') {
            scheduledEventsRef.current.forEach(id => Tone.Transport.clear(id));
            scheduledEventsRef.current = [];

            let lastEventTime = 0;

            // ✅ CORREÇÃO: Lógica de agendamento VISUAL separada.
            // Este loop garante que TODAS as colunas (incluindo as vazias) recebam o callback visual.
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
            lastEventTime = currentTime; // O tempo final da música é o tempo total das colunas
            // --- FIM DA LÓGICA VISUAL ---


            // Lógica de agendamento de ÁUDIO (permanece a mesma, mas sem o visual)
            if (sequence.length > 0) {
                const processedSequence = sequence.map((currentEvent, index, arr) => {
                    const prevEvent = arr[index - 1];
                    const nextEvent = arr[index + 1];

                    // --- CONDIÇÕES PARA INICIAR UMA NOTA (shouldStart) ---
                    const isSeparated = currentEvent.subNote.isSeparated;
                    const isFirstNote = !prevEvent;
                    const isDifferentRow = prevEvent && prevEvent.rowIndex !== currentEvent.rowIndex;
                    const hasSilenceBefore = prevEvent && (prevEvent.globalColIndex === currentEvent.globalColIndex && prevEvent.subIndex !== currentEvent.subIndex - 1);

                    const shouldStart = isSeparated || isFirstNote || isDifferentRow || hasSilenceBefore;

                    // --- CONDIÇÕES PARA PARAR UMA NOTA (shouldEnd) ---
                    const isLastNote = !nextEvent;
                    const nextIsSeparated = nextEvent && nextEvent.subNote.isSeparated;
                    const nextIsDifferentRow = nextEvent && nextEvent.rowIndex !== currentEvent.rowIndex;
                    const hasSilenceAfter = nextEvent && (nextEvent.globalColIndex === currentEvent.globalColIndex && nextEvent.subIndex !== currentEvent.subIndex + 1);

                    const shouldEnd = isLastNote || nextIsSeparated || nextIsDifferentRow || hasSilenceAfter;

                    // --- LOG DETALHADO ---
                    console.group(`Nota: ${currentEvent.noteName} (Col: ${currentEvent.globalColIndex}, Sub: ${currentEvent.subIndex})`);

                    console.log(`%c--- Verificando shouldStart: ${shouldStart} ---`, 'color: skyblue');
                    console.log(`É uma nota separada? (isSeparated):`, isSeparated);
                    console.log(`É a primeira nota da sequência? (isFirstNote):`, isFirstNote);
                    console.log(`A nota anterior é de outra linha? (isDifferentRow):`, isDifferentRow);
                    console.log(`Existe um silêncio antes? (hasSilenceBefore):`, hasSilenceBefore);

                    console.log(`%c--- Verificando shouldEnd: ${shouldEnd} ---`, 'color: lightgreen');
                    console.log(`É a última nota da sequência? (isLastNote):`, isLastNote);
                    console.log(`A próxima nota é separada? (nextIsSeparated):`, nextIsSeparated);
                    console.log(`A próxima nota é de outra linha? (nextIsDifferentRow):`, nextIsDifferentRow);
                    console.log(`Existe um silêncio depois? (hasSilenceAfter):`, hasSilenceAfter);

                    console.groupEnd();


                    return { ...currentEvent, shouldStart, shouldEnd };
                });

                processedSequence.forEach((event) => {
                    const { subNote, startTime, duration, noteName, shouldStart, shouldEnd } = event;

                    // O agendamento visual foi removido daqui

                    if (shouldStart) {
                        const attackId = Tone.Transport.schedule(time => {
                            synthRef.current?.triggerAttack(noteName, time);
                        }, startTime);
                        scheduledEventsRef.current.push(attackId);
                    }

                    if (shouldEnd) {
                        const releaseId = Tone.Transport.schedule(time => {
                            synthRef.current?.triggerRelease(noteName, time);
                        }, startTime + duration);
                        scheduledEventsRef.current.push(releaseId);
                    }
                });
            }
            // --- FIM DA LÓGICA DE ÁUDIO ---

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