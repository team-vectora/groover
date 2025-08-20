import { useState } from "react";
import { useFollow } from "../../hooks";

const FollowButton = ({ followingId, userId, isFollowing, setIsFollowing }) => {
    const { toggleFollow, loading, error } = useFollow();

    const handleClick = async () => {
        if (userId === followingId) return;

        const result = await toggleFollow(followingId, isFollowing, setIsFollowing);

        if (!result.success && result.error) {
            alert(result.error);
        }
    };

    if (error) {
        console.error("Erro no FollowButton:", error);
    }

    return userId === followingId ? null : (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`
                px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${isFollowing
                ? 'bg-[#4c4e30] text-[#e6e8e3] border border-[#4c4e30] hover:bg-[#61673e]'
                : 'bg-transparent text-[#e6e8e3] border border-[#a97f52] hover:bg-[#a97f52]'}
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
            `}
        >
            {loading ? 'Carregando...' : isFollowing ? 'Seguindo' : 'Seguir'}
        </button>
    );
};

export default FollowButton;