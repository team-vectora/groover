import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const ProfileHeader = ({
                           user,
                           isCurrentUser,
                           onEdit,
                           onLogout
                       }) => {
    const getFavoriteGenres = () => {
        if (!user?.genres || Object.keys(user.genres).length === 0) return [];

        return Object.entries(user.genres)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([genre]) => genre);
    };

    return (
        <div className="bg-[#121113] rounded-lg p-6 mb-6 border border-[#4c4e30]">
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                    <Image
                        src={user?.avatar || "/img/default_avatar.png"}
                        alt="Avatar"
                        width={120}
                        height={120}
                        className="rounded-full border-2 border-[#4c4e30]"
                    />
                    {isCurrentUser && (
                        <button
                            onClick={onEdit}
                            className="absolute -bottom-2 -right-2 bg-[#a97f52] hover:bg-[#c1915d] text-white p-2 rounded-full shadow transition-transform hover:rotate-45"
                            title="Editar Perfil"
                        >
                            <FontAwesomeIcon icon={faCog} />
                        </button>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-[#c1915d] mb-2">
                        {user?.username || "Usuário"}
                    </h1>

                    <p className="text-gray-300 mb-4">{user?.bio}</p>

                    <div className="flex justify-center md:justify-start gap-6 mb-4">
                        <div>
                            <span className="font-bold">{user?.followers?.length || 0}</span>
                            <span className="text-gray-400 ml-1">Seguidores</span>
                        </div>
                        <div>
                            <span className="font-bold">{user?.following?.length || 0}</span>
                            <span className="text-gray-400 ml-1">Seguindo</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {getFavoriteGenres().map((genre) => (
                            <span
                                key={genre}
                                className="px-3 py-1 bg-[#4c4e30] text-white rounded-full text-sm"
                            >
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </span>
                        ))}
                    </div>
                </div>

                {isCurrentUser && (
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        Sair
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProfileHeader;