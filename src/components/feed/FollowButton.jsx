'use client';
import { useState } from "react";
import { useFollow } from "../../hooks";
import { useTranslation } from 'react-i18next';

const FollowButton = ({ followingId, userId, isFollowing, setIsFollowing }) => {
    const { t } = useTranslation();
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
                px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer
                ${isFollowing
                ? 'bg-primary text-foreground border border-primary hover:bg-primary-light'
                : 'bg-transparent text-foreground border border-accent hover:bg-accent'}
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
            `}
        >
            {loading 
                ? t('followButton.loading') 
                : isFollowing 
                    ? t('followButton.following') 
                    : t('followButton.follow')}
        </button>
    );
};

export default FollowButton;
