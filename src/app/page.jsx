"use client";
import { useState, useEffect, useRef } from "react";
import PianoRoll from "./components/PianoRoll.jsx";
import * as Tone from "tone";
import { Midi } from '@tonejs/midi';

import './styles.css';

const Home = () => {

  const rows = 49; 
  const initialCols = 10;
  const [instrument, setInstrument] = useState('synth');
  const [volume, setVolume] = useState(-10); 
  const [tempo, setTempo] = useState("8");
  const [bpm, setBpm] =useState(120);
  const synthRef = useRef(null);
  const [activeCol, setActiveCol] = useState(null);
  const [cols, setCols] = useState(initialCols);

  const [matrixNotes, setMatrixNotes] = useState(
    Array.from({length: initialCols}, () => Array(rows).fill(null))
  );

  const instruments = {
    synth: () => new Tone.PolySynth(Tone.Synth), // Alterado para PolySynth isso é pra fazer acorde
    fm: () => new Tone.PolySynth(Tone.FMSynth), // Alterado para PolySynth
    am: () => new Tone.PolySynth(Tone.AMSynth), // Alterado para PolySynth
    membrane: () => new Tone.MembraneSynth(),
    duo: () => new Tone.DuoSynth(),
    mono: () => new Tone.MonoSynth(),
    lepo: () => new Tone.Sampler({
      urls: {
        A1: "A1.mp3",
        A2: "A2.mp3",
      },
      baseUrl: "https://tonejs.github.io/audio/casio/",
    }).toDestination()
  
  }

  const notes = [
    "C6", "B5", "A#5", "A5", "G#5", "G5", "F#5", "F5", "E5", "D#5",
    "D5", "C#5", "C5", "B4", "A#4", "A4", "G#4", "G4", "F#4", "F4",
    "E4", "D#4", "D4", "C#4", "C4", "B3", "A#3", "A3", "G#3",
    "G3", "F#3", "F3", "E3", "D#3", "D3", "C#3", "C3", "B2", "A#2",
    "A2", "G#2", "G2", "F#2", "F2", "E2", "D#2", "D2", "C#2", "C2"
  ];

  useEffect(() => {
    // Configuração inicial do PolySynth
    synthRef.current = instruments[instrument]().toDestination();
    synthRef.current.volume.value = volume;
    
    // Configuração recomendada para PolySynth nao entendi nada mas se precisar a gnt muda depois
    if (synthRef.current instanceof Tone.PolySynth) {
      synthRef.current.set({
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.3,
          release: 0.5
        },
        maxPolyphony: 16 // Número máximo de vozes simultâneas da pra mudar tbm mas se o deep deixou em 16 entao em 16 ficará
      });
    }
    
    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
    };
  }, [instrument]);
  
  useEffect(() => {
    Tone.getDestination().volume.rampTo(volume, 0.1);
  
    if (synthRef.current && Tone.getContext().state === "running") {
      const now = Tone.now();
      const minVolume = -30;
      const maxVolume = 0.1;
  
      const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
      const step = (maxVolume - minVolume) / notes.length;
  
      const volumeNoteMap = notes.map((note, i) => ({
        min: minVolume + i * step,
        max: minVolume + (i + 1) * step,
        note,
      }));
  
      const noteToPlay = volumeNoteMap.find(
        (range) => volume >= range.min && volume < range.max
      );
  
      if (noteToPlay) {
        synthRef.current.triggerAttackRelease(noteToPlay.note, "8n", now);
      }
    }
  }, [volume]); 
  
  const renderKeys = () => {
    return notes.map((note, index) => {
      const isBlackKey = note.includes("#");
      return (
        <div 
          onClick={() => playNotePiano(note.split(" ")[0])} 
          key={index} 
          className={`note ${isBlackKey ? 'black' : ''}`}
        >
          <p>{note}</p>
        </div>
      );
    });
  };
    const exportToMIDI = () => {
      const midi = new Midi();
      const track = midi.addTrack();
      
      // Definir o BPM no cabeçalho MIDI
      midi.header.setTempo(bpm);
      
      // Calcular a duração em segundos de uma nota baseada no tempo e BPM
      const noteDurationSeconds = (60 / bpm) * (4 / parseInt(tempo));
    
      matrixNotes.forEach((col, colIndex) => {
        col.forEach((note, rowIndex) => {
            if (note) {
              track.addNote({
                midi: Tone.Frequency(note).toMidi(),
                time: colIndex * noteDurationSeconds,
                duration: noteDurationSeconds,
                velocity: 0.8
              }); 
            }
          });
      });
      
      const bytes = midi.toArray();
      const blob = new Blob([bytes], { type: 'audio/midi' });
      const url = URL.createObjectURL(blob);
    
      const link = document.createElement('a');
      link.href = url;
      link.download = 'piano-roll.mid';
      link.click();
    
      URL.revokeObjectURL(url);
    };

    const exportButton = () => (
      <button onClick={exportToMIDI} >
        Exportar para MIDI
      </button>
    );

  const playNotePiano = (note) => {
    if (synthRef.current) {
      synthRef.current.triggerAttackRelease(note, "8n");
    }
  };

  const handleInstrumentChange = (e) => {
    const newInstrument = e.target.value;
    if (synthRef.current) {
      synthRef.current.dispose();
    }
    synthRef.current = instruments[newInstrument]().toDestination();
    setInstrument(newInstrument);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };



  let isPlaying = false;
  
    const playSelectedNotes = async () => {
      if (isPlaying) {
        console.warn('playSelectedNotes já está em execução, ignorando chamada duplicada.');
        return;
      }
      
  if (!matrixNotes || matrixNotes.length === 0) {
    console.warn('Matriz vazia. Playback cancelado.');
    return;
  }
      isPlaying = true;
      console.group('Iniciando playSelectedNotes');
    
      console.log('Estado inicial:', { 
        matrixNotes,
        bpm,
        tempo,
        synthRef: synthRef.current
      });
        const noteDuration = tempo + "n";
  
      try {
        Tone.getTransport().stop();    // Parar reprodução atual
        Tone.getTransport().cancel();  // Cancelar eventos agendados
        synthRef.current?.releaseAll?.();
    
        Tone.getTransport().bpm.value = bpm;
    
        matrixNotes.forEach((col, colIndex) => {
          const notesToPlay = col.filter(note => note !== null);
  
          Tone.getTransport().schedule(time => {
            try {
              if (notesToPlay.length === 1) {
                synthRef.current.triggerAttackRelease(notesToPlay[0], noteDuration, time);
              } else if (notesToPlay.length > 1) {
                synthRef.current.triggerAttackRelease(notesToPlay, noteDuration, time);
              }
            } catch (error) {
              console.error(`Erro ao tocar nota:`, error);
            }
  
            setActiveCol(colIndex);
  
            if (colIndex + 1 === matrixNotes.length) {
              setTimeout(() => setActiveCol(-1), Tone.Time(noteDuration).toMilliseconds());
            }
          }, colIndex * Tone.Time(noteDuration).toSeconds());
        });
  
    
        await Tone.start();
        Tone.getTransport().start();
    
      } catch (error) {
        console.error('Erro durante playSelectedNotes:', error);
      } finally {
        console.groupEnd();
        // Delay para liberar a flag apenas após o tempo total
        const totalTime = matrixNotes.length * Tone.Time(noteDuration).toMilliseconds();
        setTimeout(() => {
          isPlaying = false;
          console.log('playSelectedNotes liberado para nova execução');
        }, totalTime + 100); // +100ms de margem
      }
    };

  const playNotes = () => {
    console.log('Renderizando botão de play');
    return (
      <button onClick={playSelectedNotes} >
        Tocar notas selecionadas
      </button>
    );
  }

  const importFromMIDI = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const arrayBuffer = await file.arrayBuffer();
      const midi = new Midi(arrayBuffer);

      // Obter BPM do MIDI (padrão para 120 se não existir)
      const bpmFromMidi = midi.header.tempos[0]?.bpm || 120;
      
      // Analisar a duração típica das notas para determinar o valor de tempo
      const track = midi.tracks[0];
      if (!track.notes.length) return;

      // Calcular a duração média das notas em segundos
      const avgDuration = track.notes.reduce((sum, note) => sum + note.duration, 0) / track.notes.length;
      
      // Converter duração para notação musical (8n, 16n, etc.)
      const tempoFromNote = Tone.Time(avgDuration).toNotation().replace('n', '');

      // Calcular quantas colunas precisamos baseado na última nota
      const lastNoteTime = track.notes[track.notes.length - 1].time;
      const noteDuration = (60 / bpmFromMidi) * (4 / parseInt(tempoFromNote));
      const newCols = Math.ceil(lastNoteTime / noteDuration) + 1;

      // Inicializar nova matriz
      const newMatrix = Array.from({ length: newCols }, () => Array(rows).fill(null));

      // Preencher a matriz
      track.notes.forEach(note => {
        const colIndex = Math.round(note.time / noteDuration);
        const rowIndex = notes.indexOf(Tone.Frequency(note.midi, "midi").toNote());
        if (colIndex >= 0 && rowIndex >= 0) {
          newMatrix[colIndex][rowIndex] = Tone.Frequency(note.midi, "midi").toNote();
        }
      });

      // Atualizar estado
      setMatrixNotes(newMatrix);
      setCols(newCols);
      setTempo(tempoFromNote);
      setBpm(Math.round(bpmFromMidi));
    };

  const importButton = () => (
    <button >
      Importar MIDI
      <input type="file" accept=".mid" onChange={importFromMIDI} style={{ display: 'none' }} />
    </button>
  );
  

  // é um exemplo
  const userData = {
      name: "Carlos Silva",
      role: "Produtor Musical",
      avatar: "" 
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-logo-container">
          <div className="logo-circle"></div>
             <h1 className="header-logo-text">GROOVER</h1>
          </div>
        <div className="header-user-profile">
          <div className="header-user-info">

              <span className="header-user-name">{userData.name}</span>
              <span className="header-user-role">{userData.role}</span>
          </div>
        {/*Nao ta carregando para nao dar bug*/}
        {userData.avatar && (
          <img 
            src={userData.avatar} 
            alt="Avatar"
            className="header-user-avatar"
          />
        )}

        </div>
      </header>
    <div id="home">
      <div className="data">
          <div className="control-panel">
              {/* Seção de Instrumento */}
              <div className="control-group">
                  <h3>Instrumento</h3>
                  <div className="control-item">
                      <label htmlFor="instruments">Selecione um instrumento:</label>
                      <select
                          id="instruments"
                          className="control-select"
                          value={instrument}
                          onChange={handleInstrumentChange}
                      >
                          {Object.keys(instruments).map((inst) => (
                              <option key={inst} value={inst}>
                                  {inst.charAt(0).toUpperCase() + inst.slice(1)}
                              </option>
                          ))}
                      </select>
                  </div>
              </div>

              {/* Seção de Volume */}
              <div className="control-group">
                  <h3>Volume</h3>
                  <div className="control-item">
                      <label>
                          Nível: <span className="control-value">{volume}dB</span>
                      </label>
                      <input
                          type="range"
                          min="-30"
                          max="20"
                          step="1"
                          className="control-range"
                          value={volume}
                          onChange={handleVolumeChange}
                      />
                  </div>
              </div>

              {/* Seção de Tempo */}
              <div className="control-group">
                  <h3>Tempo</h3>
                  <div className="control-item">
                      <label htmlFor="time">Unidade de tempo:</label>
                      <select
                          id="time"
                          className="control-select"
                          value={tempo}
                          onChange={(e) => setTempo(Number(e.target.value))}
                      >
                          <option value="1">Semibreve (1 tempo)</option>
                          <option value="2">Mínima (2 tempos)</option>
                          <option value="4">Semínima (4 tempos)</option>
                          <option value="8">Colcheia (8 tempos)</option>
                          <option value="16">Semicolcheia (16 tempos)</option>
                      </select>
                  </div>
              </div>

              {/* Seção de BPM */}
              <div className="control-group">
                  <h3>Andamento</h3>
                  <div className="control-item">
                      <label>
                          BPM: <span className="control-value">{bpm}</span>
                      </label>
                      <input
                          type="range"
                          min="40"
                          max="300"
                          step="10"
                          className="control-range"
                          value={bpm}
                          onChange={(e) => setBpm(Number(e.target.value))}
                      />
                  </div>
              </div>

              {/* Seção de Visualização, não entendii muito bem mas deixei*/} 
              <div className="control-group">
                  <h3>Visualização</h3>
                  <p className="text-sm" style={{color: 'var(--text-light)'}}>
                      Visualizacao da onda da musica com wavesurfer (talvez?)
                  </p>
              </div>
          </div>
      </div>
      <div id="edit-window">                      
        <div id="piano-roll-container">
          <div id="notes">
            {renderKeys()}
          </div>
          <PianoRoll  synthRef={synthRef} 
                      tempo={tempo} 
                      bpm={bpm} 
                      setTempo={setTempo}
                      setBpm={setBpm}
                      matrixNotes={matrixNotes}
                      setMatrixNotes={setMatrixNotes}
                      activeCol={activeCol}
                      setActiveCol={setActiveCol}
                      cols={cols}
                      setCols={setCols}
          />
          </div>
                <div className="action-buttons">
              <button className="action-button" onClick={playSelectedNotes}>
                  PLAY
              </button>
              <button className="action-button" onClick={exportToMIDI}>
                  EXPORT
              </button>
              <button className="action-button import">
                  IMPORT
                  <input 
                      type="file" 
                      accept=".mid" 
                      onChange={importFromMIDI} 
                      style={{ display: 'none' }} 
                  />
              </button>
          </div>
      </div>
      
      <div className="data">
        Paginas de sons
        <br></br>
        adicionar novas Paginas
        <br></br>
        upar um audio(?)
      </div>
    </div>
    </div>
  );
};

export default Home;