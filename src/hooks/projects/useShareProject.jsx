import { useState } from "react";
import { toast } from "react-toastify";

export default function useShareProject(token) {
  const [loading, setLoading] = useState(false);

  const shareProject = async (username) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/invite`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username }),
      });

      if (!response.ok) throw new Error("Erro ao compartilhar");

      toast.success("Projeto compartilhado", { theme: "dark", autoClose: 3000 });
    } catch (err) {
      toast.error(err.message, { theme: "dark", autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return { shareProject, loading };
}
