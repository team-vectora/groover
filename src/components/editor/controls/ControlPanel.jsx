"use client";
import { ChangeInstrument, ChangeVolume, ChangeBpm, SelectRitmo, VersionManager } from "../../.";
import translations from "../../../locales/language";


const ControlPanel = ({
                          instrument, setInstrument, instruments, volume, setVolume, bpm, setBpm,
                          rhythm, setRhythm, versions, currentMusicId, handleVersionChange,
                          lastVersionId, activePage, pages, movePage, addPage, lang
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
        <div className="p-4 space-y-6">
            {/* Instrumento */}
            <div className="control-group">
                <h3 className="text-sm font-bold uppercase text-accent mb-2">Instrumento</h3>
                <ChangeInstrument
                    instrument={instrument}
                    instruments={instruments}
                    setInstrument={setInstrument}
                />
            </div>

            {/* Volume */}
            <div className="control-group">
                <h3 className="text-sm font-bold uppercase text-accent mb-2">Volume</h3>
                <ChangeVolume volume={volume} setVolume={setVolume} />
            </div>

            {/* Andamento (BPM) */}
            <div className="control-group">
                <h3 className="text-sm font-bold uppercase text-accent mb-2">{t("tempo")}</h3>
                <ChangeBpm bpm={bpm} setBpm={setBpm} />
            </div>

            {/* Ritmo */}
            <div className="control-group">
                <h3 className="text-sm font-bold uppercase text-accent mb-2">Ritmo (Subdivisões)</h3>
                <SelectRitmo rhythm={rhythm} setRhythm={setRhythm} />
            </div>

            {/* Versões */}
            <div className="control-group">
                <h3 className="text-sm font-bold uppercase text-accent mb-2">{t("versions")}</h3>
                <VersionManager
                    versions={versions}
                    currentMusicId={currentMusicId}
                    handleVersionChange={handleVersionChange}
                    t={t}
                    lastVersionId={lastVersionId}
                />
            </div>

            {/* Páginas */}
            <div className="control-group">
                <h3 className="text-sm font-bold uppercase text-accent mb-2">{t("page")}</h3>
                <p className="text-center text-sm mb-2">
                    {t("pageOf", { current: activePage + 1, total: pages.length || 1 })}
                </p>
                <div className="flex justify-center items-center gap-3">
                    <button onClick={() => movePage(-1)} className="w-10 h-10 rounded-full border-2 border-primary hover:bg-primary/30 transition text-lg">⬅</button>
                    <button onClick={addPage} className="w-10 h-10 rounded-full border-2 border-primary hover:bg-primary/30 transition text-lg">+</button>
                    <button onClick={() => movePage(1)} className="w-10 h-10 rounded-full border-2 border-primary hover:bg-primary/30 transition text-lg">⮕</button>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;