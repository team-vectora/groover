"use client";
import { useState, useEffect, useCallback } from 'react';
import { NOTES, ROWS, INITIAL_COLS } from '../../constants'; // Arquivo de constantes

const createSubNote = (name = null) => ({ name, isSeparated: false });
const createNote = (duration = 1) => ({
    name: null,
    duration,
    subNotes: Array(duration).fill(null).map(() => createSubNote()),
});

const createNewMatrix = () =>
    Array.from({ length: INITIAL_COLS }, () =>
        Array.from({ length: ROWS }, () => createNote())
    );

export const useProjectState = () => {
    const [title, setTitle] = useState("Novo Projeto");
    const [description, setDescription] = useState("");
    const [bpm, setBpm] = useState(120);
    const [instrument, setInstrument] = useState('piano');
    const [volume, setVolume] = useState(-10);
    const [rhythm, setRhythm] = useState(1);

    const [pages, setPages] = useState([createNewMatrix()]);
    const [activePage, setActivePage] = useState(0);
    const [selectedColumn, setSelectedColumn] = useState(null);

    useEffect(() => {
        if (selectedColumn === null) return;

        setPages((prevPages) => {
            const newPages = [...prevPages];
            const currentMatrix = [...newPages[activePage]];

            const updatedCol = currentMatrix[selectedColumn].map(note => {
                const oldSubNotes = note.subNotes || [];
                const newSubNotes = Array.from({ length: rhythm }, (_, i) =>
                    oldSubNotes[i] || createSubNote()
                );
                return { ...note, subNotes: newSubNotes };
            });

            currentMatrix[selectedColumn] = updatedCol;
            newPages[activePage] = currentMatrix;
            return newPages;
        });
        setSelectedColumn(null);
    }, [rhythm, selectedColumn, activePage]);

    const addPage = useCallback(() => {
        setPages(prev => [...prev, createNewMatrix()]);
        setActivePage(pages.length);
    }, [pages.length]);

    const movePage = useCallback((change) => {
        setActivePage(prev => {
            const next = prev + change;
            if (next < 0 || next >= pages.length) return prev;
            return next;
        });
    }, [pages.length]);

    const projectData = {
        title, description, bpm, instrument, volume, pages,
    };

    const loadProjectData = useCallback((data) => {
        setTitle(data.title ?? "Novo Projeto");
        setDescription(data.description ?? "");
        setBpm(data.bpm ?? 120);
        setInstrument(data.instrument ?? 'piano');
        setVolume(data.volume ?? -10);
        if (data.layers && data.layers.length > 0) {
            setPages(data.layers);
            setActivePage(0);
        } else {
            setPages([createNewMatrix()]);
        }
    }, []);

    return {
        state: { title, description, bpm, instrument, volume, rhythm, pages, activePage, selectedColumn },
        actions: {
            setTitle, setDescription, setBpm, setInstrument, setVolume, setRhythm,
            setPages, setActivePage, setSelectedColumn, addPage, movePage, loadProjectData
        },
        projectData,
    };
};

export default useProjectState;