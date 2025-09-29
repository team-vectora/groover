import { useState } from "react";
import { apiFetch } from "../../lib/util/apiFetch";
import { useTranslation } from "react-i18next";

export default function useFollow() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleFollow = async (followingId, currentFollowingState, onSuccess) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFetch(`/users/follow`, {
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

      // <-- INÍCIO DA CORREÇÃO: CENTRALIZAÇÃO DA LÓGICA NO LOCALSTORAGE -->
      // 1. Pega a lista atual de "seguindo" do localStorage.
      const followingList = JSON.parse(localStorage.getItem("following") || "[]");

      // 2. Adiciona ou remove o ID do usuário da lista.
      if (newIsFollowing) {
        if (!followingList.includes(followingId)) {
          followingList.push(followingId);
        }
      } else {
        const index = followingList.indexOf(followingId);
        if (index > -1) {
          followingList.splice(index, 1);
        }
      }

      // 3. Salva a lista atualizada de volta no localStorage.
      localStorage.setItem("following", JSON.stringify(followingList));
      // <-- FIM DA CORREÇÃO -->

      // 4. Dispara o evento para notificar todos os componentes abertos.
      const event = new CustomEvent('followingUpdated', {
        detail: { userId: followingId, isFollowing: newIsFollowing }
      });
      window.dispatchEvent(event);

      // Chama a callback de sucesso, se ela existir.
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