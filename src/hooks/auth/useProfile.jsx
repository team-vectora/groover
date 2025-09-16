import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../config';
import { useTranslation } from 'react-i18next';

export default function useProfile(username, token) {
  const { t } = useTranslation();
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

    setProfileData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const userRes = await fetch(`${API_BASE_URL}/users/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!userRes.ok) throw new Error(t('errors.user_not_found'));
      const userData = await userRes.json();

      const postsRes = await fetch(`${API_BASE_URL}/posts/username/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const postsData = await postsRes.json();

      const projectsRes = await fetch(`${API_BASE_URL}/projects/user/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const projectsData = await projectsRes.json();

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
  }, [username, token, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...profileData, refetch: fetchData };
}