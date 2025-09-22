import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareNodes, faPenToSquare, faTrash, faPlay } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const ProjectCard = ({ isYourProfile, project, setCurrentProject, handleClickShare, handleClickDelete }) => {
    const { t } = useTranslation();

    return (
        <div
            key={project.id}
            onClick={() => setCurrentProject(project)}
            className="flex flex-col md:flex-row items-center gap-4 p-4 md:p-6
                       bg-bg-secondary rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]
                       border-2 border-primary/70"
        >

            {/* Miniatura */}
            <div className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 bg-bg-darker rounded-xl overflow-hidden flex items-center justify-center">
                {project.cover_image
                    ? <img src={project.cover_image} alt="Capa do projeto" className="w-full h-full object-cover" />
                    : <FontAwesomeIcon icon={faPlay} className="text-accent text-4xl opacity-80" />
                }
            </div>

            {/* Info do projeto */}
            <div className="flex-1 flex flex-col justify-between w-full">
                <div>
                    <h2 className="text-lg md:text-xl font-bold text-accent-light truncate">
                        {project.title || t('profile.untitled')}
                    </h2>
                    <p className="text-sm text-foreground mt-1 line-clamp-2">
                        {project.description || t('profile.noDescription')}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-lighter opacity-70">
                        <span>BPM: {project.bpm || "--"}</span>
                        <span>{project.created_at ? new Date(project.created_at).toLocaleDateString() : "--"}</span>
                        <Link
                            href={`/profile/${project?.created_by?.username}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline"
                        >
                            {project.created_by ? project.created_by.username : "--"}
                        </Link>
                    </div>
                </div>

                {/* Ações */}
                <div className="flex gap-3 mt-4 md:mt-6">
                    {/* Editar */}
                    <Link
                        href={`/editor/${project.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-primary hover:bg-primary-light p-3 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110 shadow-sm"
                    >
                        <FontAwesomeIcon icon={faPenToSquare} className="text-text-lighter text-lg" />
                    </Link>

                    {isYourProfile && (
                        <>
                            {/* Compartilhar */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleClickShare(project); }}
                                className="bg-accent hover:bg-accent-light p-3 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110 shadow-sm"
                            >
                                <FontAwesomeIcon icon={faShareNodes} className="text-bg-secondary text-lg" />
                            </button>

                            {/* Excluir */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleClickDelete(project.id); }}
                                className="bg-red-600/80 hover:bg-red-600 p-3 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110 shadow-sm"
                            >
                                <FontAwesomeIcon icon={faTrash} className="text-text-lighter text-lg" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
