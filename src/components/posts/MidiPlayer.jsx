import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { useMidiPlayer } from "../../hooks";
import { useTranslation } from "react-i18next";

const PlayIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18l15-9L5 3z" />
    </svg>
);

const PauseIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
);

const StopIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="6" y="6" width="12" height="12" rx="2" ry="2" />
    </svg>
);

export default function MidiPlayer() {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const { midi, isPlaying, progress, duration, currentProject, playPause, stop, seek, formatTime } = useMidiPlayer();

    return (
        <div
            className={`fixed bottom-0 left-0 w-full z-50 px-3 py-2 border-t transition-all duration-300 ${
                collapsed ? "h-12" : "h-28"
            } bg-background background text-foreground border-accent`}
        >
            {/* Botão de recolher */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute top-2 right-3 text-gray-400 hover:text-text-lighter"
                aria-label={collapsed ? t('midiPlayer.expand') : t('midiPlayer.collapse')}
            >
                <FontAwesomeIcon icon={collapsed ? faChevronUp : faChevronDown} />
            </button>

            {!collapsed && (
                <>
                    {/* Controles de reprodução */}
                    <div className="flex justify-center items-center gap-4 mb-2">
                        <button
                            onClick={playPause}
                            disabled={!midi}
                            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors
                ${
                                isPlaying
                                    ? "bg-primary-light hover:bg-primary"
                                    : "bg--accent hover:bg-accent-light"
                            }
                ${!midi ? "opacity-50 cursor-not-allowed" : ""}
              `}
                            aria-label={isPlaying ? t('midiPlayer.pause') : t('midiPlayer.play')}
                        >
                            {isPlaying ? PauseIcon : PlayIcon}
                        </button>

                        <button
                            onClick={stop}
                            disabled={!midi || (!isPlaying && progress === 0)}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-primary hover:bg-primary-light disabled:opacity-50 transition-colors"
                            aria-label={t('midiPlayer.stop')}
                        >
                            {StopIcon}
                        </button>
                    </div>

                    {/* Barra de progresso */}
                    <input
                        type="range"
                        min={0}
                        max={duration}
                        step={0.01}
                        value={progress}
                        onChange={(e) => seek(parseFloat(e.target.value))}
                        disabled={!midi}
                        className={`w-full cursor-pointer rounded-lg h-1 accent-accent ${
                            !midi ? "cursor-not-allowed opacity-50" : ""
                        }`}
                    />

                    {/* Informações */}
                    <div className="flex justify-between mt-1 font-mono text-xs select-none text-text-lighter">
            <span className="truncate max-w-xs" title={currentProject?.title}>
              {currentProject?.title || t('midiPlayer.noProject')}
            </span>
                        <span>
              {midi ? `${formatTime(progress)} / ${formatTime(duration)}` : "00:00 / 00:00"}
            </span>
                    </div>
                </>
            )}
        </div>
    );
}