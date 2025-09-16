import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import useOutsideClick from '../../hooks/posts/useOutsideClick';
import useDebounce from '../../hooks/search/useDebounce';
import { API_BASE_URL } from '../../config';
import { toast } from 'react-toastify';

const SharePopUp = ({ open, onClose, project, onShare }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const popupRef = useOutsideClick(onClose);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const searchUsers = async () => {
      if (debouncedSearchTerm.length < 3) {
        setUsers([]);
        return;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/users/search?q=${debouncedSearchTerm}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Search error:", error);
        toast.error(t('errors.network_error'));
      }
      setLoading(false);
    };

    searchUsers();
  }, [debouncedSearchTerm, t]);

  const handleInvite = (username) => {
    if (!username) {
      toast.error(t('sharePopup.errorEmpty'));
      return;
    }
    onShare(project.id, username);
    onClose();
  };

  if (!open) return null;

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div ref={popupRef} className="bg-bg-secondary rounded-xl w-full max-w-md border border-primary">
          <div className="flex justify-between items-center px-5 py-4 border-b border-primary">
            <h3 className="text-lg font-semibold text-accent-light">{t('sharePopup.inviteTo')} {project.title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>
          <div className="p-5">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('sharePopup.placeholder')}
                className="w-full p-3 bg-bg-darker border border-primary rounded-md text-white focus:outline-none focus:border-accent-light"
            />
            <div className="mt-4 max-h-60 overflow-y-auto">
              {loading && <p>{t('sharePopup.loading')}</p>}
              {!loading && users.length === 0 && searchTerm.length >= 3 && <p>{t('sharePopup.noUsers')}</p>}
              <ul className="space-y-2">
                {users.map(user => (
                    <li key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-primary/30">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar || '/img/default_avatar.png'} alt={user.username} className="w-10 h-10 rounded-full" />
                        <span>{user.username}</span>
                      </div>
                      <button
                          onClick={() => handleInvite(user.username)}
                          className="px-3 py-1 bg-accent hover:bg-accent-light text-sm rounded-md"
                      >
                        {t('sharePopup.sendInvite')}
                      </button>
                    </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
};

export default SharePopUp;