"use client";

import { useState } from 'react';
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import FollowButton from "./FollowButton";
import ProjectCard from "./ProjectCard";

export default function Post({ post, userId, profileId, handleClick, setCurrentProject, handleClickFork, following }) {
  const router = useRouter();

  const isLiked = post.likes.includes(userId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const avatarUrl = post.user?.avatar || "/img/default_avatar.png";
  const [showHeart, setShowHeart] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [heartPos, setHeartPos] = useState({ x: 0, y: 0 });

  const nextImage = () => setCurrentImageIndex(prev => (prev === post.photos.length - 1 ? 0 : prev + 1));
  const prevImage = () => setCurrentImageIndex(prev => (prev === 0 ? post.photos.length - 1 : prev - 1));
  const goToImage = index => setCurrentImageIndex(index);

  const likeImage = (id, e) => {
    if (isAnimating) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHeartPos({ x, y });
    setIsAnimating(true);
    setShowHeart(true);
    handleClick(id);
    setTimeout(() => {
      setShowHeart(false);
      setIsAnimating(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-4 bg-[#1b1b1b] rounded-lg p-5 w-full max-w-2xl mx-auto text-white border border-[#61673e] mb-10">
      <div className="flex items-center gap-4">
        <Image
          className="rounded-full object-cover border border-[#61673e] hover:bg-[#c1915d] transition duration-300 cursor-pointer"
          src={avatarUrl}
          height={60}
          width={60}
          alt="Avatar"
          unoptimized
        />
        <div>
          <Link href={`/profile/${post.user?.username}`} className="hover:underline">
            <p>{post.user?.username || "Usuário desconhecido"}</p>
          </Link>
          <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString()}</p>
        </div>
        {post.user?._id && (
          <FollowButton followingId={post.user._id} userId={userId} following={following} />
        )}
      </div>

      <p className="break-words">{post.caption}</p>

      {post.genres?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.genres.map((genre) => (
            <span
              key={genre}
              className="px-3 py-1 rounded-full bg-[#4c4e30] text-[#e6e8e3] text-sm"
            >
              {genre}
            </span>
          ))}
        </div>
      )}

      {post.photos?.length > 0 && (
        <div className="relative w-full">
          {post.photos.length > 1 && (
            <button onClick={prevImage} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[#61673e] text-white w-10 h-10 rounded-full flex items-center justify-center z-10">
              &lt;
            </button>
          )}

          <div className="relative w-full h-[500px] overflow-hidden flex">
            <img
              onDoubleClick={(e) => likeImage(post._id, e)}
              src={post.photos[currentImageIndex]}
              alt={`Post image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain rounded-lg"
            />
            {showHeart && (
                  <div
                    className="absolute"
                    style={{
                      top: heartPos.y,
                      left: heartPos.x,
                      transform: "translate(-50%, -50%)",
                      pointerEvents: "none",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#a97f52"
                      viewBox="0 0 24 24"
                      className="w-20 h-20 opacity-80 animate-ping duration-1000"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28
                        2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81
                        4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22
                        5.42 22 8.5c0 3.78-3.4 6.86-8.55
                        11.54L12 21.35z" />
                    </svg>

                    <div className="absolute">
                    <svg
                          fill="#4c4e30"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 364.59 364.591"
                          className="w-6 h-6 absolute top-8 left-12 animate-ping"
                        >
                          <path d="M360.655,258.05V25c0-13.807-11.191-25-25-25H130.09c-13.807,0-25,11.193-25,25v206.27
                          c-10.569-3.184-22.145-4.271-34.058-2.768C29.527,233.738-0.293,268.3,4.427,305.695c4.719,37.396,42.189,63.464,83.694,58.226
                          c40.015-5.049,66.969-37.146,66.969-73.181V50h155.564v146.794c-10.591-3.2-22.19-4.297-34.134-2.79
                          c-41.504,5.237-71.323,39.798-66.604,77.193s42.188,63.464,83.694,58.227C332.951,324.458,360.655,293.275,360.655,258.05z"/>
                        </svg>

                        <svg
                          fill="#4c4e30"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 364.59 364.591"
                          className="w-5 h-5 absolute bottom-8 right-12 animate-ping"
                        >
                          <path d="M360.655,258.05V25c0-13.807-11.191-25-25-25H130.09c-13.807,0-25,11.193-25,25v206.27
                          c-10.569-3.184-22.145-4.271-34.058-2.768C29.527,233.738-0.293,268.3,4.427,305.695c4.719,37.396,42.189,63.464,83.694,58.226
                          c40.015-5.049,66.969-37.146,66.969-73.181V50h155.564v146.794c-10.591-3.2-22.19-4.297-34.134-2.79
                          c-41.504,5.237-71.323,39.798-66.604,77.193s42.188,63.464,83.694,58.227C332.951,324.458,360.655,293.275,360.655,258.05z"/>
                        </svg>
                    </div>
                  </div>
                )}
          </div>

          {post.photos.length > 1 && (
            <button onClick={nextImage} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#61673e] text-white w-10 h-10 rounded-full flex items-center justify-center z-10">
              &gt;
            </button>
          )}

          <div className="flex justify-center items-center gap-2 mt-4">
            {post.photos.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-3 h-3 rounded-full ${index === currentImageIndex ? 'bg-green-600' : 'bg-gray-400'}`}
              />
            ))}
          </div>
        </div>
      )}

      {post.project && (
        <ProjectCard
          project={post.project}
          profileId={profileId}
          setCurrentProject={setCurrentProject}
          handleClickFork={handleClickFork}
        />
      )}

      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={() => !isAnimating && handleClick(post.id)}
          disabled={isAnimating}
          className={`flex items-center gap-1 ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg fill={isLiked ? "#4c4e30" : "#f6f5f4"} viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M12.001 4.529c2.349-2.109...z" />
          </svg>
          <span>{post.likes?.length || 0}</span>
        </button>

        <button onClick={() => router.push(`/p/${post._id}`)}>
          <svg fill="#4c4e30" viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V18L6 14H20C21.1 14..." />
          </svg>
        </button>

        <button onClick={() => navigator.clipboard.writeText(`http://localhost:3000/p/${post._id}`)}>
          <svg fill="#4c4e30" viewBox="0 0 50 50" className="w-6 h-6">
            <path d="M 40 0 C 34.53125 0 30.066406...Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
