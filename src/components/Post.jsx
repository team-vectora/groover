"use client";
import Link from "next/link";
import FollowButton from "./FollowButton";
import Image from 'next/image';
import { useState } from 'react';

export default function Post({ post, userId, handleClick }) {
  const isLiked = post.likes.includes(userId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const avatarUrl = post.user?.avatar || "/img/default_avatar.png";

  const [showHeart, setShowHeart] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [heartPos, setHeartPos] = useState({ x: 0, y: 0 });


  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === post.photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? post.photos.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

    const likeImage = (id, event) => {
      if (isAnimating) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

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
    <div className="post">
      <div className="header-post">
        <Image
          src={avatarUrl}
          height={60}
          width={60}
          style={{ borderRadius: "50%", maxWidth: "60px", maxHeight: "60px" }}
          alt="Avatar"
          unoptimized={true}
        />

        <div className="post-info">
          <Link href={`/profile/${post.user?.username}`}>
            <p>{post.user?.username || "Usuário desconhecido"}</p>
          </Link>
          <h3 >{new Date(post.created_at).toLocaleString()}</h3>
        </div>
        <FollowButton followingId={post.user?.id} userId={userId} />
      </div>

      <h3 className="break-words w-full mt-5">{post.caption}</h3>

      {post.photos && post.photos.length > 0 && (
        <div className="post-images-container" style={{ position: 'relative' }}>
          {post.photos.length > 1 && (
            <button
              onClick={prevImage}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: '#61673e',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Previous image"
            >
              &lt;
            </button>
          )}

          <div style={{
            width: '100%',
            height: '500px',
            display: 'flex',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <img
              onDoubleClick={(e) => likeImage(post.id, e)}
              src={post.photos[currentImageIndex]}
              alt={`Post image ${currentImageIndex + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: "8px",
              }}
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
          <button
            onClick={nextImage}
            aria-label="Next image"
            className="
              absolute right-2 top-1/2 transform -translate-y-1/2
              bg-[#61673e] text-white border-none rounded-full
              w-10 h-10 cursor-pointer z-10
              flex items-center justify-center
            "
          >
            &gt;
          </button>
        )}

          {post.photos.length > 1 && (
            <div className="flex justify-center items-center gap-2 mb-2 h-7 rounded-full bg-[#070608] border border-[#4c4e30] px-3 mx-auto w-40">

              {post.photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  aria-label={`Go to image ${index + 1}`}
                  className={`
                    w-2 h-2 rounded-full border-none p-0 cursor-pointer
                    ${index === currentImageIndex ? 'bg-green-600' : 'bg-gray-400'}
                  `}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => {
          if (!isAnimating) {
            handleClick(post.id);
          }
        }}
        disabled={isAnimating}
        className={`like-button ${isLiked ? "liked" : ""} ${isAnimating ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className="heart">
          {isLiked ? (
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="heart-icon"
              fill="#26a269"
            >
              <path fill="none" d="M0 0H24V24H0z" />
              <path d="M12.001 4.529c2.349-2.109 5.979-2.039
                8.242.228 2.262 2.268 2.34 5.88.236
                8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236
                2.265-2.264 5.888-2.34 8.244-.228z"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="heart-icon"
              fill="#f6f5f4"
            >
              <path fill="none" d="M0 0H24V24H0z" />
              <path d="M12.001 4.529c2.349-2.109 5.979-2.039
                8.242.228 2.262 2.268 2.34 5.88.236
                8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236
                2.265-2.264 5.888-2.34 8.244-.228z"
              />
            </svg>
          )}
        </span>

        <h2 className="content">{post.likes?.length || 0}</h2>
      </button>
    </div>
  );
}