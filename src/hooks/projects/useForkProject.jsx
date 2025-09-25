import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config";
import { useTranslation } from "react-i18next";

export default function useForkProject() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const forkProject = async (projectId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/fork`, {
        method: "POST",
        credentials: "include", // envia o cookie HTTP-only
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: projectId,
          username_actor: localStorage.getItem("username")
        })
      });

      if (!response.ok) throw new Error(t('errors.fork_failed'));

      const data = await response.json();
      toast.success(t('fork.copiedSuccess'));

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
