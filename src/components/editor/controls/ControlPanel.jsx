// src/components/editor/controls/ControlPanel.jsx
"use client";
import { ChangeVolume, ChangeBpm, VersionManager, ConfirmationPopUp } from "../../";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faPlay, faPause, faMusic } from '@fortawesome/free-solid-svg-icons';
import { useState } from "react";

const ControlPanel = ({
                          projectState, projectActions, playerState, playerActions, apiState, apiActions,
                      }) => {
    const { t } = useTranslation();
    const { patterns, activePatternId } = projectState;
    const { setActivePatternId, createNewPatternAndSelect, addChannel, deletePattern } = projectActions;
    const { playPausePattern } = playerActions;
    const { isPatternPlaying } = playerState;

    const [patternToDelete, setPatternToDelete] = useState(null);

    // Ordena por data de criação para manter a ordem estável
    const patternList = Object.values(patterns).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const patternDisplayMap = patternList.reduce((acc, pattern, index) => {
        acc[pattern.id] = index + 1;
        return acc;
    }, {});

    const handleDeleteClick = (e, patternId) => {
        e.stopPropagation();
        setPatternToDelete(patternId);
    };

    const confirmDelete = () => {
        if (patternToDelete) {
            deletePattern(patternToDelete);
            setPatternToDelete(null);
        }
    };

    return (
        <div className="p-4 space-y-6 flex flex-col h-full">
            <div>
                <div className="w-full aspect-video bg-bg-darker rounded-md flex items-center justify-center mb-4 overflow-hidden relative group">
                    {apiState.project?.cover_image ? (
                        <>
                            <img src={apiState.project.cover_image} alt="Album cover" className="w-full h-full object-cover rounded-md" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={playerActions.playPause} className="w-16 h-16 bg-accent/80 rounded-full flex items-center justify-center text-white hover:bg-accent">
                                    <FontAwesomeIcon icon={playerState.isPlaying ? faPause : faPlay} className="text-3xl" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <FontAwesomeIcon icon={faMusic} className="text-5xl text-primary" />
                    )}
                </div>
                <h1 className="text-sm font-bold uppercase text-accent mb-2 mt-4">
                    {projectState.title || t("editor.controls.panel.newProject")}
                </h1>
                <p className="text-sm text-gray-400 h-10 overflow-y-auto">
                    {projectState.description || t("editor.controls.panel.noDescription")}
                </p>
            </div>

            <div className="flex-grow overflow-y-auto space-y-6">
                <ChangeVolume volume={projectState.volume} setVolume={projectActions.setVolume} />
                <ChangeBpm bpm={projectState.bpm} setBpm={projectActions.setBpm} t={t} />
                <div>
                    <h3 className="text-sm font-bold uppercase text-accent mb-2">{t("editor.channels")}</h3>
                    <button
                        onClick={addChannel}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-md border-2 border-primary hover:bg-primary/30 transition flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        {t('editor.sequencer.addChannel')}
                    </button>
                </div>
                <div>
                    <h3 className="text-sm font-bold uppercase text-accent mb-2">{t("editor.patterns")}</h3>
                    <div className="flex items-center gap-2 mb-2">
                        <button
                            onClick={playPausePattern}
                            disabled={!activePatternId}
                            className="flex-1 px-3 py-2 text-xs font-semibold rounded-md border-2 border-accent hover:bg-accent/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FontAwesomeIcon icon={isPatternPlaying ? faPause : faPlay} />
                            {isPatternPlaying ? t('editor.patternControls.pause') : t('editor.patternControls.play')}
                        </button>
                        <button
                            onClick={createNewPatternAndSelect}
                            className="flex-1 px-3 py-2 text-xs font-semibold rounded-md border-2 border-primary hover:bg-primary/30 transition flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            {t('editor.sequencer.newPattern')}
                        </button>
                    </div>
                    <div className="max-h-32 overflow-y-auto border border-primary rounded-md p-1 space-y-1">
                        {patternList.map(p => (
                            <div key={p.id} className={`flex items-center justify-between p-2 rounded-md transition group ${activePatternId === p.id ? 'bg-accent text-white' : 'hover:bg-primary/30'}`}>
                                <button
                                    onClick={() => setActivePatternId(p.id)}
                                    className="flex-grow text-left text-sm"
                                >
                                    {t('editor.pattern')} {patternDisplayMap[p.id]}
                                </button>
                                {patternList.length > 1 && (
                                    <button onClick={(e) => handleDeleteClick(e, p.id)} className="text-red-500/50 hover:text-red-500 ml-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <VersionManager
                    versions={apiState.versions}
                    currentMusicId={apiState.currentMusicId}
                    handleVersionChange={apiActions.handleVersionChange}
                />
            </div>
            <ConfirmationPopUp
                open={!!patternToDelete}
                onClose={() => setPatternToDelete(null)}
                onConfirm={confirmDelete}
                title={t('editor.confirmation.deletePatternTitle')}
                message={t('editor.confirmation.deletePatternMessage')}
            />
        </div>
    );
};

export default ControlPanel;