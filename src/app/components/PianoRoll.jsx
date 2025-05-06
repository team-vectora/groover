"use client";

import { useState, useEffect, useRef } from "react";
import './piano.css';

const PianoRoll = () => {
  const canvasRef = useRef(null);
  const [notes, setNotes] = useState([]);

  const grid = {
    noteHeight: 30, 
    timeWidth: 50,
    numNotes: 49,   
    numBeats: 32,
  };

  const handleClick = (e) => {

  };


  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { noteHeight, timeWidth, numNotes, numBeats } = grid;

    canvas.width = numBeats * timeWidth;
    canvas.height = numNotes * noteHeight;

    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 0.5; 
    ctx.strokeStyle = "#333";
    for (let i = 0; i <= numNotes; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * noteHeight);
      ctx.lineTo(canvas.width, i * noteHeight);
      ctx.stroke();
    }

    for (let i = 0; i <= numBeats; i++) {
      ctx.beginPath();
      ctx.moveTo(i * timeWidth, 0);
      ctx.lineTo(i * timeWidth, canvas.height);
      ctx.stroke();
    }

  };


  useEffect(()=>{
    drawCanvas();
  }, []);

  useEffect(()=>{
    drawCanvas();
  }, [handleClick]);

  return (
    <div id="canvas_id">
      <canvas
        ref={canvasRef}
        style={{ 
          width: `${6000}px`, 
          height: `${grid.numNotes * grid.noteHeight}px`,
          cursor: "pointer"
        }}
        onClick={handleClick}
      />
    </div>
  );
};

export default PianoRoll;