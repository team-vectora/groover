'use client'
import { useState, useContext } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareNodes, faPenToSquare, faTrash, faPlay, faPause, faEllipsisVertical, faUsers, faMusic } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import useOutsideClick from '../../hooks/posts/useOutsideClick';
import { useMidiPlayer } from '../../hooks';

const ProjectCard = ({ isYourProfile, project, handleClickShare, handleClickDelete, handleManageCollaborators }) => {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useOutsideClick(() => setIsMenuOpen(false));
    // CORREÇÃO: Obtendo setCurrentProject diretamente do contexto
    const { isPlaying, playPause, currentProject, setCurrentProject } = useMidiPlayer();

    const isCurrentlyPlaying = currentProject?.id === project.id && isPlaying;

    const handlePlayRequest = (e) => {
        e.stopPropagation();
        if (currentProject?.id === project.id) {
            playPause();
        } else {
            if (isPlaying) {
                // Pausa a musica anterior se tiver tocando
                playPause();
            }
            setCurrentProject(project);
            // Pequeno delay para o hook carregar o MIDI antes de tocar
            setTimeout(() => playPause(), 50);
        }
    };

    return (
        <div onClick={() => setCurrentProject(project)} className="relative flex flex-col md:flex-row items-center gap-4 p-4 pr-5 bg-bg-secondary rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] border-2 border-primary/70">
            {isYourProfile && (
                <div ref={menuRef} className="absolute top-0 right-1 z-10">
                    <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="text-text-lighter hover:text-white p-2 rounded-full hover:bg-primary/30 transition">
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-52 bg-bg-darker border border-primary rounded-md shadow-lg z-20">
                            <button onClick={(e) => { e.stopPropagation(); handleManageCollaborators(project); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-primary/20 flex items-center gap-2">
                                <FontAwesomeIcon icon={faUsers} className="w-4 h-4" />
                                {t('project.view_collaborators')}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleClickDelete(project.id); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-primary/20 flex items-center gap-2">
                                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                {t('post.deletePost')}
                            </button>
                        </div>
                    )}
                </div>
            )}
            <div className="relative flex-shrink-0 w-28 h-28 md:w-32 md:h-32 bg-bg-darker rounded-xl overflow-hidden flex items-center justify-center group">
                {project.cover_image ? (
                    <>
                        <img src={project.cover_image} alt="Capa do projeto" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={handlePlayRequest} className="w-12 h-12 bg-accent/80 rounded-full flex items-center justify-center text-white hover:bg-accent">
                                <FontAwesomeIcon icon={isCurrentlyPlaying ? faPause : faPlay} className="text-2xl" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FontAwesomeIcon icon={faMusic} className="text-accent text-4xl opacity-50" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={handlePlayRequest} className="w-12 h-12 bg-accent/80 rounded-full flex items-center justify-center text-white hover:bg-accent">
                                <FontAwesomeIcon icon={isCurrentlyPlaying ? faPause : faPlay} className="text-2xl" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex-1 flex flex-col justify-between w-full">
                <div>
                    <h2 className="text-lg md:text-xl font-bold text-accent-light line-clamp-2">{project.title || t('profile.untitled')}</h2>
                    <p className="text-sm text-foreground mt-1 line-clamp-2">{project.description || t('profile.noDescription')}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-lighter opacity-70">
                        <span>BPM: {project.bpm || "--"}</span>
                        <span>{project.created_at ? new Date(project.created_at).toLocaleDateString() : "--"}</span>
                        <Link href={`/profile/${project?.created_by?.username}`} onClick={(e) => e.stopPropagation()} className="hover:underline">{project.created_by?.username || "--"}</Link>
                    </div>
                </div>
                <div className="flex gap-3 mt-4">
                    <Link href={`/editor/${project.id}`} onClick={(e) => e.stopPropagation()} className="bg-primary hover:bg-primary-light p-3 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110 shadow-sm">
                        <FontAwesomeIcon icon={faPenToSquare} className="text-text-lighter text-lg" />
                    </Link>
                    {isYourProfile && (
                        <button onClick={(e) => { e.stopPropagation(); handleClickShare(project); }} className="bg-accent hover:bg-accent-light p-3 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110 shadow-sm">
                            <FontAwesomeIcon icon={faShareNodes} className="text-bg-secondary text-lg" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;