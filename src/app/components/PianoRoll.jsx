"use client";

import { useEffect, useState } from "react";
import { Midi } from '@tonejs/midi';
import './piano.css';
import * as Tone from 'tone';
/**
 * 
 * Eu acho que tem que tirar o tempo, nao serve pra mta coisa e só vai dar trabalho 
 * Deixar como BPM em tudo mesmo
 *  
 */

const PianoRoll = ({ synthRef, tempo, bpm, setTempo, setBpm, matrixNotes, setMatrixNotes,   activeCol,setActiveCol, cols, setCols }) => {
  const rows = 49; 
  
  const [page, setPage]= useState(1);
  const [activePage, setActivePage]= useState(1);

  const notes = [
    "C6", "B5", "A#5", "A5", "G#5", "G5", "F#5", "F5", "E5", "D#5",
    "D5", "C#5", "C5", "B4", "A#4", "A4", "G#4", "G4", "F#4", "F4",
    "E4", "D#4", "D4", "C#4", "C4", "B3", "A#3", "A3", "G#3",
    "G3", "F#3", "F3", "E3", "D#3", "D3", "C#3", "C3", "B2", "A#2",
    "A2", "G#2", "G2", "F#2", "F2", "E2", "D#2", "D2", "C#2", "C2"
  ];

  console.log('Componente PianoRoll renderizado', { tempo, bpm, synthRef });

  const isSelected = (row, col) => {
    if (!matrixNotes[col]) {
      console.warn(`Tentativa de acessar coluna inexistente: ${col}`);
      return false;
    }
    return matrixNotes[col][row] !== null;
  };

  const handleClickTable = (rowIndex, colIndex, note) => {
    console.log('Célula clicada', { rowIndex, colIndex, note });
    console.log(matrixNotes);
    setMatrixNotes(prev => {
      const newMatrix = [...prev];
      newMatrix[colIndex] = [...newMatrix[colIndex]];
      newMatrix[colIndex][rowIndex] = newMatrix[colIndex][rowIndex] ? null : note;
      
      if (colIndex === prev.length - 1) {
        console.log('Adicionando novas colunas');
        for (let i = 0; i < 10; i++) {
          newMatrix.push(Array(rows).fill(null));
        }
        setCols(prevCols => prevCols + 10);
      }
      
      console.log('Nova matriz de notas:', newMatrix);
      return newMatrix;
    });
    
    try {
      console.log('Tentando tocar nota:', note);
      synthRef.current.triggerAttackRelease(note, "8n");
      console.log('Nota tocada com sucesso');
    } catch (error) {
      console.error('Erro ao tocar nota:', error);
    }
  };

  const tableMaker = () => {
    console.log('Renderizando tabela', { cols, rows });
    return (
      <table className="piano-roll-grid">
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <td 
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`piano-roll-cell
                    ${isSelected(rowIndex, colIndex) ? 'selected' : ''}
                    ${activeCol === colIndex ? 'active-col' : ''}
                  `}
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

  useEffect(() => {
    console.log('Efeito de limpeza montado');
    return () => {
      console.log('Executando limpeza do componente');
      try {
        Tone.getTransport().cancel();
        Tone.getTransport().stop();
        console.log('Transport cancelado e parado');
      } catch (error) {
        console.error('Erro na limpeza:', error);
      }
    };
  }, []);

  console.log('Renderizando componente principal');
  return (
    <>
      {tableMaker()}
    </>
  );
};

export default PianoRoll;