import React, { useState, useEffect, useContext } from "react";
import Link from 'next/link';
import { useRouter } from "next/router";
import Post from "../components/Post";
import FeedCaption from "../components/FeedCaption";
import SimilarUsers from "../components/SimilarUsers";
import useLikePost from "../hooks/useLikePost";
import useForkProject from "../hooks/useForkProject";
import { MidiContext } from "../contexts/MidiContext";
import MidiPlayer from "../components/MidiPlayer";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function Feed() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [following, setFollowing] = useState([]);
  const [posts, setPosts] = useState([]);
  const [similarUsers, setSimilarUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  const { currentProject, setCurrentProject } = useContext(MidiContext);

  const { likePost, error: likeError } = useLikePost(token, () => fetchPosts(token));
  const { forkProject, loading: forkLoading } = useForkProject(token);

  const handleClickFork = async (project) => {
    await forkProject(project.id);
  };

  useEffect(() => {
    // Rodar só no client, pega userId, token, following
    const storedUserId = localStorage.getItem("id");
    setUserId(storedUserId);

    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      router.push("/login");
    } else {
      const storedFollowing = JSON.parse(localStorage.getItem("following") || "[]");
      setFollowing(storedFollowing);
      setToken(storedToken);

      fetchPosts(storedToken);
      fetchSimilarUsers(storedToken);
    }
  }, []);

  const fetchPosts = async (token) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/post", {
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

  const fetchSimilarUsers = async (token) => {
    try {
      const res = await fetch("http://localhost:5000/api/user/similar", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Erro ao buscar usuários similares");
      }

      const data = await res.json();
      setSimilarUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

return (
  <div className="pb-16">
    <FeedCaption />

    {loading && <p>Carregando posts...</p>}
    {(error || likeError) && <p style={{ color: "red" }}>{error || likeError}</p>}
    {!loading && posts.length === 0 && <p>Nenhum post encontrado.</p>}

<div className="flex justify-center items-start gap-6">
  <div className="w-1/5 hidden md:block similar-users-sticky">
    {userId && (
      <SimilarUsers users={similarUsers} following={following} userId={userId} />
    )}
  </div>

  <div className="w-full md:w-2/5">
    <div className="post-container">
      <ToastContainer
        position="top-center"
        toastStyle={{ textAlign: 'center', fontSize: '1.2rem' }}
      />
      {posts.map((post) => (
        <Post
          key={post._id}
          userId={userId}
          post={post}
          profileId={localStorage.getItem("id")}
          handleClick={() => likePost(post._id)}
          setCurrentProject={setCurrentProject}
          handleClickFork={handleClickFork}
          following={following}
        />
      ))}
    </div>
  </div>

  <div className="w-1/5 hidden md:block similar-users-sticky">
    {userId && (
      <SimilarUsers users={similarUsers} following={following} userId={userId} />
    )}
  </div>
</div>


    {/* Player MIDI abaixo */}
    <div className="mt-6">
      <MidiPlayer project={currentProject} />
    </div>
  </div>
);


}

export default Feed;