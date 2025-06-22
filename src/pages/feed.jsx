import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from "next/router";
import Post from "../components/Post";
import FeedCaption from "../components/FeedCaption";
function Feed() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [inputToken, setInputToken] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    console.log(token)
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

  const handleLike = async (post_id) => {
    try {
      const res = await fetch("http://localhost:5000/api/post/like", {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id }),
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
      console.log(data.message);

      fetchPosts(token);  

    } catch (err) {
      setError("Erro na comunicação com a API.");
      console.error(err);
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

  if (!token) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Informe seu Token JWT para continuar</h2>
        <input
          type="text"
          value={inputToken}
          onChange={(e) => setInputToken(e.target.value)}
          style={{ width: "300px", padding: "8px" }}
        />
        <button onClick={handleLogin} style={{ marginLeft: 10, padding: "8px" }}>
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div >
      <FeedCaption></FeedCaption>
      {loading && <p>Carregando posts...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && posts.length === 0 && <p>Nenhum post encontrado.</p>}

      <div className="post-container">
        {posts.map((post) => (
          <Post userId={localStorage.getItem("id")} post={post} handleClick={handleLike}></Post>
        ))}
      </div>
    </div>
  );
}

export default Feed;
