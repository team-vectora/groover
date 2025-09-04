// src/components/editor/controls/ControlPanel.jsx
"use client";
import { ChangeInstrument, ChangeVolume, ChangeBpm, SelectRitmo, VersionManager } from "../../";
import translations from "../../../../public/locales/language";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash, faArrowLeft, faArrowRight, faPlus, faUser} from "@fortawesome/free-solid-svg-icons";
import Link from 'next/link';


const ControlPanel = ({
                          projectState,
                          instrument, setInstrument, instruments,
                          volume, setVolume,
                          bpm, setBpm,
                          rhythm, setRhythm,
                          versions, currentMusicId, handleVersionChange, lastVersionId,
                          activePage, pages, movePage, addPage, deletePage,
                          lang,
                          username
                      }) => {
    const t = (key, params) => {
        let text = translations[lang]?.[key] || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, v);
            });
        }
        return text;
    };

    return (
        <div className="px-4 space-y-6 flex flex-col h-full md:w-1/4 lg:w-1/5 fixed">
            <div>
                <h2 className={`text-sm font-bold uppercase text-accent mb-2 mt-4`}>
                    {projectState.title || "Novo Projeto"}
                </h2>
                <p className="text-sm text-gray-400 h-10 overflow-y-auto">{projectState.description || "Sem descrição"}</p>
            </div>
            <div className="flex-grow overflow-y-auto space-y-6">
                <ChangeInstrument
                    instrument={instrument}
                    instruments={instruments}
                    setInstrument={setInstrument}
                />
                <ChangeVolume volume={volume} setVolume={setVolume} />
                <ChangeBpm bpm={bpm} setBpm={setBpm} t={t} />
                <SelectRitmo rhythm={rhythm} setRhythm={setRhythm} />
                <VersionManager
                    versions={versions}
                    currentMusicId={currentMusicId}
                    handleVersionChange={handleVersionChange}
                    t={t}
                    lastVersionId={lastVersionId}
                />

                {/* Controles de Página */}
                <div>
                    <h3 className="text-sm font-bold uppercase text-accent mb-2">{t("page")}</h3>
                    <p className="text-center text-sm mb-2">
                        {t("pageOf", { current: activePage + 1, total: pages.length || 1 })}
                    </p>
                    <div className="flex justify-center items-center gap-3">
                        <button onClick={() => movePage(-1)} className="w-10 h-10 rounded-full border-2 border-primary hover:bg-primary/30 transition text-lg"><FontAwesomeIcon icon={faArrowLeft} /></button>
                        <button onClick={addPage} className="w-10 h-10 rounded-full border-2 border-primary hover:bg-primary/30 transition text-lg font-bold"><FontAwesomeIcon icon={faPlus} /></button>
                        <button onClick={() => movePage(1)} className="w-10 h-10 rounded-full border-2 border-primary hover:bg-primary/30 transition text-lg"><FontAwesomeIcon icon={faArrowRight} /></button>
                        <button
                            onClick={deletePage}
                            title="Excluir Página Atual"
                            className="w-10 h-10 rounded-full border-2 border-red-500/50 text-red-500/80 hover:bg-red-500/30 hover:text-red-500 transition text-lg">
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ControlPanel;