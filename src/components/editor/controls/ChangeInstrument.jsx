"use client";

const ChangeInstrument = ({ instrument, instruments, setInstrument, t }) => {
  const handleInstrumentChange = (e) => {
    const newInstrument = e.target.value;
    setInstrument(newInstrument);
  };

  return (
    <>
      <h3 className="text-sm font-bold uppercase text-accent mb-2">
        {t("editor.controls.instrument.title")}
      </h3>
      <div className="control-item mb-2">
        <label htmlFor="instruments" className="block mb-2 text-sm font-medium">
          {t("editor.controls.instrument.selectLabel")}
        </label>
        <select
          id="instruments"
          className="w-full p-2 bg-bg-secondary border border-primary rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          value={instrument}
          onChange={handleInstrumentChange}
        >
          {instruments &&
            Object.keys(instruments).map((inst) => (
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
