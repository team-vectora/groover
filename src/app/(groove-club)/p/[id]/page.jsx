// src/app/(groove-club)/p/[id]/page.jsx
'use client';
import { useState, useEffect, useContext } from "react";
import { Post, CommentForm, CommentThread } from "../../../../components"; // Novos componentes
import { useParams } from "next/navigation";
import { useAuth } from "../../../../hooks";
import { MidiContext } from "../../../../contexts/MidiContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function PostPage() {
    const { id: postId } = useParams();
    const [post, setPost] = useState(null);
    const { token, userId } = useAuth();
    const { setCurrentProject } = useContext(MidiContext);

    const fetchPost = async () => {
        if (!postId || !token) return;
        try {
            const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setPost(data);
        } catch (err) {
            console.error("Erro ao buscar post:", err);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [postId, token]);

    if (!post) return <p className="text-center py-10">Carregando post...</p>;

    return (
        <div className="py-8">
            <ToastContainer position="top-center" />
            {/* Post Principal */}
            <Post
                post={post}
                token={token}
                userId={userId}
                setCurrentProject={setCurrentProject}
            />
            {/* Formulário para novo comentário */}
            <CommentForm postId={postId} token={token} onCommentAdded={fetchPost} />

            {/* Thread de Comentários */}
            <CommentThread comments={post.comments} />
        </div>
    );
}

export default PostPage;