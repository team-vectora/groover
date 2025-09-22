'use client';
import { useEffect, useState, useContext, useRef } from "react";
import { motion } from "framer-motion";
import { MidiContext } from "../../contexts/MidiContext";
import { useMidiPlayer } from "../../hooks";
import { PsychedelicVisualizer } from "../../components";

export default function GrooveFeed() {
  const { currentProject, setCurrentProject } = useContext(MidiContext);
  const { midi, playMidi, stop } = useMidiPlayer();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const projectRefs = useRef([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch("http://localhost:5000/api/projects/teste", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Erro ao carregar projetos");

        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Erro ao carregar projetos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const idx = entry.target.dataset.index;
          if (entry.isIntersecting) {
            setCurrentProject(projects[idx]);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.6, // 60% visível
      }
    );

    projectRefs.current.forEach(ref => ref && observer.observe(ref));

    return () => observer.disconnect();
  }, [projects]);

  useEffect(() => {
    if (!currentProject || !currentProject.midi) return;
    playMidi(currentProject.midi);
  }, [currentProject]);

  if (loading) return <p className="text-center text-white py-8">Carregando projetos...</p>;
  if (!projects.length) return <p className="text-center text-white py-8">Nenhum projeto encontrado</p>;

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-md mx-auto bg-bg-primary rounded-xl shadow-xl overflow-auto h-screen"
    >
      <div className="feed-container space-y-6 p-4">
        {projects.map((project, i) => (
          <motion.div
            key={i}
            ref={el => projectRefs.current[i] = el}
            data-index={i}
            className="feed-item flex flex-col bg-black rounded-lg shadow-md overflow-hidden"
            initial={{ opacity: 0.5, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.4 }}
          >
            {/* Visualizador */}
            <div className="border-2 border-white rounded-lg overflow-hidden p-1 h-48 w-full">
              <PsychedelicVisualizer
                midi={project.midi}
                isPlaying={currentProject === project}
              />
            </div>


            {/* Conteúdo do projeto */}
            <div className="flex flex-col gap-2 p-4 bg-gradient-to-t from-black/90 to-transparent text-white">
              <h3 className="font-bold text-lg truncate">{project.title || "Untitled Project"}</h3>

              {/* Autor */}
              <div className="flex items-center gap-2">
                {project.created_by?.avatar && (
                  <img
                    src={project.created_by.avatar}
                    alt={project.created_by?.username || "Autor"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <p className="text-sm text-gray-300 truncate">
                  Autor: {project.created_by?.username || "Desconhecido"}
                </p>
              </div>

              {/* Descrição */}
              {project.description && (
                <p className="text-sm text-gray-200 line-clamp-2">{project.description}</p>
              )}

              {/* Informações adicionais */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                {project.bpm && <span>BPM: {project.bpm}</span>}
                {project.volume !== undefined && <span>Volume: {project.volume} dB</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
