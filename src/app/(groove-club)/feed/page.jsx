// src/app/(groove-club)/feed/page.jsx
'use client';
import { useContext } from "react";
import { MidiContext } from "../../../contexts/MidiContext";
import { Post, LoadingDisc } from "../../../components";
import { useAuth, usePosts } from "../../../hooks/";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FeedPage = () => {
    const { username, userId } = useAuth();
    const { posts, loading, error } = usePosts();
    const { setCurrentProject } = useContext(MidiContext);

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
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeedPage;