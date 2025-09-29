import { PianoRoll, PianoKeys, ControlPanel, Sequencer } from "../.";
import { NOTES } from "../../constants";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const EditorLayout = ({
  projectState, projectActions,
  playerState, playerActions,
  apiState, apiActions,
  isCurrentUserProject,
  isControlPanelOpen, setIsControlPanelOpen,
  isSequencerOpen, setIsSequencerOpen
}) => {
  const activePatternNotes =
    projectState.patterns[projectState.activePatternId]?.notes || [];
  const activeChannel = projectState.channels[projectState.activeChannelIndex];

  return (
    <main className="flex flex-col md:flex-row flex-grow p-4 pt-20 gap-4 relative h-screen overflow-hidden">

      {/* PAINEL MOBILE - CONTROLS */}
      {isControlPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsControlPanelOpen(false)}
          />
          <div className="relative bg-bg-darker max-w-md h-4/5 rounded-lg z-10 flex flex-col w-[90%]">
            <button
              className="absolute top-2 right-2 w-8 h-8  text-text-lighter rounded-full flex items-center justify-center z-20"
              onClick={() => setIsControlPanelOpen(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="flex-1 w-full overflow-y-auto">
              <ControlPanel
                projectState={projectState}
                projectActions={projectActions}
                playerState={playerState}
                playerActions={playerActions}
                apiState={apiState}
                apiActions={apiActions}
              />
            </div>
          </div>
        </div>
      )}

      {/* PAINEL MOBILE - SEQUENCER */}
      {isSequencerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsSequencerOpen(false)}
          />
          <div className="relative bg-bg-darker max-w-md h-4/5 rounded-lg z-10 flex flex-col w-[90%]">
            <button
              className="absolute top-2 right-2 w-8 h-8  text-text-lighter rounded-full flex items-center justify-center z-20"
              onClick={() => setIsSequencerOpen(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="flex-1 w-full overflow-y-auto">
              <Sequencer
                projectState={projectState}
                projectActions={projectActions}
                playerState={playerState}
              />
            </div>
          </div>
        </div>
      )}

      {/* PAINEL DE CONTROLE DESKTOP */}
      <aside className="hidden md:block w-full md:w-1/4 lg:w-1/5 bg-bg-darker rounded-lg p-2 overflow-y-auto">
        <ControlPanel
          projectState={projectState}
          projectActions={projectActions}
          playerState={playerState}
          playerActions={playerActions}
          apiState={apiState}
          apiActions={apiActions}
        />
      </aside>

      {/* ÁREA DE EDIÇÃO PRINCIPAL */}
      <div className="w-full md:flex-1 flex flex-col gap-4">

        {/* SEÇÃO DO PIANO ROLL */}
        <section className="h-2/3 bg-bg-secondary rounded-lg border-2 border-primary relative overflow-hidden">
          <div id="piano-roll-scroll-container" className="h-full w-full overflow-auto">
            <div className="relative flex w-full">
              <PianoKeys
                notes={NOTES}
                onKeyClick={(note) =>
                  playerActions.playNotePiano(note, activeChannel.id)
                }
              />
              <div className="relative flex-grow">
                <PianoRoll
                  patternNotes={activePatternNotes}
                  onNotesChange={(newNotes) =>
                    projectActions.updatePatternNotes(
                      projectState.activePatternId,
                      newNotes
                    )
                  }
                  isCurrentUserProject={isCurrentUserProject}
                  playNote={playerActions.playNotePiano}
                  activeInstrument={activeChannel.id}
                  playheadPositionInTicks={playerState.playheadPositionInTicks}
                  isPlaying={playerState.isPlaying}
                  isPatternPlaying={playerState.isPatternPlaying}
                />
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO DO SEQUENCIADOR (DESKTOP) */}
        <section className="h-1/3 bg-bg-secondary rounded-lg border-2 border-primary p-2 overflow-auto relative">
          <Sequencer
            projectState={projectState}
            projectActions={projectActions}
            playerState={playerState}
          />
        </section>
      </div>
    </main>
  );
};

export default EditorLayout;
