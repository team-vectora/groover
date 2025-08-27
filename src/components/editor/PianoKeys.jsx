const PianoKeys = ({ notes, onKeyClick }) => {
    return (
        <div className="sticky left-0 z-20 flex flex-col bg-bg-darker border-r-2 border-primary">
            {notes.map((note, index) => {
                const isBlackKey = note.includes("#");
                const isC_Note = note.startsWith("C") && !isBlackKey;

                return (
                    <div
                        key={index}
                        onClick={() => onKeyClick(note)}
                        className={`
                            flex items-center justify-center cursor-pointer select-none transition-colors
                            h-[30px] min-h-[30px] w-20 
                            ${isBlackKey
                            ? 'bg-primary text-text-lighter border-b border-bg-darker shadow-inner'
                            : 'bg-bg-secondary text-foreground'
                        }
                            ${isC_Note ? 'border-t-2 border-primary' : 'border-t border-bg-darker'}
                            hover:bg-primary-light
                        `}
                    >
                        <p className="text-xs font-bold pointer-events-none">{note}</p>
                    </div>
                );
            })}
        </div>
    );
};
export default PianoKeys;