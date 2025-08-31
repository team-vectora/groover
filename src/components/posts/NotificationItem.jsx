import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faComment,
  faCodeBranch,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

export default function NotificationItem({ notification, lang = "pt" }) {
  const icons = {
    curtida: faHeart,
    comentario: faComment,
    fork: faCodeBranch,
    recomendacao: faStar,
  };

  const templates = {
    pt: {
      curtida: "{actor} curtiu seu post",
      comentario: "{actor} comentou: {content}",
      fork: "{actor} fez fork do seu projeto",
      recomendacao: "{actor} recomendou seu projeto",
    },
    en: {
      curtida: "{actor} liked your post",
      comentario: "{actor} commented: {content}",
      fork: "{actor} forked your project",
      recomendacao: "{actor} recommended your project",
    },
  };

  const { type, actor_name, content, created_at } = notification;

  const template =
    templates[lang]?.[type] || templates["pt"].curtida;
  const message = template
    .replace("{actor}", actor_name || "Alguém")
    .replace("{content}", content || "");

  return (
    <li className="flex items-start gap-3 p-3 rounded-lg bg-[#1b1b1b] hover:bg-[#222] cursor-pointer transition">
      <FontAwesomeIcon
        icon={icons[type] || faStar}
        className="text-[#a97f52] w-5 h-5 mt-1"
      />
      <div className="flex flex-col">
        <span className="text-sm">{message}</span>
        <span className="text-xs text-gray-400">
          {new Date(created_at).toLocaleString(lang === "pt" ? "pt-BR" : "en-US")}
        </span>
      </div>
    </li>
  );
}
