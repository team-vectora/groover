import { useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config";

export default function useHandleInvite(token) {
  const [loading, setLoading] = useState(false);

  const handleInvite = async (inviteId, response, onComplete) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/invitations/${inviteId}/respond`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response }),
      });

      if (!res.ok) throw new Error("Erro ao responder ao convite");

      toast.success(`Convite ${response === 'accept' ? 'aceito' : 'recusado'}!`, { theme: "dark", autoClose: 3000 });

      if (onComplete) onComplete();
    } catch (err) {
      toast.error(err.message, { theme: "dark", autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return { handleInvite, loading };
}
