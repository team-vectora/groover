import { useState } from "react";
import { API_BASE_URL } from "../../config";
import { useTranslation } from "react-i18next";

export default function useLikePost(onSuccess) {
  const { t } = useTranslation();
  const [error, setError] = useState("");

  const likePost = async (post_id, owner_id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/posts/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({ post_id, owner_id }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError(t('errors.invalid_token'));
          return;
        }
        const data = await res.json();
        setError(t(`backend_errors.${data.error}`, { defaultValue: t('errors.generic_error') }));
        return;
      }

      if (onSuccess) onSuccess();

    } catch (err) {
      setError(t('errors.network_error'));
      console.error(err);
    }
  };

  return { likePost, error };
}
