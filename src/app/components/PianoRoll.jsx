"use client";

import { useState } from "react";
import './piano.css';

const PianoRoll = ({synthRef}) => {
  const rows = 49; 
  const cols = 10; 
  
  const notes = [
    "C6", "B5", "A#5", "A5", "G#5", "G5", "F#5", "F5", "E5", "D#5",
    "D5", "C#5", "C5", "B4", "A#4", "A4", "G#4", "G4", "F#4", "F4",
    "E4", "D#4", "D4", "C#4", "C4", "B3", "A#3", "A3", "G#3",
    "G3", "F#3", "F3", "E3", "D#3", "D3", "C#3", "C3", "B2", "A#2",
    "A2", "G#2", "G2", "F#2", "F2", "E2", "D#2", "D2", "C#2", "C2"
  ];
  
  const [selectedCells, setSelectedCells] = useState([]);

  const handleClickTable = (rowIndex, colIndex, note) => {
    const cellIndex = selectedCells.findIndex(cell => cell.row === rowIndex && cell.col === colIndex);
    if (cellIndex !== -1) {
      setSelectedCells(prev => prev.filter((_, index) => index !== cellIndex));

    } else {
      setSelectedCells(prev => [...prev, { row: rowIndex, col: colIndex }]);
    
      
    }
    synthRef.current.triggerAttackRelease(note, "8n");

  };

  const isSelected = (row, col) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const tableMaker = () => {
    return (
      <table className="piano-roll-grid">
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <td 
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`piano-roll-cell ${isSelected(rowIndex, colIndex) ? 'selected' : ''}`}
                  data-row={rowIndex}
                  data-col={colIndex}
                  onClick={() => handleClickTable(rowIndex, colIndex, notes[rowIndex])}
                >
                  <b>{notes[rowIndex]}</b>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <>
      {tableMaker()}
    </>
  );
};

export default PianoRoll;
