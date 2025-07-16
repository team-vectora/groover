"use client";

import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

const SaveMusicPopUp = ({
  open,
  onSave,
  onCancel,
  title,
  setTitle,
  description,
  setDescription,
    saveOrFork,
}) => {
  return (
    <Popup open={open} closeOnDocumentClick={false}   contentStyle={{ background: "transparent", boxShadow: "none", border:"none"}}>
      <div className="modal p-6 rounded-lg shadow-lg bg-[#121113] text-[#e6e8e3] max-w-md mx-auto cursor">
        <button
          className="close text-4xl font-bold float-right hover:text-red-600 transition-colors duration-300"
          onClick={onCancel}
        >
          &times;
        </button>


        <div className="header text-2xl font-semibold mb-4 text-[#a97f52]">
          Save Project
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-[#070608] text-[#e6e8e3] border border-[#61673e] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c1915d]"
            required
          />
          <input
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-[#070608] text-[#e6e8e3] border border-[#61673e] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c1915d]"
            required
          />
          <button
            type="submit"
            className="bg-[#a97f52] hover:bg-[#c1915d] text-white px-4 py-2 rounded transition duration-300"
          >
            {saveOrFork || "Salvar"}
          </button>
        </form>
      </div>
    </Popup>
  );
};

export default SaveMusicPopUp;
