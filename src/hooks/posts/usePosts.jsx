// src/hooks/posts/usePosts.jsx
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../config';
import { useTranslation } from 'react-i18next';

export default function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/posts`, {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(data);
      } else {
        setError(data.error || t('livecode.error'));
      }
    } catch (err) {
      setError(t('errors.network_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // FUNÇÃO ADICIONADA: Atualiza um post específico na lista de posts
  const updatePost = useCallback((updatedPost) => {
    setPosts(currentPosts =>
        currentPosts.map(post =>
            post._id === updatedPost._id ? updatedPost : post
        )
    );
  }, []);


  return { posts, loading, error, refetch: fetchPosts, updatePost };
}