import { useState } from "react";

export default function useSignUp() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = async ({ username, email, senha }) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password: senha }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        return { success: true, data };
      } else {
        setError(data.error || "Erro no cadastro");
        return { success: false, error: data.error || "Erro no cadastro" };
      }
    } catch (err) {
      setLoading(false);
      setError("Erro ao conectar com a API");
      return { success: false, error: "Erro ao conectar com a API" };
    }
  };

  return { signUp, error, loading };
}
