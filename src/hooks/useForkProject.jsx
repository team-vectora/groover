import { useState } from "react";
import { toast } from "react-toastify";

export default function useForkProject(token) {
  const [loading, setLoading] = useState(false);

  const forkProject = async (projectId) => {
    setLoading(true);
    try {
        console.log(projectId)
      const response = await fetch(`http://localhost:5000/api/fork`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ project_id: projectId })
      });

      if (!response.ok) throw new Error("Erro ao fazer fork");

      const data = await response.json();

      toast.success("Projeto forkado", { theme: "dark", autoClose: 3000 });

      return data.fork_id;
    } catch (err) {
      toast.error(err.message, { theme: "dark", autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return { forkProject, loading };
}
