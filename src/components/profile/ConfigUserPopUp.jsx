// src/components/profile/ConfigUserPopUp.jsx
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { uploadToCloudinary } from '../../lib/util/upload';
import useOutsideClick from '../../hooks/posts/useOutsideClick';
import { toast } from 'react-toastify';
import { GENRES } from '../../constants';
import { API_BASE_URL } from "../../config";
import { useTranslation } from 'react-i18next';

const ConfigUserPopUp = ({ open, onClose, username, bio, profilePic, setProfilePic, favoriteTags = [], onSuccess }) => {
  const { t } = useTranslation();
  const [musicTags, setMusicTags] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("/img/default_avatar.png");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [changedBio, setChangedBio] = useState(bio || "");
  const [changedProfilePic, setChangedProfilePic] = useState(profilePic);

  const popupRef = useOutsideClick(onClose);

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



  useEffect(() => {
    if (favoriteTags && Object.keys(favoriteTags).length > 0) {
      const topTags = Object.entries(favoriteTags)
          .filter(([tag, value]) => value > 0)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([tag]) => tag);

      setMusicTags(topTags);
    }
  }, [favoriteTags]);

  const toggleTag = (tag) => {
    setMusicTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter((t) => t !== tag);
      } else {
        if (prevTags.length >= 5) {
          toast.warn(t('configUserPopup.maxGenresWarning'));
          return prevTags;
        }
        return [...prevTags, tag];
      }
    });
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

    const res = await fetch(`${API_BASE_URL}/users/config`, {
      method: "PUT",
      body: JSON.stringify({          avatar: profilePicUrl,
                                       music_tags: musicTags,
                                       bio: changedBio,}),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });


      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("avatar", profilePicUrl);
        window.dispatchEvent(new Event('profileUpdated'));
        toast.success(t('configUserPopup.profileUpdatedSuccess'));
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(data.error || t('configUserPopup.updateError'));
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error(t('configUserPopup.apiError'));
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div ref={popupRef} className="bg-bg-secondary rounded-xl w-full max-w-md border border-primary">
          <div className="flex justify-between items-center px-5 py-4 border-b border-primary">
            <h3 className="text-lg font-semibold text-accent-light">{t('configUserPopup.configureProfile')}</h3>
            <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-white">
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5">
            <div className="mb-5">
              <label className="block mb-2 text-sm text-gray-300">{t('configUserPopup.profilePicture')}</label>
              <div className="flex justify-center items-center mb-3">
                <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border border-primary-light"
                />
              </div>
              <label
                  htmlFor="file-upload"
                  className="inline-block px-4 py-2 rounded-md cursor-pointer select-none transition-colors bg-primary text-white hover:bg-primary-light"
              >
                {t('configUserPopup.selectNewPhoto')}
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
              <label className="block mb-2 text-sm text-gray-300">{t('configUserPopup.bio')}</label>
              <textarea
                  value={changedBio}
                  onChange={(e) => setChangedBio(e.target.value)}
                  placeholder={t('configUserPopup.bioPlaceholder')}
                  rows={2}
                  maxLength={50}
                  className="w-full p-3 bg-bg-darker border border-primary rounded-md text-white focus:outline-none focus:border-accent-light"
              />
              <div className="text-right text-xs text-primary-light mt-1">{changedBio.length}/50</div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm text-gray-300">{t('configUserPopup.selectGenres')}</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-bg-darker border border-primary rounded-md">
                {GENRES.map((tag) => (
                    <button
                        key={tag}
                        type="button"
                        className={`px-2 py-1 rounded-full text-center transition ${
                            musicTags.includes(tag)
                                ? "bg-primary text-white font-semibold"
                                : "bg-bg-secondary text-foreground hover:bg-accent-sidebar"
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
                    isSubmitting ? "bg-accent-light cursor-not-allowed" : "bg-accent hover:bg-accent-light"
                }`}
            >
              {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                  t('configUserPopup.saveChanges')
              )}
            </button>
          </form>
        </div>
      </div>
  );
};

export default ConfigUserPopUp;