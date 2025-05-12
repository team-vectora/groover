"use client";

import { useEffect, useState } from "react";
import './piano.css';
import * as Tone from 'tone';

const PianoRoll = ({ synthRef, tempo, bpm }) => {
  const rows = 49; 
  const initialCols = 10;
  const [cols, setCols] = useState(initialCols);
  const [activeCol, setActiveCol] = useState(null);
  const [matrixNotes, setMatrixNotes] = useState(
    Array.from({length: initialCols}, () => Array(rows).fill(null))
  ); // Matriz pra representar a tabela, cada coluna é um array

  const notes = [
    "C6", "B5", "A#5", "A5", "G#5", "G5", "F#5", "F5", "E5", "D#5",
    "D5", "C#5", "C5", "B4", "A#4", "A4", "G#4", "G4", "F#4", "F4",
    "E4", "D#4", "D4", "C#4", "C4", "B3", "A#3", "A3", "G#3",
    "G3", "F#3", "F3", "E3", "D#3", "D3", "C#3", "C3", "B2", "A#2",
    "A2", "G#2", "G2", "F#2", "F2", "E2", "D#2", "D2", "C#2", "C2"
  ];

const isSelected = (row, col) => {
  // Verifique se a coluna existe antes de tentar acessar
  if (!matrixNotes[col]) return false;
  return matrixNotes[col][row] !== null;
};


  const handleClickTable = (rowIndex, colIndex, note) => {

    setMatrixNotes(prev => {
      const newMatrix = [...prev];
      // toggle da nota (adiciona/remove)
      newMatrix[colIndex] = [...newMatrix[colIndex]];
      newMatrix[colIndex][rowIndex] = newMatrix[colIndex][rowIndex] ? null : note;
      
      // adiciona mais colunas se necessário
      if (colIndex === prev.length - 1) {
        for (let i = 0; i < 10; i++) {
          newMatrix.push(Array(rows).fill(null));
        }
        setCols(prevCols => prevCols + 10);
      }
      
      return newMatrix;
    });
    
    // toca a nota ao clicar
    synthRef.current.triggerAttackRelease(note, "8n");
  };

  const playSelectedNotes = async () => {
    console.log("entrou");
    
    Tone.getTransport().bpm.value = bpm;
    Tone.getTransport().stop();

    const noteDuration = tempo + "n";

    matrixNotes.forEach((col, colIndex) => {
      const notesToPlay = col.filter(note => note !== null);
        Tone.getTransport().schedule(time => {
          
          console.log(colIndex)
      
          if (notesToPlay.length === 1) {
            synthRef.current.triggerAttackRelease(notesToPlay[0], noteDuration, time);
          } else if (notesToPlay.length > 0) {
            synthRef.current.triggerAttackRelease(notesToPlay, noteDuration, time);
          }

          setActiveCol(colIndex);
          console.log(noteDuration)
          if(colIndex+1 == initialCols){
            setTimeout(() => {
              setActiveCol(-1);
            }, Tone.Time(noteDuration).toMilliseconds());
          }

        }, colIndex * Tone.Time(noteDuration).toSeconds());
    });
    
    await Tone.start();
    Tone.getTransport().start();
    
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

  const playNotes = () => {
    return (
      <button onClick={playSelectedNotes} className="play-button">
        Tocar notas selecionadas
      </button>
    );
  }

  useEffect(() => {
    return () => {
      Tone.getTransport().cancel();
      Tone.getTransport().stop();
    };
  }, []);

  return (
    <>
      {playNotes()}
      {tableMaker()}
    </>
  );
};

export default PianoRoll;