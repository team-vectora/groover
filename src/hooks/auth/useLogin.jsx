import { useState } from "react";
import { API_BASE_URL } from "../../config";
import { useTranslation } from "react-i18next";

export default function useLogin() {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const login = async ({ username, senha }) => {
    setErrors({});
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: senha }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("id", data.user_id);
        localStorage.setItem("avatar", data.avatar);
        localStorage.setItem("following", JSON.stringify(data.following));

        return { success: true, data };
      } else {
        const backendErrors = {};
        backendErrors.general = t('errors.generic_error');
        setErrors(backendErrors);
        return { success: false, errors: backendErrors };
      }
    } catch (err) {
      setLoading(false);
      setErrors({ general: t('errors.network_error') });
      return { success: false, errors: { general: t('errors.network_error') } };
    }
  };

  return { login, errors, loading };
}