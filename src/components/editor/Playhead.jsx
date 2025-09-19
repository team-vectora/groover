// src/components/editor/Playhead.jsx
"use client";

const Playhead = ({ position, totalTicks }) => {
    // Calcula a posição percentual
    const leftPercentage = totalTicks > 0 ? (position / totalTicks) * 100 : 0;

    // Garante que o playhead esteja dentro dos limites do container
    const clampedLeft = Math.max(0, Math.min(100, leftPercentage));

    return (
        <>
            <div
                className="absolute top-0 h-full w-0.5 bg-primary pointer-events-none"
                style={{
                    left: `${clampedLeft}%`,
                    animation: 'pulseOpacity 2s infinite ease-in-out'
                }}
            />
            <style jsx>{`
                @keyframes pulseOpacity {
                    0% { opacity: 0.9; }
                    50% { opacity: 0.5; }
                    100% { opacity: 0.9; }
                }
            `}</style>
        </>
    );
};

export default Playhead;