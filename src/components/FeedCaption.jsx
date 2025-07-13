"use client";
import Image from 'next/image';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const FeedCaption = () => {
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const avatarUrl = localStorage.getItem('avatar');
    console.log(avatarUrl)
    if (storedUsername && avatarUrl) {
      setUsername(storedUsername);
      setAvatarUrl(avatarUrl);
    }
  }, []);

  const handleProfileClick = () => {
    if (username) {
      router.push(`/profile/`);
    }
  };

  return (
    <header className="app-header">
      <Image
        src="/img/groover_logo.png"
        alt="Disco"
        width={120}
        height={120}
        quality={100}
      />
    <div>
        Bandas(seila)
        Feed
        Eventos
    </div>
    <div
      onClick={handleProfileClick}
      className="flex flex-col items-center cursor-pointer"
    >
      <Image
        src={avatarUrl}
        height={60}
        width={60}
        className="w-13 h-13 sm:w-13 sm:h-13 rounded-full object-cover border border-[#61673e] mb-2 hover:bg-[#c1915d] transition duration-300 ease-in-out cursor-pointer"
        alt="Avatar"
        unoptimized={true}
      />
      <span><u>{username}</u></span>
    </div>


    </header>
  );
};

export default FeedCaption;
