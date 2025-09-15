import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../config'; // ajuste o caminho

export default function useProfile(username, token) {
  const [profileData, setProfileData] = useState({
    user: null,
    posts: [],
    projects: [],
    invites: [],
    loading: true,
    error: null
  });

  const fetchData = useCallback(async () => {
    if (!username || !token) return;

    try {
      // Fetch user data
      const userRes = await fetch(`${API_BASE_URL}/users/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!userRes.ok) throw new Error('Erro ao buscar usuário');
      const userData = await userRes.json();

      // Fetch posts
      const postsRes = await fetch(`${API_BASE_URL}/posts/username/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const postsData = await postsRes.json();

      // Fetch projects
      const projectsRes = await fetch(`${API_BASE_URL}/projects/user/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const projectsData = await projectsRes.json();

      // Fetch invites (somente se for o usuário atual)
      let invitesData = [];
      if (localStorage.getItem('username') === username) {
        const invitesRes = await fetch(`${API_BASE_URL}/invitations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        invitesData = await invitesRes.json();
      }

      setProfileData({
        user: userData,
        posts: postsData,
        projects: projectsData,
        invites: invitesData,
        loading: false,
        error: null
      });
    } catch (error) {
      setProfileData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, [username, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...profileData, refetch: fetchData };
}
