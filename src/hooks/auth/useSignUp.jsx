import { useState } from "react";
import useLogin from "./useLogin"; // Importa o hook de login
import { API_BASE_URL } from "../../config"; // ajuste o caminho conforme sua estrutura

export default function useSignUp() {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useLogin(); // Instancia o hook de login

  const validateInputs = ({ username, email, senha }) => {
    const newErrors = {};

    // Validações (igual ao seu código)
    if (!username || username.trim() === "") {
      newErrors.username = "Nome de usuário é obrigatório";
    } else if (username.length < 3) {
      newErrors.username = "Nome deve ter pelo menos 3 caracteres";
    } else if (username.length > 20) {
      newErrors.username = "Nome não pode exceder 20 caracteres";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = "Use apenas letras, números e underline (_)";
    }

    if (!email || email.trim() === "") {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Digite um email válido";
    }

    if (!senha || senha.trim() === "") {
      newErrors.senha = "Senha é obrigatória";
    } else if (senha.length < 8) {
      newErrors.senha = "Senha deve ter pelo menos 8 caracteres";
    } else if (!/[A-Z]/.test(senha)) {
      newErrors.senha = "Inclua pelo menos uma letra maiúscula";
    } else if (!/[0-9]/.test(senha)) {
      newErrors.senha = "Inclua pelo menos um número";
    } else if (!/[^A-Za-z0-9]/.test(senha)) {
      newErrors.senha = "Inclua pelo menos um caractere especial";
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
        body: JSON.stringify({ username, email, password: senha }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login automático após cadastro
        const loginResult = await login({ username, senha });
        setLoading(false);
        return loginResult;
      } else {
        setLoading(false);
        const backendErrors = {};

        if (data.error.includes("Username already exists")) {
          backendErrors.username = "Nome de usuário já em uso";
        } else if (data.error.includes("Email already used")) {
          backendErrors.email = "Email já cadastrado";
        } else {
          backendErrors.general = data.error || "Erro no cadastro";
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

  return { signUp, errors, loading };
}
