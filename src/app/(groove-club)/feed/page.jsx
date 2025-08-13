'use client';
import { useContext } from "react";
import { MidiContext } from "../../../contexts/MidiContext";
import Post from "../../../components/posts/Post";
import SimilarUsers from "../../../components/feed/SimilarUsers";
import useAuth from "../../../hooks/useAuth";
import usePosts from "../../../hooks/usePosts";
import useSimilarUsers from "../../../hooks/useSimilarUsers"; // Importe o novo hook
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FeedPage = () => {
    const { token, userId } = useAuth();
    const { posts, loading, error } = usePosts(token);
    const { similarUsers, loading: similarLoading } = useSimilarUsers(token); // Use o hook
    const { setCurrentProject } = useContext(MidiContext);

    return (
        <div className="flex">
            <div className="w-2/3 pr-6">
                <ToastContainer position="top-center" />

                {loading && <p className="text-center py-4">Carregando posts...</p>}
                {error && <p className="text-red-500 text-center py-4">{error}</p>}

                <div className="space-y-6">
                    {posts.map((post) => (
                        <Post
                            key={post._id}
                            userId={userId}
                            post={post}
                            profileId={userId}
                            setCurrentProject={setCurrentProject}
                            following={[]} // Será implementado em hook separado
                        />
                    ))}
                </div>
            </div>

            <div className="w-1/3 sticky top-24 h-fit">
                {similarLoading ? (
                    <p className="text-center py-4">Carregando sugestões...</p>
                ) : (
                    <SimilarUsers
                        users={similarUsers}
                        userId={userId}
                    />
                )}
            </div>
        </div>
    );
};

export default FeedPage;