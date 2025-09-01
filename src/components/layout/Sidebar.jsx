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
} from "@fortawesome/free-solid-svg-icons";
import useNotifications from "../../hooks/posts/useNotifications";
import NotificationItem from "../posts/NotificationItem";

const Sidebar = () => {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/img/default_avatar.png");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // controle menu mobile
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const avatarUrlStorage = localStorage.getItem("avatar");
    const storedToken = localStorage.getItem("token");

    if (storedUsername) setUsername(storedUsername);
    if (avatarUrlStorage) setAvatarUrl(avatarUrlStorage);
    if (storedToken) setToken(storedToken);
  }, []);

  const { notifications, loading, error, refetch, checkNotification } =
    useNotifications(token || "");

  const navItems = [
    { icon: faHome, label: "Feed", path: "/feed" },
    { icon: faMusic, label: "Editor", path: "/editor/new" },
  ];

  return (
    <>
      {/* header celular teste*/}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#111] border-b border-[#333]">
        <img src="/img/groover_logo.png" alt="Groover Logo" className="w-28" />
        <div className="flex items-center gap-4">
          {/* Botão Notificações */}
          <button onClick={() => setIsNotifOpen(!isNotifOpen)}>
            <FontAwesomeIcon icon={faBell} className="w-6 h-6 text-[#a97f52]" />
          </button>

          {/* Botão Menu */}
          <button onClick={() => setIsMenuOpen(true)}>
            <FontAwesomeIcon icon={faBars} className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Drawer Mobile */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-[#111] p-4 transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden z-50`}
      >
        {/* Botão Fechar */}
        <button
          onClick={() => setIsMenuOpen(false)}
          className="mb-6 text-white flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faTimes} />
          Fechar
        </button>

        {/* Navegação */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                router.push(item.path);
                setIsMenuOpen(false);
              }}
              className="flex items-center w-full p-3 hover:bg-[#1b1b1b] rounded-lg transition"
            >
              <FontAwesomeIcon icon={item.icon} className="mr-3 w-6 h-6" />
              <span>{item.label}</span>
            </button>
          ))}

          {/* Nova Postagem */}
          <button
            onClick={() => {
              router.push(`/profile/${username}?newPost=true`);
              setIsMenuOpen(false);
            }}
            className="flex items-center w-full p-3 bg-[#a97f52] hover:bg-[#c1915d] text-white rounded-lg transition-colors mt-2"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-3 w-6 h-6" />
            <span>Nova Postagem</span>
          </button>
        </nav>

        {/* Perfil e Logout */}
        <div className="border-t border-[#4c4e30] pt-4 mt-4">
          <div
            className="flex items-center cursor-pointer p-2 hover:bg-[#1b1b1b] rounded-lg"
            onClick={() => {
              router.push(`/profile/${username}`);
              setIsMenuOpen(false);
            }}
          >
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border border-[#4c4e30] mr-3"
            />
            <span className="font-medium">{username}</span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/logout");
              setIsMenuOpen(false);
            }}
            className="flex items-center w-full p-2 mt-2 hover:bg-[#1b1b1b] rounded-lg text-red-400"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 w-6 h-6" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Teste de responsividade maior */}
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
                  className="flex items-center w-full p-3 hover:bg-[#1b1b1b] rounded-lg transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon icon={item.icon} className="mr-3 w-6 h-6" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}

            {/* Notificações */}
            <li className="relative ">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="flex items-center w-full p-3 hover:bg-[#1b1b1b] rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faBell} className="mr-3 w-6 h-6" />
                <span className="cursor-pointer">Notificações</span>
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 text-white text-[10px] px-1.5 rounded-full bg-[#4c4e30]">
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </span>
                )}
              </button>

              {/* Popup Notificações */}
              {isNotifOpen && (
                <ul className="absolute top-full left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[#1b1b1b] border border-[#4c4e30] rounded-lg shadow-lg z-50">
                  {loading && (
                    <li className="p-3 text-sm text-gray-400">Carregando...</li>
                  )}
                  {error && (
                    <li className="p-3 text-sm text-red-400">{error}</li>
                  )}
                  {!loading && notifications.length === 0 && (
                    <li className="p-3 text-sm text-gray-400">
                      Nenhuma notificação
                    </li>
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
                onClick={() =>
                  router.push(`/profile/${username}?newPost=true`)
                }
                className="flex items-center w-full p-3 bg-[#a97f52] hover:bg-[#c1915d] text-white rounded-lg transition-colors mt-2"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-3 w-6 h-6" />
                <span>Nova Postagem</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Perfil e logout */}
        <div className="border-t border-[#4c4e30] pt-4">
          <div
            className="flex items-center cursor-pointer p-2 hover:bg-[#1b1b1b] rounded-lg"
            onClick={() => router.push(`/profile/${username}`)}
          >
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border border-[#4c4e30] mr-3"
            />
            <span className="font-medium">{username}</span>
          </div>
          <button
              onClick={() => {}}
              className="flex items-center w-full p-2 mt-2 hover:bg-[#1b1b1b] rounded-lg "
          >
            <FontAwesomeIcon icon={faGear} className="mr-3 w-6 h-6" />
            <span>Configurações</span>
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/logout");
            }}
            className="flex items-center w-full p-2 mt-2 hover:bg-[#1b1b1b] rounded-lg text-red-400"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 w-6 h-6" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
