// src/hooks/editor/useProjectAPI.jsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Midi } from "@tonejs/midi";
import * as Tone from "tone";
import { NOTES } from "../../constants";
import { API_BASE_URL } from "../../config";
import { toast } from 'react-toastify';
import useProjectStates from "./useProjectStates";

const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const useProjectAPI = (projectId, projectActions) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);
    const [versions, setVersions] = useState([]);
    const [currentMusicId, setCurrentMusicId] = useState("");
    const [lastVersionId, setLastVersionId] = useState("");
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Carregar dados iniciais do projeto
    useEffect(() => {
        const loadInitialData = async () => {
            if (!projectId || !token || projectId === "new") {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to load project');
                const data = await res.json();

                console.log(data)

                setProject(data);
                // A estrutura da música vem aninhada em current_music_id
                if (data.current_music_id) {
                    projectActions.loadProjectData({ ...data, ...data.current_music_id });
                    setCurrentMusicId(data.current_music_id._id);
                    setLastVersionId(data.current_music_id._id);
                }
                setVersions(data.music_versions || []);

            } catch (error) {
                console.error("Error loading project:", error);
                toast.error("Error loading project.");
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [projectId, token, router]);

    // Salvar Projeto (NOVO FORMATO)
    const handleSave = useCallback(async (projectData) => {
        if (!token) return;

        const midiBlob = await exportToMIDI(projectData, true);
        const midiBase64 = await blobToBase64(midiBlob);

        const payload = {
            ...projectData,
            midi: midiBase64
        };

        if (projectId !== "new") {
            payload.id = projectId;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/projects`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Failed to save project.");

            const data = await response.json();
            toast.success("Project saved!");

            if (projectId === "new" && data?._id) {
                router.push(`/editor/${data._id}`);
            } else {
                setProject(data);
                if (data.current_music_id) {
                    setCurrentMusicId(data.current_music_id._id);
                    setLastVersionId(data.current_music_id._id);
                }
                setVersions(data.music_versions || []);
            }
        } catch (error) {
            console.error("Error saving project:", error);
            toast.error("Failed to save project.");
        }
    }, [token, projectId, router]);

    // Exportar para MIDI (NOVA LÓGICA MULTI-CANAL)
    const exportToMIDI = async (projectData, returnBlob = false) => {
        const { bpm, channels, patterns, songStructure } = projectData;
        const midi = new Midi();
        midi.header.setTempo(bpm);

        const TICKS_PER_BAR = 32;
        const barDuration = Tone.Time("1m").toSeconds();
        const tickDuration = barDuration / TICKS_PER_BAR;

        channels.forEach((channel, channelIndex) => {
            const track = midi.addTrack();
            track.instrument.name = channel.instrument;

            const channelStructure = songStructure[channelIndex] || [];
            channelStructure.forEach((patternId, barIndex) => {
                if (!patternId) return;

                const pattern = patterns[patternId];
                if (!pattern || !pattern.notes) return;

                const barOffset = barIndex * barDuration;

                pattern.notes.forEach(note => {
                    track.addNote({
                        name: NOTES[note.pitch],
                        time: note.start * tickDuration + barOffset,
                        duration: (note.end - note.start) * tickDuration,
                    });
                });
            });
        });

        const blob = new Blob([await midi.toArray()], { type: "audio/midi" });
        if (returnBlob) return blob;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${projectData.title || "music"}.mid`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Importar de MIDI (NOVA LÓGICA MULTI-CANAL)
    const importFromMIDI = useCallback(async (file) => {
        if (!file) return;

        try {
            const midiData = new Midi(await file.arrayBuffer());
            const newChannels = [];
            const newPatterns = {};
            const newSongStructure = [];

            const TICKS_PER_BAR = 32;
            const barDuration = (60 / midiData.header.tempos[0].bpm) * 4;

            midiData.tracks.forEach((track, trackIndex) => {
                if (track.notes.length === 0) return;

                newChannels.push({ id: `imported-channel-${trackIndex}`, instrument: track.instrument.name || 'piano' });
                const channelPatternRow = [];

                // Agrupar notas por compasso
                const notesByBar = {};
                track.notes.forEach(note => {
                    const barIndex = Math.floor(note.time / barDuration);
                    if (!notesByBar[barIndex]) notesByBar[barIndex] = [];
                    notesByBar[barIndex].push(note);
                });

                const maxBar = Math.max(...Object.keys(notesByBar).map(Number));

                for (let barIndex = 0; barIndex <= maxBar; barIndex++) {
                    const barNotes = notesByBar[barIndex];
                    if (!barNotes || barNotes.length === 0) {
                        channelPatternRow.push(null);
                        continue;
                    }

                    const newPatternId = `imported-pattern-${trackIndex}-${barIndex}`;
                    const patternNotes = barNotes.map(note => {
                        const startTick = Math.round((note.time % barDuration) / barDuration * TICKS_PER_BAR);
                        const endTick = Math.round(((note.time % barDuration) + note.duration) / barDuration * TICKS_PER_BAR);
                        return {
                            id: `note-${Math.random()}`,
                            pitch: NOTES.indexOf(note.name),
                            start: startTick,
                            end: Math.max(startTick + 1, endTick),
                        };
                    }).filter(n => n.pitch !== -1);

                    newPatterns[newPatternId] = { id: newPatternId, notes: patternNotes };
                    channelPatternRow.push(newPatternId);
                }
                newSongStructure.push(channelPatternRow);
            });

            projectActions.loadProjectData({
                bpm: midiData.header.tempos[0].bpm,
                channels: newChannels,
                patterns: newPatterns,
                songStructure: newSongStructure
            });
            toast.success("MIDI imported successfully!");

        } catch (e) {
            console.error("Error importing MIDI:", e);
            toast.error("Failed to read MIDI file.");
        }
    }, [projectActions]);

    // Carregar Versão Antiga (NOVA LÓGICA)
    const handleVersionChange = useCallback(async (musicId) => {
        if (!musicId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/projects/${projectId}/versions/${musicId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load version');

            const versionData = await res.json();
            // O `project` (com metadados) permanece o mesmo, só a música muda.
            projectActions.loadProjectData({ ...project, ...versionData });
            setCurrentMusicId(musicId);
            toast.info("Version loaded.");

        } catch (error) {
            console.error("Error loading version:", error);
            toast.error("Failed to load version.");
        } finally {
            setLoading(false);
        }
    }, [projectId, token, project, projectActions]);

    return {
        apiState: { loading, project, versions, currentMusicId, lastVersionId },
        apiActions: { handleSave, exportToMIDI, importFromMIDI, handleVersionChange },
    };
};

export default useProjectAPI;