import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useTranslation } from 'react-i18next';

export default function useSimilarUsers(token) {
  const [similarUsers, setSimilarUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const fetchSimilarUsers = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/similar`, {
        headers: { Authorization: `Bearer ${token}` },
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
  }, [token]);

  return {
    similarUsers,
    loading,
    error,
    refetch: fetchSimilarUsers
  };
}