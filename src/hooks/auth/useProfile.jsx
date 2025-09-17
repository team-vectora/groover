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

  const fetchData = useCallback(async (isBackgroundUpdate = false) => {
    if (!username || !token) return;

    const cacheKey = `profile_${username}`;

    // Na carga inicial, tenta usar o cache.
    if (!isBackgroundUpdate) {
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        setProfileData({ ...JSON.parse(cachedData), loading: false });
        // Após carregar o cache, inicia uma atualização silenciosa em segundo plano.
        fetchData(true);
        return;
      }
    }

    // Mostra o "loading" principal apenas se não houver cache (primeira carga).
    // A atualização em segundo plano não deve disparar este estado.
    if (!isBackgroundUpdate) {
      setProfileData(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      // Busca todos os dados em paralelo
      const [userRes, postsRes, projectsRes, invitesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/posts/username/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/projects/user/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        // Só busca convites se for o perfil do próprio usuário
        localStorage.getItem('username') === username
            ? fetch(`${API_BASE_URL}/invitations`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            : Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      ]);

      if (!userRes.ok) throw new Error(t('errors.user_not_found'));

      const userData = await userRes.json();
      const postsData = await postsRes.json();
      const projectsData = await projectsRes.json();
      const invitesData = await invitesRes.json();

      const newData = {
        user: userData,
        posts: postsData,
        projects: projectsData,
        invites: invitesData,
        loading: false,
        error: null
      };

      // Armazena os dados frescos no cache e atualiza o estado.
      sessionStorage.setItem(cacheKey, JSON.stringify(newData));
      setProfileData(newData);

    } catch (error) {
      // Erros em atualizações de segundo plano podem falhar silenciosamente.
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
  }, [username, token, t]);

  // Refetch manual deve limpar o cache e mostrar o "loading".
  const refetch = useCallback(() => {
    const cacheKey = `profile_${username}`;
    sessionStorage.removeItem(cacheKey);
    fetchData(false);
  }, [username, fetchData]);


  useEffect(() => {
    // Busca inicial ao montar o componente.
    fetchData(false);
  }, [fetchData]);

  return { ...profileData, refetch };
}