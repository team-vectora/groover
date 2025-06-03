"use client";
import { useEffect } from "react";
import * as Tone from 'tone';

const PianoRoll = ({
                       synthRef,
                       bpm,
                       pages,
                       activePage,
                       activeCol,
                       cols,
                       notes,
                       rows,
                       selectedColumn,
                       setSelectedColumn,
                       setPages,
                       createNote
                   }) => {
    // Debug logging
    console.log('Componente PianoRoll renderizado', { bpm, synthRef, activePage });

    // Helper functions
    const isSelected = (row, col) => {
        if (!pages[activePage] || !pages[activePage][col]) {
            console.warn(`Tentativa de acessar coluna inexistente: ${col}`);
            return false;
        }
        return pages[activePage][col][row] !== null;
    };

    const updateNoteFlags = (note) => {
        const activeSubNotes = note.subNotes.filter(sub => sub !== null);

        if (activeSubNotes.length === 0) {
            note.isStart = false;
            note.isEnd = false;
            return;
        }

        // Encontrar primeiro índice ativo
        const firstActive = note.subNotes.findIndex(sub => sub !== null);
        note.isStart = firstActive === 0;

        // Encontrar último índice ativo
        const lastActive = note.subNotes.length - 1 -
            [...note.subNotes].reverse().findIndex(sub => sub !== null);
        note.isEnd = lastActive === note.subNotes.length - 1;
    };

    // Event handlers
    const handleDoubleClick = (colIndex) => {
        setSelectedColumn(colIndex === selectedColumn ? null : colIndex);
    };

    const handleSubNoteClick = (e, rowIndex, colIndex, subIndex) => {
        e.stopPropagation();

        setPages((prevPages) => {
            const newPages = [...prevPages];
            // Garante que exista a matriz da página ativa
            if (!newPages[activePage]) newPages[activePage] = [];

            // Faz cópia da coluna (immutability)
            const currentMatrix = [...newPages[activePage]];
            if (!currentMatrix[colIndex]) {
                currentMatrix[colIndex] = Array(rows).fill(null);
            } else {
                currentMatrix[colIndex] = [...currentMatrix[colIndex]];
            }

            // Pega a nota (podendo ser null)
            let note = currentMatrix[colIndex][rowIndex];
            const noteName = notes[rowIndex];

            // Função para recalcular flags para cada subNota depois de atualizar
            const recalcFlags = (noteObj) => {
                noteObj.subNotes.forEach((sn, idx) => {
                    if (!sn || !sn.name) {
                        sn.isStart = false;
                        sn.isEnd = false;
                        return;
                    }
                    // Checa subnotas anteriores e posteriores dentro da mesma nota
                    const prevName = noteObj.subNotes[idx - 1]?.name;
                    const nextName = noteObj.subNotes[idx + 1]?.name;

                    // Também checa colunas adjacentes
                    const leftNote = currentMatrix[colIndex - 1]?.[rowIndex];
                    const rightNote = currentMatrix[colIndex + 1]?.[rowIndex];

                    const leftNeighborSame =
                        leftNote && leftNote.subNotes[idx]?.name === sn.name;
                    const rightNeighborSame =
                        rightNote && rightNote.subNotes[idx]?.name === sn.name;

                    // isStart = se não houver subnota igual à esquerda (nem dentro da própria nota, nem coluna adjacente)
                    sn.isStart =
                        !prevName && // coluna atual, subIndex anterior vazio
                        !leftNeighborSame; // coluna -1, mesma linha, mesma subIndex

                    // isEnd = se não houver subnota igual à direita (nem dentro da própria nota, nem coluna adjacente)
                    sn.isEnd =
                        !nextName && // coluna atual, subIndex +1 vazio
                        !rightNeighborSame;

                    // isSeparated permanece o mesmo valor que estava (o booleano não muda aqui)
                    // pois só muda no clique direito
                });
            };

            if (subIndex === -1) {
                // Cria a nota do zero, com duração padrão (ex: 4 subnotas)
                const duration = 4; // ou o valor que fizer sentido para você
                const subNotes = Array.from({ length: duration }, () =>
                    createSubNote(null)
                );
                // Ativa apenas a subnota clicada
                subNotes[subIndex] = createSubNote(noteName);

                // Recomputa flags iniciais para cada subnota
                note = createNote(noteName, duration, subNotes.map((s) => s.name));
                // Mas precisamos copiar as flags manualmente, já que createNote seta isStart/isEnd=false
                // Vamos sobrescrever pelo objeto completo:
                note.subNotes = subNotes;
                recalcFlags(note);
            } else {
                // Se já existe, faz clone para imutabilidade
                note = { ...note, subNotes: [...note.subNotes] };

                // Garante que exista array de subNotes
                if (!note.subNotes || !Array.isArray(note.subNotes)) {
                    note.subNotes = Array.from({ length: note.duration }, () =>
                        createSubNote(null)
                    );
                }

                // Alterna a subnota clicada:
                const targetSub = note.subNotes[subIndex];
                if (targetSub && targetSub.name) {
                    // se já houver nome, "desativa" (passa a null)
                    note.subNotes[subIndex] = createSubNote(null);
                } else {
                    // ativa criando um novo SubNote com o nome
                    const newSub = createSubNote(noteName);
                    note.subNotes[subIndex] = newSub;
                }

                // Recalcula flags em toda a subNotes
                recalcFlags(note);
            }

            // Grava na matriz
            currentMatrix[colIndex][rowIndex] = note;
            newPages[activePage] = currentMatrix;
            return newPages;
        });

        try {
            synthRef.current.triggerAttackRelease(notes[rowIndex], "32n");
        } catch (error) {
            console.error("Erro ao tocar subnota:", error);
        }
    };

    const handleSubNoteRightClick = (e, rowIndex, colIndex, subIndex) => {
        e.preventDefault();
        e.stopPropagation();

        setPages((prevPages) => {
            const newPages = [...prevPages];
            const currentMatrix = [...(newPages[activePage] || [])];
            if (!currentMatrix[colIndex]) return newPages;

            currentMatrix[colIndex] = [...currentMatrix[colIndex]];
            const note = currentMatrix[colIndex][rowIndex];
            if (!note || !note.subNotes) return newPages;

            // Faz clone da nota e da subNotes
            const newNote = {
                ...note,
                subNotes: [...note.subNotes],
            };

            const targetSub = newNote.subNotes[subIndex];
            if (!targetSub || !targetSub.name) return newPages; // nada a fazer se estiver vazia

            // Clona o objeto SubNote e inverte isSeparated
            newNote.subNotes[subIndex] = {
                ...targetSub,
                isSeparated: !targetSub.isSeparated,
            };

            // Recalcula isStart/isEnd também, caso faça sentido revalidar:
            // (você pode reaproveitar a recalcFlags criada acima, adaptando para este escopo)

            currentMatrix[colIndex][rowIndex] = newNote;
            newPages[activePage] = currentMatrix;
            return newPages;
        });
    };

    const renderSubNotes = (note, rowIndex, colIndex) => {
        if (!note || !note.subNotes || !Array.isArray(note.subNotes)) return null;
        return (
            <div className="subnotes-container" style={{ display: 'flex', height: '100%' }}>
                {note.subNotes.map((subNote, subIndex) => {
                    const isActive = subNote && (subNote.name != null);
                    const isSeparated = subNote && subNote.isSeparated;

                    return (
                        <div
                            key={`subnote-${rowIndex}-${colIndex}-${subIndex}`}
                            className={`subnote ${isActive ? 'active' : ''} ${isSeparated ? 'separated' : ''} ${isActive ? 'selected' : ''}`}
                            style={{
                                width: `${100 / note.subNotes.length}%`,
                                height: '100%',
                                boxSizing: 'border-box',
                                margin: isSeparated ? '1px' : '0px',
                            }}
                            onClick={(e) => handleSubNoteClick(e, rowIndex, colIndex, subIndex)}
                            onContextMenu={(e) => handleSubNoteRightClick(e, rowIndex, colIndex, subIndex)}
                        ></div>
                    );
                })}
            </div>
        );
    };

    const tableMaker = () => (
        <table className="piano-roll-grid">
            <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                    {Array.from({ length: cols }).map((_, colIndex) => {
                        const note = pages[activePage]?.[colIndex]?.[rowIndex];
                        return (
                            <td
                                key={`cell-${rowIndex}-${colIndex}`}
                                className={`
                                    piano-roll-cell
                                    ${note ? 'selected' : ''}
                                    ${activeCol === colIndex ? 'active-col' : ''}
                                    ${selectedColumn === colIndex ? 'selected-column' : ''}
                                `}
                                onDoubleClick={() => handleDoubleClick(colIndex)}
                            >
                                <b>{notes[rowIndex]}</b>
                                <div className="subnotes-container">
                                    {note ? (
                                        note.subNotes.map((subNote, subIndex) => (
                                            <div
                                                key={`subnote-${rowIndex}-${colIndex}-${subIndex}`}
                                                className={`subnote-${subNote ? 'active' : ''}`}
                                                style={`{ width: ${100 / note.subNotes.length}% }`}
                                                onClick={(e) => {
                                                    handleSubNoteClick(e, rowIndex, colIndex, subIndex);
                                                }}
                                                onContextMenu={(e) => handleSubNoteRightClick(e, rowIndex, colIndex, subIndex)}
                                            />
                                        ))
                                    ) : (
                                        <div
                                            className="subnote"
                                            style={{ width: '100%' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSubNoteClick(e, rowIndex, colIndex, -1);
                                            }}
                                        />
                                    )}
                                </div>
                            </td>
                        );
                    })}
                </tr>
            ))}
            </tbody>
        </table>
    );

    // Effects
    useEffect(() => {
        return () => {
            try {
                Tone.getTransport().cancel();
                Tone.getTransport().stop();
            } catch (error) {
                console.error('Erro na limpeza:', error);
            }
        };
    }, []);

    // Main render
    return (
        <>
            {tableMaker()}
        </>
    );
};

export default PianoRoll;