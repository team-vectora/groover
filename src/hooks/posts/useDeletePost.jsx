import { useState } from "react";
import { toast } from "react-toastify";
import { apiFetch } from "../../lib/util/apiFetch";
import { useTranslation } from "react-i18next";
import { usePosts } from "../../hooks";

export default function useDeletePost() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const {deletePostUpdate} = usePosts();

  const deletePost = async (postId, onSuccess) => {
    setLoading(true);
    try {
      const response = await apiFetch(`/posts/${postId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ? t(`backend_errors.${data.error}`, { defaultValue: t('errors.delete_failed') }) : t('errors.delete_failed'));
      }

      toast.success(t('post.deletedSuccess'));
      if (onSuccess) onSuccess(postId); // Passa o ID do post deletado
      deletePostUpdate(postId);
      window.location.reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { deletePost, loading };
}