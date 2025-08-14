'use client';
import { useState } from 'react';
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHeart,
    faComment,
    faShareAlt,
    faChevronLeft,
    faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import FollowButton from "../feed/FollowButton";
import ProjectCard from "../profile/ProjectCard";
import useLikePost from "../../hooks/useLikePost";

const HeartAnimation = ({ position }) => {
    return (
        <div
            className="absolute pointer-events-none animate-ping"
            style={{
                top: position.y,
                left: position.x,
                transform: 'translate(-50%, -50%)',
                animationDuration: '1000ms'
            }}
        >
            <FontAwesomeIcon
                icon={faHeart}
                className="text-[#a97f52] text-5xl opacity-80"
            />
        </div>
    );
};

export default function Post({
                                 post,
                                 userId,
                                 profileId,
                                 setCurrentProject,
                                 handleClickFork,
                                 following
                             }) {
    const router = useRouter();
    const { likePost } = useLikePost();

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showHeart, setShowHeart] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [heartPos, setHeartPos] = useState({ x: 0, y: 0 });

    const avatarUrl = post.user?.avatar || "/img/default_avatar.png";
    const isLiked = post.likes?.includes(userId) || false;

    const nextImage = () => setCurrentImageIndex(prev =>
        prev === post.photos.length - 1 ? 0 : prev + 1
    );

    const prevImage = () => setCurrentImageIndex(prev =>
        prev === 0 ? post.photos.length - 1 : prev - 1
    );

    const goToImage = index => setCurrentImageIndex(index);

    const handleLikeImage = (e) => {
        if (isAnimating) return;

        const rect = e.currentTarget.getBoundingClientRect();
        setHeartPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });

        setIsAnimating(true);
        setShowHeart(true);

        likePost(post._id);

        setTimeout(() => {
            setShowHeart(false);
            setIsAnimating(false);
        }, 1000);
    };

    // Função para lidar com clique no projeto
    const handleProjectClick = (project) => {
        setCurrentProject(project);
    };

    return (
        <div className="flex flex-col gap-4 bg-[#121113] rounded-lg p-5 w-full max-w-2xl mx-auto border border-[#4c4e30] mb-10 shadow-lg hover:shadow-xl transition-shadow">
            {/* Cabeçalho do post */}
            <div className="flex items-center gap-4">
                <Image
                    className="rounded-full object-cover border-2 border-[#4c4e30] hover:border-[#c1915d] transition duration-300 cursor-pointer"
                    src={avatarUrl}
                    height={60}
                    width={60}
                    alt="Avatar"
                    unoptimized
                />
                <div className="flex-1">
                    <Link href={`/profile/${post.user?.username}`} className="hover:underline">
                        <p className="font-medium text-[#e6e8e3]">{post.user?.username || "Usuário desconhecido"}</p>
                    </Link>
                    <p className="text-xs text-[#a97f52]">{new Date(post.created_at).toLocaleString()}</p>
                </div>
                {post.user?._id && (
                    <FollowButton
                        followingId={post.user._id}
                        userId={userId}
                        following={following}
                    />
                )}
            </div>

            {/* Legenda */}
            <p className="break-words text-[#e6e8e3]">{post.caption}</p>

            {/* Gêneros */}
            {post.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {post.genres.map((genre) => (
                        <span
                            key={genre}
                            className="px-3 py-1 rounded-full bg-[#4c4e30] text-[#e6e8e3] text-sm font-medium"
                        >
                            {genre}
                        </span>
                    ))}
                </div>
            )}

            {/* Galeria de imagens */}
            {post.photos?.length > 0 && (
                <div className="relative w-full group">
                    {/* Botão anterior */}
                    {post.photos.length > 1 && (
                        <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[#4c4e30] bg-opacity-80 text-white w-10 h-10 rounded-full flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                    )}

                    {/* Imagem atual */}
                    <div
                        className="relative w-full h-[500px] overflow-hidden flex"
                        onDoubleClick={handleLikeImage}
                    >
                        <img
                            src={post.photos[currentImageIndex]}
                            alt={`Post image ${currentImageIndex + 1}`}
                            className="w-full h-full object-contain rounded-lg border border-[#4c4e30]"
                        />

                        {/* Animação de coração */}
                        {showHeart && <HeartAnimation position={heartPos} />}
                    </div>

                    {/* Botão próximo */}
                    {post.photos.length > 1 && (
                        <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#4c4e30] bg-opacity-80 text-white w-10 h-10 rounded-full flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    )}

                    {/* Indicadores de imagem */}
                    {post.photos.length > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                            {post.photos.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToImage(index)}
                                    className={`w-3 h-3 rounded-full ${index === currentImageIndex ? 'bg-[#a97f52]' : 'bg-[#4c4e30]'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Projeto associado */}
            {post.project && (
                <div onClick={() => handleProjectClick(post.project)}>
                    <ProjectCard
                        project={post.project}
                        profileId={profileId}
                        setCurrentProject={setCurrentProject}
                        handleClickFork={handleClickFork}
                    />
                </div>
            )}

            {/* Botões de interação */}
            <div className="flex justify-center gap-8 mt-4">
                <button
                    onClick={() => !isAnimating && likePost(post._id)}
                    disabled={isAnimating}
                    className={`flex items-center gap-2 ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#c1915d]'} transition-colors`}
                >
                    <FontAwesomeIcon
                        icon={faHeart}
                        className={isLiked ? 'text-[#a97f52]' : 'text-[#e6e8e3]'}
                    />
                    <span className="text-[#e6e8e3]">{post.likes?.length || 0}</span>
                </button>

                <button
                    onClick={() => router.push(`/p/${post._id}`)}
                    className="hover:text-[#c1915d] transition-colors"
                >
                    <FontAwesomeIcon icon={faComment} className="text-[#e6e8e3]" />
                </button>

                <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/p/${post._id}`)}
                    className="hover:text-[#c1915d] transition-colors"
                >
                    <FontAwesomeIcon icon={faShareAlt} className="text-[#e6e8e3]" />
                </button>
            </div>
        </div>
    );
}