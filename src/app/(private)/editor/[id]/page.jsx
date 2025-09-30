// src/app/editor/[id]/page.jsx
'use client';
import { useRouter, useParams } from "next/navigation";
import { useAuth, useProjectStates, useTonePlayer, useProjectAPI, useForkProject } from '../../../../hooks';
import { HeaderEditor, SaveMusicPopUp, EditorLayout, ConfirmationPopUp, LoadingDisc } from '../../../../components';
import { useEffect, useState, useCallback, useContext } from "react";
import { MidiContext } from "../../../../contexts/MidiContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from "react-i18next";

export default function EditorPage() {
    const router = useRouter();
    const params = useParams();
    const { id: projectId } = params;

    const { setIsEditorActive, stop: stopGlobalPlayer } = useContext(MidiContext);

    const { state: projectState, actions: projectActions, projectData } = useProjectStates();
    const { userId, loading: authLoading } = useAuth();
    const { playerState, playerActions } = useTonePlayer(projectState);
    const { apiState, apiActions } = useProjectAPI(projectId, projectActions);
    const { forkProject, loading: forkLoading } = useForkProject();
    const { t } = useTranslation();

    const [openPop, setOpenPop] = useState(false);
    const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
    const [isSequencerOpen, setIsSequencerOpen] = useState(false);
    const [confirmationAction, setConfirmationAction] = useState(null);
    const [coverImageFile, setCoverImageFile] = useState(null);

    const isOwner = projectData.owner === userId;
    const isCollaborator = projectData.collaborators?.includes(userId);
    const isNewProject = projectId === "new";
    const isCurrentUserProject = isOwner || isCollaborator || isNewProject;

    const handlePlay = useCallback(() => {
        playerActions.playPause();
    }, [playerActions]);

    const handleFork = async () => {
        if (forkLoading) return;
        toast.info(t("toasts.forking"));
        await forkProject(projectId);
    };

    const handleClear = () => setConfirmationAction('clear');

    const handleConfirmAction = () => {
        if (confirmationAction === 'clear' && projectState.activePatternId) {
            projectActions.updatePatternNotes(projectState.activePatternId, []);
            toast.info(t('toasts.patternCleared'));
        }
        setConfirmationAction(null);
    };

    if (authLoading || apiState.loading || !projectState) {
        return (
            <div className="flex flex-col items-center justify-center w-screen h-screen bg-[var(--color-background)] text-center p-4">
                <LoadingDisc />
                <span
                    className="mt-4 text-lg font-bold text-transparent bg-clip-text inline-block"
                    style={{
                        backgroundImage: `linear-gradient(90deg, var(--color-accent), var(--color-accent-light), var(--color-primary-light), var(--color-accent))`,
                        backgroundSize: "300% 100%",
                        animation: "gradient 2s linear infinite",
                    }}
                >
                    {t("editor.loadingMessage")}
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <ToastContainer position="top-center" theme="dark" />
            <HeaderEditor
                onPlaySong={handlePlay}
                onStop={playerActions.stop}
                isPlaying={playerState.isPlaying || playerState.isPatternPlaying}
                onExport={() => apiActions.exportToMIDI(projectData)}
                onImport={apiActions.importFromMIDI}
                onSave={() => setOpenPop(true)}
                onClear={handleClear}
                onFork={handleFork}
                isCurrentUserProject={isCurrentUserProject}
                title={projectState.title}
                setIsControlPanelOpen={setIsControlPanelOpen}
                setIsSequencerOpen={setIsSequencerOpen}
                isSequencerOpen={isSequencerOpen}
                isControlPanelOpen={isControlPanelOpen}
            />
            <SaveMusicPopUp
                open={openPop}
                onSave={() => { apiActions.handleSave({ ...projectData, coverImage: coverImageFile }); setOpenPop(false); }}
                onCancel={() => setOpenPop(false)}
                title={projectState.title}
                setTitle={projectActions.setTitle}
                description={projectState.description}
                setDescription={projectActions.setDescription}
                onImageChange={setCoverImageFile}
                coverImage={apiState.project?.cover_image}
            />
            <EditorLayout
                projectState={projectState}
                projectActions={projectActions}
                playerState={playerState}
                playerActions={playerActions}
                apiState={apiState}
                apiActions={apiActions}
                isCurrentUserProject={isCurrentUserProject}
                setIsControlPanelOpen={setIsControlPanelOpen}
                isSequencerOpen={isSequencerOpen}
                setIsSequencerOpen={setIsSequencerOpen}
                isControlPanelOpen={isControlPanelOpen}
            />
            <ConfirmationPopUp
                open={!!confirmationAction}
                onClose={() => setConfirmationAction(null)}
                onConfirm={handleConfirmAction}
                title={t("editor.confirmation.clearTitle")}
                message={t("editor.confirmation.clearMessage")}
            />
        </div>
    );
}