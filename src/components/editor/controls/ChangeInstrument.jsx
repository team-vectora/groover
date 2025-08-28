"use client";

const ChangeInstrument = ({ instrument, instruments, setInstrument }) => {

  const handleInstrumentChange = (e) => {
    const newInstrument = e.target.value;
    setInstrument(newInstrument);
  };

  return (
      <>
        {/* Estes estilos devem ser convertidos para Tailwind se ainda não foram */}
        <h3 className="text-sm font-bold uppercase text-accent mb-2">Instrumento</h3>
        <div className="control-item mb-2">
          <label htmlFor="instruments" className="block mb-2 text-sm font-medium">
            Selecione um instrumento:
          </label>
          <select
              id="instruments"
              className="w-full p-2 bg-bg-secondary border border-primary rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              value={instrument}
              onChange={handleInstrumentChange}
          >
            {/* Garante que 'instruments' é um objeto antes de mapear */}
            {instruments && Object.keys(instruments).map((inst) => (
                <option key={inst} value={inst}>
                  {inst.charAt(0).toUpperCase() + inst.slice(1).replace(/-/g, " ")}
                </option>
            ))}
          </select>
        </div>
      </>
  );
};

export default ChangeInstrument;
