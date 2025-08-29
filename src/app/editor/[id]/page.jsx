"use client";
import { useRouter, useParams } from "next/navigation";
import { useAuth, useProjectStates, useTonePlayer, useProjectAPI } from '../../../hooks';
import { HeaderEditor, SaveMusicPopUp, EditorLayout } from '../../../components';
import { useEffect, useState, useCallback } from "react";

export default function EditorPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const { state: projectState, actions: projectActions, projectData } = useProjectStates();
    const { token, loading: authLoading } = useAuth();
    const { synthRef, playerState, playerActions } = useTonePlayer(projectState);
    const { apiState, apiActions } = useProjectAPI(projectData, token);

    const [lang, setLang] = useState("pt");
    const [openPop, setOpenPop] = useState(false);

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

        playerActions.runPlayback(sequence, onVisuals, onEnd);
    }, [projectState.pages, projectState.activePage, playerActions, projectActions.setActivePage]);

    if (authLoading || apiState.loading) {
        return <div className="flex items-center justify-center h-screen">Carregando...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <HeaderEditor
                onPlaySong={() => handlePlay('song')}
                onPlayActivePage={() => handlePlay('page')}
                onExport={apiActions.exportToMIDI}
                onImport={apiActions.importFromMIDI}
                onSave={() => setOpenPop(true)}
                setLang={setLang}
                lang={lang}
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
            />
        </div>
    );
}