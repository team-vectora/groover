'use client';
import { useContext, useState } from "react";
import { MidiContext } from "../../../contexts/MidiContext";
import { Post, LoadingDisc, GrooveFeed } from "../../../components";
import { useAuth, usePosts } from "../../../hooks/";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const FeedPage = () => {
    const { t } = useTranslation();
    const { token, userId } = useAuth();
    const { posts, loading, error } = usePosts(token);
    const { setCurrentProject } = useContext(MidiContext);

    const [showFeed, setShowFeed] = useState(false);

    return (
        <div className="flex gap-10">
            <div className="flex-1 w-full">
                <ToastContainer position="top-center" />

                {loading && <LoadingDisc />}
                {error && <p className="text-red-500 text-center py-4">{error}</p>}

                <div className="space-y-6">
                    <button
                        onClick={() => setShowFeed(true)}
                        className="px-6 py-3 rounded-full text-white font-bold text-lg shadow-lg relative overflow-hidden"
                        style={{
                            background: 'linear-gradient(270deg, #ff6ec4, #7873f5, #42e695, #ff6ec4)',
                            backgroundSize: '800% 800%',
                            animation: 'lavaLamp 10s ease infinite'
                        }}
                    >
                        {t("Abrir Feed 🎵")}
                        <span className="absolute inset-0 bg-white/10 rounded-full pointer-events-none"></span>
                    </button>

                    {posts.map((post) => (
                        <Post
                            key={post._id}
                            token={token}
                            userId={userId}
                            post={post}
                            profileId={userId}
                            setCurrentProject={setCurrentProject}
                        />
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {showFeed && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            transition={{ duration: 0.3 }}
                            className="relative w-full h-full md:w-3/4 md:h-5/6 bg-bg-primary rounded-xl overflow-hidden"
                        >
                            <button
                                onClick={() => setShowFeed(false)}
                                className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full shadow hover:bg-accent-dark transition"
                            >
                                ✕
                            </button>

                            <GrooveFeed posts={posts} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                @keyframes lavaLamp {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
};

export default FeedPage;
