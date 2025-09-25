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

  const fetchData = useCallback(async () => {
    if (!username) return;

    setProfileData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch(`${API_BASE_URL}/users/profile/${username}`, {
        credentials: "include" // Usa o cookie para autenticação
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t('errors.user_not_found'));
      }

      const data = await res.json();
      setProfileData({ ...data, loading: false, error: null });

    } catch (error) {
      setProfileData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, [username, t]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);


  useEffect(() => {
    fetchData();

    const handleFollowingUpdate = ({ detail }) => {
      setProfileData(prev => {
        if (!prev.user) return prev;

        const newFollowing = [...prev.user.following];
        const newFollowers = [...prev.user.followers];
        let newIsFollowing = prev.user.is_following;
        const currentUserId = localStorage.getItem('id');

        if (prev.user._id === detail.userId) {
          newIsFollowing = detail.isFollowing;
          if (detail.isFollowing) {
            if (!newFollowers.includes(currentUserId)) newFollowers.push(currentUserId);
          } else {
            const index = newFollowers.indexOf(currentUserId);
            if (index > -1) newFollowers.splice(index, 1);
          }
        }

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
            is_following: newIsFollowing
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