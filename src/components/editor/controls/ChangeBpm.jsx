"use client";

const ChangeBpm = ({ bpm, setBpm, t }) => {
    return (
        <div>
            <h3 className="text-sm font-bold uppercase text-accent mb-2">
                {t("editor.controls.bpm.tempo")}
            </h3>
            <div className="control-item">
                <label className="block mb-2 text-sm font-medium">
                    {t("editor.controls.bpm.bpmLabel")}:{" "}
                    <span className="font-bold text-accent">{bpm}</span>
                </label>
                <input
                    type="range"
                    min="40"
                    max="300"
                    step="5"
                    className="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                />
            </div>
        </div>
    );
};

export default ChangeBpm;
