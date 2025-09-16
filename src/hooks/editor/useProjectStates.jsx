// src/hooks/editor/useProjectStates.jsx
"use client";
import { useState, useEffect, useCallback } from 'react';
import { ROWS, INITIAL_COLS } from '../../constants'; // Arquivo de constantes
import { useTranslation } from 'react-i18next';

// ✅ FUNÇÕES ATUALIZADAS: Criam a nova estrutura de dados compacta
const createNote = (duration = 1) => Array(duration).fill(null);

const createNewMatrix = () =>
    Array.from({ length: INITIAL_COLS }, () =>
        Array.from({ length: ROWS }, () => createNote())
    );

// ✅ NOVA FUNÇÃO: Garante que a estrutura de dados seja segura para iteração
const rehydrateLayers = (layers, rows) => {
    if (!layers || layers.length === 0) return [];

    return layers.map(page => {
        if (!page) return [];

        return page.map(column => {
            // Encontra o maior número de subdivisões nesta coluna para usá-lo como base
            const maxSubdivisions = Math.max(1, ...column.map(noteArray => Array.isArray(noteArray) ? noteArray.length : 1));

            return (column || []).map(noteArray => {
                // Se a célula for nula (problema das versões antigas),
                // cria um array de nulos com o tamanho correto da subdivisão da coluna.
                if (noteArray === null) {
                    return Array(maxSubdivisions).fill(null);
                }
                // Garante que o que veio é um array
                return Array.isArray(noteArray) ? noteArray : [noteArray];
            });
        });
    });
};

const createNewPage = () =>
    Array.from({ length: 10 }, () =>
        Array.from({ length: ROWS }, () => createNote())
    );

export const useProjectState = () => {
    const { t } = useTranslation();
    const [title, setTitle] = useState("Novo Projeto");
    const [description, setDescription] = useState("");
    const [bpm, setBpm] = useState(120);
    const [instrument, setInstrument] = useState('piano');
    const [volume, setVolume] = useState(-10);
    const [rhythm, setRhythm] = useState(1);
    const [collaborators, setCollaborators] = useState([]);
    const [ownerId, setOwnerId] = useState(null);

    const [pages, setPages] = useState([createNewMatrix()]);
    const [activePage, setActivePage] = useState(0);
    const [selectedColumn, setSelectedColumn] = useState(null);

    // ✅ ATUALIZADO: Lida com a nova estrutura de nota (que é um array)
    useEffect(() => {
        if (selectedColumn === null) return;

        setPages((prevPages) => {
            const newPages = [...prevPages];
            const currentMatrix = [...newPages[activePage]];

            const updatedCol = currentMatrix[selectedColumn].map(noteArray => {
                const oldSubNotes = noteArray || [null];
                const newSubNotes = Array.from({ length: rhythm }, (_, i) =>
                    oldSubNotes[i] || null
                );
                return newSubNotes;
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
        const nextPage = activePage + change;

        if (nextPage < 0) {
            setPages(prevPages => [createNewMatrix(), ...prevPages]);
            setActivePage(0);
        } else if (nextPage >= pages.length) {
            setPages(prevPages => [...prevPages, createNewMatrix()]);
            setActivePage(pages.length);
        } else {
            setActivePage(nextPage);
        }
    }, [activePage, pages]);

    const deletePage = useCallback((pageIndex) => {
        setPages(prev => {
            if (prev.length <= 1) {
                alert(t('editor.deleteLastPageError'));
                return prev;
            }
            const newPages = prev.filter((_, index) => index !== pageIndex);

            // Ajusta a página ativa se necessário
            if (activePage >= newPages.length) {
                setActivePage(newPages.length - 1);
            }
            return newPages;
        });
    }, [activePage, t]);

    const clearPage = useCallback((pageIndex) => {
        setPages(prevPages => {
            const newPages = [...prevPages];
            // Substitui a página no índice especificado por uma nova e vazia
            newPages[pageIndex] = createNewPage();
            return newPages;
        });
    }, []);

    const projectData = {
        title, description, bpm, instrument, volume, pages, collaborators, ownerId
    };

    // ✅ ATUALIZADO: Reidrata os dados compactos vindos da API
    const loadProjectData = useCallback((data) => {
        setTitle(data.title ?? "Novo Projeto");
        setDescription(data.description ?? "");
        setBpm(data.bpm ?? 120);
        setInstrument(data.instrument ?? 'piano');
        setVolume(data.volume ?? -10);
        if (data.layers && data.layers.length > 0) {
            const rehydratedPages = rehydrateLayers(data.layers, ROWS);
            setPages(rehydratedPages);
            setActivePage(0);
        } else {
            setPages([createNewMatrix()]);
        }
        setCollaborators(data.collaborators ?? [])
        setOwnerId(data.created_by._id ?? null)

    }, []);

    const loadVersionData = useCallback((data) => {
        if (data.layers && data.layers.length > 0) {
            const rehydratedPages = rehydrateLayers(data.layers, ROWS);
            setPages(rehydratedPages);
            setActivePage(0);
        } else {
            setPages([createNewMatrix()]);
        }
    }, []);

    return {
        state: { title, description, bpm, instrument, volume, rhythm, pages, activePage, selectedColumn },
        actions: {
            setTitle, setDescription, setBpm, setInstrument, setVolume, setRhythm,
            setPages, setActivePage, setSelectedColumn, addPage, movePage, deletePage, loadProjectData, loadVersionData,
            clearPage,
        },
        projectData,
    };
};

export default useProjectState;