import { useState, useEffect } from 'react';

export default function useAuth() {
  const [authData, setAuthData] = useState({
    token: null,
    userId: null,
    username: null,
    avatar: '/img/default_avatar.png',
    loading: true
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('id');
    const username = localStorage.getItem('username');

    const storedAvatar = localStorage.getItem("avatar");
    const avatarUrl = (storedAvatar && storedAvatar !== "null")
        ? storedAvatar
        : "/img/default_avatar.png";

    setAuthData({
      token,
      userId,
      username,
      avatar: avatarUrl,
      loading: false
    });
  }, []);

  return authData;
}