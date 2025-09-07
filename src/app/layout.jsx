// src/app/layout.jsx
"use client";
import "../styles/global.css";
import { MidiProvider } from "../contexts/MidiContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { LanguageProvider } from "../contexts/LanguageProvider";
import "../lib/i18n";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider>
          <MidiProvider>
              <LanguageProvider>
            {children}
            </LanguageProvider>
          </MidiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
