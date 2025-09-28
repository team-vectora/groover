'use client';
import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../../config";
import { io } from "socket.io-client";
import { useTranslation } from "react-i18next";

export default function useNotifications() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
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
  };

  const checkNotification = async (notification_id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notification_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("toasts.error_marking_notification"));
      } else {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification_id ? { ...n, read: true } : n
          )
        );
      }
    } catch (err) {
      setError(t("errors.network_error"));
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Evita múltiplas conexões
    if (socketRef.current) return;

    const socket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    // Socket se conecta e backend já associa o usuário à sua sala via JWT
    socket.on("connect", () => {
      console.log("Socket conectado:", socket.id);
    });

    // Recebe notificações
    socket.on("new_notification", (data) => {
      console.log("Nova notificação recebida via socket:", data);
      fetchNotifications(); // 🔥 sincroniza de novo com o backend
    });

    socket.on("connect_error", (err) => {
      console.error("Erro de conexão socket:", err);
    });

    return () => {
      socket.off("connect");
      socket.off("new_notification");
      socket.off("connect_error");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { notifications, loading, error, refetch: fetchNotifications, checkNotification };
}
