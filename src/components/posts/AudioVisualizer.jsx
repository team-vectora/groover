import { useEffect, useRef } from "react";
import * as Tone from "tone";
import AudioMotionAnalyzer from "audiomotion-analyzer";
import { Midi } from "@tonejs/midi";

// Converte base64 para Uint8Array
function base64ToUint8Array(base64) {
  const raw = atob(base64);
  const array = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}

export default function AudioVisualizer({ midiData, start }) {
  const containerRef = useRef(null);
  const partRef = useRef(null);

  useEffect(() => {
    if (!midiData || !start) return;

    const midiArray = base64ToUint8Array(midiData.split(",")[1]);
    const midi = new Midi(midiArray);

    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const analyzerNode = Tone.context.createAnalyser();
    synth.connect(analyzerNode);

    const analyzer = new AudioMotionAnalyzer(containerRef.current, {
      source: analyzerNode,
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetWidth,
      gradient: "rainbow",
      bands: 256,
      scale: "linear",
      gain: 0.5,
      smoothing: 0.8,
      effects: ["led", "reflection"],
      backgroundColor: "#111",
      showScale: true,
      showLeds: true,
      ledSpacing: 1.5,
      reflectionAlpha: 0.2,
    });

    Tone.Transport.cancel();
    Tone.Transport.stop();
    Tone.Transport.position = 0;

    const notes = midi.tracks.flatMap(track =>
      track.notes.map(n => ({
        time: n.time,
        name: n.name,
        duration: n.duration,
        velocity: n.velocity
      }))
    );

    const part = new Tone.Part((time, note) => {
      synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
    }, notes);

    part.start(0);
    partRef.current = part;

    Tone.Transport.start();

    return () => {
      Tone.Transport.cancel();
      Tone.Transport.stop();
      part.dispose();
      synth.dispose();
      analyzer.destroy();
    };
  }, [midiData, start]);

  return (
<div className="relative w-full h-full rounded-xl shadow-lg border-2 border-white overflow-hidden">
  <div
    ref={containerRef}
    className="w-full h-full bg-black rounded-xl"
    style={{ touchAction: "none" }}
  />
</div>

  );
}
