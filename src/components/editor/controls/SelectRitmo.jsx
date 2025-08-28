"use client";

const SelectRitmo = ({ rhythm, setRhythm }) => {
    return (
        <div>
            <h3 className="text-sm font-bold uppercase text-accent mb-2">Ritmo (Subdivisões)</h3>
            <select
                value={rhythm}
                onChange={(e) => setRhythm(Number(e.target.value))}
                className="w-full p-2 bg-bg-secondary border border-primary rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
                <option value={1}>1 (Semibreve)</option>
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
