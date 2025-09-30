import { useState } from "react";
import { apiFetch } from "../../lib/util/apiFetch";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function useSignUp() {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const signUp = async ({ username, email, senha }) => {
    setErrors({});
    setLoading(true);

    try {
      const response = await apiFetch(`/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password: senha, lang: i18n.language }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setLoading(false);
        // CORREÇÃO: Redireciona para a página de verificação de e-mail
        router.push("/verify-email");
        return { success: true };
      } else {
        setLoading(false);
        const backendErrors = {};
        if (data.error.includes("Username already exists")) {
          backendErrors.username = t("backend_errors.username_exists");
        } else if (data.error.includes("Email already used")) {
          backendErrors.email = t("backend_errors.email_exists");
        } else {
          backendErrors.general = data.error || t("errors.generic_error");
        }
        setErrors(backendErrors);
        return { success: false, errors: backendErrors };
      }
    } catch (err) {
      setLoading(false);
      const networkError = { general: t("errors.network_error") };
      setErrors(networkError);
      return { success: false, errors: networkError };
    }
  };

  return { signUp, errors, loading };
}