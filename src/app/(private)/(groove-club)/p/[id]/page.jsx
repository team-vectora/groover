// src/app/(groove-club)/p/[id]/page.jsx
'use client';
import { useState, useEffect, useContext } from "react";
import { Post, CommentForm, CommentThread, LoadingDisc } from "../../../../../components";
import { useParams } from "next/navigation";
import {useAuth , useProfile , useMidiPlayer , usePosts} from "../../../../../hooks";
import { ToastContainer } from 'react-toastify';
import { apiFetch } from '../../../../../lib/util/apiFetch';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from "react-i18next";

function PostPage() {
    const { t } = useTranslation();
    const { id: postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userId, username } = useAuth();
    const { setCurrentProject } = useMidiPlayer();
    const { projects } = useProfile(username);

    const { refetch, updatePostInCache } = usePosts();

    const fetchPost = async () => {
        if (!postId) return;
        setLoading(true);
        try {
            const res = await apiFetch(`/posts/${postId}`, {
                credentials: "include" // Usa o cookie para autenticação
            });
            if (!res.ok) {
                throw new Error("Post não encontrado");
            }
            const data = await res.json();
            if (!data) {
                setError(true);
            }
            setPost(data);
            updatePostInCache(data);
        } catch (err) {
            console.error("Erro ao buscar post:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [postId]);

    if (loading) return <LoadingDisc />;
    if (error) return (
        <div className="flex flex-col items-center justify-center text-center py-10">
            <h2 className="text-2xl font-bold mb-4">🚫 {t('post.unavailable')}</h2>
            <p className="text-gray-400">{t('post.removed')}</p>
        </div>
    );

    return (
        <div className="py-8">
            <ToastContainer position="top-center" />
            <Post
                post={post}
                userId={userId}
                setCurrentProject={setCurrentProject}
                onPostCreated={fetchPost}
            />
            <CommentForm postId={postId} onCommentAdded={fetchPost} projects={projects}/>
            <CommentThread
                comments={post.comments}
                userId={userId}
                setCurrentProject={setCurrentProject}
                onPostCreated={fetchPost}
            />
        </div>
    );
}

export default PostPage;