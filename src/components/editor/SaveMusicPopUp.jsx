"use client";

import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';

const SaveMusicPopUp = ({
                            open, onSave, onCancel, title, setTitle,
                            description, setDescription, onImageChange, coverImage
                        }) => {
    const { t } = useTranslation();
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState("");

    useEffect(() => {
        if (coverImage) {
            setPreview(coverImage);
        }
    }, [coverImage]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            if (onImageChange) {
                onImageChange(file);
            }
        }
    };

    return (
        <Popup open={open} closeOnDocumentClick={false} contentStyle={{ background: "transparent", boxShadow: "none", border:"none"}}>
            <div className="modal p-6 rounded-lg shadow-lg bg-bg-secondary text-foreground max-w-md mx-auto cursor">
                <button className="close text-4xl font-bold float-right hover:text-red-600" onClick={onCancel}>&times;</button>
                <div className="header text-2xl font-semibold mb-4 text-accent">{t('editor.saveProject')}</div>

                <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
                    <div className="flex items-center gap-4">
                        <div
                            className="w-24 h-24 bg-bg-darker rounded-md flex items-center justify-center border-2 border-dashed border-primary cursor-pointer hover:border-accent"
                            onClick={() => fileInputRef.current.click()}
                        >
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-md"/>
                            ) : (
                                <FontAwesomeIcon icon={faImage} className="text-primary text-2xl" />
                            )}
                        </div>
                        <input id="file-upload" type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden"/>
                        <div className="flex-1">
                            <input type="text" placeholder={t('editor.title')} value={title} onChange={(e) => setTitle(e.target.value)}
                                   className="w-full bg-bg-darker text-foreground border border-primary-light rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-light" required/>
                        </div>
                    </div>
                    <textarea
                        placeholder={t('editor.description')}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-24 bg-bg-darker text-foreground border border-primary-light rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-light"
                        required
                    />
                    <button type="submit" className="bg-accent hover:bg-accent-light text-text-lighter px-4 py-2 rounded transition">
                        {t('editor.save')}
                    </button>
                </form>
            </div>
        </Popup>
    );
};

export default SaveMusicPopUp;