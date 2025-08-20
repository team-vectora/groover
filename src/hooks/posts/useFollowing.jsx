import { useState, useEffect } from "react";

export default function useFollowing() {
    const [following, setFollowing] = useState([]);

    // Carrega do localStorage na montagem
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("following") || "[]");
        setFollowing(stored);
    }, []);

    // Sempre que mudar, salva no localStorage
    useEffect(() => {
        localStorage.setItem("following", JSON.stringify(following));
    }, [following]);

    const isFollowing = (id) => following.includes(id);

    const follow = (id) => {
        if (!following.includes(id)) {
            setFollowing((prev) => [...prev, id]);
        }
    };

    const unfollow = (id) => {
        setFollowing((prev) => prev.filter((f) => f !== id));
    };

    const toggleFollow = (id) => {
        if (isFollowing(id)) {
            unfollow(id);
        } else {
            follow(id);
        }
    };

    return { following, isFollowing, follow, unfollow, toggleFollow };
}
