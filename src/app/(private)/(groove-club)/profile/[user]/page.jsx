// src/app/(groove-club)/profile/[user]/page.jsx
'use client'

import React from "react";
import { useState, useContext, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth, useProfile, useForkProject, useShareProject, useDeleteProject } from '../../../../../hooks';
import { ProfileHeader, ProfileTabs, Post, ProjectCard, Invite,
  PostFormPopUp, ConfigUserPopUp, SharePopUp, ConfirmationPopUp, FollowListPopup, LoadingDisc, ManageCollaboratorsPopup } from '../../../../../components';
import { useTranslation } from 'react-i18next';
import { apiFetch } from "../../../../../lib/util/apiFetch";

export default function ProfilePage({ params }) {
  const { t } = useTranslation();
  const { user: username } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId, username: currentUsername } = useAuth();
  const { user, posts, projects, invites, loading, error, refetch } = useProfile(username);

  const [activeTab, setActiveTab] = useState('posts');
  const [openPostForm, setOpenPostForm] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [followList, setFollowList] = useState({ open: false, type: '', users: [], isLoading: false });
  const [shareProject, setShareProject] = useState(null);
  const [projectToManage, setProjectToManage] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const { forkProject } = useForkProject();
  const { shareProject: shareProjectApi } = useShareProject();
  const { deleteProject } = useDeleteProject();

  const isCurrentUser = currentUsername === username;

  useEffect(() => {
    if (searchParams.get('newPost') === 'true' && isCurrentUser) {
      setOpenPostForm(true);
      router.replace(`/profile/${username}`, { scroll: false });
    }
  }, [searchParams, isCurrentUser, router, username]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleShareProject = (project) => setShareProject(project);
  const handleDeleteClick = (projectId) => setProjectToDelete(projectId);
  const handleManageCollaborators = (project) => setProjectToManage(project);

  const confirmDelete = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete, refetch);
      setProjectToDelete(null);
    }
  };

  const fetchFollowList = async (type) => {
    setFollowList({ open: true, type, users: [], isLoading: true });
    try {
      const endpoint = type === 'followers' ? 'followers' : 'following';
      const res = await apiFetch(`/users/${username}/${endpoint}`, { credentials: "include" });
      const data = await res.json();
      setFollowList({ open: true, type, users: data, isLoading: false });
    } catch (err) {
      setFollowList({ open: true, type, users: [], isLoading: false });
      console.error("Erro ao buscar lista:", err);
    }
  };

  const handleLogout = () => {
    router.push('/logout');
  };

  if (loading) return <LoadingDisc />;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
      <div className="container mx-auto px-4 py-8">
        <ToastContainer position="top-center" />
        <ProfileHeader user={user} isCurrentUser={isCurrentUser} onEdit={() => setOpenConfig(true)} onLogout={handleLogout} onFollowersClick={() => fetchFollowList('followers')} onFollowingClick={() => fetchFollowList('following')} />
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} showInvites={isCurrentUser} />

        {activeTab === 'posts' && (
            <div className="space-y-6">
              {isCurrentUser && <div className="flex justify-end mb-4"><button className="bg-accent hover:bg-accent-light text-text-lighter p-2 rounded-full w-12 h-12 flex items-center justify-center text-2xl" onClick={() => setOpenPostForm(true)} title="Novo Post">+</button></div>}
              {!posts?.length ? <p className="text-center text-text-lighter">{t('profile.noPosts')}</p> : posts.map(post => <Post key={post._id} post={post} userId={userId} onPostCreated={refetch} />)}
            </div>
        )}

        {activeTab === 'musics' && (
            <div>
              {isCurrentUser && <button className="mb-4 px-4 py-2 bg-accent hover:bg-accent-light text-text-lighter rounded" onClick={() => router.push('/editor/new')}>{t('profile.newProject')}</button>}
              {!projects?.length ? <p className="text-center text-text-lighter">{t('profile.noMusics')}</p> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map(project => <ProjectCard key={project.id} project={project} isYourProfile={isCurrentUser} handleClickShare={handleShareProject} handleClickDelete={handleDeleteClick} handleManageCollaborators={handleManageCollaborators}/>)}
                  </div>
              )}
            </div>
        )}

        {activeTab === 'invites' && isCurrentUser && (
            <div>
              {!invites?.length ? <p className="text-center text-text-lighter">{t('profile.noInvites')}</p> : <div className="space-y-4">{invites.map(invite => <Invite key={invite.id} invite={invite} onActionComplete={refetch} />)}</div>}
            </div>
        )}

        {openPostForm && <PostFormPopUp open={openPostForm} onClose={() => setOpenPostForm(false)} projects={projects} onPostCreated={refetch} />}
        {openConfig && <ConfigUserPopUp open={openConfig} onClose={() => setOpenConfig(false)} username={currentUsername} bio={user.bio} profilePic={user.avatar} favoriteTags={user.genres || {}} onSuccess={refetch} />}
        {shareProject && <SharePopUp open={!!shareProject} onClose={() => setShareProject(null)} project={shareProject} onShare={shareProjectApi} />}
        {followList.open && <FollowListPopup title={followList.type === 'followers' ? t('profile.followers') : t('profile.following')} users={followList.users} isLoading={followList.isLoading} onClose={() => setFollowList({ open: false, type: '', users: [], isLoading: false })} isCurrentUserFollowingList={isCurrentUser && followList.type === 'following'} refetchProfile={refetch} />}
        {projectToDelete && <ConfirmationPopUp open={!!projectToDelete} onClose={() => setProjectToDelete(null)} onConfirm={confirmDelete} title={t('profile.deleteProjectTitle')} message={t('profile.deleteProjectConfirmation')} />}
        {projectToManage && <ManageCollaboratorsPopup project={projectToManage} open={!!projectToManage} onClose={() => setProjectToManage(null)} onCollaboratorChange={() => {refetch}} />}
      </div>
  );
}