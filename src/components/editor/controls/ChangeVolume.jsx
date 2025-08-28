"use client";

const ChangeVolume = ({ volume, setVolume }) => {
    // A função apenas atualiza o estado. O hook useTonePlayer cuidará de aplicá-lo.
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
    };

    return (
        <div>
            <h3 className="text-sm font-bold uppercase text-accent mb-2 mt-4">Volume</h3>
            <div className="control-item">
                <label className="block mb-2 text-sm font-medium">
                    Nível: <span className="font-bold text-accent">{volume}dB</span>
                </label>
                <input
                    type="range"
                    min="-40"
                    max="10"
                    step="1"
                    className="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
                    value={volume}
                    onChange={handleVolumeChange}
                />
            </div>
        </div>
    );
};

export default ChangeVolume;
