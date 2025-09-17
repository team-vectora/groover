import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import { useTranslation } from "react-i18next";

export default function useNotifications(token) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
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
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/notifications/check`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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
        if (!token) return;

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
      }, [token]);

  return { notifications, loading, error, refetch: fetchNotifications, checkNotification };
}
