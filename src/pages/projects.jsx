"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Projects() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
        } else {
            setLoading(false);
        }
    }, [router]);

    if (loading) {
        return (
            <div className="loadingContainer">
                <p>Carregando projetos...</p>
            </div>
        );
    }

    const projects = [
        { id: 1, title: "Projeto One", description: "Uma descrição breve do projeto One." },
    ];

    const username = localStorage.getItem("username") || "Usuário";

    function handleNewProject() {
        alert("Aqui você pode abrir a tela para criar um novo projeto!");
    }

    return (
        <div className="container">
            <div className="headerWithButton">
                <h1 className="title">Projetos de {username}</h1>
                <button className="newProjectBtn" onClick={handleNewProject}>
                    + Novo Projeto
                </button>
            </div>
            <div className="projectList">
                {projects.map((project) => (
                    <div key={project.id} className="projectCard">
                        <h2 className="projectTitle">{project.title}</h2>
                        <p className="projectDescription">{project.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
