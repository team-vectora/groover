import { useState } from "react";
import { toast } from "react-toastify";
import { apiFetch } from "../../lib/util/apiFetch";
import { useTranslation } from "react-i18next";

export default function useShareProject() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const shareProject = async (projectId, username) => {
    setLoading(true);
    try {
      const response = await apiFetch(`/projects/${projectId}/invite`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error
            ? t(`backend_errors.${data.error}`, { defaultValue: t('share.error') })
            : t('share.error')
        );
      }

      toast.success(t('share.sharedSuccess'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { shareProject, loading };
}
