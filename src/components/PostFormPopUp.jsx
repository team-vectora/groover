"use client";

import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { useState, useRef } from "react";
import { uploadToCloudinary } from "../util/upload.jsx";

const PostFormPopUp = ({ open, onClose }) => {
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCaption("");
        setImages([]);
        setPreviews([]);
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

  return (
    <Popup
      open={open}
      closeOnDocumentClick={false}
      onClose={onClose}
      modal
      nested
      contentStyle={{
        background: "transparent",
        border: "none",
        width: "auto",
        maxWidth: "600px",
      }}
    >
      <div
        className="rounded-xl overflow-hidden shadow-lg w-full max-w-md mx-auto"
        style={{ backgroundColor: "#121113" }} // --bg-secondary
      >
        {/* Header */}
        <div
          className="flex justify-between items-center px-5 py-4 border-b"
          style={{ backgroundColor: "#070608", borderColor: "#4c4e30" }}
        >
          <h3 style={{ color: "#c1915d" }} className="text-lg font-semibold">
            Criar Nova Publicação
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-2xl transition-colors"
            style={{ color: "#e6e8e3" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#a97f52")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#e6e8e3")}
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-5">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Escreva uma legenda..."
              rows={4}
              maxLength={500}
              className="w-full p-3 rounded-md resize-none font-sans focus:outline-none"
              style={{
                backgroundColor: "#070608", // --bg-darker
                borderColor: "#4c4e30", // --primary
                color: "#e6e8e3", // --foreground
              }}
              onFocus={(e) => (e.target.style.borderColor = "#a97f52")} // --accent
              onBlur={(e) => (e.target.style.borderColor = "#4c4e30")} // --primary
            />
            <div
              className="text-right text-xs select-none"
              style={{ color: "#61673e", marginTop: "4px" }} // --primary-light
            >
              {caption.length}/500
            </div>
          </div>

          {/* Images Preview or Empty State */}
          <div className="mb-5">
            {previews.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative rounded-md overflow-hidden aspect-square"
                    style={{
                      border: "1px solid #4c4e30", // --primary
                    }}
                  >
                    <img
                      src={preview.url}
                      alt={preview.name}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-lg transition-colors"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.7)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#b91c1c")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.7)")
                      }
                      aria-label={`Remover imagem ${index + 1}`}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md mb-4 text-center"
                style={{ borderColor: "#4c4e30", color: "#61673e" }} // --primary e --primary-light
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-12 h-12 mb-3"
                  style={{ color: "#4c4e30" }} // --primary
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

            {/* Upload Button */}
            <label
              htmlFor="file-upload"
              className="inline-block px-4 py-2 rounded-md cursor-pointer select-none transition-colors"
              style={{
                backgroundColor: "#4c4e30",
                color: "#ffffff",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget.style.backgroundColor = "#61673e"))
              }
              onMouseLeave={(e) =>
                ((e.currentTarget.style.backgroundColor = "#4c4e30"))
              }
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || (!caption && images.length === 0)}
            className="w-full py-3 rounded-md font-semibold transition-colors flex justify-center items-center"
            style={{
              backgroundColor: isSubmitting ? "#c1915d" : "#a97f52",
              color: "#0a090d",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? (
              <span
                className="w-5 h-5 border-4 border-[#0a090d] border-t-transparent rounded-full animate-spin"
                aria-label="Carregando"
              />
            ) : (
              "Publicar"
            )}
          </button>
        </form>
      </div>
    </Popup>
  );
};

export default PostFormPopUp;
