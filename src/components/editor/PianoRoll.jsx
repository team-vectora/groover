"use client";
import { useEffect } from "react";
import * as Tone from 'tone';

const PianoRoll = ({
                       synthRef,
                       pages,
                       activePage,
                       activeCol,
                       activeSubIndex,
                       cols,
                       notes,
                       rows,
                       selectedColumn,
                       setSelectedColumn,
                       setPages,
                   }) => {

    const handleDoubleClick = (colIndex) => {
        setSelectedColumn(colIndex === selectedColumn ? null : colIndex);
    };

    const handleSubNoteClick = (e, rowIndex, colIndex, subIndex) => {
        e.stopPropagation();
        setPages((prevPages) => {
            const newPages = JSON.parse(JSON.stringify(prevPages));
            const note = newPages[activePage][colIndex][rowIndex];
            const noteName = notes[rowIndex];
            const subNote = note.subNotes[subIndex];
            if (subNote && subNote.name) {
                subNote.name = null;
            } else {
                note.subNotes[subIndex] = { name: noteName, isSeparated: false };
            }
            return newPages;
        });
        synthRef.current?.triggerAttackRelease(notes[rowIndex], "32n");
    };

    const handleSubNoteRightClick = (e, rowIndex, colIndex, subIndex) => {
        e.preventDefault();
        e.stopPropagation();
        setPages((prevPages) => {
            const newPages = JSON.parse(JSON.stringify(prevPages));
            const subNote = newPages[activePage][colIndex][rowIndex].subNotes[subIndex];
            if (subNote) {
                subNote.isSeparated = !subNote.isSeparated;
            }
            return newPages;
        });
    };

    const tableMaker = () => {
        const currentMatrix = pages?.[activePage];
        if (!currentMatrix) return null;

        return (
            <table className="border-collapse w-max">
                <tbody>
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <tr key={`row-${rowIndex}`} className={`${notes[rowIndex].startsWith("C") && !notes[rowIndex].startsWith("C#") ? 'border-t-2 border-primary' : ''}`}>
                        {Array.from({ length: cols }).map((_, colIndex) => {
                            const note = currentMatrix[colIndex]?.[rowIndex];
                            if (!note || !note.subNotes) {
                                return <td key={`cell-${rowIndex}-${colIndex}`} className="border-t border-bg-darker h-[30px] min-w-[120px] p-0"></td>;
                            }

                            return (
                                <td
                                    key={`cell-${rowIndex}-${colIndex}`}
                                    // FIX (Seleção de Coluna): Adicionando anel de destaque
                                    className={`relative border-t border-bg-darker h-[30px] min-w-[120px] p-0 cursor-pointer 
                                            ${selectedColumn === colIndex ? 'ring-2 ring-accent z-10' : ''}`}
                                    onDoubleClick={() => handleDoubleClick(colIndex)}
                                >
                                    <div className="flex w-full h-full">
                                        {note.subNotes.map((subNote, subIndex) => (
                                            <div
                                                key={`subnote-${rowIndex}-${colIndex}-${subIndex}`}
                                                className={`
                                                        h-full box-border transition-colors duration-100
                                                        border-r border-primary/20
                                                        ${subNote?.name ? 'bg-accent' : 'hover:bg-accent/40'}
                                                        ${activeCol === colIndex && activeSubIndex === subIndex ? 'bg-primary-light animate-pulse' : ''}
                                                        ${subNote?.isSeparated ? 'opacity-70 border-l-2 border-bg-darker' : ''} 
                                                    `}
                                                style={{ width: `${100 / note.subNotes.length}%` }}
                                                onClick={(e) => handleSubNoteClick(e, rowIndex, colIndex, subIndex)}
                                                onContextMenu={(e) => handleSubNoteRightClick(e, rowIndex, colIndex, subIndex)}
                                            />
                                        ))}
                                    </div>
                                </td>
                            );
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
        );
    };

    return <>{tableMaker()}</>;
};

export default PianoRoll;