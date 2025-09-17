import { useState } from "react";
import { ControlPanel, PianoRoll, PianoKeys } from "../.";
import { NOTES, ROWS } from "../../constants";

const EditorLayout = ({
  projectState,
  projectActions,
  playerState,
  playerActions,
  apiState,
  apiActions,
  synthRef,
  lang,
  onDeletePage,
  isCurrentUserProject,
  isControlPanelOpen,
  setIsControlPanelOpen
}) => {

  return (
    <main className="flex flex-col md:flex-row flex-grow p-4 pt-20 gap-4 relative">

      {isControlPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:hidden ">
          {/* Fundo escuro */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsControlPanelOpen(false)}
          />


            {/* Conteúdo do painel */}
            <div className="relative bg-bg-darker max-w-md h-4/5 rounded-lg z-10 flex flex-col w-[90%] ">

              {/* Botão fechar */}
              <button
                className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center z-20"
                onClick={() => setIsControlPanelOpen(false)}
              >
                X
              </button>

              {/* ControlPanel ocupando todo o espaço */}
              <div className="flex-1 w-full">
                <ControlPanel
                  className="h-full w-full"
                  projectState={projectState}
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
                  deletePage={onDeletePage}
                  lang={lang}
                />
              </div>
            </div>


        </div>
      )}

      {/* Painel lateral desktop */}
      <aside className="hidden md:block w-1/4 lg:w-1/5 bg-bg-darker rounded-lg p-2 overflow-y-auto">
        <ControlPanel
          projectState={projectState}
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
          deletePage={onDeletePage}
          lang={lang}
        />
      </aside>

      {/* Área de Edição Principal */}
      <section className="w-full md:flex-1 flex flex-col bg-bg-secondary rounded-lg border-2 border-primary relative z-0">
        <div id="piano-roll-container" className="flex w-full h-full">
          <PianoKeys notes={NOTES} onKeyClick={playerActions.playNotePiano} />
          <div className="flex-grow">
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
              isCurrentUserProject={isCurrentUserProject}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default EditorLayout;
