"use client";
import * as Tone from "tone";
import { Midi } from '@tonejs/midi';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

import translations from "../../../../locales/language.js";

import HeaderEditor from "../../../../components/editor/HeaderEditor.jsx";
import ChangeVolume from "../../../../components/editor/controls/ChangeVolume.jsx";
import PianoRoll from "../../../../components/editor/PianoRoll.jsx";
import ChangeInstrument from "../../../../components/editor/controls/ChangeInstrument.jsx";
import SelectRitmo from "../../../../components/editor/controls/SelectRitmo";
import SaveMusicPopUp from "../../../../components/editor/SaveMusicPopUp.jsx";

function EditorPage() {
  const router = useRouter();
  const { id } = router.query;

  const rows = 49;
  const initialCols = 10;
  const notes = [
    "C6", "B5", "A#5", "A5", "G#5", "G5", "F#5", "F5", "E5", "D#5",
    "D5", "C#5", "C5", "B4", "A#4", "A4", "G#4", "G4", "F#4", "F4",
    "E4", "D#4", "D4", "C#4", "C4", "B3", "A#3", "A3", "G#3", "G3",
    "F#3", "F3", "E3", "D#3", "D3", "C#3", "C3", "B2", "A#2", "A2",
    "G#2", "G2", "F#2", "F2", "E2", "D#2", "D2", "C#2", "C2"
  ];

  const acousticInstruments = [
    "bassoon", "cello", "clarinet",
    "flute", "french-horn", "guitar-acoustic", "guitar-electric",
    "guitar-nylon", "harmonium", "organ", "piano", "saxophone",
    "trombone", "trumpet", "violin"
  ];

  const instruments = {};

  acousticInstruments.forEach(name => {
    instruments[name] = () => new Tone.Sampler({

      urls: { C4: "C4.mp3" },
      baseUrl: `https://nbrosowsky.github.io/tonejs-instruments/samples/${name}/`,
    }).toDestination();
  });


  const [loading, setLoading] = useState(true);
  const [activeCol, setActiveCol] = useState(null);
  const [activeSubIndex, setActiveSubIndex] = useState(0);
  const [cols, setCols] = useState(initialCols);
  const [openPop, setOpenPop] = useState(false)
  const popUpRef = useRef(null);
  const createSubNote = (name = null) => ({
    name,           // ex: "C4" ou null
    isSeparated: false
  });

  const createNote = (noteName = null, duration = 1) => {
    return {
      name: noteName,      // ex: "C4"
      duration,            // valor rítmico: 1, 2, 4, 8, ...
      subNotes: Array(duration).fill(createSubNote()),
    };
  };
  const [matrixNotes, setMatrixNotes] = useState(
    Array.from({ length: initialCols }, () =>
      Array.from({ length: rows }, () =>
        createNote()
      )
    )
  );

  const [pages, setPages] = useState([matrixNotes]);
  const [activePage, setActivePage] = useState(0);
  const [lang, setLang] = useState("en");
  const [instrument, setInstrument] = useState('piano');
  const [volume, setVolume] = useState(-10);
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rhythm, setRhythm] = useState(1);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [tokenJWT, setTokenJWT] = useState(null);
  const [projectId, setProjectId] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [versions, setVersions] = useState([]);
  const [currentMusicId, setCurrentMusicId] = useState("");
  const [lastVersionId, setLastVersionId] = useState("");
  const synthRef = useRef(null);

  // Effects

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      setLoading(false);
      setTokenJWT(token);
    }
  }, [router]);

  useEffect(() => {
    synthRef.current = instruments[instrument]().toDestination();
    synthRef.current.volume.value = volume;

    if (synthRef.current instanceof Tone.PolySynth) {
      synthRef.current.set({
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.5 },
        maxPolyphony: 49,
      });
    }

    return () => synthRef.current?.dispose();
  }, [instrument]);


  useEffect(() => {
    Tone.getDestination().volume.rampTo(volume, 0.1);
  }, [volume]);

  useEffect(() => {
    if (selectedColumn === null) {
      console.log("❌ selectedColumn é null, saindo do useEffect.");
      return;
    }

    console.log("🎯 Atualizando coluna:", selectedColumn);
    console.log("🎼 Novo valor de rhythm:", rhythm);

    setPages((prevPages) => {
      const currentMatrix = prevPages[activePage];

      if (!Array.isArray(currentMatrix)) {
        console.error("🚨 currentMatrix não é um array:", currentMatrix);
        return prevPages;
      }

      const updatedMatrix = currentMatrix.map((col, colIdx) => {
        if (!Array.isArray(col)) {
          console.error(`🚨 col ${colIdx} não é array:`, col);
          return col;
        }

        if (colIdx !== selectedColumn) {
          console.log(`⏩ Mantendo coluna ${colIdx} intacta.`);
          return col;
        }

        console.log(`🛠️ Atualizando coluna ${colIdx}...`);

        const updatedCol = col.map((note, noteIdx) => {
          const oldSubNotes = note.subNotes || [];
          console.log(`  🎵 Nota ${noteIdx}:`);
          console.log("    🔹 Subnotas antigas:", oldSubNotes);

          const newSubNotes = Array.from({ length: rhythm }, (_, i) => {
            const existing = oldSubNotes[i];
            const sub = existing ? { ...existing } : createSubNote();
            console.log(`    🔧 subNote[${i}] =`, sub);
            return sub;
          });

          return {
            ...note,
            subNotes: newSubNotes,
          };
        });

        return updatedCol;
      });

      const updatedPages = [...prevPages];
      updatedPages[activePage] = updatedMatrix;
      console.log("✅ Novo estado de pages[activePage]:", JSON.stringify(updatedMatrix));
      setSelectedColumn(null);
      return updatedPages;
    });
  }, [rhythm]);


  useEffect(() => {
    setPages(prev => {
      const newPages = [...prev];
      newPages[activePage] = matrixNotes;
      return newPages;
    });
  }, [matrixNotes, activePage]);

  // Helper functions
  const t = (key, params) => {
    let text = translations[lang][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  const renderKeys = () => {
    return notes.map((note, index) => {
      const isBlackKey = note.includes("#");
      return (
        <div
          onClick={() => playNotePiano(note.split(" ")[0])}
          key={index}
          className={`note ${isBlackKey ? 'black' : ''}`}
        >
          <p>{note}</p>
        </div>
      );
    });
  };

  // Core functions

  const showPopup = () => {
    return new Promise((resolve) => {
      setOpenPop(true);
      popUpRef.current = resolve;
    });
  };

  const handleClosePopup = () => {
    setOpenPop(false);
    if (popUpRef.current) {
      popUpRef.current(); 
      popUpRef.current = null;
    }
  };

  const handleVersionChange = async (musicId) => {

    console.log("Id selecionado", musicId);

    let selectedVersion = null;

    versions.forEach(v => {
      if (v.music_id._id === musicId) {
        console.log("Id encontrado", v.music_id._id);
        console.log("Time da versao selecionada", v.updated_at);
        selectedVersion = v;
      }
    });

    if (selectedVersion) {
      await loadVersionData(selectedVersion.music_id);
    }
    setCurrentMusicId(musicId)
  };

  const addPage = () => {
    const newMatrix = Array.from({ length: initialCols }, () =>
      Array.from({ length: rows }, () =>
        createNote()
      )
    );
    setPages(prev => [...prev, newMatrix]);
    setMatrixNotes(newMatrix);
    setActivePage(pages.length);
  };

  const movePage = (change) => {
    setActivePage(prev => {
      const next = prev + change;
      if (next < 0) return 0;
      if (next >= pages.length) return pages.length - 1;

      setMatrixNotes(pages[next]);
      return next;
    });
  };

  const playNotePiano = (note) => {
    if (!synthRef.current) return;

    // Toca a nota
    synthRef.current.triggerAttackRelease(note, "8n");

    // Opcional: podemos adicionar um feedback visual
    const noteElement = document.querySelector(`.note p[data-note="${note}"]`)?.parentElement;
    if (noteElement) {
      noteElement.classList.add('active');
      setTimeout(() => noteElement.classList.remove('active'), 200);
    }
  };

  const playSelectedNotesActivePage = async (n) => {
    if (isPlaying) {
      console.warn('Playback já em execução.');
      return;
    }

    setIsPlaying(true);
    const currentMatrix = pages[n];
    const activeNotes = new Map();
    let lastEventTime = 0;

    try {
      Tone.getTransport().bpm.value = bpm;
      Tone.getTransport().cancel();

      // Lineariza todas as subnotas em uma sequência temporal
      const allSubNotes = [];
      let currentTime = 0;

      // 1. Primeira passada: calcular durações e coletar todas as subnotas
      currentMatrix.forEach((col, colIndex) => {
        const colDuration = Tone.Time("4n").toSeconds(); // Duração fixa por coluna
        const subNotesCount = Math.max(...col.map(note => note?.subNotes?.length || 1));
        const subDuration = colDuration / subNotesCount;

        col.forEach((note, rowIndex) => {
          const effectiveSubNotes = note?.subNotes || [createSubNote()];

          effectiveSubNotes.forEach((subNote, subIndex) => {
            const startTime = currentTime + (subIndex * subDuration);
            allSubNotes.push({
              rowIndex,
              colIndex,
              subIndex,
              subNote,
              startTime,
              duration: subDuration,
              noteName: notes[rowIndex]
            });
          });
        });

        currentTime += colDuration;
      });

      // 2. Segunda passada: agendar eventos
      allSubNotes.forEach(({ rowIndex, colIndex, subIndex, subNote, startTime, duration, noteName }) => {
        const noteKey = `${rowIndex}-${colIndex}-${subIndex}`;
        lastEventTime = Math.max(lastEventTime, startTime + duration);

        // Agendar highlight (para TODAS as subnotas, inclusive vazias)
        Tone.getTransport().schedule(() => {
          setActiveCol(colIndex);
          setActiveSubIndex(subIndex);
        }, startTime);

        // Lógica de reprodução apenas para subnotas com nome
        if (subNote?.name) {
          // Verificar se precisa iniciar nova nota
          const shouldStart = (
            // É a primeira subnota da primeira coluna
            (colIndex === 0 && subIndex === 0) ||
            // Está marcada como separada
            subNote.isSeparated ||
            // Subnota anterior na mesma coluna está vazia ou é diferente
            (subIndex > 0 && (
              !allSubNotes.find(s =>
                s.rowIndex === rowIndex &&
                s.colIndex === colIndex &&
                s.subIndex === subIndex - 1
              )?.subNote?.name ||
              allSubNotes.find(s =>
                s.rowIndex === rowIndex &&
                s.colIndex === colIndex &&
                s.subIndex === subIndex - 1
              )?.subNote?.name !== subNote.name
            ) ||
              // Última subnota da coluna anterior está vazia ou é diferente
              (colIndex > 0 && (
                !allSubNotes.find(s =>
                  s.rowIndex === rowIndex &&
                  s.colIndex === colIndex - 1 &&
                  s.subIndex === (currentMatrix[colIndex - 1][rowIndex]?.subNotes?.length || 1) - 1
                )?.subNote?.name ||
                allSubNotes.find(s =>
                  s.rowIndex === rowIndex &&
                  s.colIndex === colIndex - 1 &&
                  s.subIndex === (currentMatrix[colIndex - 1][rowIndex]?.subNotes?.length || 1) - 1
                )?.subNote?.name !== subNote.name
              )
              )
            )
          );

          // Verificar se precisa terminar a nota
          const shouldEnd = (
            // É a última subnota da última coluna
            (colIndex === currentMatrix.length - 1 && subIndex === (currentMatrix[colIndex][rowIndex]?.subNotes?.length || 1) - 1) ||
            // Está marcada como separada
            subNote.isSeparated ||
            // Próxima subnota na mesma coluna está vazia ou é diferente
            (subIndex < (currentMatrix[colIndex][rowIndex]?.subNotes?.length || 1) - 1 && (
              !allSubNotes.find(s =>
                s.rowIndex === rowIndex &&
                s.colIndex === colIndex &&
                s.subIndex === subIndex + 1
              )?.subNote?.name ||
              allSubNotes.find(s =>
                s.rowIndex === rowIndex &&
                s.colIndex === colIndex &&
                s.subIndex === subIndex + 1
              )?.subNote?.name !== subNote.name
            ) ||
              // Primeira subnota da próxima coluna está vazia ou é diferente
              (colIndex < currentMatrix.length - 1 && (
                !allSubNotes.find(s =>
                  s.rowIndex === rowIndex &&
                  s.colIndex === colIndex + 1 &&
                  s.subIndex === 0
                )?.subNote?.name ||
                allSubNotes.find(s =>
                  s.rowIndex === rowIndex &&
                  s.colIndex === colIndex + 1 &&
                  s.subIndex === 0
                )?.subNote?.name !== subNote.name
              )
              )
            )
          );

          if (shouldStart) {
            Tone.getTransport().schedule((time) => {
              synthRef.current?.triggerAttack(subNote.name, time);
              activeNotes.set(noteKey, { note: subNote.name, time });
            }, startTime);
          }

          if (shouldEnd) {
            Tone.getTransport().schedule((time) => {
              synthRef.current?.triggerRelease(subNote.name, time);
              activeNotes.delete(noteKey);
            }, startTime + duration);
          }
        }
      });

      await Tone.start();
      Tone.getTransport().start();

      await new Promise(resolve => {
        setTimeout(() => {
          Tone.getTransport().stop();
          synthRef.current?.releaseAll?.();
          setIsPlaying(false);
          setActiveCol(null);
          setActiveSubIndex(null);
          resolve();
        }, (lastEventTime + 0.1) * 1000);
      });

    } catch (error) {
      console.error('Erro na reprodução:', error);
      Tone.getTransport().stop();
      synthRef.current?.releaseAll?.();
      setIsPlaying(false);
    }
  };


  const playSong = async () => {
    if (isPlaying) {
      console.warn('Playback já em execução.');
      return;
    }

    setIsPlaying(true);
    setActivePage(0);
    setMatrixNotes(pages[0]);

    const activeNotes = new Map();
    let lastEventTime = 0;

    try {
      Tone.getTransport().bpm.value = bpm;
      Tone.getTransport().cancel();

      // Lineariza todas as subnotas em uma sequência temporal
      const allSubNotes = [];
      let currentTime = 0;
      let currentMatrix = pages[0];

      // 1. Primeira passada: calcular durações e coletar todas as subnotas
      for (let matrixIndex= 0; matrixIndex < pages.length; matrixIndex++) {
        let currentMatrix = pages[matrixIndex];

        currentMatrix.forEach((col , colIndex) => {
          const colDuration=Tone.Time("4n").toSeconds(); // Duração fixa por coluna
          const subNotesCount=Math.max(...col.map(note => note?.subNotes?.length || 1));
          const subDuration=colDuration / subNotesCount;

          col.forEach((note , rowIndex) => {
            const effectiveSubNotes=note?.subNotes || [ createSubNote() ];

            effectiveSubNotes.forEach((subNote , subIndex) => {
              const startTime=currentTime+(subIndex * subDuration);
              allSubNotes.push({
                matrixIndex ,
                rowIndex ,
                colIndex ,
                subIndex ,
                subNote ,
                startTime ,
                duration: subDuration ,
                noteName: notes[rowIndex]
              });
            });
          });

          currentTime+=colDuration;
        });

      }

      // 2. Segunda passada: agendar eventos
      allSubNotes.forEach(({ matrixIndex, rowIndex, colIndex, subIndex, subNote, startTime, duration, noteName }) => {
        const noteKey = `${rowIndex}-${colIndex}-${subIndex}`;
        currentMatrix = pages[matrixIndex];

        lastEventTime = Math.max(lastEventTime, startTime + duration);

        // Agendar highlight (para TODAS as subnotas, inclusive vazias)
        Tone.getTransport().schedule(() => {
          setActiveCol(colIndex);
          setActiveSubIndex(subIndex);

          setActivePage(matrixIndex);
          setMatrixNotes(pages[matrixIndex]);
        }, startTime);

        // Lógica de reprodução apenas para subnotas com nome
        if (subNote?.name) {
          // Verificar se precisa iniciar nova nota
          const shouldStart = (
              // É a primeira subnota da primeira coluna
              (colIndex === 0 && subIndex === 0) ||
              // Está marcada como separada
              subNote.isSeparated ||
              // Subnota anterior na mesma coluna está vazia ou é diferente
              (subIndex > 0 && (
                      !allSubNotes.find(s =>
                          s.rowIndex === rowIndex &&
                          s.colIndex === colIndex &&
                          s.subIndex === subIndex - 1
                      )?.subNote?.name ||
                      allSubNotes.find(s =>
                          s.rowIndex === rowIndex &&
                          s.colIndex === colIndex &&
                          s.subIndex === subIndex - 1
                      )?.subNote?.name !== subNote.name
                  ) ||
                  // Última subnota da coluna anterior está vazia ou é diferente
                  (colIndex > 0 && (
                          !allSubNotes.find(s =>
                              s.rowIndex === rowIndex &&
                              s.colIndex === colIndex - 1 &&
                              s.subIndex === (currentMatrix[colIndex - 1][rowIndex]?.subNotes?.length || 1) - 1
                          )?.subNote?.name ||
                          allSubNotes.find(s =>
                              s.rowIndex === rowIndex &&
                              s.colIndex === colIndex - 1 &&
                              s.subIndex === (currentMatrix[colIndex - 1][rowIndex]?.subNotes?.length || 1) - 1
                          )?.subNote?.name !== subNote.name
                      )
                  )
              )
          );

          // Verificar se precisa terminar a nota
          const shouldEnd = (
              // É a última subnota da última coluna
              (colIndex === currentMatrix.length - 1 && subIndex === (currentMatrix[colIndex][rowIndex]?.subNotes?.length || 1) - 1) ||
              // Está marcada como separada
              subNote.isSeparated ||
              // Próxima subnota na mesma coluna está vazia ou é diferente
              (subIndex < (currentMatrix[colIndex][rowIndex]?.subNotes?.length || 1) - 1 && (
                      !allSubNotes.find(s =>
                          s.rowIndex === rowIndex &&
                          s.colIndex === colIndex &&
                          s.subIndex === subIndex + 1
                      )?.subNote?.name ||
                      allSubNotes.find(s =>
                          s.rowIndex === rowIndex &&
                          s.colIndex === colIndex &&
                          s.subIndex === subIndex + 1
                      )?.subNote?.name !== subNote.name
                  ) ||
                  // Primeira subnota da próxima coluna está vazia ou é diferente
                  (colIndex < currentMatrix.length - 1 && (
                          !allSubNotes.find(s =>
                              s.rowIndex === rowIndex &&
                              s.colIndex === colIndex + 1 &&
                              s.subIndex === 0
                          )?.subNote?.name ||
                          allSubNotes.find(s =>
                              s.rowIndex === rowIndex &&
                              s.colIndex === colIndex + 1 &&
                              s.subIndex === 0
                          )?.subNote?.name !== subNote.name
                      )
                  )
              )
          );

          if (shouldStart) {
            Tone.getTransport().schedule((time) => {
              synthRef.current?.triggerAttack(subNote.name, time);
              activeNotes.set(noteKey, { note: subNote.name, time });
            }, startTime);
          }

          if (shouldEnd) {
            Tone.getTransport().schedule((time) => {
              synthRef.current?.triggerRelease(subNote.name, time);
              activeNotes.delete(noteKey);
            }, startTime + duration);
          }
        }
      });

      await Tone.start();
      Tone.getTransport().start();

      await new Promise(resolve => {
        setTimeout(() => {
          Tone.getTransport().stop();
          synthRef.current?.releaseAll?.();
          setIsPlaying(false);
          setActiveCol(null);
          setActiveSubIndex(null);
          resolve();
        }, (lastEventTime + 0.1) * 1000);
      });

    } catch (error) {
      console.error('Erro na reprodução:', error);
      Tone.getTransport().stop();
      synthRef.current?.releaseAll?.();
      setIsPlaying(false);
    }

    setIsPlaying(false);
  };

  const toJson = () => {
    const musicData = {
      title,
      description,
      bpm,
      instrument,
      volume,
      layers: pages.map(page =>
        page.map(column =>
          column.map(note => ({
            name: note.name,
            duration: note.duration,
            subNotes: note.subNotes.map(sub => ({
              name: sub.name,
              isSeparated: sub.isSeparated
            }))
          }))
        )
      ),
    };

    const json = JSON.stringify(musicData, null, 2);
    return musicData;
  }

  const handleSave = async () => {
    if (!tokenJWT) {
      alert("Você precisa estar logado para salvar projetos");
      return;
    }

    const projectData = toJson();

    const midiFile = midiBlob();
    const midiBase64 = await blobToBase64(midiFile);
    projectData.midi = midiBase64;
    projectData.title = title + " (Fork)"

    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenJWT}`
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();
      console.log("Resposta do salvamento:", data);

      await router.push(`/editor/${data._id}`);

    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const midiBlob = () => {
    const midi = new Midi();
    const track = midi.addTrack();
    midi.header.setTempo(bpm);

    let currentTime = 0;

    pages.forEach(page => {
      page.forEach((col, colIndex) => {
        const colDuration = Tone.Time("4n").toSeconds();
        const subNotesCount = Math.max(...col.map(note => note?.subNotes?.length || 1));
        const subDuration = colDuration / subNotesCount;

        col.forEach((noteRow, rowIndex) => {
          const noteName = notes[rowIndex];

          if (noteRow.subNotes && noteRow.subNotes.length > 0) {
            noteRow.subNotes.forEach((subNote, subIndex) => {
              const startTime = currentTime + (subIndex * subDuration);

              if (subNote.name) {
                try {
                  track.addNote({
                    name: subNote.name,
                    time: startTime,
                    duration: subDuration
                  });
                } catch (error) {
                  console.error(`Erro ao adicionar nota MIDI ${subNote.name}:`, error);
                }
              }
            });
          }
        });

        currentTime += colDuration;
      });
    });

    const midiBytes = midi.toArray();
    const blob = new Blob([midiBytes], { type: 'editor/midi' });

    return blob;
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const exportToMIDI = () => {
    const blob = midiBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'music.mid';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!router.isReady || !tokenJWT) return;

      if (id && id !== "new") {
        console.log("Carregando projeto ID:", id);
        await loadProjectData(id);
      } else {
        // Inicializa um novo projeto
        const newMatrix = Array.from({ length: initialCols }, () =>
            Array.from({ length: rows }, () => createNote())
        );
        setPages([newMatrix]);
        setMatrixNotes(newMatrix);
        setActivePage(0);
      }
    };

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setTokenJWT(token);
      loadData().then(() => setLoading(false));
    }
  }, [router.isReady, id, tokenJWT]);

  const loadProjectData = async (projectId) => {
    console.log("OIA O PROJECT ID")
    console.log(projectId)

    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenJWT}`
        }
      });

      if (response.status === 401) {
        alert("Sessão expirada. Por favor, faça login novamente.");
        await router.push("/login");
        return;
      }

      const data = await response.json();
      console.log("OIA A DATAAAA")
      console.log(data)

      if (data) {
        if (data.bpm == null || data.instrument == null || data.volume == null) {
          return;
        }

        // Carrega a versão atual (current_music_id)
        await loadVersionData(data.current_music_id);
        setCurrentMusicId(data.current_music_id._id);
        setLastVersionId(data.current_music_id._id);

        // Atualiza os metadados do projeto
        setProjectId(projectId);
        setVersions(data.music_versions);

        // Atualiza estados básicos
        setBpm(data.bpm ?? 120);
        setInstrument(data.instrument ?? 'piano');
        setVolume(data.volume ?? -10);
        setTitle(data.title ?? '');
        setDescription(data.description ?? '');

      } else {
        // Se não houver dados, inicializa com valores padrão
        const newMatrix = Array.from({ length: initialCols }, () =>
            Array.from({ length: rows }, () => createNote())
        );
        setPages([newMatrix]);
        setMatrixNotes(newMatrix);
      }
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
    }
  };

  const loadVersionData = async (version) => {
    try {
      if (!version) {
        console.warn("Versão não fornecida");
        return;
      }


      console.log("Versão recebida para carregar:", version);
      console.log("Layers para carregar:", version.layers);


      // Processa os layers
      if (version.layers?.length > 0) {
        console.log("Layers encontrados:", version.layers);

        // Atualiza os estados
        setPages(version.layers);
        setMatrixNotes(version.layers[0]);
        setActivePage(0);
      } else {
        console.warn("Sem layers válidos - criando padrão");
        const newMatrix = Array.from({ length: initialCols }, () =>
            Array.from({ length: rows }, () => createNote())
        );
        setPages([newMatrix]);
        setMatrixNotes(newMatrix);
      }
    } catch (error) {
      console.error("Erro crítico ao carregar versão:", error);
      // Fallback seguro
      const fallbackMatrix = Array.from({ length: initialCols }, () =>
          Array.from({ length: rows }, () => createNote())
      );
      setPages([fallbackMatrix]);
      setMatrixNotes(fallbackMatrix);
    }
  };

  const importFromMIDI = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      try {
        const data = JSON.parse(content);
        console.log(data)
        setBpm(data.bpm);
        setInstrument(data.instrument);
        setVolume(data.volume);
        setProjectId(projectId);

        // Verifica se há layers/pages no projeto
        if (data.layers && data.layers.length > 0) {
          console.log("Falsoooooo 1")
          setPages(data.layers);
          console.log("Falsoooooo 2")
          setMatrixNotes(pages[0]);
          console.log("Falsoooooo 3")
          setActivePage(0);
          console.log("Falsoooooo 4")

        }

      } catch (error) {
        console.error("Erro ao importar projeto:", error);
        alert(`Falha ao importar: ${error.message || "Formato de arquivo inválido"}`);
      }
    };
    reader.readAsText(file);
  };

  const formatAPIDate = (dateString) => {
    try {
      const date = new Date(dateString.replace("GMT", ""));
      return isNaN(date)
          ? "Data inválida"
          : `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }
  // Render
  return (
    <div className="app-container">
      <HeaderEditor
        onPlaySong={playSong}
        onPlayActivePage={() => playSelectedNotesActivePage(activePage)}
        onExport={exportToMIDI}
        onFork={showPopup}
        setLang={setLang}
        lang={lang}
        t={t}
        title={title}
        mode={'view'}
      />
      <SaveMusicPopUp saveOrFork={"Criar Fork"} onSave={handleSave} open={openPop} onCancel={handleClosePopup} description={description} title={title} setDescription={setDescription} setTitle={setTitle}></SaveMusicPopUp>
      <div id="home">
        <div className="data">
          <div className="control-panel">
            <div className="control-group">
              <ChangeInstrument
                instrument={instrument}
                instruments={instruments}
                setInstrument={setInstrument}
                synthRef={synthRef}
              />
            </div>

            <div className="control-group">
              <ChangeVolume
                volume={volume}
                setVolume={setVolume}
                synthRef={synthRef}
              />
            </div>

            <div className="control-group">
              <h3>{t("tempo")}</h3>
              <div className="control-item">
                <label>{t("bpmLabel")}: {bpm}</label>
                <input
                  type="range"
                  min="40"
                  max="300"
                  step="10"
                  className="control-range"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                />
              </div>
            </div>

            <SelectRitmo rhythm={rhythm} setRhythm={setRhythm} />

            <div className="control-group">
              <h3>{t("versions")}</h3>
              <div className="control-item">
                <select
                    name="versions"
                    className="control-select"
                    value={currentMusicId}
                    onChange={(e) => handleVersionChange(e.target.value)}
                >
                  {versions.length > 0 ? (
                      versions.map((version, index) => {
                        const formattedDate = formatAPIDate(version.updated_at);
                        const userName = version.update_by?.username || t("unknown_user");

                        return (
                            <option key={version._id} value={version.music_id._id}>
                              {`${formattedDate} - ${userName}`}
                              {lastVersionId === version.music_id._id && " (Current)"}
                            </option>
                        );
                      })
                  ) : (
                      <option disabled>{t("no_versions")}</option>
                  )}
                </select>
              </div>
            </div>

            <div className="control-group">
              <h3>{t("page")}</h3>
              <p className="text-sm">
                {t("pageOf", { current: activePage + 1, total: pages.length })}
              </p>
              <div className="page-buttons">
                <button onClick={() => movePage(-1)}>⬅</button>
                <button onClick={addPage}>✛</button>
                <button onClick={() => movePage(1)}>⮕</button>
              </div>
            </div>
          </div>
        </div>

        <div id="edit-window">
          <div id="piano-roll-container">
            <div id="notes">{renderKeys()}</div>
            <PianoRoll
              synthRef={synthRef}
              bpm={bpm}
              pages={pages}
              setPages={setPages}
              activeCol={activeCol}
              activeSubIndex={activeSubIndex}
              setActiveCol={setActiveCol}
              cols={cols}
              setCols={setCols}
              rows={rows}
              notes={notes}
              activePage={activePage}
              setActivePage={setActivePage}
              selectedColumn={selectedColumn}
              setSelectedColumn={setSelectedColumn}
              createSubNote={createSubNote}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default EditorPage;