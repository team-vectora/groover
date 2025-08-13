    "use client";

    import { useState, useEffect } from 'react';

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
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border border-[#61673e] mb-2 hover:bg-[#c1915d] transition duration-300 ease-in-out cursor-pointer"
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
            {post.user?._id && (
              <FollowButton followingId={post.user._id} userId={userId} following={following} />
            )}

          </div>

          <h3 className="break-words w-full mt-3">{post.caption}</h3>
            {post.genres && post.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {post.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 rounded-full bg-[#4c4e30] text-[#e6e8e3] text-sm m-0"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
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
                  onDoubleClick={(e) => likeImage(post._id, e)}
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
                <div className="flex justify-center items-center gap-2 mb-2 h-7 rounded-full bg-[#070608] border border-[#4c4e30] px-3 mx-auto w-40 mt-5">

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
        {post?.project &&(
            <ProjectCard
                project={post.project}
                profileId={profileId}
                setCurrentProject={setCurrentProject}
                handleClickFork={handleClickFork}
            />

        )}
        <div className="flex justify-center mt-5"  >
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
                      fill="#4c4e30"
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
              <button className="like-button"       onClick={() => router.push(`/p/${post._id}`)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="#4c4e30" viewBox="0 0 24 24" height="22" width="37">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V18L6 14H20C21.1 14 22 13.1 22 12V4C22 2.9 21.1 2 20 2Z"/>
              </svg>
            </button>

              <button
                      onClick={() => {navigator.clipboard.writeText("http://localhost:3000/p/" + post._id)}}
                      disabled={isAnimating}
                      className={`like-button`}
                    >
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" height="22" width="37" fill="#4c4e30" viewBox="0 0 50 50" >
                        <path d="M 40 0 C 34.53125 0 30.066406 4.421875 30 9.875 L 15.90625 16.9375 C 14.25 15.71875 12.207031 15 10 15 C 4.488281 15 0 19.488281 0 25 C 0 30.511719 4.488281 35 10 35 C 12.207031 35 14.25 34.28125 15.90625 33.0625 L 30 40.125 C 30.066406 45.578125 34.53125 50 40 50 C 45.511719 50 50 45.511719 50 40 C 50 34.488281 45.511719 30 40 30 C 37.875 30 35.902344 30.675781 34.28125 31.8125 L 20.625 25 L 34.28125 18.1875 C 35.902344 19.324219 37.875 20 40 20 C 45.511719 20 50 15.511719 50 10 C 50 4.488281 45.511719 0 40 0 Z M 40 2 C 44.429688 2 48 5.570313 48 10 C 48 14.429688 44.429688 18 40 18 C 38.363281 18 36.859375 17.492188 35.59375 16.65625 C 35.46875 16.238281 35.089844 15.949219 34.65625 15.9375 C 34.652344 15.933594 34.628906 15.941406 34.625 15.9375 C 33.230469 14.675781 32.292969 12.910156 32.0625 10.9375 C 32.273438 10.585938 32.25 10.140625 32 9.8125 C 32.101563 5.472656 35.632813 2 40 2 Z M 30.21875 12 C 30.589844 13.808594 31.449219 15.4375 32.65625 16.75 L 19.8125 23.1875 C 19.472656 21.359375 18.65625 19.710938 17.46875 18.375 Z M 10 17 C 11.851563 17 13.554688 17.609375 14.90625 18.65625 C 14.917969 18.664063 14.925781 18.679688 14.9375 18.6875 C 14.945313 18.707031 14.957031 18.730469 14.96875 18.75 C 15.054688 18.855469 15.160156 18.9375 15.28125 19 C 15.285156 19.003906 15.308594 18.996094 15.3125 19 C 16.808594 20.328125 17.796875 22.222656 17.96875 24.34375 C 17.855469 24.617188 17.867188 24.925781 18 25.1875 C 17.980469 25.269531 17.96875 25.351563 17.96875 25.4375 C 17.847656 27.65625 16.839844 29.628906 15.28125 31 C 15.1875 31.058594 15.101563 31.132813 15.03125 31.21875 C 13.65625 32.332031 11.914063 33 10 33 C 5.570313 33 2 29.429688 2 25 C 2 20.570313 5.570313 17 10 17 Z M 19.8125 26.8125 L 32.65625 33.25 C 31.449219 34.5625 30.589844 36.191406 30.21875 38 L 17.46875 31.625 C 18.65625 30.289063 19.472656 28.640625 19.8125 26.8125 Z M 40 32 C 44.429688 32 48 35.570313 48 40 C 48 44.429688 44.429688 48 40 48 C 35.570313 48 32 44.429688 32 40 C 32 37.59375 33.046875 35.433594 34.71875 33.96875 C 34.742188 33.949219 34.761719 33.929688 34.78125 33.90625 C 34.785156 33.902344 34.808594 33.910156 34.8125 33.90625 C 34.972656 33.839844 35.113281 33.730469 35.21875 33.59375 C 36.554688 32.597656 38.199219 32 40 32 Z"></path>
                        </svg>
                      </span>
              </button>
        </div>
        </div>
      );
    }