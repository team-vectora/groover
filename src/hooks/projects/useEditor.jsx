import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation"; // ✅ troca aqui
import * as Tone from "tone";
import { Midi } from '@tonejs/midi';
import PlaybackEngine from "../editor/PaybackEngine";
import ProjectManager from "./ProjectManager";

const notes = [
    "C6", "B5", "A#5", "A5", "G#5", "G5", "F#5", "F5", "E5", "D#5",
    "D5", "C#5", "C5", "B4", "A#4", "A4", "G#4", "G4", "F#4", "F4",
    "E4", "D#4", "D4", "C#4", "C4", "B3", "A#3", "A3", "G#3", "G3",
    "F#3", "F3", "E3", "D#3", "D3", "C#3", "C3", "B2", "A#2", "A2",
    "G#2", "G2", "F#2", "F2", "E2", "D#2", "D2", "C#2", "C2"
];

const acousticInstruments = [
    "bassoon", "cello", "clarinet", "flute", "french-horn",
    "guitar-acoustic", "guitar-electric", "guitar-nylon",
    "harmonium", "organ", "piano", "saxophone", "trombone",
    "trumpet", "violin"
];

export default function useEditor(id) {
    const params = useParams();
    const editorId = id ?? params.id;
    const [loading, setLoading] = useState(true);
    const [activeCol, setActiveCol] = useState(null);
    const [activeSubIndex, setActiveSubIndex] = useState(0);
    const [cols, setCols] = useState(10);
    const [openPop, setOpenPop] = useState(false);
    const [matrixNotes, setMatrixNotes] = useState([]);
    const [pages, setPages] = useState([]);
    const [activePage, setActivePage] = useState(0);
    const [lang, setLang] = useState("pt");
    const [instrument, setInstrument] = useState("piano");
    const [volume, setVolume] = useState(-10);
    const [bpm, setBpm] = useState(120);
    const [isPlaying, setIsPlaying] = useState(false);
    const [rhythm, setRhythm] = useState(1);
    const [selectedColumn, setSelectedColumn] = useState(null);
    const [tokenJWT, setTokenJWT] = useState(null);
    const [projectId, setProjectId] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [versions, setVersions] = useState([]);
    const [currentMusicId, setCurrentMusicId] = useState("");
    const [lastVersionId, setLastVersionId] = useState("");
    const synthRef = useRef(null);

    const instruments = {};
    acousticInstruments.forEach(name => {
        instruments[name] = () => new Tone.Sampler({
            urls: { C4: "C4.mp3" },
            baseUrl: `https://nbrosowsky.github.io/tonejs-instruments/samples/${name}/`,
        });
    });

    const createSubNote = (name = null) => ({ name, isSeparated: false });

    const createNote = (noteName = null, duration = 1) => ({
        name: noteName,
        duration,
        subNotes: Array(duration).fill(createSubNote()),
    });

    // Funções de reprodução
    const playback = PlaybackEngine({
        instruments,
        notes,
        setActiveCol,
        setActiveSubIndex,
        setMatrixNotes,
        setActivePage,
        setIsPlaying
    });

    // Funções de persistência
    const project = ProjectManager({
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
    });

    const t = (key) => key; // TODO: implementar internacionalização

    const showPopup = () => {
        return new Promise((resolve) => {
            setOpenPop(true);
        });
    };

    const handleClosePopup = () => {
        setOpenPop(false);
    };

    const handleVersionChange = async (musicId) => {
        const version = versions.find(v => v.music_id._id === musicId);
        if (version) {
            await project.loadVersionData(version.music_id);
            setCurrentMusicId(musicId);
        }
    };

    const addPage = () => {
        const newMatrix = Array.from({ length: cols }, () =>
            Array.from({ length: notes.length }, () => createNote())
        );
        setPages(prev => [...prev, newMatrix]);
        setMatrixNotes(newMatrix);
        setActivePage(pages.length);
    };

    const movePage = (direction) => {
        setActivePage(prev => {
            const newPage = prev + direction;
            if (newPage >= 0 && newPage < pages.length) {
                setMatrixNotes(pages[newPage]);
                return newPage;
            }
            return prev;
        });
    };

    useEffect(() => {
        setMatrixNotes(pages[activePage] || []);
    }, [activePage, pages]);

    return {
        loading,
        activeCol,
        activeSubIndex,
        cols,
        openPop,
        matrixNotes,
        pages,
        activePage,
        lang,
        instrument,
        volume,
        bpm,
        isPlaying,
        rhythm,
        selectedColumn,
        tokenJWT,
        projectId,
        title,
        description,
        versions,
        currentMusicId,
        lastVersionId,
        synthRef,
        t,
        renderKeys: () => [],
        showPopup,
        handleClosePopup,
        handleVersionChange,
        addPage,
        movePage,
        createSubNote,
        setLang,
        setInstrument,
        setVolume,
        setBpm,
        setRhythm,
        setSelectedColumn,
        setTitle,
        setDescription,
        setPages,
        setActiveCol,
        setCols,
        setActiveSubIndex,
        setActivePage,
        ...playback,
        ...project
    };
}
