"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faComment, faCodeBranch, faStar } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

export default function NotificationItem({ notification, onCheck }) {
  const { t } = useTranslation();
  const router = useRouter();

  const icons = {
    like: faHeart,
    comment: faComment,
    fork: faCodeBranch,
    recomendacao: faStar,
  };

  const { type, actor, content, post_id, created_at, read } = notification;

  const message = t(type, { user: actor || "Alguém", content: content || "" });

  const handleClick = () => {
    if (!read && onCheck) {
      onCheck();
    }

    if (post_id) {
      router.push(`/p/${post_id}`);
    }
  };

  return (
    <li
      onClick={handleClick}
      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition ${
        read ? "opacity-50" : "bg-[#1b1b1b] hover:bg-[#222]"
      }`}
    >
      <FontAwesomeIcon
        icon={icons[type] || faStar}
        className="text-[#a97f52] w-5 h-5 mt-1"
      />

      <div className="flex flex-col flex-1">
        <span className="text-sm">{message}</span>
        <span className="text-xs text-gray-400">
          {new Date(created_at).toLocaleString(t("locale", "pt-BR"))}
        </span>
      </div>

    </li>
  );
}
