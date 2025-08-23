"use client";
import { createContext, useState } from "react";

export const MidiContext = createContext();

export function MidiProvider({ children }) {
  const [currentProject, setCurrentProject] = useState(null);

  return (
    <MidiContext.Provider value={{ currentProject, setCurrentProject }}>
      {children}
    </MidiContext.Provider>
  );
}
