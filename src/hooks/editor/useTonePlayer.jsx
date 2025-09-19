// src/hooks/editor/useTonePlayer.jsx
"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from "tone";
import { ACOUSTIC_INSTRUMENTS, NOTES } from '../../constants';

const instruments = {};
ACOUSTIC_INSTRUMENTS.forEach(name => {
    instruments[name] = () => new Tone.Sampler({
        urls: { C4: "C4.mp3" },
        baseUrl: `https://nbrosowsky.github.io/tonejs-instruments/samples/${name}/`,
    }).toDestination();
});

export const useTonePlayer = (projectState) => {
    const { bpm, channels, patterns, songStructure } = projectState;
    const synthsRef = useRef({});
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPlayerLoading, setIsPlayerLoading] = useState(true);
    const [playheadPositionInTicks, setPlayheadPositionInTicks] = useState(0); // NOVO
    const scheduledEventsRef = useRef([]);

    useEffect(() => {
        const loadInstruments = async () => {
            setIsPlayerLoading(true);
            const channelIds = channels.map(c => c.id);
            Object.keys(synthsRef.current).forEach(id => {
                if (!channelIds.includes(id)) {
                    synthsRef.current[id]?.dispose();
                    delete synthsRef.current[id];
                }
            });
            await Promise.all(channels.map(async (channel) => {
                if (!synthsRef.current[channel.id] || synthsRef.current[channel.id].name !== channel.instrument) {
                    synthsRef.current[channel.id]?.dispose();
                    const newSynth = instruments[channel.instrument]();
                    await Tone.loaded();
                    synthsRef.current[channel.id] = newSynth;
                }
            }));
            setIsPlayerLoading(false);
        };
        loadInstruments();
    }, [channels]);

    useEffect(() => {
        Tone.Transport.bpm.value = bpm;
    }, [bpm]);

    const playNotePiano = useCallback(async (note, channelId) => {
        if (isPlayerLoading || !synthsRef.current[channelId]) return;
        await Tone.start();
        synthsRef.current[channelId].triggerAttackRelease(note, "8n");
    }, [isPlayerLoading]);

    const stop = useCallback(() => {
        Tone.Transport.stop();
        scheduledEventsRef.current.forEach(id => Tone.Transport.clear(id));
        scheduledEventsRef.current = [];
        Tone.Transport.position = 0;
        setPlayheadPositionInTicks(0); // NOVO
        Object.values(synthsRef.current).forEach(synth => synth.releaseAll());
        setIsPlaying(false);
    }, []);

    const playPause = useCallback(async () => {
        if (isPlayerLoading) return;
        await Tone.start();

        const state = Tone.Transport.state;
        if (state === 'started') {
            Tone.Transport.pause();
            setIsPlaying(false);
            return;
        }
        if (state === 'paused') {
            Tone.Transport.start();
            setIsPlaying(true);
            return;
        }

        stop();

        const TICKS_PER_BAR = 32; // ATUALIZADO
        const barDuration = Tone.Time("1m").toSeconds();
        const tickDuration = barDuration / TICKS_PER_BAR; // ATUALIZADO
        let totalDuration = 0;

        songStructure.forEach((channelPatterns, channelIndex) => {
            const channel = channels[channelIndex];
            if (!channel || !synthsRef.current[channel.id]) return;
            const synth = synthsRef.current[channel.id];

            channelPatterns.forEach((patternId, barIndex) => {
                if (!patternId) return;
                const pattern = patterns[patternId];
                if (!pattern?.notes) return;

                const barOffset = barIndex * barDuration;

                pattern.notes.forEach(note => {
                    const startTime = note.start * tickDuration + barOffset;
                    const duration = (note.end - note.start) * tickDuration;
                    const noteName = NOTES[note.pitch];

                    const eventId = Tone.Transport.schedule(time => {
                        synth.triggerAttackRelease(noteName, duration, time);
                    }, startTime);
                    scheduledEventsRef.current.push(eventId);

                    if(startTime + duration > totalDuration) {
                        totalDuration = startTime + duration;
                    }
                });
            });
        });

        // NOVO: Atualiza a posição do playhead
        const updatePlayheadEventId = Tone.Transport.scheduleRepeat(time => {
            Tone.Draw.schedule(() => {
                const currentBar = Math.floor(Tone.Transport.seconds / barDuration);
                const progressInBar = (Tone.Transport.seconds % barDuration) / barDuration;
                const ticksInBar = progressInBar * TICKS_PER_BAR;
                const totalTicks = (currentBar * TICKS_PER_BAR) + ticksInBar;
                setPlayheadPositionInTicks(totalTicks);
            }, time);
        }, "32n"); // Atualiza na frequência de uma fusa
        scheduledEventsRef.current.push(updatePlayheadEventId);

        if (totalDuration > 0) {
            const endEvent = Tone.Transport.schedule(() => stop(), totalDuration);
            scheduledEventsRef.current.push(endEvent);
        }

        Tone.Transport.start();
        setIsPlaying(true);

    }, [isPlayerLoading, stop, songStructure, channels, patterns, bpm]);

    return {
        playerState: { isPlaying, isPlayerLoading, instruments, playheadPositionInTicks }, // EXPOSTO
        playerActions: { playNotePiano, playPause, stop }
    };
};

export default useTonePlayer;