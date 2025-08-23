import { useState, useEffect } from 'react';

export default function useSimilarUsers(token) {
    const [similarUsers, setSimilarUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchSimilarUsers = async () => {
        if (!token) return;

        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/users/similar", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error("Erro ao buscar usuários similares");
            }

            const data = await res.json();

            console.log("Usuarios similares achados: " + data)

            setSimilarUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSimilarUsers();
    }, [token]);

    return {
        similarUsers,
        loading,
        error,
        refetch: fetchSimilarUsers
    };
}