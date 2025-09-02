// src/components/profile/FollowListPopup.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

const FollowListPopup = ({ title, users, onClose, isLoading }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-bg-secondary rounded-xl w-full max-w-md border border-primary">
                <div className="flex justify-between items-center px-5 py-4 border-b border-primary">
                    <h3 className="text-lg font-semibold text-accent-light">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                </div>
                <div className="p-5 max-h-80 overflow-y-auto">
                    {isLoading ? (
                        <p>Carregando...</p>
                    ) : users.length === 0 ? (
                        <p>Nenhum usuário encontrado.</p>
                    ) : (
                        <ul className="space-y-3">
                            {users.map(user => (
                                <li key={user.id} className="flex items-center gap-3">
                                    <img src={user.avatar || '/img/default_avatar.png'} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <Link href={`/profile/${user.username}`} className="font-semibold hover:underline" onClick={onClose}>
                                            {user.username}
                                        </Link>
                                        <p className="text-sm text-gray-400">{user.bio}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowListPopup;