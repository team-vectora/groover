// src/components/editor/PianoRoll.jsx
"use client";
import { useRef, useState, useCallback } from "react";
import { NOTES, ROWS } from '../../constants';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Playhead from './Playhead';

const TICKS_PER_PATTERN = 32;
const ROW_HEIGHT_PX = 30;
const TOTAL_HEIGHT_PX = ROWS * ROW_HEIGHT_PX;

const PianoRoll = ({
                       patternNotes, onNotesChange, isCurrentUserProject,
                       activeInstrument, playNote, playheadPositionInTicks,
                       songStructure, activePatternId
                   }) => {
    const { t } = useTranslation();
    const [dragging, setDragging] = useState(null);
    const svgRef = useRef(null);

    const isOverlapping = (noteA, noteB) => {
        return noteA.pitch === noteB.pitch && noteA.start < noteB.end && noteA.end > noteB.start;
    };

    // Função para obter coordenadas PRECISAS (para arrastar e redimensionar)
    const getCoordsFromEvent = (e, snapToColumn = false) => {
        if (!svgRef.current) return { tick: 0, pitch: 0 };
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const tickWidth = rect.width / TICKS_PER_PATTERN;
        const pitchHeight = TOTAL_HEIGHT_PX / ROWS;

        let tick = Math.max(0, Math.floor(x / tickWidth));

        // ✅ LÓGICA DE SNAPPING CONDICIONAL
        if (snapToColumn) {
            tick = Math.floor(tick / 4) * 4;
        }

        const pitch = Math.max(0, Math.min(ROWS - 1, Math.floor(y / pitchHeight)));
        return { tick: Math.max(0, tick), pitch };
    };

    const findNoteAt = (tick, pitch) => (patternNotes || []).find(note =>
        note.pitch === pitch && tick >= note.start && tick < note.end
    );

    const handleMouseDown = (e) => {
        if (!isCurrentUserProject) return;
        e.preventDefault();

        // Para arrastar e encontrar notas, usamos a posição precisa
        const preciseCoords = getCoordsFromEvent(e, false);
        const noteAtCursor = findNoteAt(preciseCoords.tick, preciseCoords.pitch);

        if (e.button === 2 && noteAtCursor) {
            onNotesChange(patternNotes.filter(n => n.id !== noteAtCursor.id));
            return;
        }

        if (noteAtCursor) {
            // Se já existe uma nota, preparamos para arrastar ou redimensionar
            const rect = svgRef.current.getBoundingClientRect();
            const tickWidth = rect.width / TICKS_PER_PATTERN;
            const noteEndX = (noteAtCursor.end * tickWidth) + rect.left;
            if (Math.abs(e.clientX - noteEndX) < 10) {
                setDragging({ type: 'resize_end', noteId: noteAtCursor.id });
            } else {
                setDragging({ type: 'move', noteId: noteAtCursor.id, tickOffset: preciseCoords.tick - noteAtCursor.start, pitchOffset: preciseCoords.pitch - noteAtCursor.pitch });
            }
        } else {
            // ✅ CRIAÇÃO DE NOTA: Usamos a coordenada com o snap ativado
            const snappedCoords = getCoordsFromEvent(e, true);

            const newNote = {
                id: Date.now() + Math.random(),
                pitch: snappedCoords.pitch,
                start: snappedCoords.tick,
                end: snappedCoords.tick + 4, // Duração padrão
                pins: [{ time: 0, interval: 0, size: 3 }, { time: 4, interval: 0, size: 3 }]
            };

            const overlaps = (patternNotes || []).some(note => isOverlapping(newNote, note));
            if (overlaps) {
                toast.error(t('editor.pianoRoll.noteOverlapError'));
                return;
            }

            onNotesChange([...(patternNotes || []), newNote]);
            playNote(NOTES[snappedCoords.pitch], activeInstrument);
            // Prepara para redimensionar a nova nota
            setDragging({ type: 'resize_end', noteId: newNote.id });
        }
    };

    const handleMouseMove = useCallback((e) => {
        if (!dragging || !patternNotes) return;
        e.preventDefault();

        // No movimento, usamos sempre as coordenadas precisas
        const { tick, pitch } = getCoordsFromEvent(e, false);

        const newNotes = [...patternNotes];
        const noteIndex = newNotes.findIndex(n => n.id === dragging.noteId);
        if (noteIndex === -1) return;

        const originalNote = newNotes[noteIndex];
        const updatedNote = { ...originalNote };
        const otherNotes = newNotes.filter(n => n.id !== dragging.noteId);

        if (dragging.type === 'move') {
            const duration = updatedNote.end - updatedNote.start;
            // O cálculo agora permite o arrasto para qualquer subdivisão
            updatedNote.start = Math.max(0, tick - dragging.tickOffset);
            updatedNote.end = updatedNote.start + duration;
            updatedNote.pitch = Math.max(0, Math.min(ROWS - 1, pitch - dragging.pitchOffset));
        } else if (dragging.type === 'resize_end') {
            // O redimensionamento já era preciso
            const newEnd = Math.max(updatedNote.start + 1, tick + 1);
            updatedNote.end = Math.min(newEnd, updatedNote.start + TICKS_PER_PATTERN);
        }

        const overlaps = otherNotes.some(note => isOverlapping(updatedNote, note));
        if (!overlaps) {
            newNotes[noteIndex] = updatedNote;
            onNotesChange(newNotes);
        }
    }, [dragging, patternNotes, onNotesChange]);

    const handleMouseUp = () => setDragging(null);

    const currentBarIndex = Math.floor(playheadPositionInTicks / TICKS_PER_PATTERN);
    const patternIdInCurrentBar = songStructure.map(ch => ch[currentBarIndex]).find(pId => pId === activePatternId);
    const showPlayhead = !!patternIdInCurrentBar;
    const playheadPositionInPattern = playheadPositionInTicks % TICKS_PER_PATTERN;


    return (
        <div
            className="relative min-w-[1200px]"
            style={{ height: `${TOTAL_HEIGHT_PX}px` }}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onContextMenu={(e) => e.preventDefault()}
        >
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                className="absolute top-0 left-0 bg-transparent"
            >
                {/* Background das linhas 'C' */}
                {NOTES.map((note, index) => {
                    if (note.startsWith('C') && !note.includes("#")) {
                        return (
                            <rect
                                key={`highlight-${note}`}
                                x="0"
                                y={`${(index / ROWS) * 100}%`}
                                width="100%"
                                height={`${(1 / ROWS) * 100}%`}
                                className="fill-primary opacity-15"
                            />
                        );
                    }
                    return null;
                })}

                {/* Grid Lines */}
                {Array.from({ length: TICKS_PER_PATTERN }).map((_, i) => (
                    <line key={`tick-line-${i}`} x1={`${(i / TICKS_PER_PATTERN) * 100}%`} y1="0" x2={`${(i / TICKS_PER_PATTERN) * 100}%`} y2="100%"
                          stroke={i % 4 === 0 ? "#555" : "#333"} />
                ))}
                {Array.from({ length: ROWS }).map((_, i) => (
                    <line key={`row-line-${i}`} x1="0" y1={`${(i / ROWS) * 100}%`} x2="100%" y2={`${(i / ROWS) * 100}%`} stroke="#444" />
                ))}

                {/* Rendered Notes */}
                {(patternNotes || []).map(note => {
                    const pitchHeight = TOTAL_HEIGHT_PX / ROWS;
                    const tickWidth = svgRef.current ? svgRef.current.getBoundingClientRect().width / TICKS_PER_PATTERN : 0;
                    return (
                        <rect key={note.id} x={note.start * tickWidth} y={note.pitch * pitchHeight}
                              width={(note.end - note.start) * tickWidth} height={pitchHeight}
                              className="fill-accent stroke-primary"
                              strokeWidth="1"
                              style={{ pointerEvents: 'none' }} />
                    );
                })}

                <rect width="100%" height="100%" fill="transparent" onMouseDown={handleMouseDown} style={{ cursor: isCurrentUserProject ? 'cell' : 'not-allowed' }} />
            </svg>
            {showPlayhead && (
                <Playhead position={playheadPositionInPattern} totalTicks={TICKS_PER_PATTERN} />
            )}
        </div>
    );
};

export default PianoRoll;