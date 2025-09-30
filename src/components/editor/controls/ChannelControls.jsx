// src/components/editor/controls/ChannelControls.jsx
"use client";
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const ChannelControls = ({ channel, channelIndex, setInstrument, instruments, onDelete, channelCount }) => {
    const { t } = useTranslation();
    const instrumentList = Object.keys(instruments);

    return (
        <div className="flex items-center space-x-2">
            <div className="flex-grow">
                <span className="text-xs font-semibold text-foreground">
                    {t('editor.channel')} {channelIndex + 1}
                </span>
                <select
                    value={channel.instrument}
                    onChange={(e) => setInstrument(channelIndex, e.target.value)}
                    className="w-full p-1 text-xs bg-bg-secondary border border-primary rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                >
                    {instrumentList.map(inst => (
                        <option key={inst} value={inst}>
                            {inst.charAt(0).toUpperCase() + inst.slice(1).replace(/-/g, " ")}
                        </option>
                    ))}
                </select>
            </div>
            {channelCount > 1 && (
                <button onClick={() => onDelete(channelIndex)} className="flex-shrink-0 text-red-500/70 hover:text-red-500 self-end mb-1">
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            )}
        </div>
    );
};

export default ChannelControls;