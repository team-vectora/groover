// src/app/(groove-club)/p/[id]/page.jsx
'use client';
import { useState, useEffect, useContext } from "react";
import { Post, CommentForm, CommentThread } from "../../../../components"; // Novos componentes
import { useParams } from "next/navigation";
import { useAuth, useProfile } from "../../../../hooks";
import { MidiContext } from "../../../../contexts/MidiContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function PostPage() {
    const { id: postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token, userId, username } = useAuth();
    const { setCurrentProject } = useContext(MidiContext);
    const { projects } = useProfile(username, token);


    const fetchPost = async () => {
        if (!postId || !token) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                throw new Error("Post não encontrado");
            }
            const data = await res.json();
            if (!data) {
                setError(true);
            }
            setPost(data);
        } catch (err) {
            console.error("Erro ao buscar post:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [postId, token]);

    if (loading) return <p className="text-center py-10">Carregando post...</p>;
    if (error) return (
        <div className="flex flex-col items-center justify-center text-center py-10">
            <h2 className="text-2xl font-bold mb-4">🚫 Esse post não está mais disponível.</h2>
            <p className="text-gray-400">Ele pode ter sido removido pelo autor.</p>
        </div>
    );


    return (
        <div className="py-8">
            <ToastContainer position="top-center" />
            {/* Post Principal */}
            <Post
                post={post}
                token={token}
                userId={userId}
                setCurrentProject={setCurrentProject}
                onPostCreated={fetchPost}
            />
            {/* Formulário para novo comentário */}
            <CommentForm postId={postId} token={token} onCommentAdded={fetchPost} projects={projects}/>

            {/* Thread de Comentários */}
            <CommentThread
                comments={post.comments}
                token={token}
                userId={userId}
                setCurrentProject={setCurrentProject}
                onPostCreated={fetchPost}
            />
        </div>
    );
}

export default PostPage;