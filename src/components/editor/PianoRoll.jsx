"use client";
import { useEffect } from "react";
import * as Tone from 'tone';

const PianoRoll = ({
                       synthRef,
                       pages,
                       activePage,
                       activeCol,
                       activeSubIndex,
                       notes,
                       rows,
                       selectedColumn,
                       setSelectedColumn,
                       setPages,
                       isCurrentUserProject,
                   }) => {

    const handleDoubleClick = (colIndex) => {
        if (!isCurrentUserProject) return;
        setSelectedColumn(colIndex === selectedColumn ? null : colIndex);
    };

    // ✅ ATUALIZADO: Manipula a criação e remoção de sub-notas na nova estrutura
    const handleSubNoteClick = (e, rowIndex, colIndex, subIndex) => {
        if (!isCurrentUserProject) return;
        e.stopPropagation();
        setPages((prevPages) => {
            const newPages = JSON.parse(JSON.stringify(prevPages));
            const noteArray = newPages[activePage][colIndex][rowIndex];
            const noteName = notes[rowIndex];
            const subNote = noteArray[subIndex];

            if (subNote?.name) {
                noteArray[subIndex] = null; // Transforma o objeto em null
            } else {
                noteArray[subIndex] = { name: noteName, isSeparated: false }; // Cria o objeto
            }
            return newPages;
        });
        synthRef.current?.triggerAttackRelease(notes[rowIndex], "32n");
    };

    // ✅ ATUALIZADO: Manipula a propriedade 'isSeparated'
    const handleSubNoteRightClick = (e, rowIndex, colIndex, subIndex) => {
        if (!isCurrentUserProject) return;
        e.preventDefault();
        e.stopPropagation();
        setPages((prevPages) => {
            const newPages = JSON.parse(JSON.stringify(prevPages));
            const subNote = newPages[activePage][colIndex][rowIndex][subIndex];
            // Só funciona se a sub-nota já existir (não for nula)
            if (subNote) {
                subNote.isSeparated = !subNote.isSeparated;
            }
            return newPages;
        });
    };

    // ✅ ATUALIZADO: Renderiza a UI com base na nova estrutura
    const tableMaker = () => {
        const currentMatrix = pages?.[activePage];
        if (!currentMatrix) return null;

        return (
            <table className="border-collapse w-full table-fixed ">
                <tbody>
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <tr key={`row-${rowIndex}`} className={`${notes[rowIndex].startsWith("C") && !notes[rowIndex].startsWith("C#") ? 'bg-primary/10' : ''}`}>
                        {Array.from({ length: 10 }).map((_, colIndex) => {
                            const note = currentMatrix[colIndex]?.[rowIndex];
                            if (!note) {
                                return <td key={`cell-${rowIndex}-${colIndex}`} className="border-t border-bg-darker h-[30px] p-0"></td>;
                            }

                            return (
                                <td
                                    key={`cell-${rowIndex}-${colIndex}`}
                                    className={`relative border-t border-bg-darker h-[30px] p-0
                                            ${isCurrentUserProject ? 'cursor-pointer' : 'cursor-not-allowed'} // ✅ Cursor atualizado
                                            ${selectedColumn === colIndex ? 'ring-2 ring-accent z-10' : ''}`}
                                    onDoubleClick={() => handleDoubleClick(colIndex)}
                                >
                                    <div className="flex w-full h-full">
                                        {note.map((subNote, subIndex) => (
                                            <div
                                                key={`subnote-${rowIndex}-${colIndex}-${subIndex}`}
                                                className={`
                                                        h-full box-border transition-colors duration-100
                                                        border-r border-primary/20
                                                        ${subNote?.name ? 'bg-accent' : (isCurrentUserProject ? 'hover:bg-accent/40' : '')} // ✅ Hover atualizado
                                                        ${activeCol === colIndex && activeSubIndex === subIndex ? 'bg-primary-light animate-pulse' : ''}
                                                        ${subNote?.isSeparated ? 'opacity-70 border-l-2 border-bg-darker' : ''} 
                                                    `}
                                                style={{ width: `${100 / note.length}%` }}
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