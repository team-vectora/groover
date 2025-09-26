import { useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config";
import { useTranslation } from "react-i18next";

export default function useDeletePost() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const deletePost = async (postId, onSuccess) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: "DELETE",
        credentials: "include" // Usa o cookie para autenticação
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ? t(`backend_errors.${data.error}`, { defaultValue: t('errors.delete_failed') }) : t('errors.delete_failed'));
      }

      toast.success(t('post.deletedSuccess'));
      if (onSuccess) onSuccess(postId); // Passa o ID do post deletado
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { deletePost, loading };
}