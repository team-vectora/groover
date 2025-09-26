// src/components/posts/Post.jsx

'use client';
import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from 'next/image';
import {usePathname , useRouter} from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faComment,
    faShareAlt,
    faChevronLeft,
    faChevronRight,
    faArrowUp,
    faEllipsisVertical,
    faTrash
} from '@fortawesome/free-solid-svg-icons';
import FollowButton from "../feed/FollowButton";
import ProjectCard from "../profile/ProjectCard";
import ConfirmationPopUp from '../editor/ConfirmationPopUp';
import { useAuth, useLikePost, useDeletePost, useOutsideClick } from "../../hooks";
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';

const HeartAnimation = ({ position, showHeart }) => {
    if (!showHeart) return null;
    return (
        <div className="absolute pointer-events-none" style={{ top: position.y, left: position.x, transform: "translate(-50%, -50%)", zIndex: 20 }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="#a97f52" viewBox="0 0 24 24" className="w-20 h-20 opacity-80 animate-ping duration-1000">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <div className="absolute">
                <svg fill="#4c4e30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 364.59 364.591" className="w-6 h-6 absolute top-8 left-12 animate-ping">
                    <path d="M360.655,258.05V25c0-13.807-11.191-25-25-25H130.09c-13.807,0-25,11.193-25,25v206.27 c-10.569-3.184-22.145-4.271-34.058-2.768C29.527,233.738-0.293,268.3,4.427,305.695c4.719,37.396,42.189,63.464,83.694,58.226 c40.015-5.049,66.969-37.146,66.969-73.181V50h155.564v146.794c-10.591-3.2-22.19-4.297-34.134-2.79 c-41.504,5.237-71.323,39.798-66.604,77.193s42.188,63.464,83.694,58.227C332.951,324.458,360.655,293.275,360.655,258.05z"/>
                </svg>
                <svg fill="#4c4e30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 364.59 364.591" className="w-5 h-5 absolute bottom-8 right-12 animate-ping">
                    <path d="M360.655,258.05V25c0-13.807-11.191-25-25-25H130.09c-13.807,0-25,11.193-25,25v206.27 c-10.569-3.184-22.145-4.271-34.058-2.768C29.527,233.738-0.293,268.3,4.427,305.695c4.719,37.396,42.189,63.464,83.694,58.226 c40.015-5.049,66.969-37.146,66.969-73.181V50h155.564v146.794c-10.591-3.2-22.19-4.297-34.134-2.79 c-41.504,5.237-71.323,39.798-66.604,77.193s42.188,63.464,83.694,58.227C332.951,324.458,360.655,293.275,360.655,258.05z"/>
                </svg>
            </div>
        </div>
    );
};

export default function Post({
                                 post,
                                 token,
                                 userId,
                                 profileId,
                                 setCurrentProject,
                                 handleClickFork,
                                 onPostCreated,
                                 onUpdatePost
                             }) {
    const { t } = useTranslation();
    const router = useRouter();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showHeart, setShowHeart] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [heartPos, setHeartPos] = useState({ x: 0, y: 0 });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(post.likes.includes(userId));
    const [likesCount, setLikesCount] = useState(post.likes.length);
    const { deletePost } = useDeletePost(token);
    const menuRef = useOutsideClick(() => setIsMenuOpen(false));
    const commentsCount = post.comment_count;
    const pathname = usePathname();

    const handleNavigation = (path) => {
        if (pathname === '/feed') {
            const scrollY = window.scrollY.toString();
            console.log(`%c[Sidebar] SALVANDO SCROLL: Clicou para sair do feed. Posição salva: ${scrollY}`, 'color: #e67e22;');
            sessionStorage.setItem('feedScrollPosition', scrollY);
        }
        router.push(path);
        setIsMenuOpen(false);
    };

    const [isFollowing, setIsFollowing] = useState(() => {
        if (typeof window !== 'undefined') {
            const following = JSON.parse(localStorage.getItem("following") || "[]");
            return following.includes(post.user?._id);
        }
        return false;
    });

    useEffect(() => {
        const handleFollowingUpdate = (event) => {
            if (event.detail.userId === post.user?._id) {
                setIsFollowing(event.detail.isFollowing);
            }
        };
        window.addEventListener('followingUpdated', handleFollowingUpdate);
        return () => {
            window.removeEventListener('followingUpdated', handleFollowingUpdate);
        };
    }, [post.user?._id]);

    const avatarUrl = post.user?.avatar || "/img/default_avatar.png";

    const { likePost } = useLikePost(() => {
        const newIsLiked = !isLiked;
        const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

        setIsLiked(newIsLiked);
        setLikesCount(newLikesCount);

        // Notifica a página pai sobre a mudança
        if (onUpdatePost) {
            onUpdatePost({
                ...post,
                likes: newIsLiked
                    ? [...post.likes, userId]
                    : post.likes.filter(id => id !== userId),
            });
        }
    });

    const nextImage = () => setCurrentImageIndex(prev => (prev === post.photos.length - 1 ? 0 : prev + 1));
    const prevImage = () => setCurrentImageIndex(prev => (prev === 0 ? post.photos.length - 1 : prev - 1));
    const goToImage = index => setCurrentImageIndex(index);

    const handleLikeImage = (e) => {
        if (isAnimating) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setHeartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setIsAnimating(true);
        setShowHeart(true);
        likePost(post._id, post.user._id);
        setTimeout(() => {
            setShowHeart(false);
            setIsAnimating(false);
        }, 1000);
    };

    const handleLikeClick = () => {
        if (!isAnimating) {
            likePost(post._id, post.user._id);
        }
    };

    const handleProjectClick = (project) => setCurrentProject(project);

    const handleShareClick = () => {
        navigator.clipboard.writeText(`${window.location.origin}/p/${post._id}`);
        toast.success(t("share.link_copied"));
    };

    const handleDelete = () => {
        setIsMenuOpen(false);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        await deletePost(post._id, onPostCreated);
        setIsConfirmOpen(false);
    };

    return (
        <div className="flex flex-col gap-4 bg-bg-secondary p-5 w-full mx-auto rounded-lg border border-primary/40">
            <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary hover:border-accent-light transition duration-300 cursor-pointer">
                    <Image src={avatarUrl} alt="Avatar" fill className="object-cover" quality={100} unoptimized />
                </div>
                <div className="flex-1 justify-items-start">
                    <Link href={`/profile/${post.user?.username}`} className="hover:underline">
                        <p className="font-medium text-text-lighter">{post.user?.username || t('unknown_user')}</p>
                    </Link>
                    <p className="text-xs text-text-lighter">{new Date(post.created_at).toLocaleString()}</p>
                </div>
                {userId !== post.user?._id && <FollowButton followingId={post.user._id} userId={userId} isFollowing={isFollowing} setIsFollowing={setIsFollowing} />}
                {userId === post.user?._id && (
                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-white cursor-pointer">
                            <FontAwesomeIcon icon={faEllipsisVertical} />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-bg-secondary border border-primary rounded-md shadow-lg z-10">
                                <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-primary/20 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faTrash} />
                                    {t('post.deletePost')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {post.parent_post_id && post.parent_post_id !== 'None' && (
                <Link href={`/p/${post.parent_post_id}`} className="text-accent text-sm hover:underline">
                    <FontAwesomeIcon icon={faArrowUp} className="mr-2" />
                    {t('post.viewThread')}
                </Link>
            )}

            <p className="break-words text-text-lighter">{post.caption}</p>

            {post.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {post.genres.map((genre) => (
                        <span key={genre} className="px-3 py-1 rounded-full bg-bg-darker text-text-lighter text-sm font-medium">
                            {genre}
                        </span>
                    ))}
                </div>
            )}

            {post.photos?.length > 0 && (
                <div className="relative w-full group">
                    {post.photos.length > 1 && (
                        <button onClick={prevImage} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-primary bg-opacity-80 text-white w-10 h-10 rounded-full flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                    )}

                    {/* Imagem atual */}
                    <div
                        className="relative w-full overflow-hidden flex"
                        onDoubleClick={handleLikeImage}
                    >
                    <AnimatePresence initial={false} custom={currentImageIndex}>
                      <motion.img
                        key={currentImageIndex}
                        src={post.photos[currentImageIndex]}
                        alt={`Post image ${currentImageIndex + 1}`}
                        className="w-full max-h-[500px] object-contain rounded-md mx-auto"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(event, { offset, velocity }) => {
                          const swipe = Math.abs(offset.x);
                          if (swipe > 50) {
                            if (offset.x > 0) {
                              prevImage();
                            } else {
                              nextImage();
                            }
                          }
                        }}
                      />
                    </AnimatePresence>

                        {/* Animação de coração */}
                        <HeartAnimation position={heartPos} showHeart={showHeart} />
                    </div>
                    {post.photos.length > 1 && (
                        <button onClick={nextImage} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary bg-opacity-80 text-text-lighter w-10 h-10 rounded-full flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    )}
                    {post.photos.length > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                            {post.photos.map((_, index) => (
                                <button key={index} onClick={() => goToImage(index)} className={`w-3 h-3 rounded-full transition-colors ${index === currentImageIndex ? 'bg-accent' : 'bg-accent-light'}`} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {post.project && (
                <div onClick={() => handleProjectClick(post.project)}>
                    <ProjectCard project={post.project} profileId={profileId} setCurrentProject={setCurrentProject} handleClickFork={handleClickFork} />
                </div>
            )}

            <div className="flex justify-center gap-8 mt-4 ">
                <button onClick={handleLikeClick} disabled={isAnimating} className={`flex items-center gap-2 ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:text-accent-light'} transition-colors hover:cursor-pointer`}>
                    {isLiked ? (
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="#a97f52">
                            <path fill="none" d="M0 0H24V24H0z" />
                            <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228z" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="#e6e8e3">
                            <path fill="none" d="M0 0H24V24H0z" />
                            <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228z" />
                        </svg>
                    )}
                    <span className="text-foreground">{likesCount}</span>
                </button>
                <button onClick={() => handleNavigation(`/p/${post._id}`)} className="hover:text-accent-light transition-colors flex items-center gap-2">
                    <FontAwesomeIcon icon={faComment} className="text-foreground hover:cursor-pointer" />
                    <span className="text-foreground">{commentsCount}</span>
                </button>
                <button onClick={handleShareClick} className="hover:text-accent-light transition-colors flex items-center gap-2">
                    <FontAwesomeIcon icon={faShareAlt} className="text-foreground hover:cursor-pointer" />
                </button>
                <ConfirmationPopUp open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title={t('post.deletePostTitle')} message={t('post.deletePostConfirmation')} />
            </div>
        </div>
    );
}