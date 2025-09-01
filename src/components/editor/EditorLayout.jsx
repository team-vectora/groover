import { ControlPanel, PianoRoll, PianoKeys } from "../.";
import { NOTES, ROWS } from "../../constants";

const EditorLayout = ({
                          projectState, projectActions,
                          playerState, playerActions,
                          apiState, apiActions,
                          synthRef, lang, onDeletePage
                      }) => {
    return (
        <main className="flex flex-col md:flex-row flex-grow p-4 gap-4">
            {/* Painel de Controle (Lateral) */}
            <aside className="w-full md:w-1/4 lg:w-1/5 bg-bg-darker rounded-lg p-2 overflow-y-auto">
                <ControlPanel
                    instrument={projectState.instrument}
                    setInstrument={projectActions.setInstrument}
                    instruments={playerState.instruments}
                    volume={projectState.volume}
                    setVolume={projectActions.setVolume}
                    bpm={projectState.bpm}
                    setBpm={projectActions.setBpm}
                    rhythm={projectState.rhythm}
                    setRhythm={projectActions.setRhythm}
                    versions={apiState.versions}
                    currentMusicId={apiState.currentMusicId}
                    handleVersionChange={apiActions.handleVersionChange}
                    lastVersionId={apiState.lastVersionId}
                    activePage={projectState.activePage}
                    pages={projectState.pages}
                    movePage={projectActions.movePage}
                    addPage={projectActions.addPage}
                    deletePage={onDeletePage} // Passando a nova prop
                    lang={lang}
                />
            </aside>

            {/* Área de Edição Principal */}
            <section className="w-full md:w-3/4 lg:w-4/5 flex flex-col bg-bg-secondary rounded-lg border-2 border-primary">
                <div id="piano-roll-container" className="flex w-full overflow-x-auto h-full">
                    <PianoKeys notes={NOTES} onKeyClick={playerActions.playNotePiano} />
                    <PianoRoll
                        synthRef={synthRef}
                        pages={projectState.pages}
                        setPages={projectActions.setPages}
                        activePage={projectState.activePage}
                        activeCol={playerState.activeCol}
                        activeSubIndex={playerState.activeSubIndex}
                        notes={NOTES}
                        rows={ROWS}
                        selectedColumn={projectState.selectedColumn}
                        setSelectedColumn={projectActions.setSelectedColumn}
                    />
                </div>
            </section>
        </main>
    );
};
export default EditorLayout;