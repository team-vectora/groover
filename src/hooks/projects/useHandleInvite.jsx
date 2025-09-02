// src/hooks/projects/useHandleInvite.jsx

import { useState } from "react";
import { toast } from "react-toastify";

export default function useHandleInvite(token) {
    const [loading, setLoading] = useState(false);

    const handleInvite = async (inviteId, response, onComplete) => { // ✨ onComplete como callback
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/invitations/${inviteId}/respond`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ response }),
            });

            if (!res.ok) throw new Error("Erro ao responder ao convite");

            toast.success(`Convite ${response === 'accept' ? 'aceito' : 'recusado'}!`, { theme: "dark", autoClose: 3000 });

            if (onComplete) {
                onComplete(); // ✨ Chama o callback para recarregar a lista
            }
        } catch (err) {
            toast.error(err.message, { theme: "dark", autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    return { handleInvite, loading };
}