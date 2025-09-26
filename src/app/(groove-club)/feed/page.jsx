// src/app/(groove-club)/feed/page.jsx
'use client';
import { useContext, useEffect, useCallback } from "react";
import { MidiContext } from "../../../contexts/MidiContext";
import { Post, LoadingDisc } from "../../../components";
import { useAuth, usePosts } from "../../../hooks/";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FeedPage = () => {
    const { username, userId } = useAuth();
    const { posts, setPosts, loading, error, updatePost } = usePosts();
    const { setCurrentProject } = useContext(MidiContext);

    const onPostDeleted = useCallback((deletedPostId) => {
        setPosts(currentPosts => currentPosts.filter(post => post._id !== deletedPostId));
    }, [setPosts]);


    // Efeito para RESTAURAR a posição do scroll ao entrar na página
    useEffect(() => {
        // Só tenta restaurar se não estiver carregando e se houver posts
        if (!loading && posts.length > 0) {
            const scrollPosition = sessionStorage.getItem('feedScrollPosition');
            if (scrollPosition) {
                console.log(`%c[Feed] RESTAURANDO SCROLL: Posição encontrada: ${scrollPosition}.`, 'color: #2ecc71;');
                // Usamos requestAnimationFrame para garantir que o DOM esteja pronto
                requestAnimationFrame(() => {
                    window.scrollTo(0, parseInt(scrollPosition, 10));
                    sessionStorage.removeItem('feedScrollPosition');
                });
            }
        }
    }, [loading, posts]);

    return (
        <div className="flex gap-10">
            <div className="flex-1 w-full">
                <ToastContainer position="top-center" />

                {loading && <LoadingDisc />}
                {error && <p className="text-red-500 text-center py-4">{error}</p>}

                <div className="space-y-6">
                    {posts.map((post) => (
                        <Post
                            key={post._id}
                            userId={userId}
                            post={post}
                            profileId={userId}
                            setCurrentProject={setCurrentProject}
                            onUpdatePost={updatePost}
                            onPostDeleted={onPostDeleted}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeedPage;