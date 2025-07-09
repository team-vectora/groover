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
        className="rounded-full max-w-[60px] max-h-[60px]"
        alt="Avatar"
        unoptimized={true}
      />
      <span><u>{username}</u></span>
    </div>


    </header>
  );
};

export default FeedCaption;
