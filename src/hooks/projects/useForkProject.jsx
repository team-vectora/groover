// src/hooks/projects/useForkProject.jsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function useForkProject(token) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const forkProject = async (projectId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/projects/fork`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ project_id: projectId })
      });

      if (!response.ok) throw new Error("Erro ao fazer fork");

      const data = await response.json();
      toast.success("Projeto copiado para seu perfil!");

      // ✅ Redireciona para o editor do novo projeto
      if (data.new_project_id) {
        router.push(`/editor/${data.new_project_id}`);
      }

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { forkProject, loading };
}