"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
import { NOTES } from '../../constants';

// Função auxiliar para converter um Blob para Base64
const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const useProjectAPI = (projectData, token, projectId) => {
    const router = useRouter();

    // Estado relacionado à API
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null); // Armazena dados carregados da API
    const [versions, setVersions] = useState([]);
    const [currentMusicId, setCurrentMusicId] = useState("");
    const [lastVersionId, setLastVersionId] = useState("");

    // Efeito para carregar os dados iniciais do projeto
    useEffect(() => {
        const loadInitialData = async () => {
            if (!projectId || !token) {
                if (projectId === 'new') setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`https://localhost:5000/api/projects/${projectId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.status === 401) {
                    alert("Sessão expirada. Faça login novamente.");
                    router.push("/login");
                    return;
                }
                if (!response.ok) throw new Error('Falha ao carregar o projeto.');

                const data = await response.json();

                // Define o estado com os dados recebidos
                setProject(data.current_music_id); // Passa a versão atual para ser carregada
                setVersions(data.music_versions);
                setCurrentMusicId(data.current_music_id._id);
                setLastVersionId(data.current_music_id._id);

            } catch (error) {
                console.error("Erro ao carregar projeto:", error);
                // Tratar erro, talvez redirecionar ou mostrar mensagem
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [projectId, token, router]);

    // Ação para salvar o projeto
    const handleSave = useCallback(async () => {
        if (!token) {
            alert("Você precisa estar logado para salvar.");
            return;
        }

        try {
            // 1. Gera o arquivo MIDI e converte para base64
            const midiBlob = exportToMIDI(true); // 'true' para retornar o blob em vez de baixar
            const midiBase64 = await blobToBase64(midiBlob);

            const dataToSave = {
                ...projectData,
                midi: midiBase64,
            };

            // Se for um projeto existente, anexa o ID para a API saber que é uma atualização
            if (projectId && projectId !== 'new') {
                dataToSave.id = projectId;
            }

            // 2. Envia para a API
            const response = await fetch('https://localhost:5000/api/projects', {
                method: 'POST', // A API usa POST tanto para criar quanto para atualizar
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSave),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Erro ao salvar.');

            // 3. Atualiza o estado com a resposta da API
            alert("Projeto salvo com sucesso!");
            setVersions(result.music_versions);
            setCurrentMusicId(result.current_music_id._id);
            setLastVersionId(result.current_music_id._id);

            // 4. Se era um projeto novo, redireciona para a URL com o ID
            if (!projectId || projectId === 'new') {
                router.push(`/editor/${result._id}`);
            }

        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert(`Falha ao salvar: ${error.message}`);
        }
    }, [token, projectData, projectId, router]);

    // Ação para carregar os dados de uma versão específica
    const loadVersionData = useCallback((musicId) => {
        const selectedVersion = versions.find(v => v.music_id._id === musicId);
        if (selectedVersion) {
            setProject(selectedVersion.music_id); // Atualiza o projeto com os dados da versão
            setCurrentMusicId(musicId);
        }
    }, [versions]);

    // Ação para lidar com a mudança no dropdown de versões
    const handleVersionChange = useCallback((musicId) => {
        loadVersionData(musicId);
    }, [loadVersionData]);

    // Ação para exportar como MIDI
    const exportToMIDI = useCallback((returnBlob = false) => {
        const midi = new Midi();
        const track = midi.addTrack();
        midi.header.setTempo(projectData.bpm);
        let currentTime = 0;

        projectData.pages.forEach(page => {
            page.forEach(col => {
                const colDuration = Tone.Time("4n").toSeconds();
                const subNotesCount = Math.max(...col.map(note => note?.subNotes?.length || 1));
                const subDuration = colDuration / subNotesCount;
                col.forEach((noteRow, rowIndex) => {
                    (noteRow.subNotes || []).forEach((subNote, subIndex) => {
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

        const blob = new Blob([midi.toArray()], { type: 'audio/midi' });
        if (returnBlob) return blob;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectData.title || 'music'}.mid`;
        a.click();
        URL.revokeObjectURL(url);
    }, [projectData]);

    // Ação para importar de um arquivo JSON
    const importFromMIDI = useCallback((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                // Atualiza o estado do 'project' com os dados importados.
                // O useEffect em page.jsx irá sincronizar isso com o useProjectState.
                setProject(data);
            } catch (error) {
                alert("Falha ao importar: Formato de arquivo inválido.");
            }
        };
        reader.readAsText(file);
    }, []);

    return {
        apiState: { loading, project, versions, currentMusicId, lastVersionId },
        apiActions: { handleSave, handleVersionChange, exportToMIDI, importFromMIDI },
    };
};

export default useProjectAPI;