"use client";

import { useEffect, useState, useContext } from "react";

import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

import Post from "../../components/Post";
import PostFormPopUp from "../../components/PostFormPopUp";
import ConfigUserPopUp from "../../components/ConfigUserPopUp";
import ProjectCard from "../../components/ProjectCard";

import { MidiContext } from "../../contexts/MidiContext";

import Popup from "reactjs-popup";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';



export default function Profile() {
  const router = useRouter();
  const { user } = router.query;

    // Talvez tire esse loading e error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [username, setUsername] = useState("Usuário");
  const [bio, setBio] = useState("");
  const [projects, setProjects] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState("/img/default_avatar.png");
  const [posts, setPosts] = useState([]);
  const [invites, setInvites] = useState([]);

  const [activeTab, setActiveTab] = useState("posts");

  const { currentProject,setCurrentProject } = useContext(MidiContext);

  // popUp
  const [popUpFork, setPopUpFork] = useState(false);
  const [openPop, setOpenPop] = useState(false);
  const [configPop, setConfigPop] = useState(false);

  // Toasts
  const notifySuccess = (msg) => toast.success(msg, {theme: "dark", autoClose: 3000});
  const notifyError = (msg) => toast.error(msg, {theme: "dark",autoClose: 3000});

  const fetchUserData = async (username) => {
    const token = localStorage.getItem("token");
    if (!username || !token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/user/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Erro ao buscar usuário:", await res.text());
        return;
      }

      const data = await res.json();
      if (data.avatar){
          setAvatarUrl(data.avatar);
      }
    } catch (err) {
      console.error("Erro:", err);
    }
  };

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (!token) {
      router.push("/login");
      return;
    }
    if (storedUsername) {
        setUsername(storedUsername)
    };

    fetchUserProjects(token, user);
    fetchPosts(token);
    fetchUserData(user);
  }, [router, user]);

const fetchUserProjects = async (token, user) => {
  try {
    const response = await fetch(`http://localhost:5000/api/projects/user/${user}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Erro ao carregar projetos");
    const data = await response.json();

    setProjects(data);
  } catch (err) {
    console.error("Erro:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const fetchPosts = async (token) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/post/username/${user}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao carregar posts");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setError("Erro ao buscar posts");
    } finally {
      setLoading(false);
    }
  };

  const handleClickFork = async (project) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/fork`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ project_id: project.id }),
      });
      if (!response.ok) throw new Error("Erro ao fazer fork");
      notifySuccess("Projeto forkado");
    } catch (err) {
      notifyError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewProject = () => router.push("/editor/new");

  function renderTabContent() {
    switch (activeTab) {
      case "posts":
        return (
          <>
            <button className="new_project" onClick={() => setOpenPop(true)}>Novo Post</button>
            <PostFormPopUp open={openPop} onClose={() => setOpenPop(false)} user={user} projects={projects}/>
            {posts.length === 0 ? (
              <p className="empty-text">Você não tem posts ainda.</p>
            ) : (
              posts.map((post) => <Post key={post.id} post={post} />)
            )}
          </>
        );
      case "musics":
        return (
          <>
            <button className="new_project" onClick={handleNewProject}>Novo Projeto</button>
            <div className="projects-grid">
              {projects.map((project) => (
                <ProjectCard project={project} setCurrentProject={setCurrentProject} handleClickFork={handleClickFork}/>
              ))}
            </div>
          </>
        );
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
            <ToastContainer
                position="top-center"
                toastStyle={{

                    textAlign: 'center',
                    fontSize: '1.2rem'
                }}
            />
      <div className="flex items-center gap-4">
        <Image
          className="w-30 h-30 sm:w-30 sm:h-30 rounded-full object-cover border border-[#61673e] mb-2 hover:bg-[#c1915d] transition duration-300 ease-in-out cursor-pointer"
          src={avatarUrl}
          height={120}
          width={120}
          alt="Avatar"

        />

        <h1 className="profile-title">Olá, {user}</h1>
        {username === user&& (
          <button
            className="cursor-pointer flex items-center justify-center bg-[#a97f52] hover:bg-[#c1915d] text-white p-2 rounded-full shadow transition duration-300 transform hover:rotate-90 focus:outline-none focus:ring-2 focus:ring-[#c1915d]"
            onClick={() => setConfigPop(true)}
            title="Editar Perfil"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        )}

        <ConfigUserPopUp
          open={configPop}
          onClose={() => setConfigPop(false)}
          username={username}
          bio={bio}
          setBio={setBio}
          profilePic={avatarUrl}
          setProfilePic={setAvatarUrl}
        />
      </div>
      Arrumar os posts do profile e o config da bio
      Adicionar tags
      <nav className="tabs-nav">

        <button className={activeTab === "posts" ? "tab active" : "tab"} onClick={() => setActiveTab("posts")}>My Posts</button>
        <button className={activeTab === "musics" ? "tab active" : "tab"} onClick={() => setActiveTab("musics")}>My Musics</button>
        <button className={activeTab === "invites" ? "tab active" : "tab"} onClick={() => setActiveTab("invites")}>Invites</button>
      </nav>
      <section className="tab-content">{renderTabContent()}</section>

    </div>
  );
}
