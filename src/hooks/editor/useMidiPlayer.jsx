import { useContext } from "react";
import { MidiContext } from "../../contexts/MidiContext";

// O hook agora é um simples consumidor do contexto centralizado.
export default function useMidiPlayer() {
    return useContext(MidiContext);
}