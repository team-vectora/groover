"use client";

import { useEffect, useState } from "react";
import { Midi } from '@tonejs/midi';
import './piano.css';
import * as Tone from 'tone';


const ChangeVolume = ({volume, setVolume}) => {
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };



  return (
  <>
                  <h3>Volume</h3>
                  <div className="control-item">
                      <label>
                          Nível: <span className="control-value">{volume}dB</span>
                      </label>
                      <input
                          type="range"
                          min="-30"
                          max="20"
                          step="1"
                          className="control-range"
                          value={volume}
                          onChange={handleVolumeChange}
                      />
                  </div>
  </>
    
  );
};

export default ChangeVolume;