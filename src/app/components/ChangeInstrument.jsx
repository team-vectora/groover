"use client";
import "./piano.css";
import { useState } from "react";

const ChangeInstrument = ({ instrument, instruments, setInstrument, synthRef }) => {
  const [loading, setLoading] = useState(false);

  const handleInstrumentChange = async (e) => {
    const newInstrument = e.target.value;

    if (synthRef.current) {
      synthRef.current.dispose();
    }

    setLoading(true);

    const newSynth = instruments[newInstrument]();

    // Se o instrumento for sampler, espera carregar os samples
    if (typeof newSynth.load === "function") {
      await newSynth.load();
    }

    newSynth.toDestination();
    synthRef.current = newSynth;
    setInstrument(newInstrument);

    setLoading(false);
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
          disabled={loading} // desabilita enquanto carrega
        >
          {Object.keys(instruments).map((inst) => (
            <option key={inst} value={inst}>
              {inst.charAt(0).toUpperCase() + inst.slice(1).replace("-", " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Aviso de carregamento */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-message">
            Carregando samples do instrumento...
          </div>
        </div>
      )}
    </>
  );
};

export default ChangeInstrument;
