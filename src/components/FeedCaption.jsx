"use client";
import Image from 'next/image';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const FeedCaption = () => {

  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);


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
              lepo
            </div>
        <h1>{username}</h1>
    </header>
  );
};

export default FeedCaption;
