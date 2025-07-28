import { useState } from "react";

export default function useLogin() {
  const [error, setError] = useState("");

  const login = async ({ username, senha }) => {
    setError("");
    try {
      const response = await fetch('http://localhost:5000/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: senha }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('id', data.user_id);
        localStorage.setItem('avatar', data.avatar);
        localStorage.setItem('following', JSON.stringify(data.following));

        return { success: true, data };
      } else {
        setError(data.error || 'Erro no login');
        return { success: false, error: data.error || 'Erro no login' };
      }
    } catch (err) {
      setError('Erro ao conectar com a API');
      return { success: false, error: 'Erro ao conectar com a API' };
    }
  };

  return { login, error };
}
