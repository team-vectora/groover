import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config";

export default function useForkProject(token) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const forkProject = async (projectId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/fork`, {
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
