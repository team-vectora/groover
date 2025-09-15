import { useState } from "react";
import { API_BASE_URL } from "../../config"; // ajuste o caminho conforme sua estrutura

export default function useFollow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleFollow = async (followingId, currentFollowingState, setFollowingState) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${API_BASE_URL}/users/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ following_id: followingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao seguir/deixar de seguir');
      }

      // Atualiza o estado local
      const newIsFollowing = !currentFollowingState;
      setFollowingState(newIsFollowing);

      // Atualiza o localStorage
      let updatedFollowing = JSON.parse(localStorage.getItem('following') || '[]');

      if (newIsFollowing) {
        if (!updatedFollowing.includes(followingId)) {
          updatedFollowing.push(followingId);
        }
      } else {
        updatedFollowing = updatedFollowing.filter(id => id !== followingId);
      }

      localStorage.setItem('following', JSON.stringify(updatedFollowing));

      // Dispara evento personalizado para notificar outros componentes
      const event = new CustomEvent('followingUpdated', {
        detail: {
          userId: followingId,
          isFollowing: newIsFollowing
        }
      });
      window.dispatchEvent(event);

      return { success: true, isFollowing: newIsFollowing };

    } catch (err) {
      setError(err.message);
      console.error('Erro no hook useFollow:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { toggleFollow, loading, error };
}
