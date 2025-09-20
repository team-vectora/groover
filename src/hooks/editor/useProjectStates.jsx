// src/hooks/editor/useProjectStates.jsx
"use client";
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

// Adicionado 'createdAt' para ordenação estável
const createNewPattern = () => ({ id: uuidv4(), notes: [], createdAt: new Date().toISOString() });
const createNewChannel = () => ({ id: uuidv4(), instrument: 'piano', volume: -10 });
const INITIAL_BAR_COUNT = 8;

export const useProjectStates = () => {
    const { t } = useTranslation();
    const [title, setTitle] = useState("New Project");
    const [description, setDescription] = useState("");
    const [bpm, setBpm] = useState(120);
    const [volume, setVolume] = useState(-10);
    const [owner, setOwner] = useState(null);

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

        const newPatterns = { ...patterns };
        delete newPatterns[patternIdToDelete];
        setPatterns(newPatterns);

        setSongStructure(prev => prev.map(channel =>
            channel.map(pId => (pId === patternIdToDelete ? null : pId))
        ));

        if (activePatternId === patternIdToDelete) {
            const remainingPatterns = Object.keys(newPatterns);
            setActivePatternId(remainingPatterns.length > 0 ? remainingPatterns[0] : null);
        }
    }, [patterns, activePatternId]);


    const updatePatternNotes = useCallback((patternId, newNotes) => {
        if (!patternId) return;
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

    const addPage = useCallback(() => {
        setSongStructure(prev => prev.map(channel => [...channel, ...Array(8).fill(null)]));
    }, []);

    const removePage = useCallback((pageIndex) => {
        const barCount = songStructure[0]?.length || 0;
        if (barCount <= 8) return; // Não remove a última página

        const start = pageIndex * 8;
        const end = start + 8;

        setSongStructure(prev => prev.map(channel => {
            const newChannel = [...channel];
            newChannel.splice(start, 8);
            return newChannel;
        }));
    }, [songStructure]);


    const loadProjectData = useCallback((data) => {
        if (!data) return;

        setTitle(data.title ?? "New Project");
        setDescription(data.description ?? "");
        setBpm(data.bpm ?? 120);
        setVolume(data.volume ?? -10);
        setOwner(data.user_id ?? null);

        const loadedChannels = data.channels && data.channels.length > 0 ? data.channels : [createNewChannel()];
        setChannels(loadedChannels);

        const loadedPatterns = data.patterns && Object.keys(data.patterns).length > 0 ? data.patterns : { 'default': { id: 'default', notes: [], createdAt: new Date().toISOString() } };
        setPatterns(loadedPatterns);

        const loadedStructure = data.songStructure && data.songStructure.length > 0 ?
            data.songStructure.map((channel) => {
                if (channel.length % INITIAL_BAR_COUNT !== 0)
                    return channel.concat(Array(INITIAL_BAR_COUNT - channel.length % INITIAL_BAR_COUNT).fill(null))
                return channel
            }) : [Array(INITIAL_BAR_COUNT).fill(null)];
        setSongStructure(loadedStructure);

        console.log("SONG STRUTUCTURE ANTES")
        console.log(data.songStructure)
        console.log("SONG STRUTUCTURE DEPOIS")
        console.log(loadedStructure)


        setActiveChannelIndex(0);

        const patternIds = Object.keys(loadedPatterns);
        if (patternIds.length > 0) {
            // Tenta manter o ID ativo se ele ainda existir, senão pega o primeiro
            setActivePatternId(prevId => patternIds.includes(prevId) ? prevId : patternIds[0]);
        } else {
            const newPattern = createNewPattern();
            setPatterns({ [newPattern.id]: newPattern });
            setActivePatternId(newPattern.id);
        }

    }, []);


    const projectData = { title, description, bpm, volume, owner, channels, patterns, songStructure };

    return {
        state: { ...projectData, activeChannelIndex, activePatternId },
        actions: {
            setTitle, setDescription, setBpm, setVolume,
            addChannel, deleteChannel, setChannelInstrument,
            createNewPatternAndSelect, deletePattern, setActivePatternId,
            updatePatternNotes, setPatternInStructure, loadProjectData,
            addPage, removePage
        },
        projectData,
    };
};

export default useProjectStates;