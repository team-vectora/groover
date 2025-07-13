import React, { useRef, useState, useEffect, useContext } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { MidiContext } from "../contexts/MidiContext";

function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

const MidiPlayer = () => {
  const synthRef = useRef(null);
  const { currentProject } = useContext(MidiContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [midi, setMidi] = useState(null);

  useEffect(() => {
    const loadMidi = async () => {
      if (!currentProject || !currentProject.midi) {
        setMidi(null);
        setDuration(0);
        setIsPlaying(false);
        setProgress(0);
        return;
      }

      const base64 = currentProject.midi.split(",")[1];
      const midiData = base64ToArrayBuffer(base64);
      const midiFile = new Midi(midiData);

      setMidi(midiFile);
      setDuration(midiFile.duration);

      if (!synthRef.current) {
        synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
      }
    };
    loadMidi();

    return () => {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      synthRef.current?.dispose();
      synthRef.current = null;
    };
  }, [currentProject]);

  useEffect(() => {
    if (!midi) return;

    Tone.Transport.cancel();

    midi.tracks.forEach((track) => {
      track.notes.forEach((note) => {
        Tone.Transport.schedule((time) => {
          synthRef.current.triggerAttackRelease(note.name, note.duration, time);
        }, note.time);
      });
    });

    Tone.Transport.scheduleRepeat(() => {
      setProgress(Tone.Transport.seconds);
      if (Tone.Transport.seconds >= duration) {
        setIsPlaying(false);
        Tone.Transport.stop();
        Tone.Transport.position = 0;
        setProgress(0);
      }
    }, 0.1);
  }, [midi, duration]);

  const handlePlayPause = async () => {
    if (!midi) return;

    if (!isPlaying) {
      await Tone.start();
      Tone.Transport.start();
      setIsPlaying(true);
    } else {
      Tone.Transport.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (!midi) return;

    Tone.Transport.stop();
    Tone.Transport.position = 0;
    setIsPlaying(false);
    setProgress(0);
  };

  const handleSeek = (e) => {
    if (!midi) return;

    const newTime = parseFloat(e.target.value);
    Tone.Transport.seconds = newTime;
    setProgress(newTime);
  };

  const formatTime = (time) => {
    const min = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const sec = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-[#1e1e1e] text-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-[#a97f52]">
      <div className="flex items-center gap-4 mb-2 sm:mb-0">
        <h2 className="text-xl">{currentProject?.title}</h2>
        <button
          onClick={handlePlayPause}
          disabled={!midi}
          className={`px-4 py-2 rounded text-white font-semibold transition ${
            isPlaying ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
          } ${!midi ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={handleStop}
          disabled={!midi || (!isPlaying && progress === 0)}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
        >
          Stop
        </button>
        <div className="text-sm font-mono">
          {midi ? `${formatTime(progress)} / ${formatTime(duration)}` : ""}
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={duration}
        step={0.01}
        value={progress}
        onChange={handleSeek}
        disabled={!midi}
        className={`w-full sm:w-1/2 accent-[#a97f52] cursor-pointer ${!midi ? "cursor-not-allowed" : ""}`}
      />
    </div>
  );
}
export default MidiPlayer;
