import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useTranslation } from 'react-i18next';

export default function useSimilarUsers() {
  const [similarUsers, setSimilarUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const fetchSimilarUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/similar`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(t('toasts.error_loading_similar_users'));
      }

      const data = await res.json();
      setSimilarUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimilarUsers();
  }, []);

  return {
    similarUsers,
    loading,
    error,
    refetch: fetchSimilarUsers
  };
}
