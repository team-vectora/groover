// src/components/editor/controls/Sequencer.jsx
"use client";
import { useTranslation } from "react-i18next";
import ChannelControls from './ChannelControls';
import ConfirmationPopUp from '../../editor/ConfirmationPopUp';
import { useState, useRef, useEffect } from "react";
import Playhead from '../Playhead';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

const TICKS_PER_BAR = 32;
const BARS_PER_PAGE = 8;
const BAR_WIDTH_PX = 80;

const Sequencer = ({ projectState, projectActions, playerState }) => {
    const { t } = useTranslation();
    const { channels, patterns, songStructure, activePatternId } = projectState;
    const { setPatternInStructure, setActivePatternId, setChannelInstrument, deleteChannel, addPage, removePage } = projectActions;
    const { playheadPositionInTicks, isPlaying, isPatternPlaying } = playerState;

    const [channelToDelete, setChannelToDelete] = useState(null);
    const [pageToDelete, setPageToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);

    const channelHeaderRef = useRef(null);
    const [channelHeaderWidth, setChannelHeaderWidth] = useState(200);

    useEffect(() => {
        if (channelHeaderRef.current) {
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    setChannelHeaderWidth(entry.contentRect.width + 14);
                }
            });
            resizeObserver.observe(channelHeaderRef.current);
            return () => resizeObserver.disconnect();
        }
    }, [channels]);

    // Ordena por data de criação para manter a ordem estável
    const patternList = Object.values(patterns).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const patternDisplayMap = patternList.reduce((acc, pattern, index) => {
        acc[pattern.id] = index + 1; return acc;
    }, {});

    const barCount = songStructure[0]?.length || 0;
    const pageCount = Math.ceil(barCount / BARS_PER_PAGE);

    const handleCellClick = (chIndex, barIndex) => {
        const pId = songStructure[chIndex][barIndex];
        if (pId) setActivePatternId(pId);
    };

    const confirmDeleteChannel = () => {
        if (channelToDelete !== null) {
            deleteChannel(channelToDelete);
            setChannelToDelete(null);
        }
    };

    const confirmDeletePage = () => {
        if (pageToDelete !== null) {
            removePage(pageToDelete);
            if (currentPage >= pageCount - 1) {
                setCurrentPage(Math.max(0, pageCount - 2));
            }
            setPageToDelete(null);
        }
    };

    const startBar = currentPage * BARS_PER_PAGE;
    const endBar = startBar + BARS_PER_PAGE;

    const playheadPage = Math.floor(playheadPositionInTicks / (TICKS_PER_BAR * BARS_PER_PAGE));

    useEffect(() => {
        if (isPlaying) {
            setCurrentPage(playheadPage);
        }
    }, [playheadPositionInTicks, isPlaying, playheadPage]);

    return (
        <div className="h-full w-full flex flex-col relative">
            <div className="flex justify-between items-center mb-2 flex-shrink-0">
                <h3 className="text-sm font-bold uppercase text-accent">
                    {t("editor.sequencer.title")}
                </h3>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="px-2 py-1 text-xs rounded border border-primary disabled:opacity-50"><FontAwesomeIcon icon={faChevronLeft} /></button>
                    <span className="text-xs">{t('editor.sequencer.page', { current: currentPage + 1, total: pageCount })}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(pageCount - 1, p + 1))} disabled={currentPage >= pageCount - 1} className="px-2 py-1 text-xs rounded border border-primary disabled:opacity-50"><FontAwesomeIcon icon={faChevronRight} /></button>
                    <button onClick={addPage} className="px-2 py-1 text-xs rounded border border-primary"><FontAwesomeIcon icon={faPlus} /></button>
                    <button onClick={() => setPageToDelete(currentPage)} disabled={pageCount <= 1} className="px-2 py-1 text-xs rounded border border-red-500/50 text-red-500/80 disabled:opacity-50"><FontAwesomeIcon icon={faTrash} /></button>
                </div>
            </div>
            <div className="overflow-auto flex-grow relative">
                <div className="absolute top-0 h-full pointer-events-none z-30" style={{
                    left: `${channelHeaderWidth}px`,
                    width: `${BARS_PER_PAGE * BAR_WIDTH_PX}px` // A largura é sempre a da página visível
                }}>
                    <Playhead
                        isPlaying={isPlaying}
                        isPatternPlaying={isPatternPlaying}
                        playheadPositionInTicks={playheadPositionInTicks}
                        container="sequencer"
                        currentPage={currentPage}
                        totalBars={barCount}
                    />
                </div>
                <table className="relative w-full border-collapse">
                    <thead>
                    <tr>
                        <th ref={channelHeaderRef} className="sticky left-0 bg-bg-secondary p-2 border border-primary z-20 min-w-[200px]">{t('editor.sequencer.channel')}</th>
                        {Array.from({ length: BARS_PER_PAGE }).map((_, index) => {
                            const barIndex = startBar + index;
                            if (barIndex >= barCount) return null;
                            return (
                                <th key={barIndex} className="p-2 border border-primary text-xs font-normal text-gray-400" style={{ width: `${BAR_WIDTH_PX}px`, minWidth: `${BAR_WIDTH_PX}px` }}>
                                    {barIndex + 1}
                                </th>
                            );
                        })}
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
                            {songStructure[channelIndex]?.slice(startBar, endBar).map((patternId, index) => {
                                const barIndex = startBar + index;
                                return (
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
                                );
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <ConfirmationPopUp
                open={channelToDelete !== null}
                onClose={() => setChannelToDelete(null)}
                onConfirm={confirmDeleteChannel}
                title={t('editor.confirmation.deleteChannelTitle')}
                message={t('editor.confirmation.deleteChannelMessage')}
            />
            <ConfirmationPopUp
                open={pageToDelete !== null}
                onClose={() => setPageToDelete(null)}
                onConfirm={confirmDeletePage}
                title={t('editor.confirmation.deletePageTitle')}
                message={t('editor.confirmation.deletePageMessage', { page: pageToDelete !== null ? pageToDelete + 1 : '' })}
            />
        </div>
    );
};
export default Sequencer;