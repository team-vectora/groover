"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import PostForm from "../../components/PostForm"
import Post from "../../components/Post";
import Popup from "reactjs-popup";

export default function Profile() {
    const router = useRouter();
    const { user } = router.query;

    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [username, setUsername] = useState("Usuário");
    const [error, setError] = useState(null);
    const [popUpFork, setPopUpFork] = useState(false)
    const [posts, setPosts] = useState([]);
    const [invites, setInvites] = useState([]);

    const [activeTab, setActiveTab] = useState("posts");

    useEffect(() => {
        if (!user) return;
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

    // Arrumar estilo e isso do fork
    const handleClickFork = async (project) => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:5000/api/fork`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_id: project.id,
                }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    router.push("/login");
                    return;
                }
                throw new Error('Err during fork');
            }

            setPopUpFork(true);
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
                                <>
                                    {console.log(project)}
                                    <div className="project-card">
                                        <h2>{project.title || 'Sem título'}</h2>
                                        <p>{project.description || 'Sem descrição'}</p>

                                        <div className="project-info">
                                            <span>BPM: {project.bpm || '--'}</span>
                                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                        </div>


                                        {!project.is_owner && (
                                            <div className="collab-badge">Colaborador</div>
                                        )}
                                        <div className="button-info">
                                            <a
                                                href={`/editor/${project.id}`}
                                                key={project.id}
                                                className="button-card-project"
                                            > <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="12.7835" y="2.38351" width="6" height="10" rx="3" transform="rotate(33.0385 12.7835 2.38351)" stroke="#000000" stroke-width="2" stroke-linecap="round"></rect> <rect x="7.83558" y="6.32284" width="6" height="10" rx="3" transform="rotate(33.0385 7.83558 6.32284)" stroke="#000000" stroke-width="2" stroke-linecap="round"></rect> </g></svg></a>

                                            <button className="button-card-project"
                                                onClick={() => (handleClickFork(project))}>
                                                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M0 0H10V4H4V10H0V0Z" fill="#000000"></path> <path d="M16 6H6V16H16V6Z" fill="#000000"></path> </g></svg>
                                            </button>

                                            <Popup open={popUpFork} closeOnDocumentClick onClose={() => setPopUpFork(false)}>
                                                <div>
                                                    Projeto copiado: recarregue a pagina (arrumar isso)
                                                </div>
                                            </Popup>
                                        </div>
                                    </div>
                                </>
                            ))}
                        </div>
                    </>
                )
            case "invites":
                return invites.length === 0 ? (
                    <p className="empty-text">Você não tem convite</p>
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
                </button>s.
            </nav>
            <section className="tab-content">{renderTabContent()}</section>
        </div>
    );
}
