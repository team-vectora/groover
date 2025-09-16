import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ProfileTabs = ({
                         activeTab,
                         setActiveTab,
                         showInvites
                     }) => {
    const { t } = useTranslation();
    return (
        <div className="flex border-b border-primary: mb-6">
            <button
                className={`px-4 py-2 font-medium ${
                    activeTab === 'posts'
                        ? 'text-accent-light border-b-2 border-accent-light'
                        : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('posts')}
            >
                {t('profileTabs.posts')}
            </button>

            <button
                className={`px-4 py-2 font-medium ${
                    activeTab === 'musics'
                        ? 'text-accent-light border-b-2 border-accent-light'
                        : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('musics')}
            >
                {t('profileTabs.musics')}
            </button>

            {showInvites && (
                <button
                    className={`px-4 py-2 font-medium ${
                        activeTab === 'invites'
                            ? 'text-accent-light border-b-2 border-accent-light'
                            : 'text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('invites')}
                >
                    {t('profileTabs.invites')}
                </button>
            )}
        </div>
    );
};

export default ProfileTabs;