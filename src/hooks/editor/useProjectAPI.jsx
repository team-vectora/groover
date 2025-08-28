"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Midi } from "@tonejs/midi";
import * as Tone from "tone";

// 🔹 Utilitário: converte Blob → Base64
const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const toJson = (data) => ({
    title: data.title,
    description: data.description,
    bpm: data.bpm,
    instrument: data.instrument,
    volume: data.volume,
    layers: data.pages,   // 🔹 ajuste importante
});

export const useProjectAPI = (token, projectId) => {
    const router = useRouter();

    // Estados principais da API
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);
    const [versions, setVersions] = useState([]);
    const [currentMusicId, setCurrentMusicId] = useState("");
    const [lastVersionId, setLastVersionId] = useState("");

    // 🔹 Carregar dados iniciais
    useEffect(() => {
        const loadInitialData = async () => {
            if (!projectId || !token || projectId === "new") {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const response = await fetch(
                    `http://localhost:5000/api/projects/${projectId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.status === 401) {
                    router.push("/login");
                    return;
                }
                if (!response.ok) throw new Error("Falha ao carregar o projeto.");

                const data = await response.json();

                setProject(data.current_music_id);
                setVersions(data.music_versions);
                setCurrentMusicId(data.current_music_id._id);
                setLastVersionId(data.current_music_id._id);

                setProjectId(projectId);

                setBpm(data.bpm ?? 120);
                setInstrument(data.instrument ?? 'piano');
                setVolume(data.volume ?? -10);
                setTitle(data.title ?? '');
                setDescription(data.description ?? '');
            } catch (error) {
                console.error("Erro ao carregar projeto:", error);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // 🔹 Salvar projeto
    const handleSave = useCallback(
        async (projectData) => {
            if (!token) throw new Error("Token não disponível");

            const payload = toJson(projectData);
            const midiBlob = exportToMIDI(projectData, true); // oia a sacanagem, export to midi espera PAGES
            payload.midi = await blobToBase64(midiBlob);        // mas o back espera LAYERS

            try {
                const response = await fetch("http://localhost:5000/api/projects", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) throw new Error("Falha ao salvar o projeto.");

                const data = await response.json();

                if (projectId === "new" && data.current_music_id?._id) {
                    router.push(`/editor/${data.current_music_id._id}`);
                }

                setProject(data.current_music_id);
                setVersions(data.music_versions);
                setCurrentMusicId(data.current_music_id._id);
                setLastVersionId(data.current_music_id._id);

                return data;
            } catch (error) {
                console.error("Erro ao salvar projeto:", error);
                throw error;
            }
        },
        [token]
    );

    // 🔹 Exportar para MIDI
    const exportToMIDI = useCallback((projectData, returnBlob = false) => {
        const midi = new Midi();
        const track = midi.addTrack();
        midi.header.setTempo(projectData.bpm);

        let currentTime = 0;
        projectData.pages.forEach((page) => {
            page.forEach((col) => {
                const colDuration = Tone.Time("4n").toSeconds();
                const subNotesCount = Math.max(
                    1,
                    ...col.map((note) => note?.subNotes?.length || 1)
                );
                const subDuration = colDuration / subNotesCount;

                col.forEach((noteRow) => {
                    (noteRow.subNotes || []).forEach((subNote, subIndex) => {
                        if (subNote.name) {
                            try {
                                track.addNote({
                                    name: subNote.name,
                                    time: currentTime + subIndex * subDuration,
                                    duration: subDuration,
                                });
                            } catch (e) {
                                console.error(`Nota inválida não exportada: ${subNote.name}`, e);
                            }
                        }
                    });
                });

                currentTime += colDuration;
            });
        });

        const blob = new Blob([midi.toArray()], { type: "audio/midi" });

        if (returnBlob) return blob;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${projectData.title || "music"}.mid`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, []);

    // 🔹 Alterar versão ativa
    const handleVersionChange = useCallback(
        (musicId) => {
            const selectedVersion = versions.find((v) => v.music_id._id === musicId);
            if (selectedVersion) {
                setProject(selectedVersion.music_id);
                setCurrentMusicId(musicId);
            }
        },
        [versions]
    );

    return {
        apiState: { loading, project, versions, currentMusicId, lastVersionId },
        apiActions: { handleSave, exportToMIDI, handleVersionChange },
    };
};

export default useProjectAPI;
