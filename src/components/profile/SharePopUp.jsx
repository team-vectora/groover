'use client';
import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import useOutsideClick from '../../hooks/posts/useOutsideClick';
import { useTranslation } from 'react-i18next';

const SharePopup = ({ open, onClose, project, onShare }) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const popupRef = useOutsideClick(onClose);

  // Debounce para a busca
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const fetchUsers = async (query) => {
    if (query.length < 5) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/users/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 500), []);

  useEffect(() => {
    debouncedFetchUsers(username);
  }, [username, debouncedFetchUsers]);

  const handleSelectUser = (selectedUsername) => {
    setUsername(selectedUsername);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error(t('sharePopup.errorEmpty'));
      return;
    }
    try {
      await onShare(project.id, username);
      onClose();
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div ref={popupRef} className="bg-bg-secondary rounded-xl w-full max-w-md border border-primary">
        <div className="flex justify-between items-center px-5 py-4 border-b border-primary">
          <h3 className="text-lg font-semibold text-accent-light">
            {t('sharePopup.inviteTo')} {project.title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-5 relative">
            <label className="block mb-2 text-sm text-gray-300">
              {t('sharePopup.username')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('sharePopup.placeholder')}
              className="w-full p-3 bg-bg-darker border border-primary rounded-md text-white focus:outline-none focus:border-accent-light"
              required
              autoComplete="off"
            />
            {loading && <div className="text-xs text-accent mt-1">{t('sharePopup.loading')}</div>}
            {suggestions.length > 0 && (
              <ul className="absolute w-full bg-bg-darker border border-primary mt-1 rounded-md max-h-40 overflow-y-auto z-10">
                {suggestions.map(user => (
                  <li
                    key={user.id}
                    onClick={() => handleSelectUser(user.username)}
                    className="p-2 hover:bg-primary cursor-pointer text-foreground"
                  >
                    {user.username}
                  </li>
                ))}
              </ul>
            )}
            {username.length >= 5 && !loading && suggestions.length === 0 && (
              <div className="text-xs text-gray-400 mt-1">{t('sharePopup.noUsers')}</div>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-md transition"
          >
            {t('sharePopup.sendInvite')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SharePopup;
