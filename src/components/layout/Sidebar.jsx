import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faUser,
  faMusic,
  faCalendar,
  faPlus,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
const Sidebar = () => {
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('/img/default_avatar.png');
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const avatarUrlStorage = localStorage.getItem('avatar');
    if (storedUsername) setUsername(storedUsername);
    if (avatarUrlStorage) setAvatarUrl(avatarUrlStorage);
  }, []);

  const navItems = [
    { icon: faHome, label: "Feed", path: "/feed" },
    { icon: faMusic, label: "Editor", path: "/editor" },
    { icon: faCalendar, label: "Eventos", path: "/events" },
  ];

  return (
      <aside className="sticky top-0 left-0 h-fit w-64 p-4 flex flex-col">
        <div className="flex justify-center mb-8">
          <img
              src="/img/groover_logo.png"
              alt="Groover Logo"
              className="w-32"
          />
        </div>

        <nav className="mb-4 ">
          <ul className="space-y-2">
            {navItems.map((item) => (
                <li key={item.path} >
                  <button
                      onClick={() => router.push(item.path)}
                      className="flex items-center w-full p-3 hover:bg-[#1b1b1b] rounded-lg transition-colors"
                  >
                    <FontAwesomeIcon icon={item.icon} className="mr-3 w-6 h-6" />

                    <span>{item.label}</span>
                  </button>
                </li>
            ))}

            {/* Botão Nova Postagem */}
            <li>
              <button
                  onClick={() => router.push(`/profile/${username}?newPost=true`)}
                  className="flex items-center w-full p-3 bg-[#a97f52] hover:bg-[#c1915d] text-white rounded-lg transition-colors mt-2"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-3 w-6 h-6" />
                <span>Nova Postagem</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Seção de perfil e logout logo abaixo do menu */}
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
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/logout');
              }}
              className="flex items-center w-full p-2 mt-2 hover:bg-[#1b1b1b] rounded-lg text-red-400"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 w-6 h-6"  />
            <span>Sair</span>
          </button>
        </div>
      </aside>

  );
};

export default Sidebar;
