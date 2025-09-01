// src/app/layout.jsx
"use client";
import "../styles/global.css";
import { MidiProvider } from "../contexts/MidiContext";
import MidiPlayerWrapper from "../components/MidiPlayerWrapper";
import "../lib/i18n";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <MidiProvider>
            {children}
        </MidiProvider>
      </body>
    </html>
  );
}
