// src/app/layout.jsx
"use client";
import "../styles/global.css";
import { MidiProvider } from "../contexts/MidiContext";
import { ThemeProvider } from "../contexts/ThemeContext"; // import do ThemeContext
import "../lib/i18n";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider>
          <MidiProvider>
            {children}
          </MidiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
