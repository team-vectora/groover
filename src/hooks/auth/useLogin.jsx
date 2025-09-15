import { useState } from "react";
import { API_BASE_URL } from "../../config";

export default function useLogin() {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

        if (data.error.includes("Invalid credentials")) {
          backendErrors.general = "Nome de usuário ou senha incorreto";
        } else if (data.error.includes("Username and password are required")) {
          backendErrors.general = "Insira um usuário e senha";
        } else {
          backendErrors.general = data.error || "Erro no login";
        }

        setErrors(backendErrors);
        return { success: false, errors: backendErrors };
      }
    } catch (err) {
      setLoading(false);
      setErrors({ general: "Erro ao conectar com o servidor" });
      return { success: false, errors: { general: "Erro ao conectar com o servidor" } };
    }
  };

  return { login, errors, loading };
}
