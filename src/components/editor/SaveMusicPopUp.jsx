"use client";

import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
      <Popup open={open} closeOnDocumentClick={false}   contentStyle={{ background: "transparent", boxShadow: "none", border:"none"}}>
        <div className="modal p-6 rounded-lg shadow-lg bg-bg-secondary text-foreground max-w-md mx-auto cursor">
          <button
              className="close text-4xl font-bold float-right hover:text-red-600 transition-colors duration-300"
              onClick={onCancel}
          >
            &times;
          </button>


          <div className="header text-2xl font-semibold mb-4 text-accent">
            {t('editor.saveProject')}
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
                placeholder={t('editor.title')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-bg-darker text-foreground border border-primary-light rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-light:"
                required
            />
            <input
                type="text"
                placeholder={t('editor.description')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-bg-darker text-foreground border border-primary-light rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-light"
                required
            />
            <button
                type="submit"
                className="bg-accent hover:bg-accent-light text-white px-4 py-2 rounded transition duration-300"
            >
              {saveOrFork || t('editor.save')}
            </button>
          </form>
        </div>
      </Popup>
  );
};

export default SaveMusicPopUp;