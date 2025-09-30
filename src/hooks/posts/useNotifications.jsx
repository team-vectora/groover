'use client';
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../lib/util/apiFetch";
import { useTranslation } from "react-i18next";

export default function useNotifications() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true); // Inicia como true
  const [error, setError] = useState("");

  // useCallback para garantir que a função seja estável
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/notifications`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data);
      } else {
        setError(data.error || t("toasts.error_loading_notifications"));
      }
    } catch (err) {
      setError(t("errors.network_error"));
    } finally {
      setLoading(false);
    }
  }, [t]); // A dependência em 't' é estável

  const checkNotification = async (notification_id) => {
    try {
      const res = await apiFetch(`/notifications/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notification_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("toasts.error_marking_notification"));
      } else {
        // Atualiza o estado local para refletir a mudança imediatamente
        setNotifications((prev) =>
            prev.filter((n) => n._id !== notification_id)
        );
      }
    } catch (err) {
      setError(t("errors.network_error"));
    }
  };

  // Efeito para buscar as notificações apenas uma vez quando o hook é montado
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // REMOVEMOS O useEffect que conectava ao socket daqui.

  return { notifications, loading, error, refetch: fetchNotifications, checkNotification };
}