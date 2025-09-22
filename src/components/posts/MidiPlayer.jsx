import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { useMidiPlayer } from "../../hooks";
import { useTranslation } from "react-i18next";

const PlayIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18l15-9L5 3z" />
    </svg>
);

const PauseIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
);

const StopIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="6" y="6" width="12" height="12" rx="2" ry="2" />
    </svg>
);

export default function MidiPlayer() {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const { midi, isPlaying, progress, duration, currentProject, playPause, stop, seek, formatTime } = useMidiPlayer();

    return (
        <div
            className={`fixed bottom-0 left-0 w-full z-50 px-4 py-3 transition-all duration-300 ${
                collapsed ? "h-14" : "h-28"
            } bg-background border-t border-primary flex flex-col justify-center shadow-lg`}
        >
            {/* Botão de recolher */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute top-2 right-4 text-text-lighter hover:text-accent transition-colors"
                aria-label={collapsed ? t('midiPlayer.expand') : t('midiPlayer.collapse')}
            >
                <FontAwesomeIcon icon={collapsed ? faChevronUp : faChevronDown} />
            </button>

            {!collapsed && (
                <>
                    {/* Informações do projeto */}
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm md:text-base font-semibold text-accent-light truncate max-w-xs" title={currentProject?.title}>
                            {currentProject?.title || t('midiPlayer.noProject')}
                        </span>
                        <span className="text-xs md:text-sm text-text-lighter font-mono">
                            {midi ? `${formatTime(progress)} / ${formatTime(duration)}` : "00:00 / 00:00"}
                        </span>
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
                        className={`w-full h-1 rounded-full appearance-none cursor-pointer
                            ${!midi ? "opacity-50 cursor-not-allowed" : ""}
                            bg-gradient-to-r from-accent-light to-accent`}
                    />

                    {/* Controles de reprodução */}
                    <div className="flex justify-center items-center gap-6 mt-3">
                        <button
                            onClick={playPause}
                            disabled={!midi}
                            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                                ${isPlaying ? "bg-accent hover:bg-accent-light shadow-lg" : "bg-primary hover:bg-primary-light shadow-md"}
                                ${!midi ? "opacity-50 cursor-not-allowed" : ""}`}
                            aria-label={isPlaying ? t('midiPlayer.pause') : t('midiPlayer.play')}
                        >
                            {isPlaying ? PauseIcon : PlayIcon}
                        </button>

                        <button
                            onClick={stop}
                            disabled={!midi || (!isPlaying && progress === 0)}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary hover:bg-primary-light shadow-md disabled:opacity-50 transition-all duration-300"
                            aria-label={t('midiPlayer.stop')}
                        >
                            {StopIcon}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
