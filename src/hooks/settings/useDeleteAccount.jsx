import { useState } from "react";
import { API_BASE_URL } from "../../config";

export function useDeleteAccount(token) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteAccount = async () => {

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/users/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro desconhecido");
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { deleteAccount, loading, error };
}
