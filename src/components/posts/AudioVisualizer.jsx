// src/components/posts/AudioVisualizer.jsx
import { useEffect, useRef } from "react";
import AudioMotionAnalyzer from "audiomotion-analyzer";
import { useMidiPlayer } from "../../hooks";

const VISUAL_PRESETS = [
    { mode: 10, gradient: 'prism', radial: true, spinSpeed: 2, reflexRatio: 0.5 },
    { mode: 4, gradient: 'rainbow', radial: false, reflexRatio: 0.6, lineWidth: 2 },
    { mode: 7, gradient: 'orangered', radial: true, spinSpeed: -1, reflexRatio: 0.4 },
    { mode: 2, gradient: 'classic', radial: false, reflexRatio: 0.7, lineWidth: 3 },
    { mode: 5, gradient: 'steelblue', radial: false, reflexRatio: 0.3, lineWidth: 2.5, spinSpeed: 0 }
];

export default function AudioVisualizer() {
    const containerRef = useRef(null);
    const audioMotionRef = useRef(null);
    const { analyserRef, isPlaying } = useMidiPlayer();

    // Este useEffect agora gerencia o ciclo de vida completo do visualizador.
    useEffect(() => {
        if (!analyserRef?.current || !containerRef.current) return;

        if (audioMotionRef.current) {
            audioMotionRef.current.destroy();
        }

        const preset = VISUAL_PRESETS[Math.floor(Math.random() * VISUAL_PRESETS.length)];

        const audioMotion = new AudioMotionAnalyzer(containerRef.current, {
            source: analyserRef.current,
            height: 400,
            width: 400,
            ...preset,
            overlay: true,
            bgAlpha: 0,
            showScaleX: false,
        });

        audioMotionRef.current = audioMotion;

        return () => {
            audioMotionRef.current?.destroy();
            audioMotionRef.current = null;
        };
    }, [analyserRef, isPlaying]);


    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <div
                ref={containerRef}
                className="w-[400px] h-[400px] transition-all duration-500 ease-in-out"
                style={{
                    transform: isPlaying ? 'scale(1.1)' : 'scale(1)',
                    filter: isPlaying ? 'drop-shadow(0 0 25px var(--color-accent))' : 'drop-shadow(0 0 10px var(--color-primary))'
                }}
            />
        </div>
    );
}