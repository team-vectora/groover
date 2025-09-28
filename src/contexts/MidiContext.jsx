"use client";
import React, { createContext, useState, useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";

export const MidiContext = createContext(null);

function base64ToArrayBuffer(base64) {
  if (typeof window === 'undefined' || !base64) return new ArrayBuffer(0);
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function MidiProvider({ children }) {
  const [currentProject, setCurrentProject] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false); // Flag para controlar a troca

  const synthRef = useRef(null);
  const partRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const stop = useCallback(() => {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    setIsPlaying(false);
    setProgress(0);
    if (progressIntervalRef.current) {
      Tone.Transport.clear(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const loadMidi = useCallback(async (project) => {
    stop();
    setIsLoaded(false);
    setCurrentProject(project);

    if (!project || !project.midi) {
      setDuration(0);
      setProgress(0);
      partRef.current?.dispose();
      return false;
    }

    try {
      if (!synthRef.current) {
        synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
      }

      const base64 = project.midi.split(",")[1];
      const midiData = base64ToArrayBuffer(base64);
      const midiFile = new Midi(midiData);

      setDuration(midiFile.duration);
      setProgress(0);
      partRef.current?.dispose();

      const newPart = new Tone.Part((time, note) => {
        synthRef.current?.triggerAttackRelease(note.name, note.duration, time, note.velocity);
      }, midiFile.tracks.flatMap(track => track.notes)).start(0);

      partRef.current = newPart;
      setIsLoaded(true);
      return true; // Carregado com sucesso

    } catch (error) {
      console.error("Failed to load MIDI:", error);
      setIsLoaded(false);
      setDuration(0);
      return false; // Falha ao carregar
    }
  }, [stop]);

  useEffect(() => {
    if (!isSwitching) {
      loadMidi(currentProject);
    }
  }, [currentProject, isSwitching, loadMidi]);

  const playPause = useCallback(async () => {
    if (!isLoaded || !currentProject || isSwitching) return;
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }

    if (Tone.Transport.state === "started") {
      Tone.Transport.pause();
      setIsPlaying(false);
    } else {
      Tone.Transport.start();
      setIsPlaying(true);
    }
  }, [isLoaded, currentProject, isSwitching]);

  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = Tone.Transport.scheduleRepeat(() => {
        const currentProgress = Tone.Transport.seconds;
        setProgress(currentProgress);

        if (duration > 0 && currentProgress >= duration) {
          stop();
        }
      }, 0.1);
    } else {
      if (progressIntervalRef.current) {
        Tone.Transport.clear(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        Tone.Transport.clear(progressIntervalRef.current);
      }
    };
  }, [isPlaying, duration, stop]);

  const seek = (time) => {
    if (!isLoaded) return;
    const newTime = Math.max(0, Math.min(time, duration));
    Tone.Transport.seconds = newTime;
    setProgress(newTime);
  };

  const formatTime = (time) => {
    if (isNaN(time) || time < 0) return "00:00";
    const min = Math.floor(time / 60).toString().padStart(2, "0");
    const sec = Math.floor(time % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const value = {
    currentProject,
    setCurrentProject,
    isPlaying,
    progress,
    duration,
    isLoaded,
    playPause,
    stop,
    seek,
    formatTime,
  };

  return <MidiContext.Provider value={value}>{children}</MidiContext.Provider>;
}