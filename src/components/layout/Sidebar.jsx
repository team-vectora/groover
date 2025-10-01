"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faMusic,
  faGear,
  faPlus,
  faSignOutAlt,
  faBell,
  faBars,
  faTimes,
  faSearch,
  faCompactDisc,
  faCompass,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import useNotifications from "../../hooks/posts/useNotifications";
import NotificationItem from "../posts/NotificationItem";
import Image from "next/image";
import { useOutsideClick } from "../../hooks";
import { useTranslation } from "react-i18next";
// import { io } from "socket.io-client";
// import {API_BASE_URL} from "../../config";

const restoreStyle = "color: #8be9fd; font-weight: bold;";

const Sidebar = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("/img/default_avatar.png");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFeedReload, setShowFeedReload] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // O hook agora só nos dá os dados e a função para recarregar
  const { notifications, loading, error, checkNotification, refetch } = useNotifications();

  // <-- INÍCIO DA CORREÇÃO -->
  // Unificamos toda a lógica de WebSocket em um único useEffect
  useEffect(() => {
    // Busca os dados do usuário do localStorage
    const storedUsername = localStorage.getItem("username");
    const storedAvatar = localStorage.getItem("avatar");
    if (storedUsername) setUsername(storedUsername);
    if (storedAvatar && storedAvatar !== "null") setAvatarUrl(storedAvatar);

    // Conexão de socket para produção
    // const socket = io(API_BASE_URL.slice(0, -4), {
    //   withCredentials: true, // permite enviar cookies ou JWT
    //   transports: ["websocket"], // força WebSocket
    // });

    // Ouvinte para a atualização do FEED
    // socket.on("new_post_notification", () => {
    //   setShowFeedReload(true);
    // });
    //
    // // Ouvinte para as NOTIFICAÇÕES PESSOAIS (like, comentário, etc.)
    // socket.on("new_notification", (data) => {
    //   console.log("Nova notificação recebida, recarregando lista...", data);
    //   refetch(); // Chama a função do hook para buscar a nova lista de notificações
    // });

    // Função de limpeza para desconectar o socket quando o componente for desmontado
    return () => {
      // socket.off("new_post_notification");
      // socket.off("new_notification");
      // socket.disconnect();
    };
  }, [pathname, refetch]); // Adicionamos refetch às dependências
  // <-- FIM DA CORREÇÃO -->

  useEffect(() => {
    const handleProfileUpdate = () => {
      const storedAvatar = localStorage.getItem("avatar");
      if (storedAvatar && storedAvatar !== "null") {
        setAvatarUrl(storedAvatar);
      } else {
        setAvatarUrl("/img/default_avatar.png");
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);


  const navItems = [
    { icon: faHome, label: "feed", path: "/feed" },
    { icon: faCompass, label: "explore", path: "/explore" },
    { icon: faSearch, label: "search", path: "/search" },
    { icon: faMusic, label: "editor", path: "/editor/new" },
    { icon: faCompactDisc, label: "livecode", path: "/livecode" },
  ];

  const notifRef = useOutsideClick(() => setIsNotifOpen(false));

  const handleNavigation = (path) => {
    if (pathname === '/feed' && path === '/feed') {
      console.log(`%c[FeedPage] A limpar o cache para o próximo refresh.`, restoreStyle);
      sessionStorage.removeItem('feedState');
      setShowFeedReload(false);
      setIsMenuOpen(false);
      window.location.reload();
      return;
    }
    if (pathname === '/feed' && path !== '/feed') {
      const feedState = JSON.parse(sessionStorage.getItem('feedState') || '{}');
      sessionStorage.setItem('feedState', JSON.stringify({
        ...feedState,
        scrollPosition: window.scrollY
      }));
    }
    router.push(path);
    setIsMenuOpen(false);
  };

  const handleCheckNotification = (notificationId) => {
    // Encontra a notificação para saber o destino
    const notification = notifications.find(n => n._id === notificationId);
    if (!notification) return;

    // Marca como lida
    checkNotification(notificationId);

    // Navega para o local apropriado
    const { type, post_id, project_id } = notification;
    switch(type) {
      case 'invitation_received':
        router.push(`/profile/${username}?tab=invites`);
        break;
      case 'invite_accepted':
      case 'collaborator_update':
        router.push(`/editor/${project_id}`);
        break;
      case 'like':
      case 'comment':
        if (post_id) router.push(`/p/${post_id}`);
        break;
      default:
        break;
    }
    setIsNotifOpen(false); // Fecha o popup de notificações após o clique
  };


  return (
      <>
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-2 bg-bg-secondary border-b border-primary/50">
          <img src="/img/groover_logo.png" alt="Groover Logo" className="w-28" />
          <div className="flex items-center gap-4 absolute right-4">
            <button onClick={() => setIsMenuOpen(true)}>
              <FontAwesomeIcon icon={faBars} className="w-6 h-6 text-text-lighter" />
            </button>
          </div>
        </div>

        <div className={`fixed inset-0 z-50 md:hidden flex ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out`}>
          <div className={`fixed inset-0 bg-black/50 ${isMenuOpen ? "block" : "hidden"}`} onClick={() => setIsMenuOpen(false)} />
          <div className="relative w-64 bg-[#111] p-4 h-full flex flex-col">
            <button onClick={() => setIsMenuOpen(false)} className="mb-6 text-foreground flex items-center gap-2">
              <FontAwesomeIcon icon={faTimes} />
              {t("sidebar.close")}
            </button>
            <nav className="space-y-2 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                  <button key={item.path} onClick={() => handleNavigation(item.path)} className="flex items-center w-full p-3 hover:bg-[var(--color-accent-sidebar)] text-text-lighter rounded-lg transition-colors cursor-pointer">
                    <FontAwesomeIcon icon={item.icon} className="mr-3 w-6 h-6" />
                    <span>{t(`sidebar.${item.label}`)}</span>
                    {item.label === 'feed' && showFeedReload && (
                        <FontAwesomeIcon icon={faSync} className="ml-auto text-accent animate-spin" />
                    )}
                  </button>
              ))}
              <li className="relative" ref={notifRef}>
                <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="flex items-center w-full p-3 hover:bg-[var(--color-accent-sidebar)] rounded-lg transition-colors text-text-lighter cursor-pointer relative z-10">
                  <FontAwesomeIcon icon={faBell} className="mr-3 w-6 h-6" />
                  <span>{t("sidebar.notifications")}</span>
                  {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 text-text-lighter text-[10px] px-1.5 rounded-full bg-primary z-20">
                        {notifications.length > 9 ? "9+" : notifications.length}
                      </span>
                  )}
                </button>
                {isNotifOpen && (
                    <ul className="absolute top-full left-0 mt-2 w-full max-h-96 overflow-y-auto bg-[var(--color-accent-sidebar)] border border-primary rounded-lg shadow-lg z-[9999]">
                      {loading && <li className="p-3 text-sm text-text-lighter">{t("sidebar.loading")}</li>}
                      {error && <li className="p-3 text-sm text-red-400">{error}</li>}
                      {!loading && notifications.length === 0 && (
                          <li className="p-3 text-sm text-text-lighter">{t("sidebar.no_notifications")}</li>
                      )}
                      {notifications.map((notif) => (
                          <NotificationItem key={notif._id} notification={notif} onCheck={() => handleCheckNotification(notif._id)} />
                      ))}
                    </ul>
                )}
              </li>
              <button onClick={() => handleNavigation(`/profile/${username}?newPost=true`)} className="flex items-center w-full p-3 bg-accent hover:bg-accent-light text-text-lighter rounded-lg transition-colors mt-2">
                <FontAwesomeIcon icon={faPlus} className="mr-3 w-6 h-6" />
                <span>{t("sidebar.new_post")}</span>
              </button>
            </nav>
            <div className="border-t border-primary pt-4 mt-4">
              <div className="flex items-center cursor-pointer p-2 hover:bg-accent-sidebar rounded-lg" onClick={() => handleNavigation(`/profile/${username}`)}>
                <Image src={avatarUrl} alt="Avatar" width={40} height={40} className="rounded-full border border-primary mr-3" style={{ objectFit: "cover", aspectRatio: "1 / 1" }} quality={100} />
                <span className="font-medium">{username}</span>
              </div>
              <button onClick={() => handleNavigation("/settings")} className="flex items-center w-full p-2 mt-2 hover:bg-[var(--color-accent-sidebar)] rounded-lg text-text-lighter cursor-pointer">
                <FontAwesomeIcon icon={faGear} className="mr-3 w-6 h-6" />
                <span>{t("sidebar.settings")}</span>
              </button>
              <button onClick={() => { localStorage.clear(); sessionStorage.clear(); handleNavigation("/login"); }} className="flex items-center w-full p-2 mt-2 hover:bg-accent-sidebar rounded-lg text-red-400">
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 w-6 h-6" />
                <span>{t("sidebar.logout")}</span>
              </button>
            </div>
          </div>
        </div>

        <aside className="hidden md:flex sticky top-0 left-0 h-fit w-64 p-4 flex-col">
          <div className="flex justify-center mb-8">
            <img src="/img/groover_logo.png" alt="Groover Logo" className="w-32" />
          </div>
          <nav className="mb-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                  <li key={item.path}>
                    <button onClick={() => handleNavigation(item.path)} className="flex items-center w-full p-3 hover:bg-[var(--color-accent-sidebar)] text-text-lighter rounded-lg transition-colors cursor-pointer">
                      <FontAwesomeIcon icon={item.icon} className="mr-3 w-6 h-6" />
                      <span>{t(`sidebar.${item.label}`)}</span>
                      {item.label === 'feed' && showFeedReload && (
                          <FontAwesomeIcon icon={faSync} className="ml-auto text-accent animate-spin" />
                      )}
                    </button>
                  </li>
              ))}
              <li className="relative" ref={notifRef}>
                <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="flex items-center w-full p-3 hover:bg-[var(--color-accent-sidebar)] rounded-lg transition-colors text-text-lighter cursor-pointer relative z-10">
                  <FontAwesomeIcon icon={faBell} className="mr-3 w-6 h-6" />
                  <span>{t("sidebar.notifications")}</span>
                  {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 text-text-lighter text-[10px] px-1.5 rounded-full bg-primary z-20">
                        {notifications.length > 9 ? "9+" : notifications.length}
                      </span>
                  )}
                </button>
                {isNotifOpen && (
                    <ul className="absolute top-full left-0 mt-2 w-70 max-h-96 overflow-y-auto bg-[var(--color-accent-sidebar)] border border-primary rounded-lg shadow-lg z-[9999]">
                      {loading && <li className="p-3 text-sm text-text-lighter">{t("sidebar.loading")}</li>}
                      {error && <li className="p-3 text-sm text-red-400">{error}</li>}
                      {!loading && notifications.length === 0 && (
                          <li className="p-3 text-sm text-text-lighter">{t("sidebar.no_notifications")}</li>
                      )}
                      {notifications.map((notif) => (
                          <NotificationItem key={notif._id} notification={notif} onCheck={() => handleCheckNotification(notif._id)} />
                      ))}
                    </ul>
                )}
              </li>
              <li>
                <button onClick={() => handleNavigation(`/profile/${username}?newPost=true`)} className="flex items-center w-full p-3 bg-[var(--color-accent)] hover:bg-accent-light text-text-lighter rounded-lg transition-colors mt-2 cursor-pointer">
                  <FontAwesomeIcon icon={faPlus} className="mr-3 w-6 h-6" />
                  <span>{t("sidebar.new_post")}</span>
                </button>
              </li>
            </ul>
          </nav>
          <div className="border-t border-primary pt-4">
            <div className="flex items-center cursor-pointer p-2 hover:bg-[var(--color-accent-sidebar)] rounded-lg text-text-lighter" onClick={() => handleNavigation(`/profile/${username}`)}>
              <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-primary mr-3" style={{ aspectRatio: '1 / 1', objectFit: 'cover', imageRendering: 'auto' }} />
              <span className="font-medium">{username}</span>
            </div>
            <button onClick={() => handleNavigation("/settings")} className="flex items-center w-full p-2 mt-2 hover:bg-[var(--color-accent-sidebar)] rounded-lg text-text-lighter cursor-pointer">
              <FontAwesomeIcon icon={faGear} className="mr-3 w-6 h-6" />
              <span>{t("sidebar.settings")}</span>
            </button>
            <button onClick={() => { localStorage.clear(); sessionStorage.clear(); handleNavigation("/login"); }} className="flex items-center w-full p-2 mt-2 hover:bg-[var(--color-accent-sidebar)] cursor-pointer rounded-lg text-red-400">
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 w-6 h-6" />
              <span>{t("sidebar.logout")}</span>
            </button>
          </div>
        </aside>
      </>
  );
};

export default Sidebar;