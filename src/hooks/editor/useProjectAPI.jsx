"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Midi } from "@tonejs/midi";
import * as Tone from "tone";
import { useProjectStates, useAuth } from "../../hooks";
import {NOTES , ROWS} from "../../constants";
import { API_BASE_URL } from "../../config"; // ajuste o caminho conforme sua estrutura

// 🔹 Utilitário: converte Blob → Base64
const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// ✅ FUNÇÃO ATUALIZADA: Implementa a compactação dos dados para o backend
const convertPagesToLayers = (pages) => {
    if (!pages) return [];
    return pages.map(page =>
        page.map(column =>
            column.map(noteArray => { // 'noteArray' é o array de sub-notas do cliente
                if (!noteArray || noteArray.length === 0) return null;

                const compactedSubNotes = noteArray.map(subNote => {
                    if (!subNote?.name) {
                        return null; // Colapsa {name: null, ...} para null
                    }
                    return { // Mantém apenas as propriedades relevantes
                        name: subNote.name,
                        isSeparated: subNote.isSeparated || false,
                    };
                });

                // Se todas as sub-notas forem nulas, colapsa o array inteiro para null
                if (compactedSubNotes.every(sn => sn === null)) {
                    return null;
                }

                return compactedSubNotes;
            })
        )
    );
};


const toJson = (data) => ({
    title: data.title || "Novo Projeto",
    description: data.description || "",
    bpm: data.bpm || 120,
    instrument: data.instrument || "piano",
    volume: data.volume || -10,
    layers: convertPagesToLayers(data.pages),
});

const createNote = (duration = 1) => Array(duration).fill(null);

const createNewPage = () =>
    Array.from({ length: 10 }, () =>
        Array.from({ length: ROWS }, () => createNote())
    );

export const useProjectAPI = (projectId, projectActions) => {
    const router = useRouter();

    // Estados principais da API
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);
    const [version, setVersion] = useState(null);
    const [versions, setVersions] = useState([]);
    const [currentMusicId, setCurrentMusicId] = useState("");
    const [lastVersionId, setLastVersionId] = useState("");
    const {actions: statesActions} = useProjectStates();
    const token = localStorage.getItem('token');

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

                console.log(data)

                setProject(data);
                setVersion(data.current_music_id);
                setVersions(data.music_versions);
                setCurrentMusicId(data.current_music_id._id);
                setLastVersionId(data.current_music_id._id);

            } catch (error) {
                console.error("Erro ao carregar projeto:", error);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [router.isReady]);

    // 🔹 Salvar projeto
    const handleSave = useCallback(
        async (projectData) => {
            if (!token) throw new Error("Token não disponível");

            const payload = toJson(projectData);
            const midiBlob = exportToMIDI(projectData, true); // oia a sacanagem, export to midi espera PAGES
            payload.midi = await blobToBase64(midiBlob);        // mas o back espera LAYERS
            console.log("PAYLOAD");
            console.log(JSON.stringify(payload));

            if (projectId !== "new") {
                payload.id = projectId;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/projects`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });

                if (response.status === 401) {
                    router.push("/login");
                    return;
                }

                if (!response.ok) throw new Error("Falha ao salvar o projeto.");

                const data = await response.json();

                if (projectId === "new" && data?._id) {
                    router.push(`/editor/${data._id}`);
                }

                setProject(data);
                setVersion(data.current_music_id);
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
    const exportToMIDI = (projectData, returnBlob = false) => {
        const midi = new Midi();
        const track = midi.addTrack();
        midi.header.setTempo(projectData.bpm);

        let currentTime = 0;
        projectData.pages.forEach((page) => {
            page.forEach((col) => {
                const colDuration = Tone.Time("4n").toSeconds();
                const subNotesCount = Math.max(
                    1,
                    ...col.map((note) => note?.length || 1) // ✅ Modificado
                );
                const subDuration = colDuration / subNotesCount;

                col.forEach((noteRow) => {
                    (noteRow || []).forEach((subNote, subIndex) => { // ✅ Modificado
                        if (subNote?.name) { // ✅ Modificado
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
    };

    const importFromMIDI = useCallback(async (file) => {
        if (!file) return;

        try {
            const midiData = await Midi.fromUrl(URL.createObjectURL(file));
            const newPages = [];
            let currentPage = createNewPage(); // Função auxiliar para criar página vazia
            let currentCols = 0;

            const totalColsPerPage = 10;

            midiData.tracks.forEach(track => {
                track.notes.forEach(note => {
                    const noteEnd = note.time + note.duration;
                    const colIndex = Math.floor(note.time / (Tone.Time('4n').toSeconds()));
                    const pageIndex = Math.floor(colIndex / totalColsPerPage);
                    const localColIndex = colIndex % totalColsPerPage;

                    // Adiciona novas páginas se necessário
                    while (newPages.length <= pageIndex) {
                        newPages.push(createNewPage());
                    }

                    const rowIndex = NOTES.indexOf(note.name);

                    if (rowIndex > -1) {
                        // Garante que a nota seja inserida
                        if(!newPages[pageIndex][localColIndex]) newPages[pageIndex][localColIndex] = Array.from({ length: NOTES.length }, () => [null]);
                        newPages[pageIndex][localColIndex][rowIndex] = [{ name: note.name, isSeparated: false }];
                    }
                });
            });

            projectActions.setPages(newPages.length > 0 ? newPages : [createNewPage()]);
            projectActions.setBpm(midiData.header.tempos[0]?.bpm || 120);

        } catch (e) {
            console.error("Erro ao importar MIDI:", e);
            alert("Não foi possível ler o arquivo MIDI.");
        }
    }, [projectActions]);

    // 🔹 Alterar versão ativa
    const handleVersionChange = useCallback(
        (musicId) => {
            const selectedVersion = versions.find((v) => v.music_id._id === musicId);
            if (selectedVersion) {
                console.log("VERSION: ");
                console.log(selectedVersion);
                setVersion(selectedVersion.music_id);
                setCurrentMusicId(musicId);
            }
        },
        [versions]
    );

    return {
        apiState: { loading, project, version, versions, currentMusicId, lastVersionId },
        apiActions: { handleSave, exportToMIDI, handleVersionChange, importFromMIDI },
    };
};

export default useProjectAPI;