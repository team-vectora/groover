// src/app/(private)/(groove-club)/explore/page.jsx
'use client';
import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useMidiPlayer } from "../../../../hooks";
import { AudioVisualizer, LoadingDisc } from "../../../../components";
import { apiFetch } from "../../../../lib/util/apiFetch";
import Link from "next/link";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function GrooveFeed() {
    const { currentProject, setCurrentProject, isPlaying, playPause } = useMidiPlayer();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const projectRefs = useRef([]);

    const isCurrentlyPlaying = (project) => {
        return currentProject?._id === project._id && isPlaying;
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const idx = parseInt(entry.target.dataset.index, 10);
                        const newProject = projects[idx];
                        if (!(currentProject) || (newProject && currentProject?._id !== newProject._id)) {
                            console.log("Setando novo projeto")
                            setCurrentProject(newProject);
                        }
                    }
                });
            },
            { root: null, rootMargin: "0px", threshold: 0.7 }
        );

        const refs = projectRefs.current;
        refs.forEach((ref) => { if (ref) observer.observe(ref); });
        return () => { refs.forEach((ref) => { if (ref) observer.unobserve(ref); }); };
    }, [projects, currentProject, setCurrentProject]);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const res = await apiFetch("/projects/explore");
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

    const handlePlayRequest = (project) => {
        console.log("Play")
        setCurrentProject(project);
        setTimeout(() => {
            playPause();
        }, 150);
    };

    if (loading) return <LoadingDisc />;
    if (!projects.length) return <p className="text-center text-white py-8">Nenhum projeto encontrado</p>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
        >
            <div className="snap-y snap-mandatory overflow-y-scroll h-[calc(100vh-6rem)] max-w-lg mx-auto p-0">
                {projects.map((project, i) => (
                    <motion.div
                        key={project._id || i}
                        ref={(el) => (projectRefs.current[i] = el)}
                        data-index={i}
                        className="group snap-start h-full relative flex flex-col bg-black rounded-lg shadow-md overflow-hidden"
                    >
                        <div className="absolute inset-0 flex items-center justify-center bg-bg-darker">
                            <AudioVisualizer isPlaying={isCurrentlyPlaying(project)} />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePlayRequest(project); }}
                                className="w-20 h-20 bg-black/30 backdrop-blur-sm rounded-full text-white/70 hover:bg-black/50 hover:text-white transition-all duration-300 flex items-center justify-center"
                                aria-label="Play/Pause"
                            >
                                <FontAwesomeIcon icon={isCurrentlyPlaying(project) ? faPause : faPlay} className="text-4xl" />
                            </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-4 bg-gradient-to-t from-black/80 to-transparent text-white z-20">
                            <h3 className="font-bold text-lg truncate">{project.title || "Untitled Project"}</h3>
                            <Link href={`/profile/${project.created_by?.username}`} className="flex items-center gap-2 group/user w-fit">
                                {project.created_by?.avatar && (
                                    <img src={project.created_by.avatar} alt={project.created_by?.username || "Autor"} className="w-8 h-8 rounded-full object-cover border-2 border-transparent group-hover/user:border-accent transition" />
                                )}
                                <p className="text-sm text-gray-300 group-hover/user:underline truncate">{project.created_by?.username || "Desconhecido"}</p>
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}