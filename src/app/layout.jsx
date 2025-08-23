// src/app/layout.jsx
import "../styles/global.css";
import { MidiProvider } from "../contexts/MidiContext";
import MidiPlayerWrapper from "../components/MidiPlayerWrapper";


export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <MidiProvider>
          <MidiPlayerWrapper>
            {children}
          </MidiPlayerWrapper>
        </MidiProvider>
      </body>
    </html>
  );
}
