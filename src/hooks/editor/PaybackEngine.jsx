import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

export default function PlaybackEngine({
                                           instruments,
                                           notes,
                                           pages,
                                           setActiveCol,
                                           setActiveSubIndex,
                                           setMatrixNotes,
                                           setActivePage,
                                           setIsPlaying
                                       }) {
    const synthRef = useRef(null);
    const [isPlaying, setIsPlayingLocal] = useState(false);

    useEffect(() => {
        setIsPlaying(isPlayingLocal);
    }, [isPlayingLocal, setIsPlaying]);

    const playNotePiano = (note) => {
        if (!synthRef.current) return;
        synthRef.current.triggerAttackRelease(note, "8n");
    };

    const playSelectedNotesActivePage = async (n) => {
        await playSong(n);
    };

    const playSong = async (page = -1) => {
        if (isPlaying) {
            console.warn('Playback já em execução.');
            return;
        }

        setIsPlaying(true);
        setActivePage(page === -1 ? 0 : page);
        setMatrixNotes(pages[page === -1 ? 0 : page]);

        const activeNotes = new Map();
        let lastEventTime = 0;

        try {
            Tone.getTransport().bpm.value = bpm;
            Tone.getTransport().cancel();

            // Lineariza todas as subnotas em uma sequência temporal
            const allSubNotes = [];
            let currentTime = 0;
            let currentMatrix = pages[0];

            // 1. Primeira passada: calcular durações e coletar todas as subnotas
            for (let matrixIndex= 0; matrixIndex < pages.length; matrixIndex++) {
                let currentMatrix = pages[matrixIndex];

                currentMatrix.forEach((col , colIndex) => {
                    const colDuration=Tone.Time("4n").toSeconds(); // Duração fixa por coluna
                    const subNotesCount=Math.max(...col.map(note => note?.subNotes?.length || 1));
                    const subDuration=colDuration / subNotesCount;

                    col.forEach((note , rowIndex) => {
                        const effectiveSubNotes=note?.subNotes || [ createSubNote() ];

                        effectiveSubNotes.forEach((subNote , subIndex) => {
                            const startTime=currentTime+(subIndex * subDuration);
                            allSubNotes.push({
                                matrixIndex ,
                                rowIndex ,
                                colIndex ,
                                subIndex ,
                                subNote ,
                                startTime ,
                                duration: subDuration ,
                                noteName: notes[rowIndex]
                            });
                        });
                    });

                    currentTime+=colDuration;
                });

            }

            // 2. Segunda passada: agendar eventos
            allSubNotes.forEach(({ matrixIndex, rowIndex, colIndex, subIndex, subNote, startTime, duration, noteName }) => {
                const noteKey = `${rowIndex}-${colIndex}-${subIndex}`;
                currentMatrix = pages[matrixIndex];

                lastEventTime = Math.max(lastEventTime, startTime + duration);

                // Agendar highlight (para TODAS as subnotas, inclusive vazias)
                Tone.getTransport().schedule(() => {
                    setActiveCol(colIndex);
                    setActiveSubIndex(subIndex);

                    setActivePage(matrixIndex);
                    setMatrixNotes(pages[matrixIndex]);
                }, startTime);

                // Lógica de reprodução apenas para subnotas com nome
                if (subNote?.name) {
                    // Verificar se precisa iniciar nova nota
                    const shouldStart = (
                        // É a primeira subnota da primeira coluna
                        (colIndex === 0 && subIndex === 0) ||
                        // Está marcada como separada
                        subNote.isSeparated ||
                        // Subnota anterior na mesma coluna está vazia ou é diferente
                        (subIndex > 0 && (
                                !allSubNotes.find(s =>
                                    s.rowIndex === rowIndex &&
                                    s.colIndex === colIndex &&
                                    s.subIndex === subIndex - 1
                                )?.subNote?.name ||
                                allSubNotes.find(s =>
                                    s.rowIndex === rowIndex &&
                                    s.colIndex === colIndex &&
                                    s.subIndex === subIndex - 1
                                )?.subNote?.name !== subNote.name
                            ) ||
                            // Última subnota da coluna anterior está vazia ou é diferente
                            (colIndex > 0 && (
                                    !allSubNotes.find(s =>
                                        s.rowIndex === rowIndex &&
                                        s.colIndex === colIndex - 1 &&
                                        s.subIndex === (currentMatrix[colIndex - 1][rowIndex]?.subNotes?.length || 1) - 1
                                    )?.subNote?.name ||
                                    allSubNotes.find(s =>
                                        s.rowIndex === rowIndex &&
                                        s.colIndex === colIndex - 1 &&
                                        s.subIndex === (currentMatrix[colIndex - 1][rowIndex]?.subNotes?.length || 1) - 1
                                    )?.subNote?.name !== subNote.name
                                )
                            )
                        )
                    );

                    // Verificar se precisa terminar a nota
                    const shouldEnd = (
                        // É a última subnota da última coluna
                        (colIndex === currentMatrix.length - 1 && subIndex === (currentMatrix[colIndex][rowIndex]?.subNotes?.length || 1) - 1) ||
                        // Está marcada como separada
                        subNote.isSeparated ||
                        // Próxima subnota na mesma coluna está vazia ou é diferente
                        (subIndex < (currentMatrix[colIndex][rowIndex]?.subNotes?.length || 1) - 1 && (
                                !allSubNotes.find(s =>
                                    s.rowIndex === rowIndex &&
                                    s.colIndex === colIndex &&
                                    s.subIndex === subIndex + 1
                                )?.subNote?.name ||
                                allSubNotes.find(s =>
                                    s.rowIndex === rowIndex &&
                                    s.colIndex === colIndex &&
                                    s.subIndex === subIndex + 1
                                )?.subNote?.name !== subNote.name
                            ) ||
                            // Primeira subnota da próxima coluna está vazia ou é diferente
                            (colIndex < currentMatrix.length - 1 && (
                                    !allSubNotes.find(s =>
                                        s.rowIndex === rowIndex &&
                                        s.colIndex === colIndex + 1 &&
                                        s.subIndex === 0
                                    )?.subNote?.name ||
                                    allSubNotes.find(s =>
                                        s.rowIndex === rowIndex &&
                                        s.colIndex === colIndex + 1 &&
                                        s.subIndex === 0
                                    )?.subNote?.name !== subNote.name
                                )
                            )
                        )
                    );

                    if (shouldStart) {
                        Tone.getTransport().schedule((time) => {
                            synthRef.current?.triggerAttack(subNote.name, time);
                            activeNotes.set(noteKey, { note: subNote.name, time });
                        }, startTime);
                    }

                    if (shouldEnd) {
                        Tone.getTransport().schedule((time) => {
                            synthRef.current?.triggerRelease(subNote.name, time);
                            activeNotes.delete(noteKey);
                        }, startTime + duration);
                    }
                }
            });

            await Tone.start();
            Tone.getTransport().start();

            await new Promise(resolve => {
                setTimeout(() => {
                    Tone.getTransport().stop();
                    synthRef.current?.releaseAll?.();
                    setIsPlaying(false);
                    setActiveCol(null);
                    setActiveSubIndex(null);
                    resolve();
                }, (lastEventTime + 0.1) * 1000);
            });

        } catch (error) {
            console.error('Erro na reprodução:', error);
            Tone.getTransport().stop();
            synthRef.current?.releaseAll?.();
            setIsPlaying(false);
        }

        setIsPlaying(false);
    };

    return {
        synthRef,
        isPlaying,
        playNotePiano,
        playSelectedNotesActivePage,
        playSong
    };
}
