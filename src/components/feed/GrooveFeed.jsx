'use client';
import { useEffect, useState, useContext, useRef } from "react";
import { motion } from "framer-motion";
import { MidiContext } from "../../contexts/MidiContext";
import { AudioVisualizer } from "../../components";
import * as Tone from "tone";

export default function GrooveFeed() {
  const { currentProject, setCurrentProject } = useContext(MidiContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const projectRefs = useRef([]);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/projects/teste", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
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
        entries.forEach((entry) => {
          const idx = entry.target.dataset.index;
          if (entry.isIntersecting) setCurrentProject(projects[idx]);
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.6 }
    );

    projectRefs.current.forEach((ref) => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, [projects]);

  if (loading)
    return (
      <p className="text-center text-white py-8">Carregando projetos...</p>
    );
  if (!projects.length)
    return (
      <p className="text-center text-white py-8">Nenhum projeto encontrado</p>
    );

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full h-full"
    >
      {!started && (
        <div className="text-center p-4">
          <button
            onClick={async () => {
              await Tone.start();
              setStarted(true);
            }}
            className="px-6 py-3 bg-accent text-white rounded-lg shadow-lg hover:bg-accent-light transition"
          >
            Iniciar Música e Visualizador
          </button>
        </div>
      )}

      <div className="feed-container overflow-y-auto h-screen snap-y snap-mandatory scroll-smooth p-0 max-w-lg mx-auto">
        {projects.map((project, i) => (
          <motion.div
            key={i}
            ref={(el) => (projectRefs.current[i] = el)}
            data-index={i}
            className="feed-item flex flex-col bg-black rounded-lg shadow-md overflow-hidden h-screen snap-start"
            initial={{ opacity: 0.5, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex-grow flex items-center justify-center bg-bg-darker">
              {started && (
                <AudioVisualizer
                  midiData={project.midi}
                  start={started && currentProject === project}
                />
              )}
            </div>

            <div className="flex flex-col gap-2 p-4 bg-gradient-to-t from-black/90 to-transparent text-white">
              <h3 className="font-bold text-lg truncate">
                {project.title || "Untitled Project"}
              </h3>

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

              {project.description && (
                <p className="text-sm text-gray-200 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
