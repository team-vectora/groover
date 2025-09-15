import { useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config";

export default function useDeletePost(token) {
  const [loading, setLoading] = useState(false);

  const deletePost = async (postId, onSuccess) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao excluir o post");
      }

      toast.success("Post apagado com sucesso!");
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { deletePost, loading };
}
