import { useState, useEffect } from 'react';

export default function usePosts(token) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchPosts = async () => {
        if (!token) return;

        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/posts", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (res.ok) {
                setPosts(data);
            } else {
                setError(data.error || 'Erro ao carregar posts');
            }
        } catch (err) {
            setError('Erro na comunicação com o servidor');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [token]);

    return { posts, loading, error, refetch: fetchPosts };
}