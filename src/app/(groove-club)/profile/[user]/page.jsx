'use client';

import React from "react";
import { useState, useContext, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MidiContext } from '../../../../contexts/MidiContext';
import { useAuth, useProfile, useLikePost, useForkProject, useShareProject } from '../../../../hooks';
import { ProfileHeader, ProfileTabs, Post, ProjectCard, Invite, PostFormPopUp, ConfigUserPopUp, SharePopUp } from '../../../../components';

export default function ProfilePage({ params }) {
      const { user: username } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, userId, username: currentUsername } = useAuth();
  const { user, posts, projects, invites, loading, error, refetch } = useProfile(username, token);

  const { setCurrentProject } = useContext(MidiContext);
  const [activeTab, setActiveTab] = useState('posts');
  const [openPostForm, setOpenPostForm] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [shareProject, setShareProject] = useState(null);

  const { forkProject } = useForkProject(token);
  const { shareProject: shareProjectApi } = useShareProject(token);

  const isCurrentUser = currentUsername === username;

  // Abrir PopUp automaticamente se houver query ?newPost=true
  useEffect(() => {
    if (searchParams.get('newPost') === 'true' && isCurrentUser) {
      setOpenPostForm(true);
      // Remover o query param para não abrir novamente
      router.replace(`/profile/${username}`);
    }
  }, [searchParams, isCurrentUser, router, username]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'invites' || tab === 'musics' || tab === 'posts') {
      setActiveTab(tab);
      router.replace(`/profile/${username}`, undefined, { shallow: true });
    }
  }, [searchParams, router, username]);


  const handleForkProject = async (project) => {
    await forkProject(project.id);
  };

  const handleShareProject = (project) => {
    setShareProject(project);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('username');
    router.push('/login');
  };



  if (loading) return <div className="text-center py-8">Carregando perfil...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
      <div className="container mx-auto px-4 py-8">
        <ToastContainer position="top-center" />

        <ProfileHeader
            user={user}
            isCurrentUser={isCurrentUser}
            onEdit={() => setOpenConfig(true)}
            onLogout={handleLogout}
        />

        <ProfileTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            showInvites={isCurrentUser}
        />

        {/* Tab Content */}
        {activeTab === 'posts' && (
            <div className="space-y-6">
              {isCurrentUser && (
                  <div className="flex justify-end mb-4">
                    <button
                        className="bg-[#a97f52] hover:bg-[#c1915d] text-white p-2 rounded-full w-12 h-12 flex items-center justify-center text-2xl"
                        onClick={() => setOpenPostForm(true)}
                        title="Novo Post"
                    >
                      +
                    </button>
                  </div>
              )}

              {posts.length === 0 ? (
                  <p className="text-center text-gray-400">Nenhum post encontrado</p>
              ) : (
                  posts.map(post => (
                      <Post
                          key={post._id}
                          token={token}
                          post={post}
                          userId={userId}
                          setCurrentProject={setCurrentProject}
                          handleClickFork={handleForkProject}
                      />
                  ))
              )}
            </div>
        )}

        {activeTab === 'musics' && (
            <div>
              {isCurrentUser && (
                  <button
                      className="mb-4 px-4 py-2 bg-[#a97f52] hover:bg-[#c1915d] text-white rounded"
                      onClick={() => router.push('/controls/new')}
                  >
                    Novo Projeto
                  </button>
              )}

              {projects.length === 0 ? (
                  <p className="text-center text-gray-400">Nenhum projeto encontrado</p>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            profileId={userId}
                            isYourProfile={isCurrentUser}
                            setCurrentProject={setCurrentProject}
                            handleClickFork={handleForkProject}
                            handleClickShare={handleShareProject}
                        />
                    ))}
                  </div>
              )}
            </div>
        )}

        {activeTab === 'invites' && isCurrentUser && (
            <div>
              {invites.length === 0 ? (
                  <p className="text-center text-gray-400">Nenhum convite encontrado</p>
              ) : (
                  <div className="space-y-4">
                    {invites.map(invite => (
                        <Invite key={invite.id} invite={invite} onActionComplete={refetch} />
                    ))}
                  </div>
              )}
            </div>
        )}

        {/* Popups */}
        {openPostForm && (
            <PostFormPopUp
                open={openPostForm}
                onClose={() => setOpenPostForm(false)}
                projects={projects}
            />
        )}

        {openConfig && (
            <ConfigUserPopUp
                open={openConfig}
                onClose={() => setOpenConfig(false)}
                username={currentUsername}
                bio={user.bio}
                profilePic={user.avatar}
                setProfilePic={(url) => {}}
                favoriteTags={user.genres || []}
            />
        )}

        {shareProject && (
            <SharePopUp
                open={!!shareProject}
                onClose={() => setShareProject(null)}
                project={shareProject}
                onShare={shareProjectApi}
            />
        )}
      </div>
  );
}
