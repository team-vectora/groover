// EditorPage.jsx
'use client';
import { useRouter, useParams } from "next/navigation";
import { useAuth, useProjectStates, useTonePlayer, useProjectAPI, useForkProject } from '../../../hooks';
import { HeaderEditor, SaveMusicPopUp, EditorLayout, ConfirmationPopUp } from '../../../components';
import { useEffect, useState, useCallback } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from "react-i18next";

export default function EditorPage() {
    const router = useRouter();
    const params = useParams();
    const { id: projectId } = params;

    const { state: projectState, actions: projectActions, projectData } = useProjectStates();
    const { token, userId, username, loading: authLoading } = useAuth();
    const { synthRef, playerState, playerActions } = useTonePlayer(projectState);
    const { apiState, apiActions } = useProjectAPI(projectId, projectActions);
    const { forkProject, loading: forkLoading } = useForkProject(token);

    const { t } = useTranslation();

    const [lang, setLang] = useState("pt");
    const [openPop, setOpenPop] = useState(false);
    const [confirmationAction, setConfirmationAction] = useState(null); // 'clear' ou 'delete'
    const [isControlPanelOpen, setIsControlPanelOpen] = useState(false); // NOVO: controla painel no mobile

    const isOwner = projectData.ownerId === userId;
    const isCollaborator = projectData.collaborators.includes(userId);
    const isNewProject = projectId === "new";
    const isCurrentUserProject = isOwner || isCollaborator || isNewProject;

    useEffect(() => {
        if (!authLoading && !token) {
            router.push("/login");
        }
    }, [token, authLoading, router]);

    useEffect(() => {
        if (apiState.project) projectActions.loadProjectData(apiState.project);
    }, [apiState.project]);

    useEffect(() => {
        if (apiState.version) projectActions.loadVersionData(apiState.version);
    }, [apiState.version]);

    const handlePlay = useCallback((scope) => {
        const targetPages = scope === 'song' ? projectState.pages : [projectState.pages[projectState.activePage]];
        const sequence = playerActions.createPlaybackSequence(targetPages);

        const onVisuals = (matrixIndex, colIndex, subIndex) => {
            if (scope === 'song') projectActions.setActivePage(matrixIndex);
            playerActions.setActiveCol(colIndex);
            playerActions.setActiveSubIndex(subIndex);
        };
        const onEnd = () => {
            playerActions.setActiveCol(null);
            playerActions.setActiveSubIndex(null);
        };

        playerActions.playPause(sequence, onVisuals, onEnd);
    }, [projectState.pages, projectState.activePage, playerActions, projectActions]);

    const handleFork = async () => {
        if (forkLoading) return;
        toast.info(t("editor.toast.forking"));
        await forkProject(projectId);
    };

    if (authLoading || apiState.loading) {
        return <div className="flex items-center justify-center h-screen">{t("loading")}</div>;
    }

    const handleClear = () => setConfirmationAction('clear');
    const handleDeletePage = () => setConfirmationAction('delete');

    const handleConfirmAction = () => {
        if (confirmationAction === 'clear') projectActions.clearPage(projectState.activePage);
        else if (confirmationAction === 'delete') projectActions.deletePage(projectState.activePage);
        setConfirmationAction(null);
    };

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <ToastContainer position="top-center" theme="dark" />

            {/* Header */}
            <HeaderEditor
                onPlaySong={() => handlePlay('song')}
                onStop={playerActions.stop}
                isPlaying={playerState.isPlaying}
                onExport={() => apiActions.exportToMIDI(projectData)}
                onImport={apiActions.importFromMIDI}
                onSave={() => setOpenPop(true)}
                onFork={handleFork}
                onClear={handleClear}
                isCurrentUserProject={isCurrentUserProject}
                title={projectState.title}
            >
                {/* Botão para abrir/fechar painel no mobile */}
                <button
                    className="md:hidden p-2 ml-2 bg-gray-700 rounded text-white"
                    onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}
                >
                    ☰
                </button>
            </HeaderEditor>

            {/* PopUp salvar música */}
            <SaveMusicPopUp
                open={openPop}
                onSave={() => { apiActions.handleSave(projectData); setOpenPop(false); }}
                onCancel={() => setOpenPop(false)}
                title={projectState.title}
                setTitle={projectActions.setTitle}
                description={projectState.description}
                setDescription={projectActions.setDescription}
            />

            {/* Editor layout com painel lateral */}
            <EditorLayout
                projectState={projectState}
                projectActions={projectActions}
                playerState={playerState}
                playerActions={playerActions}
                apiState={apiState}
                apiActions={apiActions}
                synthRef={synthRef}
                lang={lang}
                onDeletePage={handleDeletePage}
                isCurrentUserProject={isCurrentUserProject}
                username={username}
                isControlPanelOpen={isControlPanelOpen} // passa para controlar visibilidade
            />

            {/* PopUp confirmação */}
            <ConfirmationPopUp
                open={!!confirmationAction}
                onClose={() => setConfirmationAction(null)}
                onConfirm={handleConfirmAction}
                title={
                    confirmationAction === 'clear'
                        ? t("editor.confirmation.clearTitle")
                        : t("editor.confirmation.deleteTitle")
                }
                message={
                    confirmationAction === 'clear'
                        ? t("editor.confirmation.clearMessage")
                        : t("editor.confirmation.deleteMessage")
                }
            />
        </div>
    );
}
