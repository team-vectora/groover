// src/app/(groove-club)/feed/page.jsx
'use client';
import { useEffect, useState, useRef } from "react";
import { Post, LoadingDisc } from "../../../../components";
import { useAuth, usePosts, useMidiPlayer } from "../../../../hooks/";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const POSTS_PER_BATCH = 10;
const logStyle = "color: #50fa7b; font-weight: bold; background: #282a36; padding: 2px 4px; border-radius: 3px;";
const restoreStyle = "color: #8be9fd; font-weight: bold;";
const fetchStyle = "color: #f1fa8c; font-weight: bold;";

const FeedPage = () => {
    console.log(`%c[FeedPage] Montando Feed`, 'color: #FF0000');
    const { userId } = useAuth();
    const { loading, error, refetch, updatePostInCache } = usePosts();
    const { setCurrentProject } = useMidiPlayer();

    // Estado local é a nossa "fonte da verdade" para a renderização
    const [posts, setPosts] = useState([]);
    const [visiblePostsCount, setVisiblePostsCount] = useState(POSTS_PER_BATCH);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Efeito de Carregamento Inicial
    // Efeito de Carregamento Inicial
    useEffect(() => {
        console.log(`%c[FeedPage] Montado. A iniciar lógica de carregamento...`, logStyle);
        const loadFeed = async () => {
            const cachedStateString = sessionStorage.getItem('feedState');
            console.log(`%c[FeedPage] Lendo sessionStorage:`, logStyle, cachedStateString);
            const cachedState = cachedStateString ? JSON.parse(cachedStateString) : null;

            if (cachedState && cachedState.posts && cachedState.posts.length > 0) {
                console.log(`%c[FeedPage] DECISÃO: Cache encontrado. A restaurar estado.`, restoreStyle);
                setPosts(cachedState.posts);
                setVisiblePostsCount(cachedState.visiblePostsCount || POSTS_PER_BATCH);

                if (cachedState.scrollPosition > 0) {
                    setTimeout(() => {
                        console.log(`%c[FeedPage] A APLICAR SCROLL para ${cachedState.scrollPosition}px.`, restoreStyle);
                        window.scrollTo({ top: cachedState.scrollPosition, behavior: 'instant' });
                    }, 0);
                }
            } else {
                console.log(`%c[FeedPage] DECISÃO: Cache vazio ou inexistente. A buscar novos posts.`, fetchStyle);
                const newPosts = await refetch();
                if (newPosts) {
                    console.log(`%c[FeedPage] ${newPosts.length} posts recebidos da API.`, fetchStyle);
                    setPosts(newPosts);
                    setVisiblePostsCount(POSTS_PER_BATCH);
                    console.log(`%c[FeedPage] A guardar novo estado no cache.`, fetchStyle);
                    sessionStorage.setItem('feedState', JSON.stringify({
                        posts: newPosts,
                        visiblePostsCount: POSTS_PER_BATCH
                    }));
                }
            }
            setIsInitialLoad(false);
        };

        loadFeed();
    }, [refetch]); // Dependência apenas em refetch para ser estável

    // Efeito para o "Scroll Infinito"
    useEffect(() => {
        const handleScroll = () => {
            const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300;
            if (isAtBottom && visiblePostsCount < posts.length) {
                const newVisibleCount = Math.min(posts.length, visiblePostsCount + POSTS_PER_BATCH);
                console.log(`%c[FeedPage] Scroll Infinito: A carregar mais posts. Novo total visível: ${newVisibleCount}`, 'color: #ffb86c;');
                setVisiblePostsCount(newVisibleCount);

                const currentState = JSON.parse(sessionStorage.getItem('feedState') || '{}');
                sessionStorage.setItem('feedState', JSON.stringify({ ...currentState, visiblePostsCount: newVisibleCount }));
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [visiblePostsCount, posts.length]);

    const handleUpdatePost = (updatedPost) => {
        const newPosts = posts.map(p => p._id === updatedPost._id ? updatedPost : p);
        setPosts(newPosts);
        updatePostInCache(updatedPost);
    };

    if (isInitialLoad || (loading && posts.length === 0)) {
        return <LoadingDisc />;
    }

    return (
        <div className="flex gap-10">
            <div className="flex-1 w-full">
                <ToastContainer position="top-center" />
                {error && <p className="text-red-500 text-center py-4">{error}</p>}

                {posts.length === 0 && !loading && (
                    <p className="text-center py-4 text-text-lighter0">Nenhum post para mostrar.</p>
                )}

                <div className="space-y-6">
                    {posts.slice(0, visiblePostsCount).map((post) => (
                        <Post
                            key={post._id}
                            userId={userId}
                            post={post}
                            profileId={userId}
                            setCurrentProject={setCurrentProject}
                            onUpdatePost={handleUpdatePost}
                        />
                    ))}
                </div>

                {visiblePostsCount >= posts.length && !loading && posts.length > 0 && (
                    <p className="text-center py-4 text-text-lighter">Fim do feed</p>
                )}
            </div>
        </div>
    );
};

export default FeedPage;