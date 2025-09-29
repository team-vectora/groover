import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useHandleInvite } from '../../hooks';
import { useTranslation } from "react-i18next";

const Invite = ({ invite, onActionComplete }) => {
    const { t } = useTranslation();
    const { handleInvite, loading } = useHandleInvite(localStorage.getItem('token'));

    return (
        <div className="bg-bg-secondary rounded-lg p-4 flex items-center justify-between border border-primary-light transition-shadow hover:shadow-lg">
            <div>
                <p className="text-foreground">
                    <Link href={`/profile/${invite.from_user.username}`} className="font-semibold text-accent hover:underline">
                        {invite.from_user.username || t('unknown_user')}
                    </Link>
                    {' '}
                    {t('notifications.invitation_received_text')}
                    {' '}
                    <span className="font-semibold text-accent">{invite.project.title || t('profile.untitled')}</span>
                </p>
                <p className="text-xs text-foreground/70 mt-1">{new Date(invite.created_at).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => handleInvite(invite.id, 'accept', onActionComplete)}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-text-lighter font-bold p-2 rounded-full h-10 w-10 flex items-center justify-center transition-colors disabled:opacity-50"
                    aria-label={t('confirmation.confirm')}
                >
                    <FontAwesomeIcon icon={faCheck} />
                </button>
                <button
                    onClick={() => handleInvite(invite.id, 'reject', onActionComplete)}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-text-lighter font-bold p-2 rounded-full h-10 w-10 flex items-center justify-center transition-colors disabled:opacity-50"
                    aria-label={t('confirmation.cancel')}
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>
        </div>
    );
};

export default Invite;