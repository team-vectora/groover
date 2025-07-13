"use client";
import { useState, useEffect } from "react";
import Post from "../../components/Post";
import { useRouter } from "next/router";
import useLikePost from "../../hooks/useLikePost";

function PostPage() {
  const router = useRouter();
  const { id } = router.query;

  const [post, setPost] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setUserId(localStorage.getItem("id"));
    setToken(localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    if (id && token) {
      fetchPost(id, token);
    }
  }, [id, token]);

  const fetchPost = async (postId, token) => {
    try {
      const res = await fetch(`http://localhost:5000/api/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        alert(`Erro na API: ${res.status} - ${text}`);
        return;
      }
      const data = await res.json();
      console.log("data")
      console.log(data)
      setPost(data);
    } catch (err) {
      alert("Erro na comunicação com a API.");
    }
  };

  const { likePost, error: likeError } = useLikePost(token, () => fetchPost(id, token));

  if (!post) return <p>Carregando post...</p>;

  return (
    <div className="flex h-screen justify-center align-center pt-20">
      {likeError && <p style={{ color: "red" }}>{likeError}</p>}
      <Post userId={userId} post={post[0]} handleClick={likePost} />
    </div>
  );
}

export default PostPage;
