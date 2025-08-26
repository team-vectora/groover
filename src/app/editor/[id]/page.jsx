"use client";
import { useParams } from "next/navigation";
import { useEditor } from "../../../hooks";
import { HeaderEditor, PianoRoll, SaveMusicPopUp, ControlPanel } from "../../../components";

function EditorPage() {
    const params = useParams();
    const { id } = params;

    const {
        loading, openPop, title, description, lang, instrument, instruments,
        volume, bpm, rhythm, versions, currentMusicId, lastVersionId, pages,
        activePage, selectedColumn, activeCol, activeSubIndex, cols, notes, synthRef,
        t, renderKeys, playSong, playSelectedNotesActivePage, exportToMIDI,
        importFromMIDI, showPopup, handleSave, handleClosePopup, setTitle,
        setDescription, setLang, setInstrument, setVolume, setBpm, setRhythm,
        handleVersionChange, addPage, movePage, setSelectedColumn, setPages, createSubNote
    } = useEditor(id);

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-background text-foreground">Carregando...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-background text-foreground font-sans">
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

            <main className="flex flex-1 overflow-hidden p-4 gap-4">
                {/* Painel de Controle (Esquerda) */}
                <div className="w-64 flex-shrink-0 bg-bg-secondary rounded-lg border border-primary overflow-y-auto">
                    <ControlPanel
                        instruments={instruments}
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
                </div>

                {/* Área de Edição (Direita) */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 flex overflow-hidden border-2 border-primary rounded-lg">
                        {/* Div para as Teclas do Piano (fixas) */}
                        <div className="sticky left-0 z-10 bg-bg-darker">
                            {renderKeys()}
                        </div>
                        {/* Container do Piano Roll (com scroll) */}
                        <div className="overflow-x-auto w-full">
                            <PianoRoll
                                synthRef={synthRef}
                                bpm={bpm}
                                pages={pages}
                                setPages={setPages}
                                activeCol={activeCol}
                                activeSubIndex={activeSubIndex}
                                cols={cols}
                                rows={notes.length}
                                notes={notes}
                                activePage={activePage}
                                selectedColumn={selectedColumn}
                                setSelectedColumn={setSelectedColumn}
                                createSubNote={createSubNote}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default EditorPage;