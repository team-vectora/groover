import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { uploadToCloudinary } from '../../lib/util/upload';

const GENRES = [
  "rock", "pop", "jazz", "blues", "rap", "hip hop", "r&b", "reggae",
  "samba", "mpb", "bossa nova", "funk", "sertanejo", "forró", "axé",
  "pagode", "indie", "metal", "heavy metal", "trap", "lo-fi", "electronic",
  "house", "techno", "trance", "drum and bass", "dubstep", "k-pop", "j-pop",
  "classical", "opera", "gospel", "country", "folk", "punk", "hardcore",
  "grunge", "soul", "disco", "reggaeton", "cumbia", "tango", "flamenco",
  "chillout", "ambient", "experimental"
];

const ConfigUserPopUp = ({ open, onClose, username, bio, profilePic, setProfilePic, favoriteTags = [] }) => {
  const [musicTags, setMusicTags] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("/img/default_avatar.png");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [changedBio, setChangedBio] = useState(bio || "");
  const [changedProfilePic, setChangedProfilePic] = useState(profilePic);

  useEffect(() => {
    if (favoriteTags.length > 0) {
      setMusicTags(favoriteTags);
    }
  }, [favoriteTags]);

  useEffect(() => {
    setChangedBio(bio || "");
  }, [bio]);

  useEffect(() => {
    if (profilePic instanceof File) {
      setPreviewUrl(URL.createObjectURL(profilePic));
    } else if (typeof profilePic === "string" && profilePic !== "") {
      setPreviewUrl(profilePic);
    } else {
      setPreviewUrl("/img/default_avatar.png");
    }
  }, [profilePic]);

  const toggleTag = (tag) => {
    if (musicTags.includes(tag)) {
      setMusicTags(musicTags.filter((t) => t !== tag));
    } else {
      if (musicTags.length < 5) {
        setMusicTags([...musicTags, tag]);
      } else {
        alert("Você pode selecionar no máximo 5 gêneros musicais.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem("token");
    let profilePicUrl = changedProfilePic;

    try {
      if (changedProfilePic instanceof File) {
        profilePicUrl = await uploadToCloudinary(changedProfilePic);
      }

      const res = await fetch("http://localhost:5000/api/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          avatar: profilePicUrl,
          music_tags: musicTags,
          bio: changedBio,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("avatar", profilePicUrl);
        alert("Perfil atualizado com sucesso!");
        window.location.reload(); // Recarrega a página para atualizar os dados
        onClose();
      } else {
        alert(data.error || "Erro ao atualizar");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao conectar com a API");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setChangedProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  if (!open) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-[#121113] rounded-xl w-full max-w-md border border-[#4c4e30]">
          <div className="flex justify-between items-center px-5 py-4 border-b border-[#4c4e30]">
            <h3 className="text-lg font-semibold text-[#c1915d]">
              Configurar Perfil
            </h3>
            <button
                onClick={onClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-white"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5">
            <div className="mb-5">
              <label className="block mb-2 text-sm text-gray-300">
                Foto de perfil
              </label>
              <div className="flex justify-center items-center mb-3">
                <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border border-[#61673e]"
                />
              </div>
              <label
                  htmlFor="file-upload"
                  className="inline-block px-4 py-2 rounded-md cursor-pointer select-none transition-colors bg-[#4c4e30] text-white hover:bg-[#61673e]"
              >
                Selecionar nova foto
              </label>
              <input
                  id="file-upload"
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm text-gray-300">
                Bio
              </label>
              <textarea
                  value={changedBio}
                  onChange={(e) => setChangedBio(e.target.value)}
                  placeholder="Fale um pouco sobre você..."
                  rows={2}
                  maxLength={50}
                  className="w-full p-3 bg-[#070608] border border-[#4c4e30] rounded-md text-white focus:outline-none focus:border-[#c1915d]"
              />
              <div className="text-right text-xs text-[#61673e] mt-1">
                {changedBio.length}/50
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm text-gray-300">
                Escolha até 5 gêneros musicais
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-[#070608] border border-[#4c4e30] rounded-md">
                {GENRES.map((tag) => (
                    <button
                        key={tag}
                        type="button"
                        className={`px-2 py-1 rounded-full text-center transition ${
                            musicTags.includes(tag)
                                ? "bg-[#4c4e30] text-white font-semibold"
                                : "bg-[#121113] text-[#e6e8e3] hover:bg-[#1b1b1b]"
                        }`}
                        onClick={() => toggleTag(tag)}
                    >
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </button>
                ))}
              </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-md font-semibold flex justify-center items-center ${
                    isSubmitting
                        ? "bg-[#c1915d] cursor-not-allowed"
                        : "bg-[#a97f52] hover:bg-[#c1915d]"
                }`}
            >
              {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                  "Salvar alterações"
              )}
            </button>
          </form>
        </div>
      </div>
  );
};

export default ConfigUserPopUp;