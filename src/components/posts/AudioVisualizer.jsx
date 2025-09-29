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

export default function AudioVisualizer({ isPlaying }) {
    const containerRef = useRef(null);
    const analyzerInstanceRef = useRef(null);
    const { analyzerNode } = useMidiPlayer();

    // Este useEffect agora gerencia o ciclo de vida completo do visualizador.
    useEffect(() => {
        // Se temos um nó de áudio válido vindo do contexto...
        if (containerRef.current && analyzerNode) {
            const randomPreset = VISUAL_PRESETS[Math.floor(Math.random() * VISUAL_PRESETS.length)];

            // Cria a nova instância do visualizador, conectando-a ao nó de áudio.
            analyzerInstanceRef.current = new AudioMotionAnalyzer(containerRef.current, {
                source: analyzerNode,
                height: 400,
                width: 400,
                ...randomPreset,
                overlay: true,
                bgAlpha: 0,
                showScaleX: false,
            });
        }

        // --- INÍCIO DA CORREÇÃO CRÍTICA ---
        // A função de limpeza (o return do useEffect) é executada quando o componente
        // é desmontado ou ANTES que o efeito seja executado novamente (quando analyzerNode muda).
        return () => {
            if (analyzerInstanceRef.current) {
                // Destrói a instância ANTERIOR do visualizador para evitar o erro InvalidAccessError.
                analyzerInstanceRef.current.destroy();
                analyzerInstanceRef.current = null;
            }
        };
        // --- FIM DA CORREÇÃO CRÍTICA ---

        // A dependência em 'analyzerNode' garante que este ciclo de destruir-e-recriar
        // aconteça toda vez que uma nova música é carregada no MidiContext.
    }, [analyzerNode]);

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