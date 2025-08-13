"use client";

const SelectRitmo = ({ rhythm, setRhythm }) => {
    return (
        <div className="control-group">
            <h3>Ritmo (Subdivisões)</h3>
            <select
                value={rhythm}
                onChange={(e) => setRhythm(Number(e.target.value))}
                className="control-select"
            >
                <option value={1}>1 (Inteira)</option>
                <option value={2}>2 (Mínima)</option>
                <option value={3}>3 (Tercina)</option>
                <option value={4}>4 (Semínima)</option>
                <option value={6}>6 (Sextina)</option>
                <option value={8}>8 (Colcheia)</option>
            </select>
        </div>
    );
};

export default SelectRitmo;