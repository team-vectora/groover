/**
 * @file Contém as constantes utilizadas em toda a aplicação Groover.
 */

// Define o número de linhas (teclas de piano) na grade de edição.
export const ROWS = 49;

// Define o número inicial de colunas para uma nova página.
export const INITIAL_COLS = 10;

// Array de notas musicais que correspondem a cada linha do Piano Roll, da mais aguda para a mais grave.
export const NOTES = [
    "C6", "B5", "A#5", "A5", "G#5", "G5", "F#5", "F5", "E5", "D#5",
    "D5", "C#5", "C5", "B4", "A#4", "A4", "G#4", "G4", "F#4", "F4",
    "E4", "D#4", "D4", "C#4", "C4", "B3", "A#3", "A3", "G#3", "G3",
    "F#3", "F3", "E3", "D#3", "D3", "C#3", "C3", "B2", "A#2", "A2",
    "G#2", "G2", "F#2", "F2", "E2", "D#2", "D2", "C#2", "C2"
];

// Lista de instrumentos acústicos disponíveis para o sampler do Tone.js.
export const ACOUSTIC_INSTRUMENTS = [
    "bassoon", "cello", "clarinet",
    "flute", "french-horn", "guitar-acoustic", "guitar-electric",
    "guitar-nylon", "harmonium", "organ", "piano", "saxophone",
    "trombone", "trumpet", "violin"
];