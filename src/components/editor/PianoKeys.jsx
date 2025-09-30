// src/components/editor/PianoKeys.jsx
import { ROWS } from "../../constants";

const ROW_HEIGHT_PX = 30; // Mesma altura de linha do PianoRoll
const TOTAL_HEIGHT_PX = ROWS * ROW_HEIGHT_PX;

const PianoKeys = ({ notes, onKeyClick }) => {
    return (
        <div
            className="sticky left-0 z-10 flex flex-col bg-bg-darker border-r-2 border-primary"
            style={{ height: `${TOTAL_HEIGHT_PX}px` }} // Altura fixa
        >
            {notes.map((note, index) => {
                const isBlackKey = note.includes("#");
                const isC_Note = note.startsWith("C") && !isBlackKey;

                return (
                    <div
                        key={index}
                        onClick={() => onKeyClick(note)}
                        className={`
                            flex items-center justify-center cursor-pointer select-none transition-colors
                            w-20 flex-shrink-0 
                            ${isBlackKey
                            ? 'bg-primary text-text-lighter border-b border-bg-darker shadow-inner'
                            : 'bg-bg-secondary text-foreground'
                        }
                            ${isC_Note ? 'border-t-2 border-primary' : 'border-t border-bg-darker'}
                            hover:bg-primary-light
                        `}
                        style={{ height: `${ROW_HEIGHT_PX}px` }} // Altura de cada tecla
                    >
                        <p className="text-xs font-bold pointer-events-none">{note}</p>
                    </div>
                );
            })}
        </div>
    );
};
export default PianoKeys;