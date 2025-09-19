// src/hooks/editor/useProjectStates.jsx
"use client";
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

const createNewPattern = () => ({ id: uuidv4(), notes: [] });
const createNewChannel = () => ({ id: uuidv4(), instrument: 'piano', volume: -10 });
const INITIAL_BAR_COUNT = 8;

export const useProjectStates = () => {
    const { t } = useTranslation();
    const [title, setTitle] = useState("Novo Projeto");
    const [description, setDescription] = useState("");
    const [bpm, setBpm] = useState(120);
    const [volume, setVolume] = useState(-10);
    const [owner, setOwner] = useState();

    const [channels, setChannels] = useState([createNewChannel()]);
    const [patterns, setPatterns] = useState(() => {
        const newPattern = createNewPattern();
        return { [newPattern.id]: newPattern };
    });
    const [songStructure, setSongStructure] = useState([Array(INITIAL_BAR_COUNT).fill(null)]);

    const [activeChannelIndex, setActiveChannelIndex] = useState(0);
    const [activePatternId, setActivePatternId] = useState(Object.keys(patterns)[0]);

    // --- Ações ---

    const addChannel = useCallback(() => {
        setChannels(prev => [...prev, createNewChannel()]);
        setSongStructure(prev => [...prev, Array(prev[0]?.length || INITIAL_BAR_COUNT).fill(null)]);
    }, []);

    const deleteChannel = useCallback((channelIndex) => {
        if (channels.length <= 1) return; // Não permite excluir o último canal
        setChannels(prev => prev.filter((_, index) => index !== channelIndex));
        setSongStructure(prev => prev.filter((_, index) => index !== channelIndex));
        if (activeChannelIndex >= channelIndex) {
            setActiveChannelIndex(prev => Math.max(0, prev - 1));
        }
    }, [channels.length, activeChannelIndex]);

    const setChannelInstrument = useCallback((channelIndex, newInstrument) => {
        setChannels(prev => prev.map((channel, index) =>
            index === channelIndex ? { ...channel, instrument: newInstrument } : channel
        ));
    }, []);

    const createNewPatternAndSelect = useCallback(() => {
        const newPattern = createNewPattern();
        setPatterns(prev => ({ ...prev, [newPattern.id]: newPattern }));
        setActivePatternId(newPattern.id);
        return newPattern.id;
    }, []);

    const deletePattern = useCallback((patternIdToDelete) => {
        if (Object.keys(patterns).length <= 1) return; // Não permite excluir o último padrão

        // Remove o padrão do objeto de padrões
        setPatterns(prev => {
            const newPatterns = { ...prev };
            delete newPatterns[patternIdToDelete];
            return newPatterns;
        });

        // Remove o padrão da estrutura da música
        setSongStructure(prev => prev.map(channel =>
            channel.map(pId => (pId === patternIdToDelete ? null : pId))
        ));

        // Se o padrão ativo foi deletado, seleciona o primeiro da lista
        if (activePatternId === patternIdToDelete) {
            setActivePatternId(Object.keys(patterns)[0] || null);
        }
    }, [patterns, activePatternId]);

    const updatePatternNotes = useCallback((patternId, newNotes) => {
        setPatterns(prev => ({
            ...prev,
            [patternId]: { ...prev[patternId], notes: newNotes }
        }));
    }, []);

    const setPatternInStructure = useCallback((channelIndex, barIndex, patternId) => {
        setSongStructure(prev => {
            const newStructure = prev.map(row => [...row]);
            newStructure[channelIndex][barIndex] = patternId;
            return newStructure;
        });
    }, []);

    const loadProjectData = useCallback((data) => {
        setTitle(data.title ?? "Novo Projeto");
        setDescription(data.description ?? "");
        setBpm(data.bpm ?? 120);
        setVolume(data.volume ?? -10);
        setChannels(data.channels && data.channels.length > 0 ? data.channels : [createNewChannel()]);
        setPatterns(data.patterns && Object.keys(data.patterns).length > 0 ? data.patterns : { 'initial': { id: 'initial', notes: [] } });
        setSongStructure(data.songStructure && data.songStructure.length > 0 ? data.songStructure : [Array(INITIAL_BAR_COUNT).fill(null)]);
        setActiveChannelIndex(0);
        setOwner(data.user_id)
        const firstPatternId = Object.keys(data.patterns || { 'initial': {} })[0];
        setActivePatternId(firstPatternId);
    }, []);

    const projectData = { title, description, bpm, volume, owner, channels, patterns, songStructure };

    return {
        state: { ...projectData, activeChannelIndex, activePatternId },
        actions: {
            setTitle, setDescription, setBpm, setVolume,
            addChannel, deleteChannel, setChannelInstrument,
            createNewPatternAndSelect, deletePattern, setActivePatternId,
            updatePatternNotes, setPatternInStructure, loadProjectData,
        },
        projectData,
    };
};

export default useProjectStates;