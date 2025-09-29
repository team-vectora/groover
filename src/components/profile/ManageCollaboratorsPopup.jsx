// src/components/profile/ManageCollaboratorsPopup.jsx
'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import useOutsideClick from '../../hooks/posts/useOutsideClick';
import { apiFetch } from '../../lib/util/apiFetch';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { ConfirmationPopUp } from '..';

const ManageCollaboratorsPopup = ({ project, open, onClose, onCollaboratorChange }) => {
    const { t } = useTranslation();
    const [collaborators, setCollaborators] = useState(project.collaborators || []);
    const [userToRemove, setUserToRemove] = useState(null);

    const handleRemove = async () => {
        if (!userToRemove) return;

        try {
            const response = await apiFetch(`/projects/${project.id}/collaborators/${userToRemove.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to remove collaborator');
            }

            toast.success(`${userToRemove.username} foi removido.`);
            setCollaborators(prev => prev.filter(c => c.id !== userToRemove.id));
            if (onCollaboratorChange) {
                onCollaboratorChange();
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUserToRemove(null);
        }
    };

    if (!open) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-bg-secondary rounded-xl w-full max-w-md border border-primary">
                    <div className="flex justify-between items-center px-5 py-4 border-b border-primary">
                        <h3 className="text-lg font-semibold text-accent-light">{t('project.manage_collaborators')}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <FontAwesomeIcon icon={faTimes} size="lg" />
                        </button>
                    </div>
                    <div className="p-5 max-h-80 overflow-y-auto">
                        {collaborators.length === 0 ? (
                            <p className="text-center text-gray-400">{t('project.no_collaborators')}</p>
                        ) : (
                            <ul className="space-y-3">
                                {collaborators.map(user => (
                                    <li key={user.id} className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-primary/20">
                                        <Link href={`/profile/${user.username}`} className="flex items-center gap-3" onClick={onClose}>
                                            <img src={user.avatar || '/img/default_avatar.png'} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                                            <div>
                                                <p className="font-semibold hover:underline">{user.username}</p>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={() => setUserToRemove(user)}
                                            className="text-red-500/70 hover:text-red-500 transition-colors p-2 rounded-full"
                                            title={t('project.remove_collaborator_title')}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmationPopUp
                open={!!userToRemove}
                onClose={() => setUserToRemove(null)}
                onConfirm={handleRemove}
                title={t('project.remove_collaborator_title')}
                message={t('project.remove_collaborator_confirmation', { user: userToRemove?.username })}
            />
        </>
    );
};

export default ManageCollaboratorsPopup;