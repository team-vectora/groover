"use client";
import React from 'react';

const PianoRoll = ({
                       pages,
                       activePage,
                       cols,
                       rows,
                       notes,
                       selectedColumn,
                       activeCol,
                       activeSubIndex,
                       // Handlers recebidos do useEditor
                       handleColumnSelect,
                       handleSubNoteClick,
                       handleSubNoteRightClick,
                   }) => {
    // A renderização é onde aplicamos o Tailwind e os novos handlers
    return (
        <table className="border-collapse w-max">
            <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr
                    key={`row-${rowIndex}`}
                    // Borda divisória para as notas 'C'
                    className={`${notes[rowIndex].startsWith("C") && !notes[rowIndex].startsWith("C#") ? 'border-t-2 border-b-2 border-primary' : ''}`}
                >
                    {Array.from({ length: cols }).map((_, colIndex) => {
                        const note = pages[activePage]?.[colIndex]?.[rowIndex] || { subNotes: [], duration: 1 };
                        const subNotes = note.subNotes || [];
                        const isColumnSelected = selectedColumn === colIndex;

                        return (
                            <td
                                key={`cell-${rowIndex}-${colIndex}`}
                                className={`h-[30px] min-w-[120px] p-0 border-t border-b border-bg-darker transition-transform duration-150 ease-in-out ${isColumnSelected ? 'scale-105 z-10 shadow-lg' : ''}`}
                                onDoubleClick={() => handleColumnSelect(colIndex)}
                            >
                                <div className="flex w-full h-full">
                                    {subNotes.map((subNote, subIndex) => {
                                        const isActive = subNote?.name != null;
                                        const isSeparated = subNote?.isSeparated;
                                        const isPlaybackActive = activeCol === colIndex && activeSubIndex === subIndex;

                                        const subNoteClasses = [
                                            "h-full", "cursor-pointer", "transition-colors",
                                            "duration-100", "ease-in-out", "border-r", "border-primary/20",
                                            isPlaybackActive ? "bg-primary-light animate-pulse" :
                                                isActive ? "bg-accent" : "bg-bg-secondary hover:bg-bg-darker",
                                            isSeparated ? "opacity-70 border-l-2 border-bg-darker" : ""
                                        ].join(" ");

                                        return (
                                            <div
                                                key={`subnote-${rowIndex}-${colIndex}-${subIndex}`}
                                                className={subNoteClasses}
                                                style={{ width: `${100 / (note.duration || 1)}%` }}
                                                onClick={(e) => { e.stopPropagation(); handleSubNoteClick(rowIndex, colIndex, subIndex); }}
                                                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); handleSubNoteRightClick(rowIndex, colIndex, subIndex); }}
                                            />
                                        );
                                    })}
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

export default PianoRoll;