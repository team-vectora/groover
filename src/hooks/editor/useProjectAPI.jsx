// src/hooks/editor/useProjectAPI.jsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Midi } from "@tonejs/midi";
import * as Tone from "tone";
import { NOTES } from "../../constants";
import { API_BASE_URL } from "../../config";
import { toast } from 'react-toastify';
import { uploadToCloudinary } from '../../lib/util/upload';

const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                resolve(reader.result.split(",")[1]);
            } else {
                reject(new Error("Failed to read blob."));
            }
        };
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

    const exportToMIDI = useCallback(async (projectData, returnBlob = false) => {
        const { bpm, channels, patterns, songStructure } = projectData;
        const midi = new Midi();
        midi.header.setTempo(bpm);
        const barDuration = (60 / bpm) * 4;

        channels.forEach((channel, channelIndex) => {
            const track = midi.addTrack();
            track.instrument.name = channel.instrument;
            let currentTime = 0;
            const channelStructure = songStructure[channelIndex] || [];

            channelStructure.forEach(patternId => {
                if (patternId && patterns[patternId]) {
                    const pattern = patterns[patternId];
                    pattern.notes?.forEach(note => {
                        const noteName = NOTES[note.pitch];
                        if (noteName) {
                            try {
                                track.addNote({
                                    name: noteName,
                                    time: currentTime + (note.start / 32) * barDuration,
                                    duration: ((note.end - note.start) / 32) * barDuration,
                                    velocity: 1
                                });
                            } catch (e) { console.error(`Nota inválida não exportada: ${noteName}`, e); }
                        }
                    });
                }
                currentTime += barDuration;
            });
        });

        const blob = new Blob([await midi.toArray()], { type: "audio/midi" });
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

    useEffect(() => {
        const loadInitialData = async () => {
            if (projectId === "new") {
                projectActions.loadProjectData();
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/projects/${projectId}`, { credentials: "include" });
                if (!res.ok) throw new Error('Failed to load project');
                const data = await res.json();
                setProject(data);
                projectActions.loadProjectData(data.current_music_id ? { ...data, ...data.current_music_id } : data);
                setCurrentMusicId(data.current_music_id?._id);
                setVersions(data.music_versions || []);
            } catch (error) {
                console.error("Error loading project:", error);
                toast.error("Error loading project.");
                router.push('/editor/new');
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [projectId, router]);

    const handleSave = useCallback(async (projectData) => {
        setLoading(true);
        try {
            const midiBlob = await exportToMIDI(projectData, true);
            const base64Midi = await blobToBase64(midiBlob);
            const payload = { ...projectData, midi: base64Midi };

            if (projectData.coverImage instanceof File) {
                // BUGFIX: Chamada corrigida, sem o segundo argumento.
                const imageUrl = await uploadToCloudinary(projectData.coverImage);
                payload.cover_image = imageUrl;
            }

            if (projectId !== "new") payload.id = projectId;

            const response = await fetch(`${API_BASE_URL}/projects`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to save project.");
            }
            const data = await response.json();
            toast.success("Project saved!");
            if (projectId === "new" && data?._id) {
                router.push(`/editor/${data._id}`);
            } else {
                setProject(data);
                setCurrentMusicId(data.current_music_id?._id);
                setVersions(data.music_versions || []);
            }
        } catch (error) {
            console.error("Error saving project:", error);
            toast.error(`Failed to save project: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [projectId, router, exportToMIDI]);

    const importFromMIDI = useCallback(async (file) => {
        if (!file) return;
        try {
            const midiData = new Midi(await file.arrayBuffer());
            const bpm = midiData.header.tempos[0]?.bpm || 120;
            const barDurationInSeconds = (60 / bpm) * 4;
            const TICKS_PER_BAR = 32;
            const newChannels = [], newPatterns = {}, newSongStructure = [];
            let totalBars = 0;

            midiData.tracks.forEach((track, trackIndex) => {
                if (track.notes.length === 0) return;
                const channelId = `imported-channel-${trackIndex}`;
                newChannels.push({ id: channelId, instrument: track.instrument.name || 'piano', volume: -10 });
                const channelStructureRow = [], notesByBar = {};
                track.notes.forEach(note => {
                    const barIndex = Math.floor(note.time / barDurationInSeconds);
                    if (!notesByBar[barIndex]) notesByBar[barIndex] = [];
                    notesByBar[barIndex].push(note);
                    totalBars = Math.max(totalBars, barIndex + 1);
                });
                for (let i = 0; i < totalBars; i++) {
                    const barNotes = notesByBar[i];
                    if (barNotes?.length) {
                        const patternId = `pattern-${channelId}-${i}`;
                        const patternNotes = barNotes.map(note => {
                            const noteStartInBar = note.time % barDurationInSeconds;
                            const startTick = Math.floor((noteStartInBar / barDurationInSeconds) * TICKS_PER_BAR);
                            const endTick = Math.ceil(((noteStartInBar + note.duration) / barDurationInSeconds) * TICKS_PER_BAR);
                            const pitch = NOTES.indexOf(note.name);
                            if (pitch === -1) return null;
                            return { id: `note-${Math.random()}`, pitch, start: startTick, end: Math.max(startTick + 1, endTick) };
                        }).filter(Boolean);
                        if (patternNotes.length > 0) {
                            newPatterns[patternId] = { id: patternId, notes: patternNotes, createdAt: new Date().toISOString() };
                            channelStructureRow.push(patternId);
                        } else {
                            channelStructureRow.push(null);
                        }
                    } else {
                        channelStructureRow.push(null);
                    }
                }
                newSongStructure.push(channelStructureRow);
            });

            if (newChannels.length === 0) {
                toast.warn("No valid notes found in the MIDI file.");
                return;
            }
            newSongStructure.forEach(row => {
                while (row.length < totalBars) row.push(null);
            });
            projectActions.loadProjectData({
                title: file.name.replace(/\.mid$/i, ''), description: "Imported from MIDI file.", bpm, volume: -10,
                channels: newChannels, patterns: newPatterns, songStructure: newSongStructure,
            });
            toast.success("MIDI imported successfully!");
        } catch (e) {
            console.error("Error importing MIDI:", e);
            toast.error("Failed to read or parse the MIDI file.");
        }
    }, [projectActions]);

    const handleVersionChange = useCallback(async (musicId) => {
        if (!musicId || musicId === currentMusicId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/projects/${projectId}/versions/${musicId}`, { credentials: "include" });
            if (!res.ok) throw new Error('Failed to load version');
            const versionData = await res.json();
            projectActions.loadProjectData({ ...project, ...versionData });
            setCurrentMusicId(musicId);
            toast.info("Version loaded.");
        } catch (error) {
            console.error("Error loading version:", error);
            toast.error("Failed to load version.");
        } finally {
            setLoading(false);
        }
    }, [projectId, project, currentMusicId, projectActions]);

    return {
        apiState: { loading, project, versions, currentMusicId },
        apiActions: { handleSave, exportToMIDI, importFromMIDI, handleVersionChange },
    };
};

export default useProjectAPI;