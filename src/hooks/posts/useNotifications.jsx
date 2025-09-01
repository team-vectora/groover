import { useState, useEffect } from "react";

export default function useNotifications(token) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // GET notifications
  const fetchNotifications = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setNotifications(data);
      } else {
        setError(data.error || "Erro ao carregar notificações");
      }
    } catch (err) {
      setError("Erro na comunicação com o servidor");
    } finally {
      setLoading(false);
    }
  };


  const checkNotification = async (notification_id) => {
    if (!token) return;

    try {
      const res = await fetch(
        "http://localhost:5000/api/notifications/check",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notification_id }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao marcar notificação");
      } else {

        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification_id ? { ...n, read: true } : n
          )
        );
      }
    } catch (err) {
      setError("Erro na comunicação com o servidor");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  return { notifications, loading, error, refetch: fetchNotifications, checkNotification };
}
