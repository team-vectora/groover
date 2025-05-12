"use client";
import { useState, useEffect, useRef } from "react";
import PianoRoll from "./components/PianoRoll.jsx";
import * as Tone from "tone";
import './styles.css';

const Home = () => {
  
  const [instrument, setInstrument] = useState('synth');
  const [volume, setVolume] = useState(-10); 
  const [tempo, setTempo] = useState("8");
  const [bpm, setBpm] =useState(120);
  const synthRef = useRef(null);

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

  return (
    <div id="home">
      <div className="data">
        <label htmlFor="instruments">Instrumentos:</label>
        <select 
          name="instruments" 
          id="instruments"
          value={instrument}
          onChange={handleInstrumentChange}
        >
          {Object.keys(instruments).map((inst) => (
            <option key={inst} value={inst}>
              {inst.charAt(0).toUpperCase() + inst.slice(1)}
            </option>
          ))}
        </select> 

        <div className="volume-control">
          <label>Volume: {volume}dB</label>
          <input 
            type="range" 
            min="-30" 
            max="20" 
            step="1"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>
        <label htmlFor="time">Tempo</label>
        <select 
          name="time" 
          id="time"
          value={tempo}
          onChange={(e) => setTempo(Number(e.target.value))}
        >
          <option value="1">1 Tempo (Semibreve)</option> 
          <option value="2">2 Tempos (Mínima)</option>  
          <option value="4">4 Tempos (Semínima)</option>  
          <option value="8">8 Tempos (Colcheia)</option>  
          <option value="16">16 Tempos (Semicolcheia)</option>  
        
        </select> 

        <label htmlFor="bpm">Bpm ({bpm})</label>
        <input
          type="range"
          min="40"
          max="300"
          step="10"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
        />
        Customizar instrumente (talvez?)
        <br></br>
        Visualizacao da onda da musica com wavesurfer (talvez?)

      </div>

      <div id="edit-window">
        <div id="piano-roll-container">
          <div id="notes">
            {renderKeys()}
          </div>
          <PianoRoll  synthRef={synthRef} tempo={tempo} bpm={bpm}/>
        </div>
        Camadas
        <p>* +</p>
      </div>
      
      <div className="data">
        Paginas de sons
        <br></br>
        adicionar novas Paginas
        <br></br>
        upar um audio(?)
      </div>
    </div>
  );
};

export default Home;