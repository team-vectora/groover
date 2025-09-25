import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useTranslation } from 'react-i18next';

export default function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();
  const cacheKey = 'feed_posts';

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/posts`, {
        credentials: "include" // Usa o cookie para autenticação
      });

      const data = await res.json();
      if (res.ok) {
        setPosts(data);
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
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
    const cachedPosts = sessionStorage.getItem(cacheKey);
    if (cachedPosts) {
      setPosts(JSON.parse(cachedPosts));
    } else {
      fetchPosts();
    }
  }, []);

  return { posts, loading, error, refetch: fetchPosts };
}