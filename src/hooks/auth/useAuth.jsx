import { useState, useEffect } from 'react';

export default function useAuth() {
  const [authData, setAuthData] = useState({
    token: '',
    userId: '',
    username: '',
    avatar: '/img/default_avatar.png',
    loading: true
  });

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    const userId = localStorage.getItem('id') || '';
    const username = localStorage.getItem('username') || '';
    const avatar = localStorage.getItem('avatar') || '/img/default_avatar.png';

    setAuthData({
      token,
      userId,
      username,
      avatar,
      loading: false
    });
  }, []);

  return authData;
}