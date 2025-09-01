// src/app/editor/[id]/page.jsx
"use client";
import { useRouter, useParams } from "next/navigation";
import { useAuth, useProjectStates, useTonePlayer, useProjectAPI, useForkProject } from '../../../hooks';
import { HeaderEditor, SaveMusicPopUp, EditorLayout, ConfirmationPopUp } from '../../../components';
import { useEffect, useState, useCallback } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditorPage() {
    const router = useRouter();
    const params = useParams();
    const { id: projectId } = params;

    const { state: projectState, actions: projectActions, projectData } = useProjectStates();
    const { token, userId, loading: authLoading } = useAuth();
    const { synthRef, playerState, playerActions } = useTonePlayer(projectState);
    const { apiState, apiActions } = useProjectAPI(projectId, projectActions);
    const { forkProject, loading: forkLoading } = useForkProject(token);

    const [lang, setLang] = useState("pt");
    const [openPop, setOpenPop] = useState(false);
    const [confirmationAction, setConfirmationAction] = useState(null); // pode ser 'clear', 'delete', ou null

    const isCurrentUserProject = apiState.project?.created_by?._id === userId;

    useEffect(() => {
        if (!authLoading && !token) {
            router.push("/login");
        }
    }, [token, authLoading, router]);

    useEffect(() => {
        if (apiState.project) {
            projectActions.loadProjectData(apiState.project);
        }
    }, [apiState.project, projectActions.loadProjectData]);

    useEffect(() => {
        if (apiState.version) {
            projectActions.loadVersionData(apiState.version);
        }
    }, [apiState.version, projectActions.loadVersionData]);


    // ✅ LÓGICA DE PLAY SIMPLIFICADA
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

        // Apenas chama a função playPause do hook
        playerActions.playPause(sequence, onVisuals, onEnd);

    }, [projectState.pages, projectState.activePage, playerActions, projectActions]);

    const handleFork = async () => {
        if (forkLoading) return;
        toast.info("Criando uma cópia do projeto...");
        await forkProject(projectId);
        // O hook useForkProject cuidará do redirecionamento
    };

    if (authLoading || apiState.loading) {
        return <div className="flex items-center justify-center h-screen">Carregando...</div>;
    }

    const handleClear = () => {
        setConfirmationAction('clear');
    };

    const handleDeletePage = () => {
        setConfirmationAction('delete');
    };

    const handleConfirmAction = () => {
        if (confirmationAction === 'clear') {
            projectActions.clearPage(projectState.activePage);
            toast.info("Página limpa!");
        } else if (confirmationAction === 'delete') {
            projectActions.deletePage(projectState.activePage);
            toast.info("Página excluída!");
        }
        setConfirmationAction(null); // Fecha o pop-up
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <ToastContainer position="top-center" theme="dark" />
            <HeaderEditor
                onPlaySong={() => handlePlay('song')}
                onPlayActivePage={() => handlePlay('page')} // Pode ser removido se não for mais necessário
                onStop={playerActions.stop} // ✅ Passa a função stop diretamente
                isPlaying={playerState.isPlaying}
                onExport={() => apiActions.exportToMIDI(projectData)}
                onImport={apiActions.importFromMIDI}
                onSave={() => setOpenPop(true)}
                onFork={handleFork}
                onClear={handleClear}
                isCurrentUserProject={isCurrentUserProject}
                title={projectState.title}
            />
            <SaveMusicPopUp
                open={openPop}
                onSave={() => { apiActions.handleSave(projectData); setOpenPop(false); }}
                onCancel={() => setOpenPop(false)}
                title={projectState.title}
                setTitle={projectActions.setTitle}
                description={projectState.description}
                setDescription={projectActions.setDescription}
            />
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
            />
            <ConfirmationPopUp
                open={!!confirmationAction}
                onClose={() => setConfirmationAction(null)}
                onConfirm={handleConfirmAction}
                title={confirmationAction === 'clear' ? "Limpar Página" : "Excluir Página"}
                message={
                    confirmationAction === 'clear'
                        ? "Todas as notas da página atual serão removidas. Esta ação não pode ser desfeita."
                        : "Esta página será excluída permanentemente. Tem certeza?"
                }
            />
        </div>
    );
}