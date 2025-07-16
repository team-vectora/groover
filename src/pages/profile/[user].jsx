"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

import Post from "../../components/Post";
import PostFormPopUp from "../../components/PostFormPopUp";
import ConfigUserPopUp from "../../components/ConfigUserPopUp";
import ProjectCard from "../../components/ProjectCard";

import useLikePost from "../../hooks/useLikePost";
import useForkProject from "../../hooks/useForkProject";

import { MidiContext } from "../../contexts/MidiContext";

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import useShareProject from "../../hooks/useShareProject";
import Invite from "../../components/Invite";
import SharePopUp from "../../components/SharePopUp";

export default function Profile() {
  const router = useRouter();
  const { user } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [username, setUsername] = useState("Usuário");
  const [bio, setBio] = useState("");
  const [projects, setProjects] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState("/img/default_avatar.png");
  const [posts, setPosts] = useState([]);
  const [invites, setInvites] = useState([]);
  const [genres, setGenres] = useState([]);
  const [id, setId] = useState(null);
  const [projectClicked, setProjectClicked] = useState(null);
  const [followers, setFollowers] = useState(0);
  const [followings, setFollowings] = useState(0);
  const [mostFavoriteTags, setMostFavoriteTags] = useState(null);

  const [followingsUserLoged, setFollowingsUserLoged] = useState(0);

  const [activeTab, setActiveTab] = useState("posts");

  const { currentProject, setCurrentProject } = useContext(MidiContext);

  const [openPop, setOpenPop] = useState(false);
  const [configPop, setConfigPop] = useState(false);
  const [sharePop, setSharePop] = useState(false);
  const [response, setResponse] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const { likePost, error: likeError } = useLikePost(token, () => fetchPosts(token));
  const { forkProject, loading: forkLoading } = useForkProject(token);
  const { shareProject, loading: shareLoading } = useShareProject(token);

  useEffect(() => {
    const storedFollowing = JSON.parse(localStorage.getItem("following") || "[]");
    setFollowingsUserLoged(storedFollowing);
  }, []);

  const handleClickLogout = () => {
    localStorage.clear();
    router.push("login");
  };

  const fetchUserData = async (username) => {
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
      if (data.avatar) setAvatarUrl(data.avatar);
      if (data.bio) setBio(data.bio);
      if (data.followers) setFollowers(data.followers);
      if (data.following) setFollowings(data.following);
    } catch (err) {
      console.error("Erro:", err);
    }
  };

  useEffect(() => {
    if (!user) return;

    const storedUsername = localStorage.getItem("username");
    const storedId = localStorage.getItem("id");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUsername) {
      setUsername(storedUsername);
      setId(storedId);
    }

    fetchUserProjects(token, user);
    fetchPosts(token);
    fetchUserData(user);
    fetchInvites(token);
  }, [router, user]);

  const fetchUserProjects = async (token, user) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/user/${user}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao carregar projetos");
      const data = await response.json();
      console.log("Olha os projetos");
      console.log(data);
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
      setGenres(data.length > 0 ? data[0].user.genres : []);
      setMostFavoriteTags(getFavoriteGenres(data.length > 0 ? data[0].user.genres : []));
    } catch (err) {
      setError("Erro ao buscar posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvites = async (token) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/invitations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao carregar invites");
      const data = await res.json();
      console.log("Oia os invites");
      console.log(data);
      setInvites(data);
    } catch (err) {
      setError("Erro ao buscar posts");
    } finally {
      setLoading(false);
    }
  };

  const handleClickFork = async (project) => {
    await forkProject(project.id);
  };

  const handleClickShare = async (project) => {
    setSharePop(true);
    setProjectClicked(project);
  };

  const handleClickAccept = async (inviteId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/invitations/${inviteId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          response: "accept",
        }),
      });

      const data = await response.json();

      if (!data.ok) throw new Error("Erro ao aceitar convite");

      setResponse("Aceito!");
    } catch (err) {
      setError("Erro ao aceitar convite");
    } finally {
      setLoading(false);
    }
  };

  const handleClickReject = async (inviteId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/invitations/${inviteId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          response: "reject",
        }),
      });

      const data = await response.json();

      if (!data.ok) throw new Error("Erro ao aceitar convite");

      setResponse("Recusado");
    } catch (err) {
      setError("Erro ao aceitar convite");
    } finally {
      setLoading(false);
    }
  };

  const handleNewProject = () => router.push("/editor/new");

  function getFavoriteGenres(genres) {
    if (!genres || Object.keys(genres).length === 0) {
      return [];
    }

    return Object.entries(genres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);
  }

  function renderTabContent() {
    switch (activeTab) {
      case "posts":
        return (
          <>
            {username === user && (
              <>
                <button
                  className="new_project flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition duration-300 transform hover:scale-110 hover:bg-[#c1915d] bg-[#a97f52] text-black text-3xl font-bold"
                  onClick={() => setOpenPop(true)}
                  title="Novo Post"
                >
                  +
                </button>
                <PostFormPopUp
                  open={openPop}
                  onClose={() => setOpenPop(false)}
                  user={user}
                  projects={projects}
                  favoriteTags={[]}
                />
              </>
            )}

            {likeError && <p style={{ color: "red" }}>{likeError}</p>}
            {posts.length === 0 ? (
              <p className="empty-text">Você não tem posts ainda.</p>
            ) : (
              posts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  userId={id}
                  handleClick={() => likePost(post._id)}
                  setCurrentProject={setCurrentProject}
                  handleClickFork={handleClickFork}
                  following={followingsUserLoged}
                />
              ))
            )}
          </>
        );
      case "musics":
        return (
          <>
            {username === user && (
              <>
                <button className="new_project" onClick={handleNewProject}>
                  Novo Projeto
                </button>
              </>
            )}
            <div className="projects-grid">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  isYourProfile={project.created_by._id === id}
                  project={project}
                  setCurrentProject={setCurrentProject}
                  handleClickShare={handleClickShare}
                  handleClickFork={handleClickFork}
                  setProjectClicked={setProjectClicked}
                />
              ))}
            </div>
          </>
        );
      case "invites":
        return invites.length === 0 ? (
          <p className="empty-text">Você não tem convite</p>
        ) : (
          invites.map((invite) => (
            <Invite
              invite={invite}
              response={response}
              handleClickAccept={handleClickAccept}
              handleClickReject={handleClickReject}
            />
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
        toastStyle={{ textAlign: "center", fontSize: "1.2rem" }}
      />
      <div className="flex justify-between items-center w-full mb-4">
        <div className="flex items-center gap-4">
          <Image
            className="w-30 h-30 sm:w-30 sm:h-30 rounded-full object-cover border border-[#61673e] mb-2 hover:bg-[#c1915d] transition duration-300 ease-in-out cursor-pointer"
            src={avatarUrl}
            height={120}
            width={120}
            alt="Avatar"
          />
          <div className="flex flex-col">
            <h1 className="profile-title">Olá, {user}</h1>
            <div className="flex gap-4">
              <p>Seguidores: {followers.length}</p>
              <p>Seguindo: {followings.length}</p>
            </div>

            <h3 className="text-x m-2">{bio}</h3>
            <ul className="flex flex-wrap gap-2 mt-4">
              {getFavoriteGenres(genres).map((genre) => (
                <li
                  key={genre}
                  className="px-3 py-1 bg-[#61673e] text-white rounded-full shadow text-sm font-semibold"
                >
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </li>
              ))}
            </ul>
          </div>

          {username === user && (
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
        </div>

        <button className="header-button-logout" onClick={handleClickLogout}>
          ❌ {"logout"}
        </button>
      </div>

      <ConfigUserPopUp
        open={configPop}
        onClose={() => setConfigPop(false)}
        username={username}
        bio={bio}
        profilePic={avatarUrl}
        setProfilePic={setAvatarUrl}
        favoriteTags={genres}
      />

      <SharePopUp open={sharePop} onClose={() => setSharePop(false)} project={projectClicked} />

      <nav className="tabs-nav">
        <button className={activeTab === "posts" ? "tab active" : "tab"} onClick={() => setActiveTab("posts")}>
          Posts
        </button>
        <button className={activeTab === "musics" ? "tab active" : "tab"} onClick={() => setActiveTab("musics")}>
          Musics
        </button>
        {username === user &&
            (<button className={activeTab === "invites" ? "tab active" : "tab"} onClick={() => setActiveTab("invites")}>
              Invites
            </button>)
            }
      </nav>

      <section className="tab-content">{renderTabContent()}</section>
    </div>
  );
}
