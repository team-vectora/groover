"use client";
import React, { createContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { usePathname } from "next/navigation";

export const MidiContext = createContext(null);

const cleanupStyle = "background: #ff5555; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;";
const createStyle = "background: #50fa7b; color: black; font-weight: bold; padding: 2px 6px; border-radius: 3px;";
const infoStyle = "background: #8be9fd; color: black; font-weight: bold; padding: 2px 6px; border-radius: 3px;";

function base64ToArrayBuffer(base64) {
  if (typeof window === 'undefined' || !base64) return new ArrayBuffer(0);
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes.buffer;
}

export function MidiProvider({ children }) {
  const [currentProject, setCurrentProject] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [analyzerNode, setAnalyzerNode] = useState(null);

  const synthRef = useRef(null);
  const partRef = useRef(null);
  const compressorRef = useRef(null);
  const analyzerNodeRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const pathname = usePathname();
  const isEditorPage = pathname.startsWith('/editor');

  const cleanupAudio = useCallback(() => {
    Tone.Transport.stop();
    Tone.Transport.cancel(0);

    if (progressIntervalRef.current) {
      Tone.Transport.clear(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    partRef.current?.dispose();
    partRef.current = null;

    synthRef.current?.disconnect();
    synthRef.current?.dispose();
    synthRef.current = null;

    compressorRef.current?.disconnect();
    compressorRef.current?.dispose();
    compressorRef.current = null;

    analyzerNodeRef.current?.disconnect();
    analyzerNodeRef.current?.dispose();
    analyzerNodeRef.current = null;

    setAnalyzerNode(null);
  }, []);

  const stop = useCallback(() => {
    cleanupAudio();
    Tone.Transport.position = 0;
    setIsPlaying(false);
    setProgress(0);
  }, [cleanupAudio]);

  // 3. Efeito que para o player global se o utilizador navegar para o editor
  useEffect(() => {
    if (isEditorPage) stop();
  }, [isEditorPage, stop]);

  const playPause = useCallback(async () => {
    if (isEditorPage || !isLoaded || !currentProject) return;
    if (Tone.context.state !== "running") await Tone.start();

    if (Tone.Transport.state === "started") {
      Tone.Transport.pause();
      setIsPlaying(false);
    } else {
      Tone.Transport.start();
      setIsPlaying(true);
    }
  }, [isLoaded, currentProject, isEditorPage]);

  const loadMidi = useCallback(async (project, autoplay = false) => {
    if (isEditorPage) return false;
    cleanupAudio();
    setIsLoaded(false);
    setCurrentProject(project);

    if (!project?.midi) {
      setDuration(0);
      setProgress(0);
      partRef.current?.dispose();
      return false;
    }

    try {
      if (Tone.context.state !== "running") await Tone.start();

      if (!synthRef.current) synthRef.current = new Tone.PolySynth(Tone.Synth);
      if (!compressorRef.current) {
        compressorRef.current = new Tone.Compressor({ threshold: -12, ratio: 2, attack: 0.01, release: 0.25 });
      }

      analyzerNodeRef.current = new Tone.Analyser("waveform", 1024);
      setAnalyzerNode(analyzerNodeRef.current);

      synthRef.current.disconnect();
      synthRef.current.chain(compressorRef.current, Tone.Destination);
      compressorRef.current.fan(analyzerNodeRef.current); // paralelo para visualizer

      Tone.Destination.volume.value = -6;

      const midiData = base64ToArrayBuffer(project.midi.split(",")[1]);
      const midiFile = new Midi(midiData);
      setDuration(midiFile.duration);
      setProgress(0);

      partRef.current = new Tone.Part((time, note) => {
        synthRef.current?.triggerAttackRelease(note.name, note.duration, time, note.velocity);
      }, midiFile.tracks.flatMap(t => t.notes)).start(0);

      setIsLoaded(true);
      if (autoplay) await playPause();
      return true;
    } catch (err) {
      console.error(err);
      cleanupAudio();
      setIsLoaded(false);
      setDuration(0);
      return false;
    }
  }, [cleanupAudio, isEditorPage, playPause]);

  const handleSetCurrentProject = useCallback((project, autoplay = false) => loadMidi(project, autoplay), [loadMidi]);

  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = Tone.Transport.scheduleRepeat(() => {
        const currentProgress = Tone.Transport.seconds;
        setProgress(currentProgress);
        if (duration && currentProgress >= duration) stop();
      }, 0.1);
    } else {
      if (progressIntervalRef.current) Tone.Transport.clear(progressIntervalRef.current);
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
    currentProject,
    setCurrentProject: handleSetCurrentProject,
    isPlaying,
    progress,
    duration,
    isLoaded,
    playPause,
    stop,
    seek,
    formatTime,
    analyzerNode
  }), [currentProject, handleSetCurrentProject, isPlaying, progress, duration, isLoaded, playPause, stop, seek, analyzerNode]);


  return <MidiContext.Provider value={value}>{children}</MidiContext.Provider>;
}
