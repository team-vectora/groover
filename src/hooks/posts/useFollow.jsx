import { useState } from "react";
import { API_BASE_URL } from "../../config";
import { useTranslation } from "react-i18next";

export default function useFollow() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleFollow = async (followingId, currentFollowingState, onSuccess) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/users/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({ following_id: followingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error
            ? t(`backend_errors.${data.error}`, { defaultValue: t('toasts.error_following') })
            : t('toasts.error_following')
        );
      }

      const newIsFollowing = !currentFollowingState;

      const event = new CustomEvent('followingUpdated', {
        detail: { userId: followingId, isFollowing: newIsFollowing }
      });
      window.dispatchEvent(event);

      // Chama a callback de sucesso, se ela existir
      if (onSuccess) {
        onSuccess(newIsFollowing);
      }

      return { success: true, isFollowing: newIsFollowing };

    } catch (err) {
      setError(err.message);
      console.error('Error in useFollow hook:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { toggleFollow, loading, error };
}
