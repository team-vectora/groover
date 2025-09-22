    'use client';
    import React, { useRef, useEffect, useState } from 'react';
    import dynamic from 'next/dynamic';
    import * as Tone from 'tone';

    const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
      ssr: false
    });

    export default function PsychedelicVisualizer({ midi, isPlaying }) {
      const [analyser, setAnalyser] = useState(null);
      const fftRef = useRef(null);

    const preload = ()=>{
        song = loadSound(midi);
        }

    const setup = (p5, canvasParentRef) => {
      const parentWidth = canvasParentRef.offsetWidth;
      const parentHeight = canvasParentRef.offsetHeight; // usa a altura real da div
      p5.createCanvas(parentWidth, parentHeight).parent(canvasParentRef);
      p5.colorMode(p5.HSB, 360, 100, 100);
      fftRef.current = new p5.FFT();
    };



      const draw = (p5) => {
        p5.background(0, 10);
        p5.strokeWeight(20);

        if (isPlaying && fftRef.current) {
          const wave = fftRef.current.waveform();
          p5.beginShape();

          for (let i = 0; i < p5.width; i++) {
            const index = Math.floor(p5.map(i, 0, p5.width, 0, wave.length));
            const x = i;
            const y = wave[index] * 50 + p5.height / 2;

            // Efeito psicodélico com cores variáveis
            const hue = (p5.frameCount * 0.5 + i * 0.1) % 360;
            p5.stroke(hue, 80, 100);
            p5.vertex(x, y);
          }

          p5.endShape();
        }
      };

      return <Sketch setup={setup} draw={draw} />;
    }