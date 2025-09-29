'use client';
import { useFollow } from "../../hooks";
import { useTranslation } from 'react-i18next';

const FollowButton = ({ followingId, userId, isFollowing, setIsFollowing, onToggleFollow }) => {
    const { t } = useTranslation();
    const { toggleFollow, loading, error } = useFollow();

    const handleClick = async () => {
        if (userId === followingId) return;
        const result = await toggleFollow(followingId, isFollowing, setIsFollowing, onToggleFollow);

        if (!result.success && result.error) {
            alert(result.error);
        }
    };

    if (error) {
        console.error("Erro no FollowButton:", error);
    }

    if (userId === followingId) return null;

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`
        px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200
        shadow-sm
        ${isFollowing
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-accent-light text-text-lighter hover:border-primary hover:text-primary'}
        ${loading ? 'opacity-60 cursor-not-allowed' : ''}
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