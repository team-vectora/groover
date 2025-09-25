import { useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config";
import { useTranslation } from "react-i18next";

export default function useDeleteProject() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const deleteProject = async (projectId, onSuccess) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('errors.delete_failed'));
      }

      toast.success(t('project.deletedSuccess'));
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { deleteProject, loading };
}
