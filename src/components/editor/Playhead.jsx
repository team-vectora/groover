// src/components/editor/Playhead.jsx
"use client";

const TICKS_PER_BAR = 32;
const BARS_PER_PAGE = 8;

const Playhead = ({
                      isPlaying,
                      isPatternPlaying,
                      playheadPositionInTicks,
                      container, // "sequencer" or "pianoroll"
                      currentPage, // for sequencer
                      totalBars, // for sequencer
                  }) => {
    const calculatePosition = () => {
        if (!isPlaying && !isPatternPlaying) return -1; // Oculta se não estiver tocando

        if (container === "pianoroll") {
            // No PianoRoll, a posição é sempre relativa ao início do pattern (0 a 31 ticks)
            const positionInPattern = playheadPositionInTicks % TICKS_PER_BAR;
            return (positionInPattern / TICKS_PER_BAR) * 100;
        }

        if (container === "sequencer") {
            const ticksPerPage = TICKS_PER_BAR * BARS_PER_PAGE;
            const currentPageStartTick = currentPage * ticksPerPage;
            const currentPageEndTick = currentPageStartTick + ticksPerPage;

            // Verifica se o playhead está na página atual
            if (
                playheadPositionInTicks >= currentPageStartTick &&
                playheadPositionInTicks < currentPageEndTick
            ) {
                // Calcula a posição relativa à página atual
                const positionInPage = playheadPositionInTicks - currentPageStartTick;
                return (positionInPage / ticksPerPage) * 100;
            }
            return -1; // Oculta se não estiver na página visível
        }

        return -1;
    };

    const leftPosition = calculatePosition();

    if (leftPosition < 0) {
        return null; // Não renderiza o playhead se ele não deve ser visível
    }

    return (
        <>
            <div
                className="absolute top-0 h-full w-0.5 bg-primary pointer-events-none z-30"
                style={{
                    left: `${leftPosition}%`,
                    animation: "pulseOpacity 2s infinite ease-in-out",
                }}
            />
            <style jsx>{`
        @keyframes pulseOpacity {
          0% {
            opacity: 0.9;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 0.9;
          }
        }
      `}</style>
        </>
    );
};

export default Playhead;