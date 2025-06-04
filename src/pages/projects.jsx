"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Projects() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [username, setUsername] = useState("Usuário");
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUsername = localStorage.getItem("username");

        if (!token) {
            router.push("/login");
        } else {
            if (storedUsername) {
                setUsername(storedUsername);
            }
            fetchUserProjects(token);
        }
    }, [router]);

    const fetchUserProjects = async (token) => {
        try {
            const response = await fetch('https://groover-api.onrender.com/api/projects', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    router.push("/login");
                    return;
                }
                throw new Error('Erro ao carregar projetos');
            }

            const data = await response.json();
            setProjects(data);
        } catch (err) {
            console.error('Erro:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNewProject = () => {
        router.push("/editor/new");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-xl">Carregando projetos...</p>
                    <div className="mt-4 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center p-6 bg-red-100 rounded-lg max-w-md">
                    <p className="text-xl text-red-600">Erro ao carregar projetos</p>
                    <p className="mt-2">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Projetos de {username}</h1>
                <button
                    onClick={handleNewProject}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                >
                    <span>+</span> Novo Projeto
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-xl text-gray-500">Você ainda não tem projetos</p>
                    <button
                        onClick={handleNewProject}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Criar primeiro projeto
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link
                            href={`/editor/${project.id}`}
                            key={project.id}
                            className="block"
                        >
                            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer h-full">
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">{project.title || 'Sem título'}</h2>
                                <p className="text-gray-600 mb-3">{project.description || 'Sem descrição'}</p>
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>BPM: {project.bpm || '--'}</span>
                                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                </div>
                                {!project.is_owner && (
                                    <div className="mt-2 text-xs text-blue-500">Colaborador</div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}