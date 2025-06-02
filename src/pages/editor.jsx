"use client";
import { useState, useEffect, useRef } from "react";
import PianoRoll from "../components/PianoRoll.jsx";
import * as Tone from "tone";
import { Midi } from '@tonejs/midi';
import './editor.css';
import "../globals.css";
import TittleCaption from "../components/TittleCaption.jsx";
import ChangeInstrument from "../components/ChangeInstrument.jsx";
import ChangeVolume from "../components/ChangeVolume.jsx";
import translations from "../pages/locales/language.js";


function EditorPage () {
  const rows = 49;
  const initialCols = 10;
  const [activeCol, setActiveCol] = useState(null);
  const [cols, setCols] = useState(initialCols);
  const [matrixNotes, setMatrixNotes] = useState(
    Array.from({ length: initialCols }, () => Array(rows).fill(null))
  );
  const [pages, setPages] = useState([matrixNotes]);
  const [activePage, setActivePage] = useState(0);

  const [lang, setLang] = useState("en");

  const [instrument, setInstrument] = useState('synth');
  const [volume, setVolume] = useState(-10);
  const [tempo, setTempo] = useState("8");
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);

  const synthRef = useRef(null);

  const t = (key, params) => {
    let text = translations[lang][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };
  
const acousticInstruments = [
  "bass-electric",
  "bassoon",
  "cello",
  "clarinet",
  "contrabass",
  "flute",
  "french-horn",
  "guitar-acoustic",
  "guitar-electric",
  "guitar-nylon",
  "harmonium",
  "harp",
  "organ",
  "piano",
  "saxophone",
  "trombone",
  "trumpet",
  "tuba",
  "violin",
  "xylophone"
];

const instruments = {
  synth: () => new Tone.PolySynth(Tone.Synth).toDestination()
};

acousticInstruments.forEach(name => {
  instruments[name] = () => new Tone.Sampler({
    urls: {
      C4: "C4.mp3",

    },
    baseUrl: `https://nbrosowsky.github.io/tonejs-instruments/samples/${name}/`,
  }).toDestination();
});

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
  const pageLengthSeconds = cols * noteDurationSeconds;

  pages.forEach((pageMatrix, pageIndex) => {
    pageMatrix.forEach((col, colIndex) => {
      col.forEach((note, rowIndex) => {
        if (note) {
          const time = (pageIndex * pageLengthSeconds) + (colIndex * noteDurationSeconds);
          track.addNote({
            midi: Tone.Frequency(note).toMidi(),
            time: time,
            duration: noteDurationSeconds,
            velocity: 0.8,
          });
        }
      });
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



const playSelectedNotesActivePage = (n) => {
  return new Promise(async (resolve) => {
    console.log(matrixNotes)
    if (isPlaying) {
      console.warn('Playback já em execução.');
      return resolve();
    }

    const currentMatrix = pages[n];

    if (!currentMatrix || currentMatrix.length === 0) {
      return resolve();
    }

    setIsPlaying(true);
    const noteDuration = tempo + "n";

    // Colocar as notas continuas que vao estar em um set
  
    const sustainedNotes = new Set();

    try {
      Tone.getTransport().bpm.value = bpm;

      currentMatrix.forEach((col, colIndex) => {
        Tone.getTransport().schedule(time => {
          const notesToPlay = col.filter(note => note !== null);
          
          notesToPlay.forEach(note => {
              if (!sustainedNotes.has(note)) {
                if(String(note).endsWith('*')){
                    synthRef.current.triggerAttack(note, time);
                }
                else{
                  sustainedNotes.add(note);
                }
                
              }
          });
          sustainedNotes.forEach(note => {
            if (!notesToPlay.includes(note)) {
              
              synthRef.current.triggerRelease(note, time);
              sustainedNotes.delete(note);
            }
          });

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
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
        synthRef.current?.releaseAll?.();
        setIsPlaying(false);
        resolve();
      }, totalTime);
    }
  });
};


const playSong = async () => {
  if (isPlaying) {
    console.warn('Playback já em execução.');
    return;
  }

  setIsPlaying(true);
  setActivePage(0);
  setMatrixNotes(pages[0]);
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
      synthRef.current?.releaseAll?.();
  for (let i = 0; i < pages.length; i++) {
    setActivePage(i);
    setMatrixNotes(pages[i]);
    await playSelectedNotesActivePage(i);
  }

  setIsPlaying(false);
};

const importFromMIDI = async (event) => {
  const file = event.target.files[0];
  if (!file) {
  setPages([]);
  setActivePage(0);
  setMatrixNotes([]);
  return;
}


  const arrayBuffer = await file.arrayBuffer();
  const midi = new Midi(arrayBuffer);

  const bpmFromMidi = midi.header.tempos[0]?.bpm || 120;
  const allNotes = midi.tracks.flatMap(track => track.notes);
  if (!allNotes.length) return;

  const avgDuration = allNotes.reduce((sum, note) => sum + note.duration, 0) / allNotes.length;
  const tempoFromNote = Tone.Time(avgDuration).toNotation().replace('n', '') || "8";

  const noteDuration = (60 / bpmFromMidi) * (4 / parseInt(tempoFromNote));
  const pageLengthSeconds = initialCols * noteDuration;

  const lastNoteTime = Math.max(...allNotes.map(n => n.time));
  const totalPages = Math.ceil(lastNoteTime / pageLengthSeconds);

  const newPages = Array.from({ length: totalPages }, () =>
    Array.from({ length: initialCols }, () => Array(rows).fill(null))
  );

  allNotes.forEach(note => {
    const time = note.time;

    const pageIndex = Math.floor(time / pageLengthSeconds);
    const timeInPage = time % pageLengthSeconds;
    const colIndex = Math.round(timeInPage / noteDuration);

    const noteName = Tone.Frequency(note.midi, "midi").toNote();
    const rowIndex = notes.indexOf(noteName);

    if (
      pageIndex >= 0 && pageIndex < totalPages &&
      colIndex >= 0 && colIndex < initialCols &&
      rowIndex >= 0
    ) {
      newPages[pageIndex][colIndex][rowIndex] = noteName;
    }
  });
  
  setPages(newPages);
  setActivePage(0);
  setMatrixNotes(newPages[0]);
  setCols(initialCols);
  setTempo(tempoFromNote);
  setBpm(Math.round(bpmFromMidi));
};

  return (
 <div className="app-container">
      <TittleCaption
        onPlaySong={playSong}
        onPlayActivePage={() => playSelectedNotesActivePage(activePage)}
        onExport={exportToMIDI}
        onImport={importFromMIDI}
        onSave={() => console.log('Save clicked')}
        t={t}
      />

      <div id="home">
        <div className="data">
          <div className="control-panel">

            <div className="control-group">
              <ChangeInstrument instrument={instrument} instruments={instruments} setInstrument={setInstrument} synthRef={synthRef} />
            </div>

            <div className="control-group">
              <ChangeVolume volume={volume} setVolume={setVolume} synthRef={synthRef} />
            </div>

            <div className="control-group">
              <h3>{t("tempo")}</h3>
              <div className="control-item">
                <label>{t("bpmLabel")}: {bpm}</label>
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
              <h3>{t("versions")}</h3>
              <div className="control-item">
                <select name="cars" className="control-select" id="cars">
                  <option value="volvo">Volvo</option>
                  <option value="saab">Saab</option>
                  <option value="mercedes">Mercedes</option>
                  <option value="audi">Audi</option>
                </select>
              </div>
            </div>

            <div className="control-group">
              <h3>{t("page")}</h3>
              <p className="text-sm">
                {t("pageOf", { current: activePage + 1, total: pages.length })}
              </p>
              <div className="page-buttons">
                <button onClick={() => movePage(-1)}>⬅</button>
                <button onClick={addPage}>✛</button>
                <button onClick={() => movePage(1)}>⮕</button>
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
        </div>
        <div className="data">
          <div className="language-switcher">
            <button
              className="lang-button"
              onClick={() => setLang(lang === "pt" ? "en" : "pt")}
              aria-label="Switch Language"
              title={lang === "pt" ? "Switch to English" : "Mudar para Português"}
            >
              {lang === "pt" ? "🇧🇷" : "🇺🇸"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
