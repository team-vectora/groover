"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "@fortawesome/free-solid-svg-icons";
import useNotifications from "../../hooks/posts/useNotifications";
import NotificationItem from "../posts/NotificationItem";
import Image from "next/image";
import { useOutsideClick } from "../../hooks";
import { useTranslation } from "react-i18next";

const Sidebar = () => {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("/img/default_avatar.png");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedAvatar = localStorage.getItem("avatar");
    const storedToken = localStorage.getItem("token");

    if (storedUsername) setUsername(storedUsername);
    if (storedToken) setToken(storedToken);
    if (storedAvatar && storedAvatar !== "null") setAvatarUrl(storedAvatar);
  }, []);

  const { notifications, loading, error, refetch, checkNotification } =
    useNotifications(token || "");

  const navItems = [
    { icon: faHome, label: "feed", path: "/feed" },
    { icon: faSearch, label: "search", path: "/search" },
    { icon: faMusic, label: "editor", path: "/editor/new" },
    { icon: faCompactDisc, label: "livecode", path: "/livecode" },
  ];

  const notifRef = useOutsideClick(() => setIsNotifOpen(false));

  return (
    <>

    <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-2 bg-bg-secondary border-b border-primary/50">
      <img src="/img/groover_logo.png" alt="Groover Logo" className="w-28" />
      <div className="flex items-center gap-4 absolute right-4">
        {/* Botão abrir menu */}
        <button onClick={() => setIsMenuOpen(true)}>
          <FontAwesomeIcon icon={faBars} className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>


      {/* Drawer Mobile */}
      <div
        className={`fixed inset-0 z-50 md:hidden flex ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        {/* Fundo semitransparente */}
        <div
          className={`fixed inset-0 bg-black/50 ${isMenuOpen ? "block" : "hidden"}`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Sidebar drawer */}
        <div className="relative w-64 bg-[#111] p-4 h-full flex flex-col">
          {/* Botão Fechar */}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="mb-6 text-foreground flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faTimes} />
            {t("sidebar.close")}
          </button>

          {/* Navegação */}
          <nav className="space-y-2 flex-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full p-3 hover:bg-[var(--color-accent-sidebar)] text-text-lighter rounded-lg transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={item.icon} className="mr-3 w-6 h-6" />
                <span>{t(`sidebar.${item.label}`)}</span>
              </button>
            ))}
                        <li className="relative" ref={notifRef}>
                          <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="flex items-center w-full p-3 hover:bg-[var(--color-accent-sidebar)] rounded-lg transition-colors text-text-lighter cursor-pointer relative z-10"
                          >
                            <FontAwesomeIcon icon={faBell} className="mr-3 w-6 h-6" />
                            <span>{t("sidebar.notifications")}</span>
                            {notifications.length > 0 && (
                              <span className="absolute top-1 right-1 text-text-lighter text-[10px] px-1.5 rounded-full bg-primary z-20">
                                {notifications.length > 9 ? "9+" : notifications.length}
                              </span>
                            )}
                          </button>

                          {/* Popup Notificações */}
                          {isNotifOpen && (
                            <ul className="absolute top-full left-0 mt-2 w-full max-h-96 overflow-y-auto bg-[var(--color-accent-sidebar)] border border-primary rounded-lg shadow-lg z-[9999]">
                              {loading && <li className="p-3 text-sm text-gray-400">{t("sidebar.loading")}</li>}
                              {error && <li className="p-3 text-sm text-red-400">{error}</li>}
                              {!loading && notifications.length === 0 && (
                                <li className="p-3 text-sm text-gray-400">{t("sidebar.no_notifications")}</li>
                              )}
                              {notifications.map((notif) => (
                                <NotificationItem
                                  key={notif._id}
                                  notification={notif}
                                  onCheck={() => checkNotification(notif._id)}
                                />
                              ))}
                            </ul>
                          )}
                        </li>
            {/* Nova Postagem */}
            <button
              onClick={() => {
                router.push(`/profile/${username}?newPost=true`);
                setIsMenuOpen(false);
              }}
              className="flex items-center w-full p-3 bg-accent hover:bg-accent-light text-white rounded-lg transition-colors mt-2"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-3 w-6 h-6" />
              <span>{t("sidebar.new_post")}</span>
            </button>
          </nav>

          {/* Perfil e Logout */}
          <div className="border-t border-primary pt-4 mt-4">
            <div
              className="flex items-center cursor-pointer p-2 hover:bg-accent-sidebar rounded-lg"
              onClick={() => {
                router.push(`/profile/${username}`);
                setIsMenuOpen(false);
              }}
            >

            <Image
              src={avatarUrl}
              alt="Avatar"
              width={40}
              height={40}
              className="rounded-full border border-primary mr-3"
              style={{
                objectFit: "cover",
                aspectRatio: "1 / 1",
              }}
              quality={100}
            />

              <span className="font-medium">{username}</span>
            </div>
                      <button
                        onClick={() => router.push("/settings")}
                        className="flex items-center w-full p-2 mt-2 hover:bg-[var(--color-accent-sidebar)] rounded-lg text-text-lighter cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faGear} className="mr-3 w-6 h-6" />
                        <span>{t("sidebar.settings")}</span>
                      </button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/logout");
                setIsMenuOpen(false);
              }}
              className="flex items-center w-full p-2 mt-2 hover:bg-accent-sidebar rounded-lg text-red-400"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 w-6 h-6" />
              <span>{t("sidebar.logout")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex sticky top-0 left-0 h-fit w-64 p-4 flex-col">
        <div className="flex justify-center mb-8">
          <img src="/img/groover_logo.png" alt="Groover Logo" className="w-32" />
        </div>

        <nav className="mb-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => router.push(item.path)}
                  className="flex items-center w-full p-3 hover:bg-[var(--color-accent-sidebar)] text-text-lighter rounded-lg transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon icon={item.icon} className="mr-3 w-6 h-6" />
                  <span>{t(`sidebar.${item.label}`)}</span>
                </button>
              </li>
            ))}

            {/* Notificações */}
            <li className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="flex items-center w-full p-3 hover:bg-[var(--color-accent-sidebar)] rounded-lg transition-colors text-text-lighter cursor-pointer relative z-10"
              >
                <FontAwesomeIcon icon={faBell} className="mr-3 w-6 h-6" />
                <span>{t("sidebar.notifications")}</span>
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 text-text-lighter text-[10px] px-1.5 rounded-full bg-primary z-20">
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </span>
                )}
              </button>

              {/* Popup Notificações */}
              {isNotifOpen && (
                <ul className="absolute top-full left-0 mt-2 w-70 max-h-96 overflow-y-auto bg-[var(--color-accent-sidebar)] border border-primary rounded-lg shadow-lg z-[9999]">
                  {loading && <li className="p-3 text-sm text-gray-400">{t("sidebar.loading")}</li>}
                  {error && <li className="p-3 text-sm text-red-400">{error}</li>}
                  {!loading && notifications.length === 0 && (
                    <li className="p-3 text-sm text-gray-400">{t("sidebar.no_notifications")}</li>
                  )}
                  {notifications.map((notif) => (
                    <NotificationItem
                      key={notif._id}
                      notification={notif}
                      onCheck={() => checkNotification(notif._id)}
                    />
                  ))}
                </ul>
              )}
            </li>


            {/* Botão Nova Postagem */}
            <li>
              <button
                onClick={() => router.push(`/profile/${username}?newPost=true`)}
                className="flex items-center w-full p-3 bg-[var(--color-accent)] hover:bg-accent-light text-white rounded-lg transition-colors mt-2 cursor-pointer"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-3 w-6 h-6" />
                <span>{t("sidebar.new_post")}</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Perfil e Logout */}
        <div className="border-t border-primary pt-4">
          <div
            className="flex items-center cursor-pointer p-2 hover:bg-[var(--color-accent-sidebar)] rounded-lg text-text-lighter"
            onClick={() => router.push(`/profile/${username}`)}
          >
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border border-primary mr-3"
              style={{
                aspectRatio: '1 / 1',
                objectFit: 'cover',
                imageRendering: 'auto',
              }}
            />

            <span className="font-medium">{username}</span>
          </div>
          <button
            onClick={() => router.push("/settings")}
            className="flex items-center w-full p-2 mt-2 hover:bg-[var(--color-accent-sidebar)] rounded-lg text-text-lighter cursor-pointer"
          >
            <FontAwesomeIcon icon={faGear} className="mr-3 w-6 h-6" />
            <span>{t("sidebar.settings")}</span>
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/logout");
            }}
            className="flex items-center w-full p-2 mt-2 hover:bg-[var(--color-accent-sidebar)] cursor-pointer rounded-lg text-red-400"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 w-6 h-6" />
            <span>{t("sidebar.logout")}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
