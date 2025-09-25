import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../config';
import { useTranslation } from 'react-i18next';

export default function useProfile(username) {
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState({
    user: null,
    posts: [],
    projects: [],
    invites: [],
    loading: true,
    error: null
  });

  const fetchData = useCallback(async (isBackgroundUpdate = false) => {
    if (!username) return;

    if (!isBackgroundUpdate) {
      setProfileData(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      // Busca todos os dados em paralelo
      const [userRes, postsRes, projectsRes, invitesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users/${username}`, {
          credentials: "include",
        }),
        fetch(`${API_BASE_URL}/posts/username/${username}`, {
          credentials: "include",
        }),
        fetch(`${API_BASE_URL}/projects/user/${username}`, {
          credentials: "include",
        }),
        localStorage.getItem('username') === username
            ? fetch(`${API_BASE_URL}/invitations`, {
              credentials: "include",
            })
            : Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      ]);

      if (!userRes.ok) throw new Error(t('errors.user_not_found'));

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t('errors.user_not_found'));
      }

      const data = await res.json();
      setProfileData({ ...data, loading: false, error: null });
      const newData = {
        user: userData,
        posts: postsData,
        projects: projectsData,
        invites: invitesData,
        loading: false,
        error: null
      };

      sessionStorage.setItem(cacheKey, JSON.stringify(newData));
      setProfileData(newData);

    } catch (error) {
      if (!isBackgroundUpdate) {
        setProfileData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      } else {
        console.error("Falha na atualização de perfil em segundo plano:", error);
      }
    }
  }, [username, t]);

  const refetch = useCallback(() => {
    fetchData(false);
  }, [fetchData]);

  useEffect(() => {
    fetchData(false);

    const handleFollowingUpdate = ({ detail }) => {
      setProfileData(prev => {
        if (!prev.user) return prev;

        const newFollowing = [...prev.user.following];
        const newFollowers = [...prev.user.followers];
        let newIsFollowing = prev.user.is_following;
        const currentUserId = localStorage.getItem('id');

        // Se o usuário do perfil visualizado é o que sofreu a ação
        if (prev.user._id === detail.userId) {
          newIsFollowing = detail.isFollowing; // Atualiza o estado de "seguir"
          if (detail.isFollowing) {
            if (!newFollowers.includes(currentUserId)) newFollowers.push(currentUserId);
          } else {
            const index = newFollowers.indexOf(currentUserId);
            if (index > -1) newFollowers.splice(index, 1);
          }
        }

        // Se o usuário logado está em seu próprio perfil e seguiu/deixou de seguir alguém
        if (prev.user._id === currentUserId) {
          if (detail.isFollowing) {
            if (!newFollowing.includes(detail.userId)) newFollowing.push(detail.userId);
          } else {
            const index = newFollowing.indexOf(detail.userId);
            if (index > -1) newFollowing.splice(index, 1);
          }
        }

        return {
          ...prev,
          user: {
            ...prev.user,
            followers: newFollowers,
            following: newFollowing,
            is_following: newIsFollowing // Garante que o estado seja repassado
          }
        };
      });
    };


    window.addEventListener('followingUpdated', handleFollowingUpdate);

    return () => {
      window.removeEventListener('followingUpdated', handleFollowingUpdate);
    };
  }, [fetchData]);

  return { ...profileData, refetch };
}
