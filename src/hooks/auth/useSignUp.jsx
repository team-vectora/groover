import { useState } from "react";
import { API_BASE_URL } from "../../config";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function useSignUp() {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { t, i18n } = useTranslation();

  const validateInputs = ({ username, email, senha }) => {
    const newErrors = {};

    if (!username || username.trim() === "") {
      newErrors.username = t("validation.username_required");
    } else if (username.length < 3) {
      newErrors.username = t("validation.username_min_length");
    }

    if (!email || email.trim() === "") {
      newErrors.email = t("validation.email_required");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("validation.email_invalid");
    }

    if (!senha || senha.trim() === "") {
      newErrors.senha = t("validation.password_required");
    } else if (senha.length < 8) {
      newErrors.senha = t("validation.password_min_length");
    } else if (!/[A-Z]/.test(senha)) {
      newErrors.senha = t("validation.password_uppercase");
    } else if (!/[0-9]/.test(senha)) {
      newErrors.senha = t("validation.password_number");
    } else if (!/[^A-Za-z0-9]/.test(senha)) {
      newErrors.senha = t("validation.password_special_char");
    }

    return newErrors;
  };

  const signUp = async ({ username, email, senha }) => {
    setErrors({});
    setLoading(true);

    const validationErrors = validateInputs({ username, email, senha });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return { success: false, errors: validationErrors };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password: senha, lang: i18n.language }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoading(false);
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