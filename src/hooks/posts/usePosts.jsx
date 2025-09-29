// src/hooks/posts/usePosts.jsx
import { useState, useCallback } from 'react';
import { apiFetch } from '../../lib/util/apiFetch';
import { useTranslation } from 'react-i18next';

export default function usePosts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/posts`, {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        return data;
      } else {
        setError(data.error || t('livecode.error'));
        return null;
      }
    } catch (err) {
      setError(t('errors.network_error'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Função para atualizar um post específico no cache do sessionStorage
  const updatePostInCache = (updatedPost) => {
    try {
      const cachedState = JSON.parse(sessionStorage.getItem('feedState'));
      if (cachedState && cachedState.posts) {
        const newPosts = cachedState.posts.map(p =>
            p._id === updatedPost._id ? updatedPost : p
        );
        sessionStorage.setItem('feedState', JSON.stringify({ ...cachedState, posts: newPosts }));
      }
    } catch (e) {
      console.error("Failed to update post in cache", e);
    }
  };

  const deletePostUpdate = (updatedPost) => {
    try {
      const cachedState = JSON.parse(sessionStorage.getItem('feedState'));
      if (cachedState && cachedState.posts) {
        const newPosts = cachedState.posts.filter(p =>
            p._id !== updatedPost
        );
        sessionStorage.setItem('feedState', JSON.stringify({ ...cachedState, posts: newPosts }));
      }
    } catch (e) {
      console.error("Failed to update post in cache", e);
    }
  }

  return { loading, error, refetch: fetchPosts, updatePostInCache, deletePostUpdate };
}