import { useState } from "react";
import { apiFetch } from "../../lib/util/apiFetch";
import { useTranslation } from "react-i18next";

export default function useLogin() {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const login = async ({ username, senha }) => {
    setErrors({});
    setLoading(true);

    try {
      const response = await apiFetch(`/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: senha }),
        credentials: "include",
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {

        localStorage.setItem("username", data.username);
        localStorage.setItem("id", data.user_id);
        localStorage.setItem("avatar", data.avatar);
        localStorage.setItem("following", JSON.stringify(data.following));

        return { success: true, data };
      } else {
        const backendErrors = {};

        if (data.error.includes("Invalid credentials")) {
          backendErrors.general = t("backend_errors.invalid_credentials");
        } else if (data.error.includes("User is not active.")) {
          backendErrors.general = t("backend_errors.user_not_active");
        } else if (data.error.includes("Username and password are required")) {
          backendErrors.general = t("backend_errors.username_is_required");
        } else {
          backendErrors.general = data.error || t("errors.generic_error");
        }

        setErrors(backendErrors);
        return { success: false, errors: backendErrors };
      }
    } catch (err) {
      setLoading(false);
      setErrors({ general: t("errors.network_error") });
      return {
        success: false,
        errors: { general: t("errors.network_error") },
      };
    }
  };

  return { login, errors, loading };
}
