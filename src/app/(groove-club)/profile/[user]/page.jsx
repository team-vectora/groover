'use client'

import React from "react";
import { useState, useContext, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MidiContext } from '../../../../contexts/MidiContext';
import { useAuth, useProfile, useForkProject, useShareProject, useDeleteProject } from '../../../../hooks';
import { ProfileHeader, ProfileTabs, Post, ProjectCard, Invite,
  PostFormPopUp, ConfigUserPopUp, SharePopUp, ConfirmationPopUp, FollowListPopup } from '../../../../components';

export default function ProfilePage({ params }) {
  const { user: username } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, userId, username: currentUsername } = useAuth();
  const { user, posts, projects, invites, loading, error, refetch } = useProfile(username, token);

  const { setCurrentProject } = useContext(MidiContext);
  const [activeTab, setActiveTab] = useState('posts');
  const [openPostForm, setOpenPostForm] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [followList, setFollowList] = useState({ open: false, type: '', users: [], isLoading: false });
  const [shareProject, setShareProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const { forkProject } = useForkProject(token);
  const { shareProject: shareProjectApi } = useShareProject(token);
  const { deleteProject } = useDeleteProject(token);

  const isCurrentUser = currentUsername === username;

  useEffect(() => {
    if (searchParams.get('newPost') === 'true' && isCurrentUser) {
      setOpenPostForm(true);
      router.replace(`/profile/${username}`, { scroll: false });
    }
  }, [searchParams, isCurrentUser, router, username]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
      router.replace(`/profile/${username}`, { scroll: false });
    }
  }, [searchParams, router, username]);

  const handleForkProject = async (project) => {
    await forkProject(project.id);
  };

  const handleShareProject = (project) => {
    setShareProject(project);
  };

  const handleDeleteClick = (projectId) => {
    setProjectToDelete(projectId);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete, () => {
        refetch(); // Recarrega os dados do perfil após a exclusão
        setProjectToDelete(null);
      });
    }
  };

  const fetchFollowList = async (type) => {
    setFollowList({ open: true, type, users: [], isLoading: true });
    try {
      const res = await fetch(`http://localhost:5000/api/users/${username}/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFollowList({ open: true, type, users: data, isLoading: false });
    } catch (err) {
      setFollowList({ open: true, type, users: [], isLoading: false });
      console.error("Erro ao buscar lista:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
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
            onFollowersClick={() => fetchFollowList('followers')}
            onFollowingClick={() => fetchFollowList('following')}
        />

        <ProfileTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            showInvites={isCurrentUser}
        />

        {/* Conteúdo das Abas */}
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
                      onClick={() => router.push('/editor/new')}
                  >
                    Novo Projeto
                  </button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        isYourProfile={isCurrentUser}
                        setCurrentProject={setCurrentProject}
                        handleClickShare={handleShareProject}
                        handleClickDelete={handleDeleteClick} // Passa a função de exclusão
                    />
                ))}
              </div>
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
                favoriteTags={Object.keys(user.genres || {})}
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

        {followList.open && (
            <FollowListPopup
                title={followList.type === 'followers' ? 'Seguidores' : 'Seguindo'}
                users={followList.users}
                isLoading={followList.isLoading}
                onClose={() => setFollowList({ open: false, type: '', users: [], isLoading: false })}
            />
        )}

        {projectToDelete && (
            <ConfirmationPopUp
                open={!!projectToDelete}
                onClose={() => setProjectToDelete(null)}
                onConfirm={confirmDelete}
                title="Excluir Projeto"
                message="Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita."
            />
        )}
      </div>
  );
}