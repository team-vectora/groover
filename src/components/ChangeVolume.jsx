"use client";
import { useEffect } from 'react';
import * as Tone from "tone";



const ChangeVolume = ({ volume, setVolume, synthRef }) => {
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };
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


  return (
    <>
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
    </>

  );
};

export default ChangeVolume;