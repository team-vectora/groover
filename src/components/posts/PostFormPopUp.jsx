'use client'

import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { uploadToCloudinary } from '../../lib/util/upload';
import { GENRES } from '../../constants'
import useOutsideClick from '../../hooks/posts/useOutsideClick';
import { toast } from 'react-toastify';
import {API_BASE_URL} from "../../config";
import { useTranslation } from 'react-i18next';


const PostFormPopUp = ({ open, onClose, projects, isComment = false, postId = null, initialCaption = '', onPostCreated }) => {
  const { t } = useTranslation();
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const popupRef = useOutsideClick(onClose);

  useEffect(() => {
    setCaption(initialCaption);
  }, [initialCaption]);

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      if (selectedGenres.length < 5) {
        setSelectedGenres([...selectedGenres, genre]);
      } else {
        toast.warn(t('postForm.maxTagsWarning'));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      let photoUrls = [];

      if (images.length > 0) {
        photoUrls = await Promise.all(
            images.map((file) => uploadToCloudinary(file))
        );
      }

      const url = isComment ? `${API_BASE_URL}/posts/${postId}/comment` : `${API_BASE_URL}/posts`;
      const body = {
        caption,
        photos: photoUrls,
        project_id: selectedProject,
        genres: selectedGenres,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setCaption("");
        setImages([]);
        setPreviews([]);
        setSelectedGenres([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onClose();
        if (onPostCreated) {
          onPostCreated();
        }
      } else {
        toast.error(data.error || t('toasts.error_creating_post'));
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error(t('errors.api_connection_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 5) {
      alert(t('alerts.max_images'));
      return;
    }

    setImages((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  if (!open) return null;

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
        <div ref={popupRef} className="bg-bg-secondary: rounded-xl w-full max-w-6xl border border-primary flex flex-col md:flex-row overflow-hidden">

          {/* Form (agora à esquerda) */}
          <div className="md:w-1/2 p-5 flex flex-col bg-bg-secondary">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-accent-light">
                {isComment ? t('postForm.addComment') : t('postForm.createPublication')}
              </h3>

              <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-white"
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>

            <div className="mb-5">
              <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={isComment ? t('postForm.commentPlaceholder') : t('postForm.captionPlaceholder')}
                  rows={4}
                  maxLength={500}
                  className="w-full p-3 bg-bg-darker border border-primary rounded-md text-white focus:outline-none focus:border-accent-light"
              />
              <div className="text-right text-xs text-primary-light mt-1">
                {caption.length}/500
              </div>
            </div>

            <label className="block mb-2 text-sm text-gray-300">{t('postForm.selectTags')}</label>
            <div className="grid grid-cols-3 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 mb-4 bg-bg-darker border border-primary rounded-md">
              {GENRES.map((genre) => (
                  <button
                      key={genre}
                      type="button"
                      className={`px-2 py-1 rounded-full text-center transition ${
                          selectedGenres.includes(genre)
                              ? "bg-primary text-white font-semibold"
                              : "bg-bg-secondary text-foreground hover:bg-text-lighter"
                      }`}
                      onClick={() => toggleGenre(genre)}
                  >
                    {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </button>
              ))}
            </div>

            <button
                type="submit"
                disabled={isSubmitting || (!caption && images.length === 0)}
                className={`w-full py-3 rounded-md font-semibold flex justify-center items-center mt-auto ${
                    isSubmitting || (!caption && images.length === 0)
                        ? "bg-accent-light cursor-not-allowed opacity-70"
                        : "bg-accent hover:bg-accent-light"
                }`}
                onClick={handleSubmit}
            >
              {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (isComment ? t('postForm.comment') : t('postForm.publish'))}
            </button>
          </div>

          {/* Preview + Projeto (agora à direita) */}
          <div className="md:w-1/2 p-5 border-t md:border-t-0 md:border-l border-primary: flex flex-col items-center bg-bg-secondary">
            {previews.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-4 w-full">
                  {previews.map((preview, index) => (
                      <div key={index} className="relative rounded-md overflow-hidden aspect-square border border-primary">
                        <img
                            src={preview.url}
                            alt={preview.name}
                            className="object-cover w-full h-full"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black bg-opacity-70 text-white hover:bg-red-600 flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faTimes} size="xs" />
                        </button>
                      </div>
                  ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary rounded-md mb-4 text-primary-light w-full">
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-12 h-12 mb-3 text-primary"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p>{t('postForm.addPhotos')}</p>
                </div>
            )}

            <label
                htmlFor="file-upload"
                className="inline-block px-4 py-2 rounded-md cursor-pointer select-none bg-primary text-white hover:bg-primary-light mb-4"
            >
              {t('postForm.selectImages')}
            </label>
            <input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
            />

            <label className="block mb-2 text-sm text-gray-300 w-full">{t('postForm.projectLabel')}</label>
            <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full p-3 bg-bg-darker: border border-primary rounded-md text-white focus:outline-none focus:border-accent-light"
            >
              <option value="">{t('postForm.noProject')}</option>
              {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>{proj.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
  );

};

export default PostFormPopUp;