import { useState } from "react";
import { toast } from "react-toastify";

export default function useDeleteProject(token) {
    const [loading, setLoading] = useState(false);

    const deleteProject = async (projectId, onSuccess) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Erro ao excluir projeto");
            }

            toast.success("Projeto excluído com sucesso!");
            if (onSuccess) onSuccess();

        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { deleteProject, loading };
}