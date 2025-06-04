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
                       createSubNote
                   }) => {
    // Debug logging
    console.log('Componente PianoRoll renderizado', { bpm, synthRef, activePage });

    // Event handlers
    const handleDoubleClick = (colIndex) => {
        setSelectedColumn(colIndex === selectedColumn ? null : colIndex);

        console.log(`Coluna Selecionada: ${selectedColumn}`)
    };

    const handleSubNoteClick = (e, rowIndex, colIndex, subIndex) => {
        console.log("📄 Página ativa antes da atualização:", pages[activePage]);
        console.log("🎯 Clique em subnota:", { rowIndex, colIndex, subIndex });
        e.stopPropagation();

        setPages((prevPages) => {
            console.log("📘 Estado anterior (prevPages):", prevPages);

            const newPages = [...prevPages];
            const currentMatrix = [...newPages[activePage]];
            const currentColumn = currentMatrix[colIndex] ? [...currentMatrix[colIndex]] : Array(rows).fill(null);

            console.log("📐 Matriz da página ativa antes da modificação:", currentMatrix);

            let note = currentMatrix[colIndex][rowIndex];
            console.log("🎵 Nota original:", note);

            note = { ...note };
            const noteName = notes[rowIndex];
            console.log("🔠 Nome da nota:", noteName);

            if (!note.subNotes || !Array.isArray(note.subNotes)) {
                console.log("🆕 Subnotas ainda não existem. Criando novas...");
                note.subNotes = Array.from({ length: note.duration }, () => createSubNote());
            } else {
                console.log("📋 Subnotas existentes detectadas. Fazendo cópia...");
                note.subNotes = [...note.subNotes];
            }

            if (note.subNotes[subIndex] && note.subNotes[subIndex].name) {
                console.log("🗑️ Subnota existente detectada. Removendo:", note.subNotes[subIndex]);
                note.subNotes[subIndex] = createSubNote();
            } else {
                console.log("✅ Ativando nova subnota:", noteName);
                note.subNotes[subIndex] = createSubNote(noteName);
            }

            console.log("📝 Nota modificada:", note);
            currentColumn[rowIndex] = note;
            currentMatrix[colIndex] = currentColumn;
            newPages[activePage] = currentMatrix;

            console.log("📄 Página ativa após modificação:", newPages[activePage]);
            return newPages;
        });

        // Toca o som da nota da linha clicada
        try {
            console.log("🔊 Tocando nota:", notes[rowIndex]);
            synthRef.current.triggerAttackRelease(notes[rowIndex], "32n");
        } catch (error) {
            console.error("🚨 Erro ao tocar subnota:", error);
        }
    };


    const handleSubNoteRightClick = (e, rowIndex, colIndex, subIndex) => {
        e.preventDefault();
        e.stopPropagation();

        setPages((prevPages) => {
            const newPages = [...prevPages];
            const currentMatrix = [...newPages[activePage]];

            let note = currentMatrix[colIndex][rowIndex];

            if (!note) return prevPages;  // Proteção contra undefined
            note = { ...note };
            note.subNotes = note.subNotes ? [...note.subNotes] : [];

            const oldSubNote = note.subNotes[subIndex];
            if (!oldSubNote || !oldSubNote.name) note.subNotes[subIndex] = createSubNote(note);;

            const newSubNote = { ...oldSubNote, isSeparated: !oldSubNote.isSeparated };
            note.subNotes[subIndex] = newSubNote;

            currentMatrix[colIndex][rowIndex] = note;
            newPages[activePage] = currentMatrix;

            return newPages;
        });

        // Toca o som da nota da linha clicada
        try {
            synthRef.current.triggerAttackRelease(notes[rowIndex], "32n");
        } catch (error) {
            console.error("Erro ao tocar subnota:", error);
        }
    };


    const tableMaker = () => (
        <table className="piano-roll-grid">
            <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={`row-${rowIndex}`} className={`${notes[rowIndex].startsWith("C") && !notes[rowIndex].startsWith("C#") ? 'division' : ''}`}>
                    {Array.from({ length: cols }).map((_, colIndex) => {
                        const note = pages[activePage][colIndex][rowIndex];

                        return (
                            <td
                                key={`cell-${rowIndex}-${colIndex}`}
                                className={`piano-roll-cell td-div ${selectedColumn === colIndex ? 'selected-column' : ''}`}
                            >
                                <div className="subnote-container">
                                    {note.subNotes.map((subNote, subIndex) => {
                                        const isActive = subNote && subNote.name != null;
                                        const isSeparated = subNote && subNote.isSeparated;
                                        return (
                                        <div
                                            key={`subnote-${rowIndex}-${colIndex}-${subIndex}`}
                                            className={`
                                                  subnote-cell 
                                                  ${isActive ? 'selected' : ''} 
                                                  ${isSeparated ? 'separated' : ''} 
                                                  ${activeCol === colIndex ? 'active-col' : ''}
                                                `}
                                            style={{
                                                width: `${100 / note.duration}%`,
                                                height: '100%',
                                            }}
                                            onDoubleClick={() => handleDoubleClick(colIndex)}
                                            onClick={(e) => handleSubNoteClick(e, rowIndex, colIndex, subIndex)}
                                            onContextMenu={(e) => handleSubNoteRightClick(e, rowIndex, colIndex, subIndex)}
                                        />
                                    )})}
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