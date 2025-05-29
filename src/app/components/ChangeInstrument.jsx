"use client";
import './piano.css';

const ChangeInstrument = ({instrument, instruments, setInstrument, synthRef}) => {
  const handleInstrumentChange = (e) => {
    const newInstrument = e.target.value;
    if (synthRef.current) {
      synthRef.current.dispose();
    }
    synthRef.current = instruments[newInstrument]().toDestination();
    setInstrument(newInstrument);
  };

  return (
  <>
  <h3>Instrumento</h3>
  <div className="control-item">
      <label htmlFor="instruments">Selecione um instrumento:</label>
      <select
          id="instruments"
          className="control-select"
          value={instrument}
          onChange={handleInstrumentChange}
      >
          {Object.keys(instruments).map((inst) => (
              <option key={inst} value={inst}>
                  {inst.charAt(0).toUpperCase() + inst.slice(1)}
              </option>
          ))}
      </select>
  </div>
  </>
    
  );
};

export default ChangeInstrument;