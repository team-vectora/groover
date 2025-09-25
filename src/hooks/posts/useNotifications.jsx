import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import { useTranslation } from "react-i18next";

export default function useNotifications() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        credentials: "include" // Usa o cookie para autenticação
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data);
      } else {
        setError(data.error || t('toasts.error_loading_notifications'));
      }
    } catch (err) {
      setError(t('errors.network_error'));
    } finally {
      setLoading(false);
    }
  };

  const checkNotification = async (notification_id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Usa o cookie para autenticação
        body: JSON.stringify({ notification_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t('toasts.error_marking_notification'));
      } else {
        setNotifications((prev) =>
            prev.map((n) =>
                n._id === notification_id ? { ...n, read: true } : n
            )
        );
      }
    } catch (err) {
      setError(t('errors.network_error'));
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  return { notifications, loading, error, refetch: fetchNotifications, checkNotification };
}