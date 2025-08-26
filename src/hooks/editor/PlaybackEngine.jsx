import { useRef, useEffect } from "react";
import * as Tone from "tone";

const startAudioContext = async () => {
    if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log('Audio context started!');
    }
};

export default function PlaybackEngine({
                                           isPlaying, setIsPlaying, bpm, pages, notes, instrument,
                                           instruments, volume, setActiveCol, setActiveSubIndex,
                                           setActivePage, createSubNote,
                                       }) {
    const synthRef = useRef(null);

    // Efeito para inicializar e atualizar o sintetizador
    useEffect(() => {
        if (synthRef.current) {
            synthRef.current.dispose();
        }
        if (instrument && instruments[instrument]) {
            synthRef.current = instruments[instrument]().toDestination();
            synthRef.current.volume.value = volume;
        }
        return () => {
            synthRef.current?.dispose();
        };
    }, [instrument]);

    // Efeito para atualizar o volume
    useEffect(() => {
        if (synthRef.current) {
            synthRef.current.volume.value = volume;
        }
    }, [volume]);

    // Efeito para limpar o transporte do Tone.js quando o componente for desmontado
    useEffect(() => {
        return () => {
            Tone.Transport.stop();
            Tone.Transport.cancel();
        };
    }, []);

    const stopPlayback = () => {
        if (isPlaying) {
            Tone.Transport.stop();
            Tone.Transport.cancel();
            synthRef.current?.releaseAll();
            setIsPlaying(false);
            setActiveCol(null);
            setActiveSubIndex(null);
        }
    };

    const playNotePiano = async (note) => {
        await startAudioContext(); // Garante que o áudio está pronto
        if (!synthRef.current) return;
        // Adiciona um callback para tocar a nota somente quando os samples estiverem carregados
        synthRef.current.triggerAttackRelease(note, "8n");
    };

    const _play = async ({ startPage, isSong }) => {
        await startAudioContext(); // Garante que o áudio está pronto
        if (isPlaying || !pages || pages.length === 0) {
            console.warn('Playback já em execução ou sem páginas para tocar.');
            return;
        }

        setIsPlaying(true);
        await Tone.start();
        Tone.Transport.bpm.value = bpm;
        Tone.Transport.cancel();

        const allSubNotes = [];
        let currentTime = 0;
        const pagesToPlay = isSong ? pages : [pages[startPage]];

        // 1. Primeira passada: Linearizar todas as subnotas em uma sequência temporal
        pagesToPlay.forEach((currentMatrix, matrixIndexOffset) => {
            const matrixIndex = isSong ? matrixIndexOffset : startPage;

            currentMatrix.forEach((col, colIndex) => {
                const colDuration = Tone.Time("4n").toSeconds();
                const subNotesCount = Math.max(...col.map(note => note?.subNotes?.length || 1));
                const subDuration = colDuration / subNotesCount;

                col.forEach((note, rowIndex) => {
                    const effectiveSubNotes = note?.subNotes || [createSubNote()];
                    effectiveSubNotes.forEach((subNote, subIndex) => {
                        allSubNotes.push({
                            matrixIndex, rowIndex, colIndex, subIndex, subNote,
                            startTime: currentTime + (subIndex * subDuration),
                            duration: subDuration,
                            noteName: notes[rowIndex]
                        });
                    });
                });
                currentTime += colDuration;
            });
        });

        // 2. Segunda passada: Agendar eventos no Tone.js
        allSubNotes.forEach(({ matrixIndex, rowIndex, colIndex, subIndex, subNote, startTime, duration, noteName }) => {
            const currentMatrix = pages[matrixIndex];

            // Agendamento da UI
            Tone.Transport.schedule((time) => {
                Tone.Draw.schedule(() => {
                    setActivePage(matrixIndex);
                    setActiveCol(colIndex);
                    setActiveSubIndex(subIndex);
                }, time);
            }, startTime);

            // Lógica de reprodução (portada do original)
            if (subNote?.name) {
                const getSubNote = (m, c, r, s) => pages[m]?.[c]?.[r]?.subNotes?.[s];

                const prevSubNoteInCol = subIndex > 0 ? getSubNote(matrixIndex, colIndex, rowIndex, subIndex - 1) : null;
                const prevNoteLastSubIndex = colIndex > 0 ? (pages[matrixIndex]?.[colIndex - 1]?.[rowIndex]?.subNotes?.length || 1) - 1 : -1;
                const prevSubNoteInPrevCol = colIndex > 0 ? getSubNote(matrixIndex, colIndex - 1, rowIndex, prevNoteLastSubIndex) : null;

                const nextSubNoteInCol = subIndex < (currentMatrix[colIndex][rowIndex]?.subNotes?.length || 1) - 1 ? getSubNote(matrixIndex, colIndex, rowIndex, subIndex + 1) : null;
                const nextSubNoteInNextCol = colIndex < currentMatrix.length - 1 ? getSubNote(matrixIndex, colIndex + 1, rowIndex, 0) : null;

                const shouldStart = subNote.isSeparated ||
                    !prevSubNoteInCol?.name ||
                    prevSubNoteInCol?.name !== subNote.name ||
                    (subIndex === 0 && (!prevSubNoteInPrevCol?.name || prevSubNoteInPrevCol?.name !== subNote.name));

                const shouldEnd = subNote.isSeparated ||
                    !nextSubNoteInCol?.name ||
                    nextSubNoteInCol?.name !== subNote.name ||
                    (nextSubNoteInCol === null && (!nextSubNoteInNextCol?.name || nextSubNoteInNextCol?.name !== subNote.name));

                if (shouldStart) {
                    synthRef.current?.triggerAttack(subNote.name, startTime);
                }
                if (shouldEnd) {
                    synthRef.current?.triggerRelease(subNote.name, startTime + duration);
                }
            }
        });

        Tone.Transport.scheduleOnce(() => stopPlayback(), currentTime + 0.1);
        Tone.Transport.start();
    };

    const playSong = () => {
        _play({ startPage: 0, isSong: true });
    };

    const playSelectedNotesActivePage = (pageIndex) => {
        if (pageIndex >= 0 && pageIndex < pages.length) {
            _play({ startPage: pageIndex, isSong: false });
        }
    };

    return {
        synthRef,
        playNotePiano,
        playSong,
        playSelectedNotesActivePage,
        stopPlayback,
    };
}