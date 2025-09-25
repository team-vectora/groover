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

const ConfigUserPopUp = ({ open, onClose, username, bio, profilePic, onSuccess, isOnboarding = false, onSkip }) => {
  const { t } = useTranslation();
  const [musicTags, setMusicTags] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("/img/default_avatar.png");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [changedBio, setChangedBio] = useState(bio || "");
  const [profilePicFile, setProfilePicFile] = useState(null);

  const popupRef = useOutsideClick(() => !isOnboarding && onClose());

  useEffect(() => {
    setChangedBio(bio || "");
    setPreviewUrl(profilePic || "/img/default_avatar.png");
  }, [bio, profilePic]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let profilePicUrl = profilePic;
      if (profilePicFile) {
        // Passa o tipo 'avatar' para usar o endpoint correto
        profilePicUrl = await uploadToCloudinary(profilePicFile, 'avatar');
      }

      const res = await fetch(`${API_BASE_URL}/users/config`, {
        method: "PUT",
        body: JSON.stringify({ avatar: profilePicUrl, music_tags: musicTags, bio: changedBio }),
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("avatar", profilePicUrl);
        window.dispatchEvent(new Event('profileUpdated'));
        toast.success(t('configUserPopup.profileUpdatedSuccess'));
        if (onSuccess) onSuccess();
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
      setProfilePicFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const toggleTag = (tag) => {
    setMusicTags((prev) => prev.includes(tag) ? prev.filter(t => t !== tag) : (prev.length < 5 ? [...prev, tag] : prev));
    if (musicTags.length >= 5 && !musicTags.includes(tag)) {
      toast.warn(t('configUserPopup.maxGenresWarning'));
    }
  };

  const popUpContent = (
      <div ref={popupRef} className="bg-bg-secondary rounded-xl w-full max-w-md border border-primary">
        <div className="flex justify-between items-center px-5 py-4 border-b border-primary">
          <h3 className="text-lg font-semibold text-accent-light">{t('configUserPopup.configureProfile')}</h3>
          {!isOnboarding && (
              <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-white">
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-5 text-center">
            <label className="block mb-2 text-sm text-gray-300">{t('configUserPopup.profilePicture')}</label>
            <div className="inline-block relative">
              <img src={previewUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-primary-light"/>
              <button type="button" onClick={() => fileInputRef.current.click()} className="absolute -bottom-1 -right-1 bg-accent hover:bg-accent-light text-white w-8 h-8 flex items-center justify-center rounded-full shadow transition-transform hover:scale-110">
                +
              </button>
            </div>
            <input id="file-upload" type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden"/>
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-sm text-gray-300">{t('configUserPopup.bio')}</label>
            <textarea value={changedBio} onChange={(e) => setChangedBio(e.target.value)} placeholder={t('configUserPopup.bioPlaceholder')}
                      rows={2} maxLength={50} className="w-full p-3 bg-bg-darker border border-primary rounded-md text-white focus:outline-none focus:border-accent-light"/>
            <div className="text-right text-xs text-primary-light mt-1">{changedBio.length}/50</div>
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-sm text-gray-300">{t('configUserPopup.selectGenres')}</label>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-bg-darker border border-primary rounded-md">
              {GENRES.map((tag) => (
                  <button key={tag} type="button" onClick={() => toggleTag(tag)}
                          className={`px-2 py-1 rounded-full text-center text-xs transition ${musicTags.includes(tag) ? "bg-primary text-white font-semibold" : "bg-bg-secondary text-foreground hover:bg-accent-sidebar"}`}>
                    {t(`genres.${tag}`)}
                  </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button type="submit" disabled={isSubmitting} className={`w-full py-3 rounded-md font-semibold flex justify-center items-center ${isSubmitting ? "bg-accent-light cursor-not-allowed" : "bg-accent hover:bg-accent-light"}`}>
              {isSubmitting ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : t('configUserPopup.saveChanges')}
            </button>
            {isOnboarding && (
                <button type="button" onClick={onSkip} className="w-full py-2 text-sm text-gray-400 hover:text-white transition">
                  {t('profileSetup.skip')}
                </button>
            )}
          </div>
        </form>
      </div>
  );

  if (!open) return null;

  // Se for onboarding, renderiza diretamente. Senão, usa o wrapper de popup.
  return isOnboarding ? popUpContent : (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        {popUpContent}
      </div>
  );
};

export default ConfigUserPopUp;