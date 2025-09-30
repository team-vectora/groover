import { useState } from "react";
import { apiFetch } from "../../lib/util/apiFetch";
import { useTranslation } from "react-i18next";

export function useDeleteAccount() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteAccount = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/users/delete`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('errors.generic_error'));
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
