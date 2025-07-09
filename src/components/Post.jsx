"use client";
import Link from "next/link";
import FollowButton from "./FollowButton";
import Image from 'next/image';
import { useState } from 'react';

export default function Post({ post, userId, handleClick }) {
  const isLiked = post.likes.includes(userId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const avatarUrl = post.user?.avatar || "/img/default_avatar.png";

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
          <h3>{new Date(post.created_at).toLocaleString()}</h3>
        </div>
        <FollowButton followingId={post.user?.id} userId={userId} />
      </div>

      <h3>{post.caption}</h3>

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
              src={post.photos[currentImageIndex]}
              alt={`Post image ${currentImageIndex + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: "8px",
              }}
            />
          </div>

          {post.photos.length > 1 && (
            <button
              onClick={nextImage}
              style={{
                position: 'absolute',
                right: '10px',
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
              aria-label="Next image"
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
        onClick={() => handleClick(post.id)}
        className={`like-button ${isLiked ? "liked" : ""}`}
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