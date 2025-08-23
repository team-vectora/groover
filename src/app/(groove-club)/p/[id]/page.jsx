"use client";
import { useState, useEffect, useContext } from "react";
import { Post } from "../../../../components";
import { useParams } from "next/navigation";
import { useLikePost, useForkProject } from "../../../../hooks";
import { MidiContext } from "../../../../contexts/MidiContext";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function PostPage() {
    const params = useParams();
    const { id } = params;

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
      const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
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
      <Post
          onToggle={() => toggleFollow(user.id)} token={token} userId={userId} profileId={localStorage.getItem("id")} post={post} handleClick={likePost}  setCurrentProject={setCurrentProject} handleClickFork={handleClickFork} />
    </div>
  );
}

export default PostPage;
