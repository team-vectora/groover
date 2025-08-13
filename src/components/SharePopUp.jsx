"use client";

import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { useState, useRef } from "react";

const SharePopUp = ({ open, onClose, project }) => {
  const [usernameInput, setUsernameInput] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      console.log("Usernameeeee inputttttt")
      console.log(usernameInput)
      const response = await fetch(`https://groover-api.onrender.com/api/projects/${project.id}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          'username': usernameInput
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onClose();
      } else {
        alert(data.error || "Erro ao convidar pet");
      }
    } catch (error) {
      console.error("Erro:" , error);
      alert(" Erro ao conectar com a API");
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
            Criar Nova Publicação
          </h3>
          <button
            onClick={onClose}
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
            <input
                type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Escreva o nome de usuário"
              className="w-full p-3 rounded-md resize-none font-sans focus:outline-none"
              style={{
                backgroundColor: "#070608",
                borderColor: "#4c4e30",
                color: "#e6e8e3",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#a97f52")}
              onBlur={(e) => (e.target.style.borderColor = "#4c4e30")}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-md font-semibold transition-colors flex justify-center items-center"
            style={{
              backgroundColor: "#a97f52",
              color: "#0a090d",
              cursor: "pointer",
            }}
          >
            Enviar Convite
          </button>
        </form>
      </div>
    </Popup>
  );
};

export default SharePopUp;
