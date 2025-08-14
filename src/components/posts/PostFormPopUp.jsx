import { useState, useRef } from 'react';
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

const PostFormPopUp = ({ open, onClose, projects }) => {
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      if (selectedGenres.length < 5) {
        setSelectedGenres([...selectedGenres, genre]);
      } else {
        alert("Você pode selecionar no máximo 5 tags musicais.");
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

      const response = await fetch("http://localhost:5000/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          caption,
          photos: photoUrls,
          project_id: selectedProject,
          genres: selectedGenres,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCaption("");
        setImages([]);
        setPreviews([]);
        setSelectedGenres([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onClose();
      } else {
        alert(data.error || "Erro ao criar post");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao conectar com a API");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 5) {
      alert("Máximo de 5 imagens permitidas");
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
        <div className="bg-[#121113] rounded-xl w-full max-w-6xl border border-[#4c4e30] flex flex-col md:flex-row overflow-hidden">

          {/* Form (agora à esquerda) */}
          <div className="md:w-1/2 p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#c1915d]">
                Criar Nova Publicação
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
                  placeholder="Escreva uma legenda..."
                  rows={4}
                  maxLength={500}
                  className="w-full p-3 bg-[#070608] border border-[#4c4e30] rounded-md text-white focus:outline-none focus:border-[#c1915d]"
              />
              <div className="text-right text-xs text-[#61673e] mt-1">
                {caption.length}/500
              </div>
            </div>

            <label className="block mb-2 text-sm text-gray-300">Escolha até 5 tags musicais</label>
            <div className="grid grid-cols-3 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 mb-4 bg-[#070608] border border-[#4c4e30] rounded-md">
              {GENRES.map((genre) => (
                  <button
                      key={genre}
                      type="button"
                      className={`px-2 py-1 rounded-full text-center transition ${
                          selectedGenres.includes(genre)
                              ? "bg-[#4c4e30] text-white font-semibold"
                              : "bg-[#121113] text-[#e6e8e3] hover:bg-[#1b1b1b]"
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
                        ? "bg-[#c1915d] cursor-not-allowed opacity-70"
                        : "bg-[#a97f52] hover:bg-[#c1915d]"
                }`}
                onClick={handleSubmit}
            >
              {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : "Publicar"}
            </button>
          </div>

          {/* Preview + Projeto (agora à direita) */}
          <div className="md:w-1/2 p-5 border-t md:border-t-0 md:border-l border-[#4c4e30] flex flex-col items-center">
            {/* Preview de imagens */}
            {previews.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-4 w-full">
                  {previews.map((preview, index) => (
                      <div key={index} className="relative rounded-md overflow-hidden aspect-square border border-[#4c4e30]">
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
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#4c4e30] rounded-md mb-4 text-[#61673e] w-full">
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-12 h-12 mb-3 text-[#4c4e30]"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p>Adicione fotos ao seu post</p>
                </div>
            )}

            {/* Selecionar imagens */}
            <label
                htmlFor="file-upload"
                className="inline-block px-4 py-2 rounded-md cursor-pointer select-none bg-[#4c4e30] text-white hover:bg-[#61673e] mb-4"
            >
              Selecionar Imagens
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

            {/* Projeto */}
            <label className="block mb-2 text-sm text-gray-300 w-full">Projeto (opcional)</label>
            <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full p-3 bg-[#070608] border border-[#4c4e30] rounded-md text-white focus:outline-none focus:border-[#c1915d]"
            >
              <option value="">Nenhum projeto</option>
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