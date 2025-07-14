import React, { useState, useEffect, useContext } from "react";
import Link from 'next/link';
import { useRouter } from "next/router";
import Post from "../components/Post";
import FeedCaption from "../components/FeedCaption";
import useLikePost from "../hooks/useLikePost";
import { MidiContext } from "../contexts/MidiContext";
import MidiPlayer  from "../components/MidiPlayer";

function Feed() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [inputToken, setInputToken] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { currentProject,setCurrentProject } = useContext(MidiContext);

  const { likePost, error: likeError } = useLikePost(token, () => fetchPosts(token));

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken == null) {
      router.push("/login");
    } else {
      setToken(storedToken);
      fetchPosts(storedToken);
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

  const handleLogin = () => {
    if (inputToken.trim()) {
      setToken(inputToken.trim());
      setInputToken("");
    }
  };

  return (
    <div>
      <FeedCaption />
      {loading && <p>Carregando posts...</p>}
      {(error || likeError) && <p style={{ color: "red" }}>{error || likeError}</p>}
      {!loading && !error && posts.length === 0 && <p>Nenhum post encontrado.</p>}

      <div className="post-container">
        {posts.map((post) => (
          <Post
            key={post._id}
            userId={localStorage.getItem("id")}
            post={post}
            handleClick={() => likePost(post.id)}
            setCurrentProject={setCurrentProject}
          />
        ))}
      </div>
       <MidiPlayer project={currentProject} />

    </div>
  );
}

export default Feed;
