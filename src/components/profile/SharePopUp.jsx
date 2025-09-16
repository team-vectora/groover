import { useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config";
import { useTranslation } from "react-i18next";

export default function useShareProject(token) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const shareProject = async (projectId, username) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/invite`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao compartilhar");
      }

      toast.success(t('share.sharedSuccess'), { theme: "dark", autoClose: 3000 });
    } catch (err) {
      toast.error(err.message, { theme: "dark", autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return { shareProject, loading };
}