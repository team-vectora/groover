"use client";

import { useRouter } from "next/router";

import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { useState, useEffect, useRef } from "react";
import { uploadToCloudinary } from "../util/upload.jsx";

const GENRES = [
  "rock",
  "pop",
  "jazz",
  "blues",
  "rap",
  "hip hop",
  "r&b",
  "reggae",
  "samba",
  "mpb",
  "bossa nova",
  "funk",
  "sertanejo",
  "forró",
  "axé",
  "pagode",
  "indie",
  "metal",
  "heavy metal",
  "trap",
  "lo-fi",
  "electronic",
  "house",
  "techno",
  "trance",
  "drum and bass",
  "dubstep",
  "k-pop",
  "j-pop",
  "classical",
  "opera",
  "gospel",
  "country",
  "folk",
  "punk",
  "hardcore",
  "grunge",
  "soul",
  "disco",
  "reggaeton",
  "cumbia",
  "tango",
  "flamenco",
  "chillout",
  "ambient",
  "experimental"
];


const ConfigUserPopUp = ({ open, onClose, username, bio, profilePic, setProfilePic, favoriteTags = [], selectedTags }) => {

  const router = useRouter();

  const [musicTags, setMusicTags] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("/img/default_avatar.png");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [changedBio, setChangedBio] =useState("")
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
          router.reload();
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
        className="rounded-xl overflow-hidden shadow-lg w-[448px] mx-auto"
        style={{ backgroundColor: "#121113" }}
      >
        <div
          className="flex justify-between items-center px-5 py-4 border-b"
          style={{ backgroundColor: "#070608", borderColor: "#4c4e30" }}
        >
          <h3 style={{ color: "#c1915d" }} className="text-lg font-semibold">
            Configurar Perfil
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

        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium" style={{ color: "#e6e8e3" }}>
              Foto de perfil
            </label>
            <div className="flex justify-center items-center mb-3">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border border-[#61673e]"
                />
              )}
            </div>
            <label
              htmlFor="file-upload"
              className="inline-block px-4 py-2 rounded-md cursor-pointer select-none transition-colors"
              style={{ backgroundColor: "#4c4e30", color: "#ffffff" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#61673e")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4c4e30")}
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
          <label className="block mb-2 text-sm font-medium" style={{ color: "#e6e8e3" }}>
            Bio
          </label>
          <textarea
            value={changedBio}
            onChange={(e) => setChangedBio(e.target.value)}
            placeholder="Fale um pouco sobre você..."
            rows={2}
            maxLength={50}
            className="w-full p-3 rounded-md resize-none font-sans focus:outline-none"
            style={{
              backgroundColor: "#070608",
              borderColor: "#4c4e30",
              color: "#e6e8e3",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#a97f52")}
            onBlur={(e) => (e.target.style.borderColor = "#4c4e30")}
          />
          <div
            className="text-right text-xs select-none"
            style={{ color: "#61673e", marginTop: "4px" }}
          >
            {changedBio.length}/50
          </div>
        </div>


          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium" style={{ color: "#e6e8e3" }}>
              Escolha até 5 gêneros musicais
            </label>
            <div
              className="grid grid-cols-2 max-h-40 overflow-y-auto gap-2 border border-[#61673e] rounded p-2 bg-[#070608]"
              style={{ scrollbarWidth: "thin" }}
            >
              {GENRES.map((tag) => (
                <label
                  key={tag}
                  className={`cursor-pointer select-none px-2 py-1 rounded-full text-center transition duration-300 ease-in-out ${
                    musicTags.includes(tag)
                      ? "bg-[#4c4e30] text-black font-semibold"
                      : "bg-[#121113] text-[#e6e8e3]"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={musicTags.includes(tag)}
                    onChange={() => toggleTag(tag)}
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
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
              "Salvar alterações"
            )}
          </button>
        </form>
      </div>
    </Popup>
  );
};

export default ConfigUserPopUp;
