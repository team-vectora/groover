import React, { useState, useEffect, useContext } from "react";
import Link from 'next/link';
import { useRouter } from "next/router";
import Post from "../components/Post";
import FeedCaption from "../components/FeedCaption";
import useLikePost from "../hooks/useLikePost";
import useForkProject from "../hooks/useForkProject";
import { MidiContext } from "../contexts/MidiContext";
import MidiPlayer from "../components/MidiPlayer";

function Feed() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [following, setFollowing] = useState([]);
  const [posts, setPosts] = useState([]);
  const [similarUsers, setSimilarUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { currentProject, setCurrentProject } = useContext(MidiContext);

  const { likePost, error: likeError } = useLikePost(token, () => fetchPosts(token));
  const { forkProject, loading: forkLoading } = useForkProject(token);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken == null) {
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
    <div>
      <FeedCaption />

      {/* Lista de usuários similares */}
      <section>
        <h2>Usuários similares para seguir</h2>
        {similarUsers.length === 0 && <p>Nenhum usuário similar encontrado.</p>}
        <ul>
          {similarUsers.map((user) => (
            <li key={user._id} style={{ marginBottom: '1rem' }}>
              <img
                src={user.avatar || '/default-avatar.png'}
                alt={user.username}
                width={50}
                height={50}
                style={{ borderRadius: "50%", marginRight: "0.5rem" }}
              />
              <span>{user.username}</span>
              <button
                style={{ marginLeft: "1rem" }}
                onClick={() => {
                  // Aqui você pode implementar a lógica para seguir o usuário,
                  // como chamar uma API e atualizar o estado local para refletir.
                }}
              >
                Seguir
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Feed de posts */}
      {loading && <p>Carregando posts...</p>}
      {(error || likeError) && <p style={{ color: "red" }}>{error || likeError}</p>}
      {!loading && posts.length === 0 && <p>Nenhum post encontrado.</p>}

      <div className="post-container">
        {posts.map((post) => (
          <Post
            key={post._id}
            userId={localStorage.getItem("id")}
            post={post}
            handleClick={() => likePost(post._id)}
            setCurrentProject={setCurrentProject}
            handleClickFork={forkProject}
            following={following}
          />
        ))}
      </div>

      <MidiPlayer project={currentProject} />
    </div>
  );
}

export default Feed;
