"use client";
import { useState, useEffect, useRef } from "react";
import PianoRoll from "./components/PianoRoll.jsx";
import * as Tone from "tone";
import { Midi } from '@tonejs/midi';
import './styles.css';
import TittleCaption from "./components/TittleCaption.jsx";
import ChangeInstrument from "./components/ChangeInstrument.jsx";
import ChangeVolume from "./components/ChangeVolume.jsx";

const Home = () => {
  const rows = 49;
  const initialCols = 10;

  const [instrument, setInstrument] = useState('synth');
  const [volume, setVolume] = useState(-10);
  const [tempo, setTempo] = useState("8");
  const [bpm, setBpm] = useState(120);
  const synthRef = useRef(null);
  const [activeCol, setActiveCol] = useState(null);
  const [cols, setCols] = useState(initialCols);

  const [matrixNotes, setMatrixNotes] = useState(
    Array.from({ length: initialCols }, () => Array(rows).fill(null))
  );
  const [pages, setPages] = useState([matrixNotes]);
  const [activePage, setActivePage] = useState(0);

  const instruments = {
    synth: () => new Tone.PolySynth(Tone.Synth),
    fm: () => new Tone.PolySynth(Tone.FMSynth),
    am: () => new Tone.PolySynth(Tone.AMSynth),
    membrane: () => new Tone.MembraneSynth(),
    duo: () => new Tone.DuoSynth(),
    mono: () => new Tone.MonoSynth(),
    lepo: () => new Tone.Sampler({
      urls: { A1: "A1.mp3", A2: "A2.mp3" },
      baseUrl: "https://tonejs.github.io/audio/casio/",
    }).toDestination(),
  };

  const notes = [
    "C6", "B5", "A#5", "A5", "G#5", "G5", "F#5", "F5", "E5", "D#5",
    "D5", "C#5", "C5", "B4", "A#4", "A4", "G#4", "G4", "F#4", "F4",
    "E4", "D#4", "D4", "C#4", "C4", "B3", "A#3", "A3", "G#3", "G3",
    "F#3", "F3", "E3", "D#3", "D3", "C#3", "C3", "B2", "A#2", "A2",
    "G#2", "G2", "F#2", "F2", "E2", "D#2", "D2", "C#2", "C2"
  ];

  useEffect(() => {
    synthRef.current = instruments[instrument]().toDestination();
    synthRef.current.volume.value = volume;

    if (synthRef.current instanceof Tone.PolySynth) {
      synthRef.current.set({
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.5 },
        maxPolyphony: 49,
      });
    }

    return () => synthRef.current?.dispose();
  }, [instrument]);

  useEffect(() => {
    Tone.getDestination().volume.rampTo(volume, 0.1);
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
useEffect(() => {
  setPages(prev => {
    const newPages = [...prev];
    newPages[activePage] = matrixNotes;
    return newPages;
  });
}, [matrixNotes, activePage]);

const addPage = () => {
  const newMatrix = Array.from({ length: initialCols }, () => Array(rows).fill(null));
  setPages(prev => [...prev, newMatrix]);
  setMatrixNotes(newMatrix);
  setActivePage(pages.length);
};


const movePage = (change) => {
  setActivePage(prev => {
    const next = prev + change;
    if (next < 0) return 0;
    if (next >= pages.length) return pages.length - 1;

    setMatrixNotes(pages[next]);
    return next;
  });
};


  const exportToMIDI = () => {
    const midi = new Midi();
    const track = midi.addTrack();
    midi.header.setTempo(bpm);
    const noteDurationSeconds = (60 / bpm) * (4 / parseInt(tempo));

    matrixNotes.forEach((col, colIndex) => {
      col.forEach((note, rowIndex) => {
        if (note) {
          track.addNote({
            midi: Tone.Frequency(note).toMidi(),
            time: colIndex * noteDurationSeconds,
            duration: noteDurationSeconds,
            velocity: 0.8,
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

  const playNotePiano = (note) => {
    synthRef.current?.triggerAttackRelease(note, "8n");
  };

const [isPlaying, setIsPlaying] = useState(false);

  const playSelectedNotes = async () => {
    if (isPlaying) {
      console.warn('Playback já em execução.');
      return;
    }

    const currentMatrix = pages[activePage];

    if (!currentMatrix || currentMatrix.length === 0) {
      console.warn('Matriz vazia.');
      return;
    }


    setIsPlaying(true)
    const noteDuration = tempo + "n";

    try {
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
      synthRef.current?.releaseAll?.();
      Tone.getTransport().bpm.value = bpm;

      currentMatrix.forEach((col, colIndex) => {
        const notesToPlay = col.filter(note => note !== null);

        Tone.getTransport().schedule(time => {
          if (notesToPlay.length === 1) {
            synthRef.current.triggerAttackRelease(notesToPlay[0], noteDuration, time);
          } else if (notesToPlay.length > 1) {
            synthRef.current.triggerAttackRelease(notesToPlay, noteDuration, time);
          }

          setActiveCol(colIndex);

          if (colIndex + 1 === currentMatrix.length) {
            setTimeout(() => setActiveCol(-1), Tone.Time(noteDuration).toMilliseconds());
          }
        }, colIndex * Tone.Time(noteDuration).toSeconds());
      });

      await Tone.start();
      Tone.getTransport().start();
    } finally {
      const totalTime = currentMatrix.length * Tone.Time(noteDuration).toMilliseconds();
      setTimeout(() => {
        setIsPlaying(false);
      }, totalTime + 100);
    }
  };

  const importFromMIDI = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const midi = new Midi(arrayBuffer);

    const bpmFromMidi = midi.header.tempos[0]?.bpm || 120;
    const track = midi.tracks[0];
    if (!track.notes.length) return;

    const avgDuration = track.notes.reduce((sum, note) => sum + note.duration, 0) / track.notes.length;
    const tempoFromNote = Tone.Time(avgDuration).toNotation().replace('n', '');

    const lastNoteTime = track.notes[track.notes.length - 1].time;
    const noteDuration = (60 / bpmFromMidi) * (4 / parseInt(tempoFromNote));
    const newCols = Math.ceil(lastNoteTime / noteDuration) + 1;

    const newMatrix = Array.from({ length: newCols }, () => Array(rows).fill(null));

    track.notes.forEach(note => {
      const colIndex = Math.round(note.time / noteDuration);
      const rowIndex = notes.indexOf(Tone.Frequency(note.midi, "midi").toNote());
      if (colIndex >= 0 && rowIndex >= 0) {
        newMatrix[colIndex][rowIndex] = Tone.Frequency(note.midi, "midi").toNote();
      }
    });

    setMatrixNotes(newMatrix);
    setCols(newCols);
    setTempo(tempoFromNote);
    setBpm(Math.round(bpmFromMidi));
  };

  return (
    <div className="app-container">
      <TittleCaption />
      <div id="home">
        <div className="data">
          <div className="control-panel">
            <div className="control-group">
              <ChangeInstrument instrument={instrument} instruments={instruments} setInstrument={setInstrument} synthRef={synthRef} />
            </div>
            <div className="control-group">
              <ChangeVolume volume={volume} setVolume={setVolume} synthRef={synthRef}/>
            </div>
          
            <div className="control-group">
              <h3>Andamento</h3>
              <div className="control-item">
                <label>BPM: {bpm}</label>
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
            <div className="control-group">
              <h3>Versoes</h3>
              <div className="control-item">
                <select name="cars" id="cars">
                  <option value="volvo">Volvo</option>
                  <option value="saab">Saab</option>
                  <option value="mercedes">Mercedes</option>
                  <option value="audi">Audi</option>
                </select>
              </div>
            </div>
            <div className="control-group">
              <h3>Pagina</h3>
              <p className="text-sm">Pagina <strong>{activePage+1}</strong> de <strong>{pages.length}</strong></p>
              <div className="page-buttons">
                <button  onClick={() => movePage(-1)}>⬅</button>
                <button  onClick={addPage}>➕</button>
                <button  onClick={() => movePage(1)}>⮕</button>
              </div>
            </div>
          </div>
        </div>

        <div id="edit-window">
          <div id="piano-roll-container">
            <div id="notes">{renderKeys()}</div>
            <PianoRoll
              synthRef={synthRef}
              tempo={tempo}
              bpm={bpm}
              setTempo={setTempo}
              setBpm={setBpm}
              pages={pages}
              setPages={setPages}
              activeCol={activeCol}
              setActiveCol={setActiveCol}
              cols={cols}
              setCols={setCols}
              rows={rows}
              notes={notes}
              activePage={activePage}
              setActivePage={setActivePage}
            />
          </div>
          <div className="action-buttons">
            <button className="action-button" onClick={playSelectedNotes}>▶ PLAY</button>
            <button className="action-button" onClick={exportToMIDI}>↕ EXPORT</button>
            <button className="action-button import">
              ↓ IMPORT
              <input
                type="file"
                accept=".mid"
                onChange={importFromMIDI}
                style={{ display: 'none' }}
              />
            </button>


            <button className="action-button">salvar</button>
            {pages}
          </div>
        </div>

        <div className="data">
          Páginas de sons <br />
          Adicionar novas páginas <br />
          Upar um áudio (?)
        </div>
      </div>
    </div>
  );
};

export default Home;
