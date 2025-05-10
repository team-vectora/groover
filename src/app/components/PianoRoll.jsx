"use client";

import { useEffect, useState } from "react";
import './piano.css';
/*
Lembrando => Isso eh um teste. Tamo tipo vendo oq eh codavel ou nao. Tentei fazer tocar musica so usando
o Tone js, talvez de certo mas seja um problema para exportar depois.

Ola, se vc ta lendo tem umas coisas que tem que se fazer que sao importantes. Pensar em ter que tocar
as colunas que nao tem nenhuma celula preenchida para obter as pausas certas

*/
const PianoRoll = ({ synthRef, tempo, bpm }) => {
  const rows = 49; 
  const [cols, setCols] = useState(10);
  const [selectedCells, setSelectedCells] = useState([]);
  
  const notes = [
    "C6", "B5", "A#5", "A5", "G#5", "G5", "F#5", "F5", "E5", "D#5",
    "D5", "C#5", "C5", "B4", "A#4", "A4", "G#4", "G4", "F#4", "F4",
    "E4", "D#4", "D4", "C#4", "C4", "B3", "A#3", "A3", "G#3",
    "G3", "F#3", "F3", "E3", "D#3", "D3", "C#3", "C3", "B2", "A#2",
    "A2", "G#2", "G2", "F#2", "F2", "E2", "D#2", "D2", "C#2", "C2"
  ];

  const isSelected = (row, col) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  
  // logica para adicionar/excluir uma celula (odeio esse "[...prev," bizarro)
  const handleClickTable = (rowIndex, colIndex, note) => {
    const cellIndex = selectedCells.findIndex(cell => cell.row === rowIndex && cell.col === colIndex);
    if (cellIndex !== -1) {
      setSelectedCells(prev => prev.filter((_, index) => index !== cellIndex));
    } else {
      setSelectedCells(prev => [...prev, { row: rowIndex, col: colIndex }]);
    }
    synthRef.current.triggerAttackRelease(note, "8n");
    
    // adiciona mais colunas
    if (cols === colIndex +1){
      setCols(prev => prev + 10)
    }
  };

  // Toca as notas, entretanto nao toca duas ao mesmo tempo, ta ordenando e tocando uma por vez
  
  const playSelectedNotes = async () => {
    const duration = 60/bpm;
    
    const sorted = [...selectedCells].sort((a, b) => a.col - b.col);
    for (const cell of sorted) {
      const note = notes[cell.row];
      synthRef.current.triggerAttackRelease(note, tempo + "n"); 
      // Isso aqui ta cortando a duracao da nota. Existe uma relacao entre bpm, duracao e tempo, mas tambem da para fazer com o pro
      // proprio tone js eu acho
      await new Promise(resolve => setTimeout(resolve,400)); 
    }
  };
  
  // faz a tabela basicamente
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
  };

  return (
    <>
      {tableMaker()}
      <button onClick={playSelectedNotes} className="play-button">
        Tocar notas selecionadas
      </button>
    </>
  );
};

export default PianoRoll;
