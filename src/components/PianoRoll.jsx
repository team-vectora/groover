"use client";
import { useEffect } from "react";
import './piano.css';
import * as Tone from 'tone';

const PianoRoll = ({ 
  synthRef, 
  bpm, 
  setBpm, 
  pages, 
  setPages, 
  activePage, 
  activeCol, 
  setActiveCol, 
  cols, 
  setCols, 
  notes, 
  rows, 
  setActivePage 
}) => {
  console.log('Componente PianoRoll renderizado', { bpm, synthRef, activePage });

  const getCellState = (row, col) => {
    if (!pages[activePage] || !pages[activePage][col]) return null;
    return pages[activePage][col][row];
  };

  const handleClickTable = (rowIndex, colIndex, note) => {
    console.log('Célula clicada', { rowIndex, colIndex, note });
    setPages(prevPages => {
      const newPages = [...prevPages];
      let currentMatrix = newPages[activePage] ? [...newPages[activePage]] : [];

      // Garante que a coluna exista
      if (!currentMatrix[colIndex]) {
        currentMatrix[colIndex] = Array(rows).fill(null);
      } else {
        currentMatrix[colIndex] = [...currentMatrix[colIndex]];
      }

      // Alterna nota ativa/inativa
      // Sei que estou colocando asterisco aqui e no page verificando se eh um /A, mas estranhamente eh o jeito que funciona mais "parecido"
      // ent tava fazendo uns testes para ver oq tava errado
      if (currentMatrix[colIndex][rowIndex] === null){
        currentMatrix[colIndex][rowIndex] = note;
      }
      else if(currentMatrix[colIndex][rowIndex] === note){
        currentMatrix[colIndex][rowIndex] = note+"*";
      }
      else{
        currentMatrix[colIndex][rowIndex] = null;
      }
      
      newPages[activePage] = currentMatrix;
      return newPages;
    });

    try {
      synthRef.current.triggerAttackRelease(note, "8n");
    } catch (error) {
      console.error('Erro ao tocar nota:', error);
    }
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
                  ${getCellState(rowIndex, colIndex) === notes[rowIndex] ? 'selected' : ''}
                  ${getCellState(rowIndex, colIndex) === notes[rowIndex] + '*' ? 'super-selected' : ''}
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
    return () => {
      try {
        Tone.getTransport().cancel();
        Tone.getTransport().stop();
      } catch (error) {
        console.error('Erro na limpeza:', error);
      }
    };
  }, []);

  return (
    <>
      {tableMaker()}
    </>
  );
};

export default PianoRoll;
