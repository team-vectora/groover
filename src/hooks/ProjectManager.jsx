import { Midi } from "@tonejs/midi";

export default function ProjectManager({
                                           id,
                                           router,
                                           setLoading,
                                           setTokenJWT,
                                           setProjectId,
                                           setVersions,
                                           setCurrentMusicId,
                                           setLastVersionId,
                                           setBpm,
                                           setInstrument,
                                           setVolume,
                                           setTitle,
                                           setDescription,
                                           setPages,
                                           setMatrixNotes,
                                           setActivePage,
                                           bpm,
                                           tokenJWT
                                       }) {
    const toJson = () => {
        return {
            title,
            description,
            bpm,
            instrument,
            volume,
            layers: pages.map((page) =>
                page.map((column) =>
                    column.map((note) => ({
                        name: note.name,
                        duration: note.duration,
                        subNotes: note.subNotes.map((sub) => ({
                            name: sub.name,
                            isSeparated: sub.isSeparated
                        }))
                    }))
                )
            )
        };
    };

    const midiBlob = () => {
        const midi = new Midi();
        const track = midi.addTrack();
        midi.header.setTempo(bpm);

        let currentTime = 0;

        pages.forEach((page) => {
            page.forEach((col) => {
                const colDuration = 0.5; // 4n = 0.5s
                const subNotesCount = Math.max(...col.map((note) => note?.subNotes?.length || 1));
                const subDuration = colDuration / subNotesCount;

                col.forEach((noteRow, rowIndex) => {
                    const noteName = noteRow.name;

                    if (noteRow.subNotes) {
                        noteRow.subNotes.forEach((subNote, subIndex) => {
                            if (subNote.name) {
                                const startTime = currentTime + subIndex * subDuration;

                                try {
                                    track.addNote({
                                        name: subNote.name,
                                        time: startTime,
                                        duration: subDuration
                                    });
                                } catch (error) {
                                    console.error("Erro ao adicionar nota MIDI:", error);
                                }
                            }
                        });
                    }
                });

                currentTime += colDuration;
            });
        });

        return new Blob([midi.toArray()], { type: "audio/midi" });
    };

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleSave = async () => {
        if (!tokenJWT) {
            alert("Você precisa estar logado para salvar o projeto.");
            return;
        }

        const data = toJson();
        if (id) data.id = id;

        const midiFile = midiBlob();
        const midiBase64 = await blobToBase64(midiFile);
        data.midi = midiBase64;

        try {
            const res = await fetch("http://localhost:5000/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenJWT}`
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            setCurrentMusicId(result.current_music_id._id);
            setLastVersionId(result.current_music_id._id);
            setVersions(result.music_versions);
            setBpm(result.bpm);
            setInstrument(result.instrument);
            setVolume(result.volume);
            setTitle(result.title);
            setDescription(result.description);

            if (!id) {
                await router.push(`/editor/${result._id}`);
            }

            alert("Projeto salvo com sucesso!");
        } catch (err) {
            console.error("Erro ao salvar:", err);
            alert("Erro ao salvar o projeto.");
        }
    };

    const exportToMIDI = () => {
        const blob = midiBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "music.mid";
        a.click();
        URL.revokeObjectURL(url);
    };

    const importFromMIDI = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                setBpm(data.bpm);
                setInstrument(data.instrument);
                setVolume(data.volume);
                setTitle(data.title);
                setDescription(data.description);
                if (data.layers) {
                    setPages(data.layers);
                    setMatrixNotes(data.layers[0]);
                    setActivePage(0);
                }
            } catch (err) {
                alert("Erro ao importar arquivo.");
            }
        };
        reader.readAsText(file);
    };

    const loadProjectData = async (projectId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${tokenJWT}`
                }
            });

            const data = await response.json();

            if (data.bpm != null && data.instrument != null && data.volume != null) {
                await loadVersionData(data.current_music_id);

                setCurrentMusicId(data.current_music_id._id);
                setLastVersionId(data.current_music_id._id);
                setProjectId(projectId);
                setVersions(data.music_versions);
                setBpm(data.bpm);
                setInstrument(data.instrument);
                setVolume(data.volume);
                setTitle(data.title);
                setDescription(data.description);
            }
        } catch (error) {
            console.error("Erro ao carregar projeto:", error);
        }
    };

    const loadVersionData = async (version) => {
        try {
            if (!version || !version.layers) return;
            setPages(version.layers);
            setMatrixNotes(version.layers[0]);
            setActivePage(0);
        } catch (err) {
            console.error("Erro ao carregar versão:", err);
        }
    };

    const formatAPIDate = (dateString) => {
        const date = new Date(dateString);
        return isNaN(date)
            ? "Data inválida"
            : `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    return {
        toJson,
        handleSave,
        exportToMIDI,
        importFromMIDI,
        loadProjectData,
        loadVersionData,
        formatAPIDate
    };
}
