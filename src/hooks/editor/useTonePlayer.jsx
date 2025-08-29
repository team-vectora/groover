// Arquivo: useTonePlayer.js

"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from "tone";
import { ACOUSTIC_INSTRUMENTS, NOTES } from '../../constants';

const instruments = {};
ACOUSTIC_INSTRUMENTS.forEach(name => {
    // A criação do sampler agora retorna o objeto diretamente, sem o .toDestination()
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
    // ✅ 1. Adicionado estado para controlar o carregamento do instrumento
    const [isInstrumentLoading, setIsInstrumentLoading] = useState(true);

    // ✅ 2. O useEffect agora é assíncrono para esperar o instrumento carregar
    useEffect(() => {
        const loadInstrument = async () => {
            try {
                setIsInstrumentLoading(true); // Avisa que o carregamento começou

                // Garante que qualquer instrumento antigo seja liberado da memória
                synthRef.current?.dispose();

                const newSynth = instruments[instrument]();

                // Conecta o sampler ao destino de áudio e ESPERA ele carregar
                await newSynth.toDestination();

                // Apenas depois de carregado, atualizamos o estado
                newSynth.volume.value = volume;
                synthRef.current = newSynth;

            } catch (error) {
                console.error("Erro ao carregar o instrumento:", error);
            } finally {
                setIsInstrumentLoading(false); // Avisa que o carregamento terminou (com sucesso ou erro)
            }
        };

        loadInstrument();

    }, [instrument, volume]); // Roda sempre que o instrumento ou volume mudar

    useEffect(() => {
        Tone.getTransport().bpm.value = bpm;
    }, [bpm]);

    // ✅ 3. Adicionada uma verificação para não tocar se o instrumento estiver carregando
    const playNotePiano = useCallback(async (note) => {
        if (isInstrumentLoading || !synthRef.current) return;
        await Tone.start();
        synthRef.current.triggerAttackRelease(note, "8n");
    }, [isInstrumentLoading]); // Adicionada dependência do estado de loading

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

    const scheduleEventsBasedOnOriginalLogic = (sequence, onScheduleVisuals) => {
        let lastEventTime = 0;

        sequence.forEach(({ matrixIndex, rowIndex, colIndex, subIndex, subNote, startTime, duration }) => {
            lastEventTime = Math.max(lastEventTime, startTime + duration);

            Tone.getTransport().schedule(() => {
                onScheduleVisuals(matrixIndex, colIndex, subIndex);
            }, startTime);

            if (subNote?.name) {
                const currentMatrix = pages[matrixIndex];

                const findNoteAt = (r, c, s) => sequence.find(item => item.rowIndex === r && item.colIndex === c && item.subIndex === s && item.matrixIndex === matrixIndex);

                const prevSubNoteInSameCol = subIndex > 0 ? findNoteAt(rowIndex, colIndex, subIndex - 1) : null;
                const lastSubNoteInPrevCol = colIndex > 0 ? findNoteAt(rowIndex, colIndex - 1, (pages[matrixIndex][colIndex - 1][rowIndex]?.length || 1) - 1) : null;

                const shouldStart = (
                    (colIndex === 0 && subIndex === 0) ||
                    subNote?.isSeparated ||
                    (prevSubNoteInSameCol && !prevSubNoteInSameCol.subNote?.name) ||
                    (lastSubNoteInPrevCol && !lastSubNoteInPrevCol.subNote?.name)
                );

                const nextSubNoteInSameCol = subIndex < (currentMatrix[colIndex][rowIndex]?.length || 1) - 1 ? findNoteAt(rowIndex, colIndex, subIndex + 1) : null;
                const firstSubNoteInNextCol = colIndex < currentMatrix.length - 1 ? findNoteAt(rowIndex, colIndex + 1, 0) : null;

                const shouldEnd = (
                    (colIndex === currentMatrix.length - 1 && subIndex === (currentMatrix[colIndex][rowIndex]?.length || 1) - 1) ||
                    (nextSubNoteInSameCol && !nextSubNoteInSameCol.subNote?.name) ||
                    (firstSubNoteInNextCol && !firstSubNoteInNextCol.subNote?.name) ||
                    (nextSubNoteInSameCol && nextSubNoteInSameCol.subNote?.isSeparated)
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

    // ✅ 4. Adicionada uma verificação para não dar play se o instrumento estiver carregando
    const runPlayback = async (sequence, onVisuals, onEnd) => {
        if (isPlaying || isInstrumentLoading || !synthRef.current) return;
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
            }, (lastEventTime + 0.2) * 1000);

        } catch (error) {
            console.error('Erro na reprodução:', error);
            setIsPlaying(false);
        }
    };

    return {
        synthRef,
        // ✅ 5. Exportado o novo estado para a UI poder utilizá-lo
        playerState: { isPlaying, activeCol, activeSubIndex, instruments, isInstrumentLoading },
        playerActions: { playNotePiano, runPlayback, createPlaybackSequence, setActiveCol, setActiveSubIndex }
    };
};

export default useTonePlayer;