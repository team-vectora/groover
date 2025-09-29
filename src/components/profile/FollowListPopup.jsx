// src/components/profile/FollowListPopup.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import useOutsideClick from '../../hooks/posts/useOutsideClick';
import { useTranslation } from 'react-i18next';
import FollowButton from '../feed/FollowButton';
import { useAuth, useFollow } from '../../hooks';
import { useState, useEffect } from 'react';

const FollowListPopup = ({ title, users, onClose, isLoading, isCurrentUserFollowingList, refetchProfile }) => {
    const { t } = useTranslation();
    const { userId } = useAuth();
    const popupRef = useOutsideClick(onClose);

    // Estado interno para gerenciar a lista de usuários exibida
    const [displayUsers, setDisplayUsers] = useState(users);

    useEffect(() => {
        setDisplayUsers(users);
    }, [users]);

    // Função para lidar com a ação de deixar de seguir
    const handleUnfollow = (unfollowedUserId) => {
        // Remove o usuário da lista local para atualização instantânea da UI
        setDisplayUsers(currentUsers => currentUsers.filter(user => user.id !== unfollowedUserId));
        // Chama a função para recarregar os dados do perfil na página principal em segundo plano
        if (refetchProfile) {
            refetchProfile();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div ref={popupRef} className="bg-bg-secondary rounded-xl w-full max-w-md border border-primary">
                <div className="flex justify-between items-center px-5 py-4 border-b border-primary">
                    <h3 className="text-lg font-semibold text-accent-light">{title}</h3>
                    <button onClick={onClose} className="text-text-lighter hover:text-white">
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                </div>
                <div className="p-5 max-h-80 overflow-y-auto">
                    {isLoading ? (
                        <p>{t('profile.loadingUsers')}</p>
                    ) : displayUsers.length === 0 ? (
                        <p>{t('profile.noUsers')}</p>
                    ) : (
                        <ul className="space-y-3">
                            {displayUsers.map(user => (
                                <li key={user.id} className="flex items-center justify-between gap-3">
                                    <Link href={`/profile/${user.username}`} className="flex items-center gap-3" onClick={onClose}>
                                        <img src={user.avatar || '/img/default_avatar.png'} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                                        <div>
                                            <p className="font-semibold hover:underline">{user.username}</p>
                                            <p className="text-sm text-text-lighter line-clamp-1">{user.bio}</p>
                                        </div>
                                    </Link>
                                    {isCurrentUserFollowingList && (
                                        <FollowButtonWrapper
                                            user={user}
                                            userId={userId}
                                            onUnfollow={() => handleUnfollow(user.id)}
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

// Componente Wrapper para gerenciar o estado de cada botão individualmente
const FollowButtonWrapper = ({ user, userId, onUnfollow }) => {
    const [isFollowing, setIsFollowing] = useState(true);
    const { toggleFollow, loading } = useFollow();

    const handleClick = async () => {
        await toggleFollow(user.id, isFollowing, (newIsFollowing) => {
            setIsFollowing(newIsFollowing);
            if (!newIsFollowing) {
                onUnfollow();
            }
        });
    };

    return (
        <FollowButton
            followingId={user.id}
            userId={userId}
            isFollowing={isFollowing}
            setIsFollowing={setIsFollowing} // AINDA USADO PARA ATUALIZAR O VISUAL DO BOTÃO
            onToggleFollow={handleClick} // USADO PARA CHAMAR A LÓGICA ACIMA
            loading={loading}
        />
    );
}


export default FollowListPopup;