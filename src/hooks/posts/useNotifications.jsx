import { useState, useEffect } from 'react';

export default function useNotifications(token) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);  // faltava
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setNotifications(data);
      } else {
        setError(data.error || 'Erro ao carregar notificações');
      }
    } catch (err) {
      setError('Erro na comunicação com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  return { notifications, loading, error, refetch: fetchNotifications };
}
