import { useState, useEffect } from 'react';

export default function useAuth() {
  const [authData, setAuthData] = useState({
    token: null, // O token ainda pode ser útil para saber se o usuário está logado no client-side
    userId: null,
    username: null,
    avatar: '/img/default_avatar.png',
    loading: true
  });

  useEffect(() => {
    // A lógica para verificar se o usuário está logado pode permanecer
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('id');
    const username = localStorage.getItem('username');
    const storedAvatar = localStorage.getItem("avatar");
    const avatarUrl = (storedAvatar && storedAvatar !== "null")
        ? storedAvatar
        : "/img/default_avatar.png";

    setAuthData({
      token, // Mantido para verificações de estado de login no cliente
      userId,
      username,
      avatar: avatarUrl,
      loading: false
    });
  }, []);

  return authData;
}