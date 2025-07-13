import React, { useState, useEffect } from "react";

export default function MidiPlayer() {
  const [midiFile, setMidiFile] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar script MIDI.js dinamicamente
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/midijs@0.3.0/midi.min.js";
    script.onload = () => {
      MIDI.loadPlugin({
        soundfontUrl: "https://cdn.jsdelivr.net/npm/midijs@0.3.0/soundfonts/",
        instrument: "acoustic_grand_piano",
        onsuccess: () => setIsLoaded(true),
      });
    };
    document.body.appendChild(script);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setMidiFile(event.target.result);
    };
    reader.readAsArrayBuffer(file);
  };

  const playMidi = () => {
    if (!midiFile || !isLoaded) {
      alert("Arquivo não carregado ou plugin não pronto");
      return;
    }
    MIDI.Player.stop();
    MIDI.Player.loadArrayBuffer(midiFile, () => {
      MIDI.Player.start();
    });
  };

  const stopMidi = () => {
    MIDI.Player.stop();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Player MIDI React simples</h2>
      <input type="file" accept=".mid,.midi" onChange={handleFileChange} />
      <div style={{ marginTop: 10 }}>
        <button onClick={playMidi} disabled={!isLoaded || !midiFile}>
          Tocar MIDI
        </button>
        <button onClick={stopMidi} disabled={!isLoaded}>
          Parar
        </button>
      </div>
    </div>
  );
}
