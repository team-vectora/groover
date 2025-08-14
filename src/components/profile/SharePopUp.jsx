import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const SharePopup = ({ open, onClose, project, onShare }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onShare(project.id, username);
      onClose();
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  if (!open) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-[#121113] rounded-xl w-full max-w-md border border-[#4c4e30]">
          <div className="flex justify-between items-center px-5 py-4 border-b border-[#4c4e30]">
            <h3 className="text-lg font-semibold text-[#c1915d]">
              Compartilhar Projeto
            </h3>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5">
            <div className="mb-5">
              <label className="block mb-2 text-sm text-gray-300">
                Nome de usuário
              </label>
              <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite o nome de usuário"
                  className="w-full p-3 bg-[#070608] border border-[#4c4e30] rounded-md text-white focus:outline-none focus:border-[#c1915d]"
                  required
              />
            </div>

            <button
                type="submit"
                className="w-full py-3 bg-[#a97f52] hover:bg-[#c1915d] text-white font-semibold rounded-md transition"
            >
              Enviar Convite
            </button>
          </form>
        </div>
      </div>
  );
};

export default SharePopup;