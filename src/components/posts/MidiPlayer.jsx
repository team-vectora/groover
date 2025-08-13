import React, { useRef, useState, useEffect, useContext } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { MidiContext } from "../../contexts/MidiContext";

function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

const PlayIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18l15-9L5 3z" />
  </svg>
);

const PauseIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

const StopIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <rect x="6" y="6" width="12" height="12" rx="2" ry="2" />
  </svg>
);

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
    <div
      className="fixed bottom-0 left-0 w-full z-50 px-3 py-2 border-t "
      style={{ backgroundColor: "#0a090d", color: "#e6e8e3", borderColor: "#a97f52" }}
    >
      <div className="flex justify-center items-center gap-4 mb-2">
        <button
          onClick={handlePlayPause}
          disabled={!midi}
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors
            ${
              isPlaying
                ? "bg-[#61673e] hover:bg-[#4c4e30]"
                : "bg-[#a97f52] hover:bg-[#c1915d]"
            }
            ${!midi ? "opacity-50 cursor-not-allowed" : ""}
          `}
          aria-label={isPlaying ? "Pausar" : "Tocar"}
          title={isPlaying ? "Pausar" : "Tocar"}
        >
          {isPlaying ? PauseIcon : PlayIcon}
        </button>

        <button
          onClick={handleStop}
          disabled={!midi || (!isPlaying && progress === 0)}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#4c4e30] hover:bg-[#61673e] disabled:opacity-50 transition-colors"
          aria-label="Parar"
          title="Parar"
        >
          {StopIcon}
        </button>
      </div>

      <input
        type="range"
        min={0}
        max={duration}
        step={0.01}
        value={progress}
        onChange={handleSeek}
        disabled={!midi}
        className={`w-full cursor-pointer rounded-lg h-1 accent-[#a97f52] ${
          !midi ? "cursor-not-allowed opacity-50" : ""
        }`}
        aria-label="Seek slider"
      />

      <div className="flex justify-between mt-1 font-mono text-xs select-none" style={{ color: "#e6e8e3" }}>
        <span className="truncate max-w-xs" title={currentProject?.title}>
          {currentProject?.title || "Nenhum projeto selecionado"}
        </span>
        <span>
          {midi ? `${formatTime(progress)} / ${formatTime(duration)}` : "00:00 / 00:00"}
        </span>
      </div>
    </div>

  );
};

export default MidiPlayer;
