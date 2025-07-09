"use client";

import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { useState, useEffect } from "react";
import { uploadToCloudinary } from "../util/upload.jsx";

const GENRES = [
  "Rock",
  "Pop",
  "Jazz",
  "Blues",
  "Rap",
  "Hip Hop",
  "R&B",
  "Reggae",
  "Samba",
  "MPB",
  "Bossa Nova",
  "Funk",
  "Sertanejo",
  "Forró",
  "Axé",
  "Pagode",
  "Indie",
  "Metal",
  "Heavy Metal",
  "Trap",
  "Lo-Fi",
  "Eletrônica",
  "House",
  "Techno",
  "Trance",
  "Drum and Bass",
  "Dubstep",
  "K-Pop",
  "J-Pop",
  "Clássica",
  "Opera",
  "Gospel",
  "Country",
  "Folk",
  "Punk",
  "Hardcore",
  "Grunge",
  "Soul",
  "Disco",
  "Reggaeton",
  "Cumbia",
  "Tango",
  "Flamenco",
  "Chillout",
  "Ambient",
  "Experimental",
];

// Bio bugada
const ConfigUserPopUp = ({ open, onClose, username, bio, profilePic, setBio, setProfilePic }) => {
  const [musicTags, setMusicTags] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("/img/default_avatar.png");

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

    const token = localStorage.getItem("token");
    let profilePicUrl = profilePic;

    if (profilePic) {
      profilePicUrl = await uploadToCloudinary(profilePic);
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
        bio,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("avatar",profilePicUrl);
      alert("Perfil atualizado com sucesso!");
      onClose();
    } else {
      alert(data.error || "Erro ao atualizar");
    }
  };

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setProfilePic(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    };

  return (
    <Popup
      open={open}
      closeOnDocumentClick={false}
      onClose={onClose}
      contentStyle={{ background: "transparent", boxShadow: "none", border: "none" }}
    >
      <div className="modal w-full max-w-md mx-auto p-4 sm:p-6 rounded-lg shadow-lg bg-[#121113] text-[#e6e8e3]">
        <button
          className="close text-4xl font-bold float-right hover:text-red-600 transition-colors duration-300"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="header text-2xl font-semibold mb-4 text-[#a97f52]">
          Configurar Perfil
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label>Foto de perfil</label>
            <div className="flex justify-center items-center">
                {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border border-[#61673e] mb-2 hover:bg-[#c1915d] transition duration-300 ease-in-out cursor-pointer"
                    />

                )}

            </div>



          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-[#e6e8e3]"
          />

          <label>Escolha até 5 gêneros musicais</label>
          <div
            className="grid grid-cols-2 max-h-40 overflow-y-auto gap-2 border border-[#61673e] rounded p-2 bg-[#070608]"
            style={{ scrollbarWidth: "thin" }}
          >
            {GENRES.map((tag) => (
              <label
                key={tag}
                className={`cursor-pointer select-none px-2 py-1 rounded-full text-center transition  duration-300 ease-in-out ${
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

          <label>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Fale um pouco sobre você..."
            rows={3}
            className="bg-[#070608] text-[#e6e8e3] border border-[#61673e] rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#c1915d]"
          />

          <button
            type="submit"
            className="bg-[#a97f52] hover:bg-[#c1915d] text-white px-4 py-2 rounded transition duration-300"
          >
            Salvar alterações
          </button>
        </form>
      </div>
    </Popup>
  );
};

export default ConfigUserPopUp;
