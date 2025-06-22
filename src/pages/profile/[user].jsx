"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import PostForm from "../../components/PostForm"
import Post from "../../components/Post";

export default function Profile() {
    const router = useRouter();
    const { user } = router.query;

    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [username, setUsername] = useState("Usuário");
    const [error, setError] = useState(null);

    const [posts, setPosts] = useState([]);
    const [invites, setInvites] = useState([]);

    const [activeTab, setActiveTab] = useState("posts");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUsername = localStorage.getItem("username");

        if (!token) {
            router.push("/login");
            return;
        }
        if (storedUsername) {
            setUsername(storedUsername);
        }

        fetchUserProjects(token, user ?? "");
        fetchPosts(token);
    }, [router, user]);


    const fetchUserProjects = async (token, user) => {

        try {
            const response = await fetch(`http://localhost:5000/api/projects/user/${user}`, {
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

    const fetchPosts = async (token) => {
        setLoading(true);
        setError("");
        try {

            const res = await fetch(`http://localhost:5000/api/post/${user}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                if (res.status === 401) {
                    setError("Token inválido ou expirado. Faça login novamente.");
                    setToken("");
                    return;
                }
                const text = await res.text();
                setError(`Erro na API: ${res.status} - ${text}`);
                return;
            }

            const data = await res.json();
            setPosts(data);
        } catch (err) {
            setError("Erro na comunicação com a API.");
        } finally {
            setLoading(false);
        }
    };

    const handleNewProject = () => {
        router.push("/editor/new");
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-content">
                    <p className="loading-text">Carregando projetos...</p>
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-box">
                    <p className="error-title">Erro ao carregar projetos</p>
                    <p className="error-message">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="error-button"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    function renderTabContent() {
        switch (activeTab) {
            case "posts":
                return posts.length === 0 ? (
                    <>
                        <PostForm></PostForm>
                        <p className="empty-text">Você não tem posts ainda.</p>
                    </>

                ) : (
                    posts.map((post) => (
                        <>
                            <PostForm></PostForm>
                            <Post post={post}></Post>
                        </>

                    ))
                );
            case "musics":
                return (
                    <>
                        <button
                            className="new_project"
                            onClick={handleNewProject}
                        >
                            Novo Projeto
                        </button>

                        <div className="projects-grid">
                            {projects.map((project) => (
                                <a
                                    href={`/editor/${project.id}`}
                                    key={project.id}
                                    className="project-card"
                                >
                                    <h2>{project.title || 'Sem título'}</h2>
                                    <p>{project.description || 'Sem descrição'}</p>

                                    <div className="project-info">
                                        <span>BPM: {project.bpm || '--'}</span>
                                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                    </div>

                                    {!project.is_owner && (
                                        <div className="collab-badge">Colaborador</div>
                                    )}
                                </a>
                            ))}
                        </div>
                    </>
                )
            case "invites":
                return invites.length === 0 ? (
                    <p className="empty-text">Você não tem convites.</p>
                ) : (
                    invites.map((invite) => (
                        <div key={invite.id} className="invite-card">
                            <p className="invite-text">{invite.text}</p>
                        </div>
                    ))
                );
            default:
                return null;
        }
    }

    return (
        <div className="profile-container">
            <h1 className="profile-title">Olá, {user}</h1>

            <nav className="tabs-nav">
                <button
                    className={activeTab === "posts" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("posts")}
                >
                    My Posts
                </button>
                <button
                    className={activeTab === "musics" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("musics")}
                >
                    My Musics
                </button>
                <button
                    className={activeTab === "invites" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("invites")}
                >
                    Invites
                </button>
            </nav>
            <section className="tab-content">{renderTabContent()}</section>
        </div>
    );
}
