import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { useMidiPlayer } from "../../hooks";

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
  const [collapsed, setCollapsed] = useState(false);
  const { midi, isPlaying, progress, duration, currentProject, playPause, stop, seek, formatTime } = useMidiPlayer();

  return (
      <div
          className={`fixed bottom-0 left-0 w-full z-50 px-3 py-2 border-t transition-all duration-300 ${
              collapsed ? "h-12" : "h-28"
          } bg-[#0a090d] text-[#e6e8e3] border-[#a97f52]`}
      >
        {/* Botão de recolher */}
        <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute top-2 right-3 text-gray-400 hover:text-white"
            aria-label={collapsed ? "Expandir player" : "Recolher player"}
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
                            ? "bg-[#61673e] hover:bg-[#4c4e30]"
                            : "bg-[#a97f52] hover:bg-[#c1915d]"
                    }
                ${!midi ? "opacity-50 cursor-not-allowed" : ""}
              `}
                    aria-label={isPlaying ? "Pausar" : "Tocar"}
                >
                  {isPlaying ? PauseIcon : PlayIcon}
                </button>

                <button
                    onClick={stop}
                    disabled={!midi || (!isPlaying && progress === 0)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-[#4c4e30] hover:bg-[#61673e] disabled:opacity-50 transition-colors"
                    aria-label="Parar"
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
                  className={`w-full cursor-pointer rounded-lg h-1 accent-[#a97f52] ${
                      !midi ? "cursor-not-allowed opacity-50" : ""
                  }`}
              />

              {/* Informações */}
              <div className="flex justify-between mt-1 font-mono text-xs select-none">
            <span className="truncate max-w-xs" title={currentProject?.title}>
              {currentProject?.title || "Nenhum projeto selecionado"}
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
