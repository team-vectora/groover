import { useState } from 'react';

const ProfileTabs = ({
                         activeTab,
                         setActiveTab,
                         showInvites
                     }) => {
    return (
        <div className="flex border-b border-[#4c4e30] mb-6">
            <button
                className={`px-4 py-2 font-medium ${
                    activeTab === 'posts'
                        ? 'text-[#c1915d] border-b-2 border-[#c1915d]'
                        : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('posts')}
            >
                Posts
            </button>

            <button
                className={`px-4 py-2 font-medium ${
                    activeTab === 'musics'
                        ? 'text-[#c1915d] border-b-2 border-[#c1915d]'
                        : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('musics')}
            >
                Músicas
            </button>

            {showInvites && (
                <button
                    className={`px-4 py-2 font-medium ${
                        activeTab === 'invites'
                            ? 'text-[#c1915d] border-b-2 border-[#c1915d]'
                            : 'text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('invites')}
                >
                    Convites
                </button>
            )}
        </div>
    );
};

export default ProfileTabs;