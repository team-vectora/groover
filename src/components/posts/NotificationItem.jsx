// src/components/posts/NotificationItem.jsx

"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faComment, faCodeBranch, faStar, faEnvelope, faUserCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

export default function NotificationItem({ notification, onCheck }) {
  const { t } = useTranslation();
  const router = useRouter();
  const currentUsername = typeof window !== 'undefined' ? localStorage.getItem('username') : '';

  const icons = {
    like: faHeart,
    comment: faComment,
    fork: faCodeBranch,
    recomendacao: faStar,
    invitation_received: faEnvelope,
    invite_accepted: faUserCheck,
    collaborator_update: faEdit,
  };

  const { type, actor, content, post_id, project_id, created_at, read } = notification;

  const message = t(type, { user: actor || "Alguém", content: content || "" });

  const handleClick = () => {
    if (!read && onCheck) {
      onCheck();
    }

    switch(type) {
      case 'invitation_received':
        router.push(`/profile/${currentUsername}?tab=invites`);
        break;
      case 'invite_accepted':
      case 'collaborator_update':
        router.push(`/profile/${currentUsername}?tab=musics`);
        break;
      case 'like':
      case 'comment':
        if (post_id) router.push(`/p/${post_id}`);
        break;
      default:
        break;
    }
  };

  return (
      <li
          onClick={handleClick}
          className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition ${
              read ? "opacity-60" : "bg-bg-secondary hover:bg-primary/20"
          }`}
      >
        <FontAwesomeIcon
            icon={icons[type] || faStar}
            className="text-accent w-5 h-5 mt-1"
        />
        <div className="flex flex-col flex-1">
          <span className="text-sm text-foreground">{message}</span>
          <span className="text-xs text-foreground/70">
          {new Date(created_at).toLocaleString()}
        </span>
        </div>
      </li>
  );
}