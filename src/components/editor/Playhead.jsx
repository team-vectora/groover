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

    const isPaused = !isPlaying && !isPatternPlaying && playheadPositionInTicks > 0;

    const calculatePosition = () => {
        if (!isPlaying && !isPatternPlaying && playheadPositionInTicks === 0) {
            return -1;
        }

        if (container === "pianoroll") {
            const positionInPattern = playheadPositionInTicks % TICKS_PER_BAR;
            return (positionInPattern / TICKS_PER_BAR) * 100;
        }

        if (container === "sequencer") {
            const ticksPerPage = TICKS_PER_BAR * BARS_PER_PAGE;
            const currentPageStartTick = currentPage * ticksPerPage;
            const currentPageEndTick = currentPageStartTick + ticksPerPage;

            if (
                playheadPositionInTicks >= currentPageStartTick &&
                playheadPositionInTicks < currentPageEndTick
            ) {
                const positionInPage = playheadPositionInTicks - currentPageStartTick;
                return (positionInPage / ticksPerPage) * 100;
            }
            return -1;
        }

        return -1;
    };

    const leftPosition = calculatePosition();

    if (leftPosition < 0) {
        return null;
    }

    return (
        <>
            {/* --- INÍCIO DA CORREÇÃO --- */}
            <div
                // A classe "w-0.5" foi alterada para "w-1" para duplicar a espessura.
                className="absolute top-0 h-full w-1 bg-primary pointer-events-none z-30 transition-opacity duration-300"
                style={{
                    left: `${leftPosition}%`,
                    animation: (!(isPlaying || isPatternPlaying)) ? "pulseOpacity 2s infinite ease-in-out" : "none",
                    opacity: isPaused ? 0.6 : 1,
                    // Adicionado um pequeno brilho para melhor visibilidade
                    boxShadow: '0 0 3px var(--color-primary-light)'
                }}
            />
            {/* --- FIM DA CORREÇÃO --- */}
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