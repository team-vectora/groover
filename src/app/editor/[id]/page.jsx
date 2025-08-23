"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { HeaderEditor, PianoRoll, SaveMusicPopUp, ControlPanel } from "../../../components";
import { useEditor } from "../../../hooks";
import translations from "../../../locales/language.js";

function EditorPage() {
    const params = useParams();
    const { id } = params;

  const {
    // Estados
    loading, activeCol, activeSubIndex, cols, openPop,
    matrixNotes, pages, activePage, lang, instrument,
    volume, bpm, isPlaying, rhythm, selectedColumn,
    tokenJWT, projectId, title, description, versions,
    currentMusicId, lastVersionId, synthRef,

    // Funções
    t, renderKeys, showPopup, handleClosePopup, handleVersionChange,
    addPage, movePage, playNotePiano, playSelectedNotesActivePage,
    playSong, handleSave, exportToMIDI, importFromMIDI,
    setLang, setInstrument, setVolume, setBpm, setRhythm,
    setSelectedColumn, setTitle, setDescription
  } = useEditor(id);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
      <div className="app-container">
        <HeaderEditor
            onPlaySong={playSong}
            onPlayActivePage={() => playSelectedNotesActivePage(activePage)}
            onExport={exportToMIDI}
            onImport={importFromMIDI}
            onSave={showPopup}
            setLang={setLang}
            lang={lang}
            t={t}
            title={title}
        />

        <SaveMusicPopUp
            onSave={handleSave}
            open={openPop}
            onCancel={handleClosePopup}
            description={description}
            title={title}
            setDescription={setDescription}
            setTitle={setTitle}
        />

        <div id="home">
          <ControlPanel
              instrument={instrument}
              setInstrument={setInstrument}
              volume={volume}
              setVolume={setVolume}
              bpm={bpm}
              setBpm={setBpm}
              rhythm={rhythm}
              setRhythm={setRhythm}
              versions={versions}
              currentMusicId={currentMusicId}
              handleVersionChange={handleVersionChange}
              t={t}
              lastVersionId={lastVersionId}
              activePage={activePage}
              pages={pages}
              movePage={movePage}
              addPage={addPage}
              selectedColumn={selectedColumn}
              setSelectedColumn={setSelectedColumn}
          />

          <div id="edit-window">
            <div id="piano-roll-container">
              <div id="notes">{renderKeys()}</div>
              <PianoRoll
                  synthRef={synthRef}
                  bpm={bpm}
                  pages={pages}
                  setPages={setPages}
                  activeCol={activeCol}
                  activeSubIndex={activeSubIndex}
                  setActiveCol={setActiveCol}
                  cols={cols}
                  setCols={setCols}
                  rows={notes.length}
                  notes={notes}
                  activePage={activePage}
                  setActivePage={setActivePage}
                  selectedColumn={selectedColumn}
                  setSelectedColumn={setSelectedColumn}
                  createSubNote={createSubNote}
              />
            </div>
          </div>
        </div>
      </div>
  );
}

export default EditorPage;