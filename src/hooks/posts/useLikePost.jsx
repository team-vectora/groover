import { useState } from "react";
import { API_BASE_URL } from "../../config"; // ajuste o caminho conforme a sua estrutura

export default function useLikePost(token, onSuccess) {
  const [error, setError] = useState("");

  const likePost = async (post_id, owner_id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/posts/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id, owner_id }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Token inválido ou expirado. Faça login novamente.");
          return;
        }
        const text = await res.text();
        setError(`Erro na API: ${res.status} - ${text}`);
        return;
      }

      const data = await res.json();
      console.log(data.message);

      if (onSuccess) onSuccess();

    } catch (err) {
      setError("Erro na comunicação com a API.");
      console.error(err);
    }
  };

  return { likePost, error };
}
