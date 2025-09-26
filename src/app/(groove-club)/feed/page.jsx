// src/app/(groove-club)/feed/page.jsx
'use client';
import { useContext, useEffect } from "react";
import { MidiContext } from "../../../contexts/MidiContext";
import { Post, LoadingDisc } from "../../../components";
import { useAuth, usePosts } from "../../../hooks/";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FeedPage = () => {
    const { username, userId } = useAuth();
    const { posts, loading, error, updatePost } = usePosts();
    const { setCurrentProject } = useContext(MidiContext);

    // Efeito para RESTAURAR a posição do scroll ao entrar na página
    useEffect(() => {
        // Só tenta restaurar se não estiver carregando e se houver posts
        if (!loading && posts.length > 0) {
            const scrollPosition = sessionStorage.getItem('feedScrollPosition');
            if (scrollPosition) {
                console.log(`%c[Feed] RESTAURANDO SCROLL: Posição encontrada: ${scrollPosition}.`, 'color: #2ecc71;');
                // Adiciona um pequeno delay para garantir que o DOM esteja pronto
                window.scrollTo(0, parseInt(scrollPosition, 10));
                sessionStorage.removeItem('feedScrollPosition');
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
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeedPage;