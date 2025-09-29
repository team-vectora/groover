import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import FollowButton from '../feed/FollowButton';
import { useAuth } from '../../hooks';

const ProfileHeader = ({ user, isCurrentUser, onEdit, onLogout, onFollowersClick, onFollowingClick }) => {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const [isFollowing, setIsFollowing] = useState(user?.is_following || false);

  useEffect(() => {
    setIsFollowing(user?.is_following || false);
  }, [user]);

  const getFavoriteGenres = () => {
    if (!user?.genres) return [];
    return Object.entries(user.genres)
        .filter(([_, score]) => score > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([genre]) => genre);
  };

  return (
      <div className="bg-bg-secondary rounded-lg p-6 mb-6 border border-primary">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary">
              <Image src={user?.avatar || "/img/default_avatar.png"} alt={t('profile.avatarAlt')} fill className="object-cover" quality={100} />
            </div>
            {isCurrentUser && (
                <button onClick={onEdit} className="absolute -bottom-2 -right-2 bg-accent hover:bg-accent-light text-white w-10 h-10 flex items-center justify-center rounded-full shadow transition-transform hover:rotate-45 cursor-pointer" title={t('profile.editProfile')}>
                  <FontAwesomeIcon icon={faCog} />
                </button>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-accent-light mb-2">{user?.username || t('profile.user')}</h1>
            <p className="text-text-lighter mb-4">{user?.bio}</p>
            <div className="flex justify-center md:justify-start gap-6 mb-4">
              <div onClick={onFollowersClick} className="cursor-pointer">
                <span className="font-bold">{user?.followers?.length || 0}</span>
                <span className="text-text-lighter ml-1">{t('profile.followers')}</span>
              </div>
              <div onClick={onFollowingClick} className="cursor-pointer">
                <span className="font-bold">{user?.following?.length || 0}</span>
                <span className="text-text-lighter ml-1">{t('profile.following')}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {getFavoriteGenres().map((genre) => (
                  <span key={genre} className="px-3 py-1 bg-primary text-white rounded-full text-sm">
                                {genre.charAt(0).toUpperCase() + genre.slice(1)}
                            </span>
              ))}
            </div>
          </div>
          {isCurrentUser ? (
              <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg transition cursor-pointer">
                <FontAwesomeIcon icon={faSignOutAlt} />
                {t('profile.logout')}
              </button>
          ) : (
              <FollowButton
                  followingId={user._id}
                  userId={userId}
                  isFollowing={isFollowing}
                  setIsFollowing={setIsFollowing}
              />
          )}
        </div>
      </div>
  );
};

export default ProfileHeader;