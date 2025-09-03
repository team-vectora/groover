import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareNodes, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';

const ProjectCard = ({ isYourProfile, project, setCurrentProject, handleClickShare, handleClickDelete }) => {
    return (
        <div
            key={project.id}
            onClick={() => setCurrentProject(project)}
            className="rounded-lg p-6 transition-all duration-300 bg-bg-secondary text-foreground w-full cursor-pointer border border-primary-light hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-1"
        >
            <div className="pb-4">
                <h2 className="text-xl font-semibold mb-2 truncate text-accent-light">
                    {project.title || "Sem título"}
                </h2>
                <p className="text-foreground opacity-80 mb-4 h-12 overflow-hidden">
                    {project.description || "Sem descrição"}
                </p>

                <div className="flex justify-between text-sm text-foreground opacity-70">
                    <span>BPM: {project.bpm || "--"}</span>
                    <span>
                        {project.created_at
                            ? new Date(project?.created_at).toLocaleDateString()
                            : "--"}
                    </span>
                    <span className="font-semibold">{project.created_by ? project.created_by.username : "--"}</span>
                </div>
            </div>

            <div className="border-t border-accent-light/20 my-3"></div>

            <div className="flex items-center justify-start pt-1 gap-4">
                <Link
                    href={`/editor/${project.id}`}
                    className="bg-primary hover:bg-primary-light p-3 rounded-full h-12 w-12 flex items-center justify-center transition duration-300 ease-in-out hover:shadow-md"
                >
                    <FontAwesomeIcon icon={faPenToSquare} className="text-text-lighter text-lg" />
                </Link>

                {isYourProfile && (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); handleClickShare(project); }} className="bg-primary hover:bg-primary-light p-3 rounded-full h-12 w-12 flex items-center justify-center transition duration-300 ease-in-out hover:shadow-md" >
                            <FontAwesomeIcon icon={faShareNodes} /* ... */ />
                        </button>
                        {/* Botão de Excluir */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleClickDelete(project.id); }}
                            className="bg-red-600/80 hover:bg-red-600 p-3 rounded-full h-12 w-12 flex items-center justify-center transition duration-300 ease-in-out hover:shadow-md"
                        >
                            <FontAwesomeIcon icon={faTrash} className="text-text-lighter text-lg" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProjectCard;