"use client";
import Link from "next/link";
import FollowButton from "./FollowButton";
import Image from 'next/image';
export default function Post({ post, userId, handleClick }) {
  const isLiked = post.likes.includes(userId);

  const avatarUrl =
    post.user?.avatar || "/img/default_avatar.png";

  return (
    <div className="post">
      <div className="header-post">
        <Image
          src={avatarUrl}
          height={50}
          width={50}
          style={{ borderRadius: "50%" }}
          alt="Avatar"
          unoptimized={avatarUrl}
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
          <div className="post-images" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            {post.photos.map((photoUrl, index) => (
              <img
                key={index}
                src={photoUrl}
                alt={`Post image ${index + 1}`}
                style={{ maxWidth: "70%", borderRadius: "8px" }}
              />
            ))}
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
