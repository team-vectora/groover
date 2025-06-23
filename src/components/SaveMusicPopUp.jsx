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
}) => {
  return (
    <Popup open={open} closeOnDocumentClick={false}>
      <div className="modal p-4 rounded-lg shadow-lg bg-white">
        <a
          className="close text-red-600 cursor-pointer float-right"
          onClick={onCancel}
        >
          &times;
        </a>
        <div className="header text-xl font-bold mb-4">Save Project</div>
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
            className="border border-gray-300 rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
            required
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => onCancel}
          >
            Salvar
          </button>
        </form>
      </div>
    </Popup>
  );
};

export default SaveMusicPopUp;
