"use client";
import { useState, useEffect, useRef } from "react";
import PianoRoll from "./components/PianoRoll.jsx";
import * as Tone from "tone";
import './styles.css';

const Home = () => {
  const [instrument, setInstrument] = useState('synth');
  const [volume, setVolume] = useState(-10); 
  const synthRef = useRef(null);

  const instruments = {
    synth: () => new Tone.Synth(),
    fm: () => new Tone.FMSynth(),
    am: () => new Tone.AMSynth(),
    membrane: () => new Tone.MembraneSynth(),
    metal: () => new Tone.MetalSynth(),
    duo: () => new Tone.DuoSynth()
  };
  
  const notes = [
    "C6", "B5", "A#5", "A5", "G#5", "G5", "F#5", "F5", "E5", "D#5",
    "D5", "C#5", "C5", "B4", "A#4", "A4", "G#4", "G4", "F#4", "F4",
    "E4", "D#4", "D4", "C#4", "C4", "B3", "A#3", "A3", "G#3",
    "G3", "F#3", "F3", "E3", "D#3", "D3", "C#3", "C3", "B2", "A#2",
    "A2", "G#2", "G2", "F#2", "F2", "E2", "D#2", "D2", "C#2", "C2"
  ];

  useEffect(() => {
    synthRef.current = instruments[instrument]().toDestination();
    Tone.getDestination().volume.value = volume;
    
    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
    };
  }, []);
  
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

  const playNotePiano = (note) => {
    const cleanNote = note.split("/")[0].trim();
    if (synthRef.current) {
      synthRef.current.triggerAttackRelease(cleanNote, "8n");
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
            max="0" 
            step="1"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>
      </div>

      <div id="edit-window">
        <div id="piano-roll-container">
          <div id="notes">
            {renderKeys()}
          </div>
          <PianoRoll />
        </div>
        Camadas
        <p>* +</p>
      </div>
      
      <div className="data">
        Paginas de sons
      </div>
    </div>
  );
};

export default Home;