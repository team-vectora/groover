// src/contexts/MidiContext.jsx
"use client";
import React, { createContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { usePathname } from "next/navigation";// 1. Importar o hook de navegação
import {useTonePlayer} from "../hooks";

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

  const synthRef = useRef(null);
  const partRef = useRef(null);
  const analyserRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // 2. Obter o caminho atual da URL
  const pathname = usePathname();
  const isEditorPage = pathname.startsWith('/editor');

  useEffect(() => {
    // 3. Configura toda a cadeia de áudio uma única vez
    synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();

    analyserRef.current = synthRef.current.context.createAnalyser();
    synthRef.current.connect(analyserRef.current);


    // Limpeza de recursos
    return () => {
      synthRef.current?.dispose();
      analyserRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    Tone.Transport.stop();
    Tone.Transport.cancel(0); // Limpa TODOS os eventos agendados

    // O partRef precisa de ser eliminado, pois cancel() não o remove
    if (partRef.current) {
      partRef.current.dispose();
      partRef.current = null;
    }

    synthRef.current?.releaseAll();

    Tone.Transport.position = 0;
    setIsPlaying(false);
    setProgress(0);

    if (progressIntervalRef.current) {
      Tone.Transport.clear(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // 3. Efeito que para o player global se o utilizador navegar para o editor
  useEffect(() => {
    if (isEditorPage) {
      stop();
    }
  }, [isEditorPage, stop]);

  const loadMidi = useCallback(async (project) => {
    if (isEditorPage) return false; // 4. Trava de segurança
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
        //synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
        console.error("Sintetizador não inicializado!");
        return false;
      }
      const base64 = project.midi.split(",")[1];
      const midiData = base64ToArrayBuffer(base64);
      const midiFile = new Midi(midiData);
      setDuration(midiFile.duration);
      setProgress(0);
      partRef.current?.dispose();
      const newPart = new Tone.Part((time, note) => {
        console.log("[synthRef NOTE]", {
          transportState: Tone.Transport,
          volume: Tone.Destination.volume.value,
          synthRef: synthRef.current,
          synthRefvolume: synthRef.current.volume.value
        });
        synthRef.current?.triggerAttackRelease(note.name, note.duration, time, note.velocity === 1 ? note.velocity * 0.7 : note.velocity);
        console.log("[MIDI NOTE]", {
          note: note,
          duration: note.duration,
          velocity: note.velocity,
        });

      }, midiFile.tracks.flatMap(track => track.notes)).start(0);
      partRef.current = newPart;
      setIsLoaded(true);
      return true;
    } catch (error) {
      console.error("Failed to load MIDI:", error);
      setIsLoaded(false);
      setDuration(0);
      return false;
    }
  }, [stop, isEditorPage]);

  useEffect(() => {
    loadMidi(currentProject);
  }, [currentProject, loadMidi]);

  const playPause = useCallback(async () => {
    if (isEditorPage || !isLoaded || !currentProject) return; // 4. Trava de segurança
    if (Tone.context.state !== 'running') await Tone.start();
    if (Tone.Transport.state === "started") {
      Tone.Transport.pause();
      setIsPlaying(false);
    } else {
      Tone.Transport.start();
      setIsPlaying(true);
    }

    console.log("[PLAYPAUSE AFTER]", {
      transportState: Tone.Transport.state,
      volume: Tone.Destination.volume.value
    });
  }, [isLoaded, currentProject, isEditorPage]);

  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = Tone.Transport.scheduleRepeat(() => {
        const currentProgress = Tone.Transport.seconds;
        setProgress(currentProgress);
        if (duration > 0 && currentProgress >= duration) stop();
      }, 0.1);
    } else {
      if (progressIntervalRef.current) {
        Tone.Transport.clear(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    return () => {
      if (progressIntervalRef.current) Tone.Transport.clear(progressIntervalRef.current);
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

  const value = useMemo(() => ({
    currentProject, setCurrentProject, isPlaying, progress,
    duration, isLoaded, playPause, stop, seek, formatTime,
    synthRef,
    analyserRef
  }), [currentProject, isPlaying, progress, duration, isLoaded, playPause, stop, seek, formatTime]);

  return (
      <MidiContext.Provider value={value}>
        {/* 5. Renderiza os componentes filhos apenas quando o áudio estiver pronto */}
        {children}
      </MidiContext.Provider>
  );
}