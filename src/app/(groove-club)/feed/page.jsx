'use client';
import { useContext, useEffect, useState } from "react";
import { MidiContext } from "../../../contexts/MidiContext";
import { Post, LoadingDisc } from "../../../components";
import { useAuth, usePosts } from "../../../hooks/";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const POSTS_PER_BATCH = 10; // quantos posts mostrar de cada vez

const FeedPage = () => {
    const { username, userId } = useAuth();
    const { posts: allPosts, loading, error, refetch, updatePost } = usePosts();
    const { setCurrentProject } = useContext(MidiContext);

    const [visiblePosts, setVisiblePosts] = useState([]);
    const [nextIndex, setNextIndex] = useState(0);

    useEffect(() => {
        if (!loading && allPosts.length > 0) {
            const initialPosts = allPosts.slice(0, POSTS_PER_BATCH);
            setVisiblePosts(initialPosts);
            setNextIndex(initialPosts.length);
        }
    }, [loading, allPosts]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            if (scrollTop + windowHeight >= documentHeight - 200) {
                if (nextIndex < allPosts.length) {
                    const morePosts = allPosts.slice(nextIndex, nextIndex + POSTS_PER_BATCH);
                    setVisiblePosts(prev => [...prev, ...morePosts]);
                    setNextIndex(prev => prev + morePosts.length);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [nextIndex, allPosts]);

    return (
        <div className="flex gap-10">
            <div className="flex-1 w-full">
                <ToastContainer position="top-center" />

                {loading && <LoadingDisc />}
                {error && <p className="text-red-500 text-center py-4">{error}</p>}

                <div className="space-y-6">
                    {visiblePosts.map((post) => (
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

                {nextIndex >= allPosts.length && !loading && (
                    <p className="text-center py-4 text-gray-500">Fim do feed</p>
                )}
            </div>
        </div>
    );
};

export default FeedPage;
