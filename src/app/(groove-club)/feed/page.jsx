'use client';
import { useContext } from "react";
import { MidiContext } from "../../../contexts/MidiContext";
import { Post } from "../../../components";
import {useAuth, usePosts} from "../../../hooks/";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FeedPage = () => {
    const { token, userId } = useAuth();
    const { posts, loading, error, refetch } = usePosts(token);
    const { setCurrentProject } = useContext(MidiContext);

    return (
        <div className="flex gap-10">
            {/* Conteúdo principal do feed */}
            <div className="flex-1 w-full">
                <ToastContainer position="top-center" />

                {loading && <p className="text-center py-4">Carregando posts...</p>}
                {error && <p className="text-red-500 text-center py-4">{error}</p>}

                <div className="space-y-6 ">
                    {posts.map((post) => (
                        <Post
                            key={post._id}
                            token={token}
                            userId={userId}
                            post={post}
                            profileId={userId}
                            setCurrentProject={setCurrentProject}
                            onPostCreated={refetch} // Adicionado para refetch
                        />
                    ))}
                </div>
            </div>


        </div>
    );
};

export default FeedPage;