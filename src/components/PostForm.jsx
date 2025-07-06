"use client";
import { useState } from "react";
import { uploadToCloudinary } from "../util/upload.jsx";

export default function Feed() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      let photoUrl = null;

      if (image) {
        photoUrl = await uploadToCloudinary(image);
      }

      const response = await fetch('http://localhost:5000/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          caption,
          photos: photoUrl ? [photoUrl] : [],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Post criado com sucesso!');
        setCaption('');
        setImage(null);
      } else {
        alert(data.error || 'Erro ao criar post');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com a API');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="container-input">
        <label htmlFor="caption">Legenda</label>
        <input
          type="text"
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Digite sua legenda"
        />

        <label htmlFor="image">Imagem</label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      <input id="botao-enviar" type="submit" value="Postar" />
    </form>
  );
}
