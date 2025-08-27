'use client';
import { useEffect, useState } from 'react';

function MusicNotesDetail() {
  const [notes, setNotes] = useState([]);
  const symbols = ['♪', '♫', '♩', '♬', '♭', '♮'];

  useEffect(() => {
    function createNotes() {
      const newOnes = Array.from({ length: 6 }).map(() => ({
        id: Math.random(),
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        left: Math.random() * 100,
        size: Math.random() * 20 + 15,
        duration: Math.random() * 10 + 10
      }));
      setNotes((prev) => [...prev, ...newOnes]);
      setTimeout(() => {
        setNotes((prev) => prev.filter((n) => !newOnes.includes(n)));
      }, 10000);
    }

    createNotes();
    const interval = setInterval(createNotes, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
      {notes.map((note) => (
        <span
          key={note.id}
          className="absolute music-note"
          style={{
            left: `${note.left}vw`,
            fontSize: `${note.size}px`,
            animationDuration: `${note.duration}s`
          }}
        >
          {note.symbol}
        </span>
      ))}

      <style jsx>{`
        .music-note {
          bottom: 0px;
          color: #4c4e30;
          opacity: 0;
          animation: floatUp linear forwards;
        }
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-120vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default MusicNotesDetail;
