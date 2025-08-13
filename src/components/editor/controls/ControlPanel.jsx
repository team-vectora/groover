"use client";
import ChangeInstrument from "./controls/ChangeInstrument";
import ChangeVolume from "./controls/ChangeVolume";
import ChangeBpm from "./controls/ChangeBpm";
import SelectRitmo from "./controls/SelectRitmo";
import VersionsManager from "./VersionsManager";

const ControlPanel = ({
                          instrument,
                          setInstrument,
                          instruments,
                          volume,
                          setVolume,
                          bpm,
                          setBpm,
                          rhythm,
                          setRhythm,
                          versions,
                          currentMusicId,
                          handleVersionChange,
                          t,
                          lastVersionId,
                          activePage,
                          pages,
                          movePage,
                          addPage,
                          selectedColumn,
                          setSelectedColumn,
                          synthRef
                      }) => {
    return (
        <div className="control-panel">
            <div className="control-group">
                <ChangeInstrument
                    instrument={instrument}
                    instruments={instruments}
                    setInstrument={setInstrument}
                    synthRef={synthRef}
                />
            </div>

            <div className="control-group">
                <ChangeVolume
                    volume={volume}
                    setVolume={setVolume}
                    synthRef={synthRef}
                />
            </div>

            <div className="control-group">
                <ChangeBpm bpm={bpm} setBpm={setBpm} />
            </div>

            <SelectRitmo rhythm={rhythm} setRhythm={setRhythm} />

            <VersionsManager
                versions={versions}
                currentMusicId={currentMusicId}
                handleVersionChange={handleVersionChange}
                t={t}
                lastVersionId={lastVersionId}
            />

            <div className="control-group">
                <h3>{t("page")}</h3>
                <p className="text-sm">
                    {t("pageOf", { current: activePage + 1, total: pages.length })}
                </p>
                <div className="page-buttons">
                    <button onClick={() => movePage(-1)}>⬅</button>
                    <button onClick={addPage}>✛</button>
                    <button onClick={() => movePage(1)}>⮕</button>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;
