"use client";

import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { useState } from "react";
import { uploadToCloudinary } from "../util/upload.jsx";

const PostFormPopUp = ({ open, onClose }) => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      let photoUrl = null;

      if (image) {
        photoUrl = await uploadToCloudinary(image);
      }

      const response = await fetch("http://localhost:5000/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          caption,
          photos: photoUrl ? [photoUrl] : [],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Post criado com sucesso!");
        setCaption("");
        setImage(null);
        onClose(); // fecha o popup após criar
      } else {
        alert(data.error || "Erro ao criar post");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao conectar com a API");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <Popup
      open={open}
      closeOnDocumentClick={false}
      onClose={onClose}
      contentStyle={{ background: "transparent", boxShadow: "none", border: "none" }}
    >
      <div className="modal p-6 rounded-lg shadow-lg bg-[#121113] text-[#e6e8e3] max-w-md mx-auto cursor">
        <button
          className="close text-4xl font-bold float-right hover:text-red-600 transition-colors duration-300"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="header text-2xl font-semibold mb-4 text-[#a97f52]">
          Novo Post
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Legenda"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="bg-[#070608] text-[#e6e8e3] border border-[#61673e] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c1915d]"
            required
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-[#e6e8e3]"
          />

          <button
            type="submit"
            className="bg-[#a97f52] hover:bg-[#c1915d] text-white px-4 py-2 rounded transition duration-300"
          >
            Postar
          </button>
        </form>
      </div>
    </Popup>
  );
};

export default PostFormPopUp;
