"use client";


const ChangeBpm = ({bpm, setBpm}) => {

  return (
  <>
<h3>Andamento</h3>
                  <div className="control-item">
                      <label>
                          BPM: <span className="control-value">{bpm}</span>
                      </label>
                      <input
                          type="range"
                          min="40"
                          max="300"
                          step="10"
                          className="control-range"
                          value={bpm}
                          onChange={(e) => setBpm(Number(e.target.value))}
                      />
                  </div>
  </>
    
  );
};

export default ChangeBpm;