import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as Tone from "tone";
import { Midi } from '@tonejs/midi';
import translations from "../../locales/language.js";
import PlaybackEngine from "../editor/PlaybackEngine";

// Constantes e Funções Utilitárias
const ROWS = 49;
const INITIAL_COLS = 10;
const NOTES = [
    "C6", "B5", "A#5", "A5", "G#5", "G5", "F#5", "F5", "E5", "D#5",
    "D5", "C#5", "C5", "B4", "A#4", "A4", "G#4", "G4", "F#4", "F4",
    "E4", "D#4", "D4", "C#4", "C4", "B3", "A#3", "A3", "G#3", "G3",
    "F#3", "F3", "E3", "D#3", "D3", "C#3", "C3", "B2", "A#2", "A2",
    "G#2", "G2", "F#2", "F2", "E2", "D#2", "D2", "C#2", "C2"
];

const ACOUSTIC_INSTRUMENTS = [
    "bassoon", "cello", "clarinet", "flute", "french-horn", "guitar-acoustic",
    "guitar-electric", "guitar-nylon", "harmonium", "organ", "piano",
    "saxophone", "trombone", "trumpet", "violin"
];

const INSTRUMENTS = {};
ACOUSTIC_INSTRUMENTS.forEach(name => {
    INSTRUMENTS[name] = () => new Tone.Sampler({
        urls: { C4: "C4.mp3" },
        baseUrl: `https://nbrosowsky.github.io/tonejs-instruments/samples/${name}/`,
    }).toDestination();
});

const createSubNote = (name = null) => ({
    name,
    isSeparated: false
});

const createNote = (duration = 1) => ({
    name: null,
    duration,
    subNotes: Array(duration).fill(null).map(() => createSubNote()),
});

const createNewMatrix = () => Array.from({ length: INITIAL_COLS }, () =>
    Array.from({ length: ROWS }, () => createNote())
);

export default function useEditor(id) {
    const router = useRouter();

    // Estados
    const [loading, setLoading] = useState(true);
    const [activeCol, setActiveCol] = useState(null);
    const [activeSubIndex, setActiveSubIndex] = useState(0);
    const [cols, setCols] = useState(INITIAL_COLS);
    const [openPop, setOpenPop] = useState(false);
    const [pages, setPages] = useState([createNewMatrix()]);
    const [activePage, setActivePage] = useState(0);
    const [lang, setLang] = useState("en");
    const [instrument, setInstrument] = useState('piano');
    const [volume, setVolume] = useState(-10);
    const [bpm, setBpm] = useState(120);
    const [isPlaying, setIsPlaying] = useState(false);
    const [rhythm, setRhythm] = useState(1);
    const [selectedColumn, setSelectedColumn] = useState(null);
    const [tokenJWT, setTokenJWT] = useState(null);
    const [projectId, setProjectId] = useState(id === "new" ? null : id);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [versions, setVersions] = useState([]);
    const [currentMusicId, setCurrentMusicId] = useState("");
    const [lastVersionId, setLastVersionId] = useState("");

    // Integração com o PlaybackEngine
    const {
        synthRef,
        playNotePiano,
        playSelectedNotesActivePage,
        playSong,
        stopPlayback,
    } = PlaybackEngine({
        isPlaying,
        setIsPlaying,
        bpm,
        pages,
        notes: NOTES,
        instrument,
        instruments: INSTRUMENTS,
        volume,
        setActiveCol,
        setActiveSubIndex,
        setActivePage,
        createSubNote,
    });

    // --- LÓGICA DE MANIPULAÇÃO DA MATRIZ ---
    useEffect(() => {
        if (selectedColumn === null) return;

        setPages((prevPages) => {
            const newPages = [...prevPages];
            const currentMatrix = [...newPages[activePage]];

            const updatedCol = currentMatrix[selectedColumn].map(note => {
                const oldSubNotes = note.subNotes || [];
                const newSubNotes = Array.from({ length: rhythm }, (_, i) => {
                    return oldSubNotes[i] || createSubNote();
                });

                return {
                    ...note,
                    duration: rhythm,
                    subNotes: newSubNotes,
                };
            });

            currentMatrix[selectedColumn] = updatedCol;
            newPages[activePage] = currentMatrix;
            return newPages;
        });

        setSelectedColumn(null);
    }, [rhythm, selectedColumn, activePage]);

    const handleColumnSelect = (colIndex) => {
        setSelectedColumn(colIndex);
    };

    const handleSubNoteClick = (rowIndex, colIndex, subIndex) => {
        setPages((prevPages) => {
            const newPages = [...prevPages];
            const currentMatrix = [...newPages[activePage]];
            const note = { ...currentMatrix[colIndex][rowIndex] };
            const noteName = NOTES[rowIndex];

            note.subNotes = [...(note.subNotes || [])];

            if (note.subNotes[subIndex]?.name) {
                note.subNotes[subIndex] = createSubNote();
            } else {
                note.subNotes[subIndex] = createSubNote(noteName);
            }

            currentMatrix[colIndex][rowIndex] = note;
            newPages[activePage] = currentMatrix;
            return newPages;
        });
        playNotePiano(NOTES[rowIndex]);
    };

    const handleSubNoteRightClick = (rowIndex, colIndex, subIndex, e) => {
        e.preventDefault();
        setPages((prevPages) => {
            const newPages = [...prevPages];
            const currentMatrix = [...newPages[activePage]];
            const note = { ...currentMatrix[colIndex][rowIndex] };

            if (!note || !note.subNotes) return prevPages;

            note.subNotes = [...note.subNotes];
            const oldSubNote = note.subNotes[subIndex] || createSubNote();
            note.subNotes[subIndex] = { ...oldSubNote, isSeparated: !oldSubNote.isSeparated };

            currentMatrix[colIndex][rowIndex] = note;
            newPages[activePage] = currentMatrix;
            return newPages;
        });
    };

    // --- EFEITOS ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        } else {
            setTokenJWT(token);
        }
    }, [router]);

    useEffect(() => {
        const loadData = async () => {
            if (tokenJWT && id) {
                if (id !== "new") {
                    await loadProjectData(id);
                } else {
                    setPages([createNewMatrix()]);
                }
                setLoading(false);
            }
        };
        loadData();
    }, [id, tokenJWT]);

    // --- FUNÇÕES ---
    const t = (key, params) => {
        let text = translations[lang]?.[key] || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, v);
            });
        }
        return text;
    };

    const renderKeys = () => {
        return (
            <div className="flex flex-col w-[80px] min-w-[80px] bg-bg-secondary border-r-2 border-primary">
                {NOTES.map((note) => {
                    const isBlackKey = note.includes("#");
                    let keyClasses = "flex items-center justify-center w-full select-none cursor-pointer transition-all duration-100 ease-in-out";

                    if (isBlackKey) {
                        keyClasses += " h-[20px] bg-gradient-to-b from-primary to-primary-light text-text-lighter z-10 border-b border-bg-darker shadow-inner relative";
                    } else {
                        keyClasses += " h-[30px] bg-foreground text-bg-darker border-b border-gray-300";
                    }

                    return (
                        <div
                            onClick={() => playNotePiano(note)}
                            key={note}
                            className={keyClasses}
                        >
                            <p className="font-bold text-xs pointer-events-none">{note}</p>
                        </div>
                    );
                })}
            </div>
        );
    };

    const showPopup = () => setOpenPop(true);
    const handleClosePopup = () => setOpenPop(false);

    const addPage = () => {
        const newMatrix = createNewMatrix();
        setPages(prev => [...prev, newMatrix]);
        setActivePage(pages.length);
    };

    const movePage = (change) => {
        setActivePage(prev => {
            const next = prev + change;
            if (next < 0) return 0;
            if (next >= pages.length) return pages.length - 1;
            return next;
        });
    };

    const midiBlob = () => {
        const midi = new Midi();
        const track = midi.addTrack();
        midi.header.setTempo(bpm);
        let currentTime = 0;
        pages.forEach(page => {
            page.forEach(col => {
                const colDuration = Tone.Time("4n").toSeconds();
                const subNotesCount = Math.max(...col.map(note => note?.subNotes?.length || 1));
                const subDuration = colDuration / subNotesCount;
                col.forEach((noteRow, rowIndex) => {
                    noteRow.subNotes?.forEach((subNote, subIndex) => {
                        if (subNote.name) {
                            track.addNote({
                                name: subNote.name,
                                time: currentTime + (subIndex * subDuration),
                                duration: subDuration
                            });
                        }
                    });
                });
                currentTime += colDuration;
            });
        });
        return new Blob([midi.toArray()], { type: 'audio/midi' });
    };

    const exportToMIDI = () => {
        const blob = midiBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || 'music'}.mid`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const blobToBase64 = (blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

    const handleSave = async () => {
        if (!tokenJWT) return alert("Você precisa estar logado para salvar.");

        const midiFileBlob = midiBlob();
        const midiBase64 = await blobToBase64(midiFileBlob);

        const projectData = {
            title,
            description,
            bpm,
            instrument,
            volume,
            layers: pages,
            midi: midiBase64
        };
        if (projectId) projectData.id = projectId;

        try {
            const response = await fetch('https://groover-api.onrender.com/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenJWT}`
                },
                body: JSON.stringify(projectData),
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Erro ao salvar");

            if (!projectId) {
                router.push(`/editor/${data._id}`);
            }

            setVersions(data.music_versions);
            setCurrentMusicId(data.current_music_id._id);
            setLastVersionId(data.current_music_id._id);
            handleClosePopup();
        } catch (error) {
            console.error('Erro ao salvar:', error);
        }
    };

    const loadVersionData = (version) => {
        if (version?.layers?.length > 0) {
            setPages(version.layers);
            setActivePage(0);
        } else {
            const newMatrix = createNewMatrix();
            setPages([newMatrix]);
        }
    };

    const loadProjectData = async (projId) => {
        try {
            const response = await fetch(`https://groover-api.onrender.com/api/projects/${projId}`, {
                headers: { 'Authorization': `Bearer ${tokenJWT}` }
            });
            if (!response.ok) throw new Error('Falha ao carregar projeto');
            const data = await response.json();

            setProjectId(projId);
            setTitle(data.title ?? '');
            setDescription(data.description ?? '');
            setBpm(data.bpm ?? 120);
            setInstrument(data.instrument ?? 'piano');
            setVolume(data.volume ?? -10);
            setVersions(data.music_versions);
            setCurrentMusicId(data.current_music_id._id);
            setLastVersionId(data.current_music_id._id);

            loadVersionData(data.current_music_id);

        } catch (error) {
            console.error(error);
            router.push('/editor/new');
        }
    };

    const handleVersionChange = async (musicId) => {
        const selectedVersion = versions.find(v => v.music_id._id === musicId);
        if (selectedVersion) {
            loadVersionData(selectedVersion.music_id);
            setCurrentMusicId(musicId);
        }
    };

    const importFromMIDI = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            try {
                const data = JSON.parse(content);
                setBpm(data.bpm);
                setInstrument(data.instrument);
                setVolume(data.volume);
                if (data.layers?.length > 0) {
                    setPages(data.layers);
                    setActivePage(0);
                }
            } catch (error) {
                alert(`Falha ao importar: ${error.message}`);
            }
        };
        reader.readAsText(file);
    };

    return {
        loading,
        openPop,
        title,
        description,
        lang,
        instrument,
        instruments: INSTRUMENTS,
        volume,
        bpm,
        isPlaying,
        rhythm,
        selectedColumn,
        versions,
        currentMusicId,
        lastVersionId,
        pages,
        activePage,
        activeCol,
        activeSubIndex,
        cols,
        notes: NOTES,
        synthRef,

        t,
        renderKeys,
        showPopup,
        handleClosePopup,
        handleVersionChange,
        addPage,
        movePage,
        playNotePiano,
        playSelectedNotesActivePage,
        playSong,
        stopPlayback,
        handleSave,
        exportToMIDI,
        importFromMIDI,
        setLang,
        setInstrument,
        setVolume,
        setBpm,
        setRhythm,
        setSelectedColumn,
        setTitle,
        setDescription,
        setPages,
        createSubNote,
        handleColumnSelect,
        handleSubNoteClick,
        handleSubNoteRightClick,
    };
}