// src/components/editor/controls/Sequencer.jsx
"use client";
import { useTranslation } from "react-i18next";
import ChannelControls from './ChannelControls';
import ConfirmationPopUp from '../../editor/ConfirmationPopUp';
import { useState, useRef, useEffect } from "react"; // Adicionado useRef e useEffect
import Playhead from '../Playhead';

const TICKS_PER_BAR = 32;
const BAR_WIDTH_PX = 80; // Largura de cada compasso (w-20 -> 5rem -> 80px)

const Sequencer = ({ projectState, projectActions, playerState }) => {
    const { t } = useTranslation();
    const { channels, patterns, songStructure, activePatternId } = projectState;
    const { setPatternInStructure, setActivePatternId, setChannelInstrument, deleteChannel } = projectActions;
    const { playheadPositionInTicks } = playerState;

    const [channelToDelete, setChannelToDelete] = useState(null);

    // ✅ NOVO: Refs e State para medição dinâmica
    const channelHeaderRef = useRef(null);
    const [channelHeaderWidth, setChannelHeaderWidth] = useState(200); // Um valor padrão inicial

    // ✅ NOVO: Efeito para medir a largura da coluna de canais
    useEffect(() => {
        if (channelHeaderRef.current) {
            // Usamos um ResizeObserver para detectar mudanças no tamanho da coluna
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    setChannelHeaderWidth(entry.contentRect.width + 14);
                }
            });
            resizeObserver.observe(channelHeaderRef.current);

            // Limpeza ao desmontar o componente
            return () => resizeObserver.disconnect();
        }
    }, [channels]); // Re-observa se o número de canais mudar, caso afete a largura

    const patternList = Object.values(patterns).sort((a, b) => a.id.localeCompare(b.id));
    const patternDisplayMap = patternList.reduce((acc, pattern, index) => {
        acc[pattern.id] = index + 1; return acc;
    }, {});

    const handleCellClick = (chIndex, barIndex) => {
        const pId = songStructure[chIndex][barIndex];
        if (pId) setActivePatternId(pId);
    };

    const confirmDelete = () => {
        if (channelToDelete !== null) {
            deleteChannel(channelToDelete);
            setChannelToDelete(null);
        }
    };

    const barCount = songStructure[0]?.length || 0;
    const totalBarsWidth = barCount * BAR_WIDTH_PX;
    const totalTicksInSong = barCount * TICKS_PER_BAR;

    return (
        <div className="h-full w-full flex flex-col relative">
            <h3 className="text-sm font-bold uppercase text-accent mb-2 flex-shrink-0">
                {t("editor.sequencer.title")}
            </h3>
            <div className="overflow-auto flex-grow relative">

                {/* Contêiner do Playhead agora usa a largura dinâmica */}
                <div
                    className="absolute top-0 h-full pointer-events-none z-30"
                    style={{
                        left: `${channelHeaderWidth}px`, // ✅ USA A LARGURA MEDIDA
                        width: `${totalBarsWidth}px`
                    }}
                >
                    <Playhead position={playheadPositionInTicks} totalTicks={totalTicksInSong} />
                </div>

                <table className="relative w-full border-collapse" style={{ minWidth: `${channelHeaderWidth + totalBarsWidth}px` }}>
                    <thead>
                    <tr>
                        {/* ✅ Adicionada a ref para medir o elemento */}
                        <th ref={channelHeaderRef} className="sticky left-0 bg-bg-secondary p-2 border border-primary z-20 min-w-[200px]">{t('editor.sequencer.channel')}</th>
                        {songStructure[0]?.map((_, barIndex) => (
                            <th key={barIndex} className="p-2 border border-primary text-xs font-normal text-gray-400" style={{ width: `${BAR_WIDTH_PX}px` }}>
                                {barIndex + 1}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {channels.map((channel, channelIndex) => (
                        <tr key={channel.id} className="group">
                            <td className="sticky left-0 bg-bg-secondary group-hover:bg-bg-darker p-2 border border-primary z-20 transition-colors">
                                <ChannelControls
                                    channel={channel} channelIndex={channelIndex}
                                    setInstrument={setChannelInstrument}
                                    instruments={playerState.instruments}
                                    onDelete={() => setChannelToDelete(channelIndex)}
                                    channelCount={channels.length}
                                />
                            </td>
                            {songStructure[channelIndex]?.map((patternId, barIndex) => (
                                <td key={`${channelIndex}-${barIndex}`}
                                    className={`border border-primary text-center cursor-pointer transition-colors ${patternId === activePatternId ? 'bg-accent/50' : 'hover:bg-primary/30'}`}
                                    onClick={() => handleCellClick(channelIndex, barIndex)}>
                                    <select
                                        value={patternId || ''}
                                        onChange={(e) => setPatternInStructure(channelIndex, barIndex, e.target.value || null)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full h-full p-2 bg-transparent text-center appearance-none focus:outline-none text-foreground">
                                        <option value="" className="bg-bg-darker text-gray-400">-</option>
                                        {patternList.map(p => (
                                            <option key={p.id} value={p.id} className="bg-bg-darker font-semibold">
                                                P{patternDisplayMap[p.id]}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <ConfirmationPopUp
                open={channelToDelete !== null}
                onClose={() => setChannelToDelete(null)}
                onConfirm={confirmDelete}
                title={t('editor.confirmation.deleteChannelTitle')}
                message={t('editor.confirmation.deleteChannelMessage')}
            />
        </div>
    );
};
export default Sequencer;