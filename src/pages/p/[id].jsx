"use client";
import { useState, useEffect, useContext } from "react";
import Post from "../../components/Post";
import { useRouter } from "next/router";
import useLikePost from "../../hooks/useLikePost";
import { MidiContext } from "../../contexts/MidiContext";
import useForkProject from "../../hooks/useForkProject";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function PostPage() {
  const router = useRouter();
  const { id } = router.query;

  const [post, setPost] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [following, setFollowing] = useState(null);
  const { currentProject, setCurrentProject } = useContext(MidiContext);

  useEffect(() => {
    setUserId(localStorage.getItem("id"));
    setToken(localStorage.getItem("token"));
    setFollowing(localStorage.getItem("following"));
  }, []);

  useEffect(() => {
    if (id && token) {
      fetchPost(id, token);
    }
  }, [id, token]);
      const { forkProject, loading: forkLoading } = useForkProject(token);
      const handleClickFork = async (project) => {
        await forkProject(project.id);
      };
  const fetchPost = async (postId, token) => {
    try {
      const res = await fetch(`https://groover-api.onrender.com/api/post/${postId}`, {
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
              <ToastContainer
                position="top-center"
                toastStyle={{ textAlign: 'center', fontSize: '1.2rem' }}
              />
      {likeError && <p style={{ color: "red" }}>{likeError}</p>}
      <Post userId={userId} profileId={localStorage.getItem("id")} post={post} handleClick={likePost}  setCurrentProject={setCurrentProject}  following={following} handleClickFork={handleClickFork} />
    </div>
  );
}

export default PostPage;
